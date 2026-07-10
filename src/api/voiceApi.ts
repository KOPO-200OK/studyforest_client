import { api } from "./client";

export interface AvailableVoiceRoomResponse {
  studyZoneId: number;
  zoneCode: string;
  zoneName: string;
  studyRoomId: number;
  mapNo: number;
  studyChannelId: number;
  channelNo: number;
  seatId: number;
  seatNo: number;
  voiceEnabled: boolean;
}

export interface VoiceParticipantResponse {
  email: string;
  name: string;
}

export interface VoiceJoinResponse {
  studyZoneId: number;
  zoneName: string;
  participants: VoiceParticipantResponse[];
}

export const voiceApi = {
  getMyRoom() {
    return api.get<AvailableVoiceRoomResponse | null>("/voice/me/room");
  },

  join(studyZoneId: number) {
    return api.post<VoiceJoinResponse>(`/voice/zones/${studyZoneId}/join`);
  },

  leave(studyZoneId: number) {
    return api.del<void>(`/voice/zones/${studyZoneId}/leave`);
  },

  getParticipants(studyZoneId: number) {
    return api.get<VoiceParticipantResponse[]>(`/voice/zones/${studyZoneId}/participants`);
  },
};