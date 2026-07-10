// ============================================================
// 스터디 공간(좌석/채널) 실시간 API — feature/studyspace-realtime-redis-ws
// 브랜치 기준. 아직 dev에 병합 전이라 실제 서버 연동 전 변경될 수 있음.
// ============================================================
import { api } from "./client";

export interface StudyRoomResponse {
  studyRoomId: number;
  roomName: string;
  mapNo: number;
}

export interface StudyChannelResponse {
  studyChannelId: number;
  channelNo: number;
  channelName: string;
}

export interface SeatStatusResponse {
  seatId: number;
  seatNo: number;
  active: boolean;
  occupied: boolean;
}

export type StudySessionStatus = "ACTIVE" | "PAUSED" | "ENDED" | string;

export interface StudySessionResponse {
  studySessionId: number;
  studyChannelId: number;
  seatId: number;
  status: StudySessionStatus;
  endReason?: string | null;
  startedAt: string;
  endedAt?: string | null;
  accumulatedSeconds: number;
}

export const studySpaceApi = {
  listRooms() {
    return api.get<StudyRoomResponse[]>("/study-rooms");
  },

  listChannels(studyRoomId: number) {
    return api.get<StudyChannelResponse[]>(`/study-rooms/${studyRoomId}/channels`);
  },

  listSeats(studyChannelId: number) {
    return api.get<SeatStatusResponse[]>(`/study-channels/${studyChannelId}/seats`);
  },

  occupySeat(studyChannelId: number, seatId: number, subject?: string) {
    return api.post<StudySessionResponse>(`/study-channels/${studyChannelId}/seats/${seatId}/occupancy`, { subject });
  },

  leaveSeat(studySessionId: number) {
    return api.del<StudySessionResponse>(`/study-sessions/${studySessionId}/occupancy`);
  },

  pauseSession(studySessionId: number) {
    return api.patch<void>(`/study-sessions/${studySessionId}/pause`, {});
  },

  resumeSession(studySessionId: number) {
    return api.patch<void>(`/study-sessions/${studySessionId}/resume`, {});
  },
};
