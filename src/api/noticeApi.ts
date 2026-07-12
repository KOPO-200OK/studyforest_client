import { api } from "./client";
import type { Page } from "./types";

export interface NoticeSummaryResponse {
  noticeId: number;
  title: string;
  contentPreview: string;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeDetailResponse {
  noticeId: number;
  title: string;
  content: string;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeCreateRequest {
  title: string;
  content: string;
  isPinned?: boolean;
  isPublished?: boolean;
}

export interface NoticeUpdateRequest {
  title: string;
  content: string;
  isPinned: boolean;
  isPublished: boolean;
}

export const noticeApi = {
  /**
   * 일반 사용자가 조회하는 공개 공지 목록입니다.
   *
   * 백엔드:
   * GET /api/v1/notices
   */
  listPublic(
    params: {
      page?: number;
      size?: number;
    } = {},
  ) {
    return api.get<Page<NoticeSummaryResponse>>(
      "/notices",
      params,
    );
  },

  /**
   * 일반 사용자가 공개 공지 상세 내용을 조회합니다.
   *
   * 백엔드:
   * GET /api/v1/notices/{noticeId}
   */
  getPublicDetail(noticeId: number) {
    return api.get<NoticeDetailResponse>(
      `/notices/${noticeId}`,
    );
  },

  /**
   * 관리자가 공개·비공개 공지를 모두 조회합니다.
   *
   * 백엔드:
   * GET /api/v1/admin/notices
   */
  listAdmin(
    params: {
      page?: number;
      size?: number;
      keyword?: string;
      isPublished?: boolean;
    } = {},
  ) {
    return api.get<Page<NoticeSummaryResponse>>(
      "/admin/notices",
      params,
    );
  },

  /**
   * 관리자 공지 상세 조회
   *
   * 백엔드:
   * GET /api/v1/admin/notices/{noticeId}
   */
  getAdminDetail(noticeId: number) {
    return api.get<NoticeDetailResponse>(
      `/admin/notices/${noticeId}`,
    );
  },

  /**
   * 관리자 공지 등록
   *
   * 백엔드:
   * POST /api/v1/admin/notices
   */
  create(payload: NoticeCreateRequest) {
    return api.post<NoticeDetailResponse>(
      "/admin/notices",
      payload,
    );
  },

  /**
   * 관리자 공지 수정
   *
   * 백엔드:
   * PUT /api/v1/admin/notices/{noticeId}
   */
  update(
    noticeId: number,
    payload: NoticeUpdateRequest,
  ) {
    return api.put<NoticeDetailResponse>(
      `/admin/notices/${noticeId}`,
      payload,
    );
  },

  /**
   * 관리자 공지 삭제
   *
   * 백엔드:
   * DELETE /api/v1/admin/notices/{noticeId}
   */
  delete(noticeId: number) {
    return api.del<void>(
      `/admin/notices/${noticeId}`,
    );
  },
};