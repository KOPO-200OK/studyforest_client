import { api } from "./client";

export interface AdminSeatResponse {
  seatId: number;
  studyRoomId: number;
  roomName: string;
  mapNo: number;
  seatNo: number;
  active: boolean;
  occupied: boolean;
}

export const adminStudyRoomApi = {
  /**
   * 전체 스터디 공간 좌석 조회
   */
  getSeats() {
    return api.get<
      AdminSeatResponse[]
    >(
      "/admin/study-rooms/seats",
    );
  },

  /**
   * 좌석 활성화 상태 변경
   */
  updateSeatActive(
    seatId: number,
    active: boolean,
  ) {
    return api.patch<
      AdminSeatResponse
    >(
      `/admin/study-rooms/seats/${seatId}/active`,
      {
        active,
      },
    );
  },
};