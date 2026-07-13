import { Client, type IMessage } from "@stomp/stompjs";
import { ensureAccessToken } from "@/api/client";
import {
  voiceApi,
  type VoiceParticipantResponse,
} from "@/api/voiceApi";

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

  onRemoteStream?: (
    email: string,
    stream: MediaStream,
  ) => void;

  onParticipantJoined?: (
    participant: VoiceParticipantResponse,
  ) => void;

  onParticipantLeft?: (
    email: string,
  ) => void;

  onError?: (
    message: string,
  ) => void;
}

/**
 * 음성채팅 WebSocket 주소를 생성합니다.
 *
 * 1. VITE_WS_BASE_URL이 설정되어 있다면 해당 주소 사용
 * 2. 설정이 없다면 현재 브라우저 주소의 /ws-studyspace 사용
 *
 * 개발 환경 예:
 * ws://localhost:5173/ws-studyspace
 * → Vite 프록시
 * → ws://localhost:8080/ws-studyspace
 *
 * 운영 환경 예:
 * wss://studyforest.example.com/ws-studyspace
 */
function getBrokerUrl(): string {
  const configuredUrl =
    import.meta.env.VITE_WS_BASE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  const protocol =
    window.location.protocol === "https:"
      ? "wss:"
      : "ws:";

  return `${protocol}//${window.location.host}/ws-studyspace`;
}

export class OfficeVoiceMeshClient {
  private readonly studyZoneId: number;
  private readonly selfEmail: string;

  private readonly onRemoteStream?: (
    email: string,
    stream: MediaStream,
  ) => void;

  private readonly onParticipantJoined?: (
    participant: VoiceParticipantResponse,
  ) => void;

  private readonly onParticipantLeft?: (
    email: string,
  ) => void;

  private readonly onError?: (
    message: string,
  ) => void;

  private stomp: Client | null = null;
  private localStream: MediaStream | null = null;

  private readonly peers =
    new Map<string, RTCPeerConnection>();

  constructor(options: OfficeVoiceMeshClientOptions) {
    this.studyZoneId = options.studyZoneId;
    this.selfEmail = options.selfEmail;

    this.onRemoteStream = options.onRemoteStream;
    this.onParticipantJoined =
      options.onParticipantJoined;
    this.onParticipantLeft =
      options.onParticipantLeft;
    this.onError = options.onError;
  }

  /**
   * 마이크와 WebSocket을 연결하고 음성방에 입장합니다.
   */
  async start(): Promise<void> {
    this.localStream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

    await this.connectStomp();

    const joinResult =
      await voiceApi.join(this.studyZoneId);

    for (const participant of joinResult.participants) {
      if (participant.email === this.selfEmail) {
        continue;
      }

      await this.createOffer(participant.email);
    }
  }

  /**
   * 음성방에서 퇴장하고 모든 WebRTC 연결을 종료합니다.
   */
  async stop(): Promise<void> {
    try {
      await voiceApi.leave(this.studyZoneId);
    } catch {
      /**
       * 네트워크 연결이 먼저 끊어졌거나 서버에서 이미
       * 퇴장 처리한 경우에는 종료 작업을 계속 진행합니다.
       */
    }

    for (const peer of this.peers.values()) {
      peer.close();
    }

    this.peers.clear();

    if (this.localStream) {
      this.localStream
        .getTracks()
        .forEach((track) => track.stop());

      this.localStream = null;
    }

    if (this.stomp) {
      await this.stomp.deactivate();
      this.stomp = null;
    }
  }

  /**
   * 마이크 음소거 상태를 변경합니다.
   */
  setMuted(muted: boolean): void {
    if (!this.localStream) {
      return;
    }

    this.localStream
      .getAudioTracks()
      .forEach((track) => {
        track.enabled = !muted;
      });
  }

    /**
   * Spring STOMP WebSocket에 연결합니다.
   *
   * 최초 연결과 자동 재연결 시 최신 Access Token을 사용합니다.
   */
  private async connectStomp(): Promise<void> {
    const initialAccessToken =
      await ensureAccessToken();

    if (!initialAccessToken) {
      throw new Error(
        "로그인이 필요합니다.",
      );
    }

    const wsUrl =
      getBrokerUrl();

    this.stomp =
      new Client({
        brokerURL:
          wsUrl,

        connectHeaders: {
          Authorization:
            `Bearer ${initialAccessToken}`,
        },

        reconnectDelay:
          3000,

        /**
         * STOMP 자동 재연결 직전에
         * 최신 Access Token을 다시 설정합니다.
         */
        beforeConnect:
          async () => {
            const accessToken =
              await ensureAccessToken();

            if (
              !accessToken
            ) {
              throw new Error(
                "로그인이 필요합니다.",
              );
            }

            if (this.stomp) {
              this.stomp
                .connectHeaders = {
                  Authorization:
                    `Bearer ${accessToken}`,
                };
            }
          },

        debug:
          () => {},

        onConnect:
          () => {
            this.stomp
              ?.subscribe(
                "/user/queue/voice/signals",

                (
                  message,
                ) => {
                  void this.handleSignal(
                    message,
                  );
                },
              );

            this.stomp
              ?.subscribe(
                `/topic/voice/zones/${this.studyZoneId}/participants`,

                (
                  message,
                ) => {
                  void this.handleParticipantEvent(
                    message,
                  );
                },
              );
          },

        onStompError:
          () => {
            this.onError?.(
              "음성채팅 WebSocket 연결 중 오류가 발생했습니다.",
            );
          },

        onWebSocketClose:
          () => {
            this.onError?.(
              "음성채팅 WebSocket 연결이 종료되었습니다.",
            );
          },
      });

    this.stomp.activate();

    await new Promise<void>(
      (
        resolve,
        reject,
      ) => {
        const startedAt =
          Date.now();

        const timer =
          window.setInterval(
            () => {
              if (
                this.stomp
                  ?.connected
              ) {
                window.clearInterval(
                  timer,
                );

                resolve();

                return;
              }

              const elapsed =
                Date.now() -
                startedAt;

              if (
                elapsed >
                5000
              ) {
                window.clearInterval(
                  timer,
                );

                reject(
                  new Error(
                    "음성채팅 WebSocket 연결에 실패했습니다.",
                  ),
                );
              }
            },
            100,
          );
      },
    );
  }

