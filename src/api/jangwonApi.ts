import { api } from "./client";
import type { Page } from "./types";

export type JangwonApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface JangwonApplicationResponse {
  jangwonApplicationId: number;
  memberId: number;
  displayNickname: string;
  displayName: string;
  characterName: string;
  characterImageUrl?: string | null;
  certificateImageUrl: string;
  status: JangwonApplicationStatus;
  adminMemo?: string | null;
  isVisible: boolean;
  appliedAt: string;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JangwonWinnerResponse {
  jangwonApplicationId: number;
  memberId: number;
  displayNickname: string;
  displayName: string;
  characterName: string;
  characterImageUrl?: string | null;
  reviewedAt: string;
}

export interface JangwonApplyRequest {
  displayNickname: string;
  characterName: string;
  characterImageUrl?: string | null;
  certificateImageUrl: string;
}

export const jangwonApi = {
  /**
   * 승인되고 공개 상태인 장원급제 명단을 조회합니다.
   *
   * GET /api/v1/jangwon
   */
  listWinners(
    params: {
      page?: number;
      size?: number;
    } = {},
  ) {
    return api.get<Page<JangwonWinnerResponse>>(
      "/jangwon",
      params,
    );
  },

  /**
   * 장원급제를 신청합니다.
   *
   * POST /api/v1/jangwon/applications
   */
  apply(payload: JangwonApplyRequest) {
    return api.post<JangwonApplicationResponse>(
      "/jangwon/applications",
      payload,
    );
  },

  /**
   * 현재 로그인한 사용자의 신청 내역을 조회합니다.
   *
   * GET /api/v1/jangwon/applications/me
   */
  listMyApplications(
    params: {
      page?: number;
      size?: number;
    } = {},
  ) {
    return api.get<Page<JangwonApplicationResponse>>(
      "/jangwon/applications/me",
      params,
    );
  },

  /**
   * 관리자가 전체 신청 내역을 조회합니다.
   *
   * GET /api/v1/admin/jangwon/applications
   */
  listAdminApplications(
    params: {
      page?: number;
      size?: number;
      status?: JangwonApplicationStatus;
      keyword?: string;
    } = {},
  ) {
    return api.get<Page<JangwonApplicationResponse>>(
      "/admin/jangwon/applications",
      params,
    );
  },

  /**
   * 관리자가 신청 상세 정보를 조회합니다.
   *
   * GET /api/v1/admin/jangwon/applications/{id}
   */
  getAdminApplication(
    applicationId: number,
  ) {
    return api.get<JangwonApplicationResponse>(
      `/admin/jangwon/applications/${applicationId}`,
    );
  },

  /**
   * 관리자가 신청을 승인합니다.
   *
   * PATCH /api/v1/admin/jangwon/applications/{id}/approve
   */
  approve(applicationId: number) {
    return api.patch<JangwonApplicationResponse>(
      `/admin/jangwon/applications/${applicationId}/approve`,
      {},
    );
  },

  /**
   * 관리자가 신청을 반려합니다.
   *
   * PATCH /api/v1/admin/jangwon/applications/{id}/reject
   */
  reject(
    applicationId: number,
    adminMemo: string,
  ) {
    return api.patch<JangwonApplicationResponse>(
      `/admin/jangwon/applications/${applicationId}/reject`,
      {
        adminMemo,
      },
    );
  },

  /**
   * 관리자가 신청을 삭제합니다.
   *
   * DELETE /api/v1/admin/jangwon/applications/{id}
   */
  delete(applicationId: number) {
    return api.del<void>(
      `/admin/jangwon/applications/${applicationId}`,
    );
  },
};