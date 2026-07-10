import { Client, type IMessage } from "@stomp/stompjs";
import { tokenStore } from "@/api/client";
import { voiceApi, type VoiceParticipantResponse } from "@/api/voiceApi";

type VoiceSignalType = "OFFER" | "ANSWER" | "ICE";

interface VoiceSignalMessage {
  studyZoneId: number;
  type: VoiceSignalType;
  targetEmail: string;
  senderEmail?: string;
  payload: string;
}

interface VoiceParticipantEvent {
  type: "JOINED" | "LEFT";
  studyZoneId: number;
  email: string;
  name: string;
}

interface OfficeVoiceMeshClientOptions {
  studyZoneId: number;
  selfEmail: string;
  onRemoteStream?: (email: string, stream: MediaStream) => void;
  onParticipantJoined?: (participant: VoiceParticipantResponse) => void;
  onParticipantLeft?: (email: string) => void;
  onError?: (message: string) => void;
}

export class OfficeVoiceMeshClient {
  private readonly studyZoneId: number;
  private readonly selfEmail: string;
  private readonly onRemoteStream?: (email: string, stream: MediaStream) => void;
  private readonly onParticipantJoined?: (participant: VoiceParticipantResponse) => void;
  private readonly onParticipantLeft?: (email: string) => void;
  private readonly onError?: (message: string) => void;

  private stomp: Client | null = null;
  private localStream: MediaStream | null = null;
  private peers = new Map<string, RTCPeerConnection>();

  constructor(options: OfficeVoiceMeshClientOptions) {
    this.studyZoneId = options.studyZoneId;
    this.selfEmail = options.selfEmail;
    this.onRemoteStream = options.onRemoteStream;
    this.onParticipantJoined = options.onParticipantJoined;
    this.onParticipantLeft = options.onParticipantLeft;
    this.onError = options.onError;
  }

  async start() {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    await this.connectStomp();

    const joinResult = await voiceApi.join(this.studyZoneId);

    for (const participant of joinResult.participants) {
      if (participant.email === this.selfEmail) continue;
      await this.createOffer(participant.email);
    }
  }

  async stop() {
    try {
      await voiceApi.leave(this.studyZoneId);
    } catch {
      // ignore
    }

    for (const peer of this.peers.values()) {
      peer.close();
    }

    this.peers.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.stomp) {
      await this.stomp.deactivate();
      this.stomp = null;
    }
  }

  setMuted(muted: boolean) {
    if (!this.localStream) return;

    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }

  private async connectStomp() {
    const token = tokenStore.get();

    if (!token) {
      throw new Error("로그인이 필요합니다");
    }

    const wsUrl =
      import.meta.env.VITE_WS_BASE_URL ??
      "ws://localhost:8080/ws-studyspace";

    this.stomp = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 3000,
      debug: () => {},
      onConnect: () => {
        this.stomp?.subscribe(
          "/user/queue/voice/signals",
          (message) => void this.handleSignal(message),
        );

        this.stomp?.subscribe(
          `/topic/voice/zones/${this.studyZoneId}/participants`,
          (message) => void this.handleParticipantEvent(message),
        );
      },
      onStompError: () => {
        this.onError?.("음성채팅 WebSocket 연결 중 오류가 발생했습니다");
      },
      onWebSocketClose: () => {
        this.onError?.("음성채팅 연결이 종료되었습니다");
      },
    });

    await this.stomp.activate();

    await new Promise<void>((resolve, reject) => {
      const startedAt = Date.now();

      const timer = window.setInterval(() => {
        if (this.stomp?.connected) {
          window.clearInterval(timer);
          resolve();
          return;
        }

        if (Date.now() - startedAt > 5000) {
          window.clearInterval(timer);
          reject(new Error("음성채팅 WebSocket 연결에 실패했습니다"));
        }
      }, 100);
    });
  }

  private async handleParticipantEvent(message: IMessage) {
    const event = JSON.parse(message.body) as VoiceParticipantEvent;

    if (event.email === this.selfEmail) {
      return;
    }

    if (event.type === "JOINED") {
      this.onParticipantJoined?.({
        email: event.email,
        name: event.name,
      });
      return;
    }

    if (event.type === "LEFT") {
      this.closePeer(event.email);
      this.onParticipantLeft?.(event.email);
    }
  }

  private async handleSignal(message: IMessage) {
    const signal = JSON.parse(message.body) as VoiceSignalMessage;

    if (!signal.senderEmail || signal.senderEmail === this.selfEmail) {
      return;
    }

    if (signal.type === "OFFER") {
      const peer = this.getOrCreatePeer(signal.senderEmail);

      await peer.setRemoteDescription(JSON.parse(signal.payload));

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      this.sendSignal("ANSWER", signal.senderEmail, answer);
      return;
    }

    if (signal.type === "ANSWER") {
      const peer = this.peers.get(signal.senderEmail);
      if (!peer) return;

      await peer.setRemoteDescription(JSON.parse(signal.payload));
      return;
    }

    if (signal.type === "ICE") {
      const peer = this.peers.get(signal.senderEmail);
      if (!peer) return;

      await peer.addIceCandidate(JSON.parse(signal.payload));
    }
  }

  private async createOffer(targetEmail: string) {
    const peer = this.getOrCreatePeer(targetEmail);

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    this.sendSignal("OFFER", targetEmail, offer);
  }

  private getOrCreatePeer(targetEmail: string) {
    const existing = this.peers.get(targetEmail);
    if (existing) return existing;

    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peer.addTrack(track, this.localStream as MediaStream);
      });
    }

    peer.onicecandidate = (event) => {
      if (!event.candidate) return;
      this.sendSignal("ICE", targetEmail, event.candidate);
    };

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        this.onRemoteStream?.(targetEmail, stream);
      }
    };

    peer.onconnectionstatechange = () => {
      if (
        peer.connectionState === "failed" ||
        peer.connectionState === "closed" ||
        peer.connectionState === "disconnected"
      ) {
        this.closePeer(targetEmail);
      }
    };

    this.peers.set(targetEmail, peer);
    return peer;
  }

  private sendSignal(type: VoiceSignalType, targetEmail: string, payload: unknown) {
    if (!this.stomp?.connected) {
      this.onError?.("음성채팅 WebSocket이 연결되어 있지 않습니다");
      return;
    }

    const message: VoiceSignalMessage = {
      studyZoneId: this.studyZoneId,
      type,
      targetEmail,
      payload: JSON.stringify(payload),
    };

    this.stomp.publish({
      destination: `/app/voice/zones/${this.studyZoneId}/signal`,
      body: JSON.stringify(message),
    });
  }

  private closePeer(email: string) {
    const peer = this.peers.get(email);
    if (!peer) return;

    peer.close();
    this.peers.delete(email);
  }
}