  /**
   * 같은 음성 구역의 사용자 입장·퇴장 이벤트를 처리합니다.
   */
  private async handleParticipantEvent(
    message: IMessage,
  ): Promise<void> {
    const event = JSON.parse(
      message.body,
    ) as VoiceParticipantEvent;

    if (event.studyZoneId !== this.studyZoneId) {
      return;
    }

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

  /**
   * OFFER, ANSWER, ICE 시그널을 처리합니다.
   */
  private async handleSignal(
    message: IMessage,
  ): Promise<void> {
    const signal = JSON.parse(
      message.body,
    ) as VoiceSignalMessage;

    if (
      !signal.senderEmail ||
      signal.senderEmail === this.selfEmail
    ) {
      return;
    }

    if (signal.studyZoneId !== this.studyZoneId) {
      return;
    }

    if (signal.type === "OFFER") {
      const peer =
        this.getOrCreatePeer(signal.senderEmail);

      const remoteDescription =
        JSON.parse(signal.payload) as RTCSessionDescriptionInit;

      await peer.setRemoteDescription(
        remoteDescription,
      );

      const answer = await peer.createAnswer();

      await peer.setLocalDescription(answer);

      this.sendSignal(
        "ANSWER",
        signal.senderEmail,
        answer,
      );

      return;
    }

    if (signal.type === "ANSWER") {
      const peer =
        this.peers.get(signal.senderEmail);

      if (!peer) {
        return;
      }

      const remoteDescription =
        JSON.parse(signal.payload) as RTCSessionDescriptionInit;

      await peer.setRemoteDescription(
        remoteDescription,
      );

      return;
    }

    if (signal.type === "ICE") {
      const peer =
        this.peers.get(signal.senderEmail);

      if (!peer) {
        return;
      }

      const iceCandidate =
        JSON.parse(signal.payload) as RTCIceCandidateInit;

      await peer.addIceCandidate(iceCandidate);
    }
  }

  /**
   * 새로운 사용자에게 WebRTC 연결 요청을 보냅니다.
   */
  private async createOffer(
    targetEmail: string,
  ): Promise<void> {
    const peer =
      this.getOrCreatePeer(targetEmail);

    const offer = await peer.createOffer();

    await peer.setLocalDescription(offer);

    this.sendSignal(
      "OFFER",
      targetEmail,
      offer,
    );
  }

  /**
   * 사용자별 PeerConnection을 조회하거나 새로 생성합니다.
   */
  private getOrCreatePeer(
    targetEmail: string,
  ): RTCPeerConnection {
    const existing =
      this.peers.get(targetEmail);

    if (existing) {
      return existing;
    }

    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    if (this.localStream) {
      this.localStream
        .getTracks()
        .forEach((track) => {
          peer.addTrack(
            track,
            this.localStream as MediaStream,
          );
        });
    }

    peer.onicecandidate = (event) => {
      if (!event.candidate) {
        return;
      }

      this.sendSignal(
        "ICE",
        targetEmail,
        event.candidate,
      );
    };

    peer.ontrack = (event) => {
      const [stream] = event.streams;

      if (stream) {
        this.onRemoteStream?.(
          targetEmail,
          stream,
        );
      }
    };

    peer.onconnectionstatechange = () => {
      const connectionState =
        peer.connectionState;

      if (
        connectionState === "failed" ||
        connectionState === "closed" ||
        connectionState === "disconnected"
      ) {
        this.closePeer(targetEmail);
      }
    };

    this.peers.set(targetEmail, peer);

    return peer;
  }

  /**
   * 음성 WebRTC 시그널을 Spring STOMP 서버로 전송합니다.
   */
  private sendSignal(
    type: VoiceSignalType,
    targetEmail: string,
    payload: unknown,
  ): void {
    if (!this.stomp?.connected) {
      this.onError?.(
        "음성채팅 WebSocket이 연결되어 있지 않습니다.",
      );

      return;
    }

    const message: VoiceSignalMessage = {
      studyZoneId: this.studyZoneId,
      type,
      targetEmail,
      payload: JSON.stringify(payload),
    };

    this.stomp.publish({
      destination:
        `/app/voice/zones/${this.studyZoneId}/signal`,

      body: JSON.stringify(message),
    });
  }

  /**
   * 특정 사용자의 WebRTC 연결을 종료합니다.
   */
  private closePeer(email: string): void {
    const peer = this.peers.get(email);

    if (!peer) {
      return;
    }

    peer.close();
    this.peers.delete(email);
  }
}