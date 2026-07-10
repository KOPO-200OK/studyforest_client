// ============================================================
// 스터디 공간(맵/채널) 실시간 접속자 목록 — WebSocket(STOMP) 구독.
// feature/studyspace-realtime-redis-ws 브랜치 기준 (아직 dev 미병합).
// 백엔드가 아직 안 붙어 있으면 error 상태로 조용히 실패한다.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import { studySpaceApi, type StudyRoomResponse } from "@/api/studySpaceApi";
import { tokenStore } from "@/api/client";

type SeatEventType = "OCCUPIED" | "VACATED" | "DISCONNECTED" | "RECONNECTED" | "PAUSED" | "RESUMED" | "DISABLED";

interface SeatEventMessage {
  type: SeatEventType;
  channelId: number;
  seatId: number;
  seatNo: number;
  occupantName: string | null;
  studySessionId: number | null;
  sessionStatus: string | null;
  at: string;
}

export interface PresenceOccupant {
  seatId: number;
  seatNo: number;
  name: string;
  paused: boolean;
}

const MAP_LABEL: Record<string, string> = {
  forest: "공숲",
  seodang: "서당",
  cafe: "카페",
  sa: "오피스",
};

function resolveStudyRoomId(rooms: StudyRoomResponse[], mapId: string): number | null {
  const label = MAP_LABEL[mapId];
  const byName = rooms.find((r) => r.roomName === label || r.roomName.includes(label ?? "\0"));
  if (byName) return byName.studyRoomId;
  // 이름으로 못 찾으면 등록 순서로 추정 (백엔드 시드 데이터 확인 전까지 최선 추정치)
  const order = ["forest", "seodang", "cafe", "sa"];
  const idx = order.indexOf(mapId);
  return rooms[idx]?.studyRoomId ?? null;
}

function wsUrl(): string {
  const proto = window.location.protocol === "https:" ? "wss://" : "ws://";
  return `${proto}${window.location.host}/ws-studyspace`;
}

export function useStudySpacePresence(mapId: string, channelNo: number) {
  const [occupants, setOccupants] = useState<Record<number, PresenceOccupant>>({});
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    let cancelled = false;
    setOccupants({});
    setConnected(false);
    setError(null);

    async function connect() {
      try {
        const rooms = await studySpaceApi.listRooms();
        const studyRoomId = resolveStudyRoomId(rooms, mapId);
        if (!studyRoomId) throw new Error("이 맵의 스터디 공간을 찾을 수 없습니다");

        const channels = await studySpaceApi.listChannels(studyRoomId);
        const channel = channels.find((c) => c.channelNo === channelNo) ?? channels[0];
        if (!channel) throw new Error("채널을 찾을 수 없습니다");

        const seats = await studySpaceApi.listSeats(channel.studyChannelId);
        if (cancelled) return;

        // 초기 접속자 이름은 REST 응답에 없음(occupied 여부만) — 이름은 WS 이벤트로 채워짐
        const initial: Record<number, PresenceOccupant> = {};
        for (const s of seats) {
          if (s.occupied) initial[s.seatId] = { seatId: s.seatId, seatNo: s.seatNo, name: "익명", paused: false };
        }
        setOccupants(initial);

        const token = tokenStore.get();
        const client = new Client({
          brokerURL: wsUrl(),
          connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
          reconnectDelay: 5000,
          onConnect: () => {
            if (cancelled) return;
            setConnected(true);
            client.subscribe(`/topic/channels/${channel.studyChannelId}/seats`, (msg: IMessage) => {
              try {
                const event = JSON.parse(msg.body) as SeatEventMessage;
                setOccupants((prev) => {
                  const next = { ...prev };
                  if (event.type === "OCCUPIED" || event.type === "RECONNECTED") {
                    next[event.seatId] = { seatId: event.seatId, seatNo: event.seatNo, name: event.occupantName ?? "익명", paused: false };
                  } else if (event.type === "PAUSED") {
                    if (next[event.seatId]) next[event.seatId] = { ...next[event.seatId], paused: true };
                  } else if (event.type === "RESUMED") {
                    if (next[event.seatId]) next[event.seatId] = { ...next[event.seatId], paused: false };
                  } else if (event.type === "VACATED" || event.type === "DISCONNECTED" || event.type === "DISABLED") {
                    delete next[event.seatId];
                  }
                  return next;
                });
              } catch {
                // 이벤트 파싱 실패는 무시 (연결 자체는 유지)
              }
            });
          },
          onStompError: () => setError("실시간 접속 정보를 불러올 수 없습니다"),
          onWebSocketError: () => setError("실시간 접속 정보를 불러올 수 없습니다"),
        });
        clientRef.current = client;
        client.activate();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "실시간 접속 정보를 불러올 수 없습니다");
      }
    }

    void connect();

    return () => {
      cancelled = true;
      void clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [mapId, channelNo]);

  return { occupants: Object.values(occupants), connected, error };
}
