import { api } from "@/api/client";

export interface StudyRoom {
  studyRoomId: number;
  roomName: string;
  mapNo: number;
}

export interface StudyChannel {
  studyChannelId: number;
  channelNo: number;
  channelName: string;
}

export interface SeatStatus {
  seatId: number;
  seatNo: number;
  active: boolean;
  occupied: boolean;
  characterId: number | null;
}

export interface StudySession {
  studySessionId: number;
  studyChannelId: number;
  seatId: number;
  status: "RUNNING" | "PAUSED" | "DISCONNECTED" | "COMPLETED" | "AUTO_TERMINATED" | "FORCED_TERMINATED";
  endReason: string | null;
  startedAt: string;
  endedAt: string | null;
  accumulatedSeconds: number;
}

export interface SessionTick {
  studySessionId: number;
  status: StudySession["status"];
  serverNow: string;
  displayElapsedSeconds: number;
}

export interface ActiveParticipant {
  memberId: number;
  displayName: string;
  elapsedSeconds: number;
  running: boolean;
}

export interface ActiveStudySession {
  studySessionId: number;
  studyRoomId: number;
  mapNo: number;
  studyChannelId: number;
  channelNo: number;
  seatId: number;
  seatNo: number;
  status: StudySession["status"];
  elapsedSeconds: number;
}

export const studySpaceApi = {
  getRooms: () => api.get<StudyRoom[]>("/study-rooms"),
  getChannels: (studyRoomId: number) =>
    api.get<StudyChannel[]>(`/study-rooms/${studyRoomId}/channels`),
  getSeats: (studyChannelId: number) =>
    api.get<SeatStatus[]>(`/study-channels/${studyChannelId}/seats`),
  getActiveParticipants: (studyChannelId: number) =>
    api.get<ActiveParticipant[]>(`/study-channels/${studyChannelId}/participants`),
  getMyActiveSession: () =>
    api.get<ActiveStudySession | null>("/study-sessions/me/active"),
  occupySeat: (studyChannelId: number, seatId: number, subject?: string) =>
    api.post<StudySession>(`/study-channels/${studyChannelId}/seats/${seatId}/occupancy`, { subject }),
  leaveSeat: (studySessionId: number) =>
    api.del<StudySession>(`/study-sessions/${studySessionId}/occupancy`),
  heartbeat: (studySessionId: number) =>
    api.post<SessionTick>(`/study-sessions/${studySessionId}/heartbeat`),
  pause: (studySessionId: number) =>
    api.patch<SessionTick>(`/study-sessions/${studySessionId}/pause`),
  resume: (studySessionId: number) =>
    api.patch<SessionTick>(`/study-sessions/${studySessionId}/resume`),
};
