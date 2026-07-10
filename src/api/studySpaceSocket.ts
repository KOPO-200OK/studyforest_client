import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { tokenStore } from "@/api/client";
import type { SessionTick, StudySession } from "@/api/studySpaceApi";

export interface SeatEvent {
  type: "OCCUPIED" | "VACATED" | "DISCONNECTED" | "RECONNECTED" | "PAUSED" | "RESUMED" | "DISABLED";
  channelId: number;
  seatId: number;
  seatNo: number;
  occupantName: string | null;
  studySessionId: number | null;
  sessionStatus: StudySession["status"] | null;
  at: string;
}

interface StudySpaceSocketOptions {
  channelId: number;
  studySessionId: number | null;
  onSeatEvent: (event: SeatEvent) => void;
  onSessionTick: (tick: SessionTick) => void;
  onConnectionChange: (connected: boolean) => void;
  onError: (message: string) => void;
}

function getBrokerUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws-studyspace`;
}

function parseMessage<T>(message: IMessage): T {
  return JSON.parse(message.body) as T;
}

export function connectStudySpaceSocket(options: StudySpaceSocketOptions): () => void {
  const token = tokenStore.get();
  if (!token) {
    options.onError("실시간 좌석 연결을 위한 로그인 정보가 없습니다.");
    return () => undefined;
  }

  let heartbeatTimer: number | null = null;
  let seatSubscription: StompSubscription | null = null;
  let sessionSubscription: StompSubscription | null = null;

  const client = new Client({
    brokerURL: getBrokerUrl(),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 3_000,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
    onConnect: () => {
      options.onConnectionChange(true);
      seatSubscription = client.subscribe(
        `/topic/channels/${options.channelId}/seats`,
        message => options.onSeatEvent(parseMessage<SeatEvent>(message)),
      );
      sessionSubscription = client.subscribe(
        "/user/queue/session",
        message => options.onSessionTick(parseMessage<SessionTick>(message)),
      );

      if (options.studySessionId !== null) {
        const destination = `/app/sessions/${options.studySessionId}`;
        client.publish({ destination: `${destination}/join` });
        client.publish({ destination: `${destination}/heartbeat` });
        heartbeatTimer = window.setInterval(() => {
          if (client.connected) client.publish({ destination: `${destination}/heartbeat` });
        }, 25_000);
      }
    },
    onWebSocketClose: () => options.onConnectionChange(false),
    onStompError: frame => {
      options.onConnectionChange(false);
      options.onError(frame.headers.message ?? "실시간 좌석 연결에 실패했습니다.");
    },
    onWebSocketError: () => {
      options.onConnectionChange(false);
      options.onError("실시간 좌석 서버에 연결할 수 없습니다. REST 방식으로 연결을 유지합니다.");
    },
  });

  client.activate();

  return () => {
    if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer);
    seatSubscription?.unsubscribe();
    sessionSubscription?.unsubscribe();
    void client.deactivate();
  };
}
