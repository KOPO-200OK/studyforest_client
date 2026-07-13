import { api } from "./client";
import type { Page } from "./types";

export interface InquirySummaryResponse {
  inquiryId: number;
  title: string;
  isSecret: boolean;
  hasComment: boolean;
  authorName: string;
  createdAt: string;
}

export interface InquiryCommentResponse {
  commentId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryDetailResponse {
  inquiryId: number;
  title: string;
  content: string;
  isSecret: boolean;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  comments: InquiryCommentResponse[];
}

export interface InquiryCreateRequest {
  title: string;
  content: string;
  isSecret?: boolean;
}

export interface InquiryUpdateRequest {
  title: string;
  content: string;
  isSecret?: boolean;
}

export const inquiryApi = {
  /**
   * 비밀글을 제외한 공개 문의 목록입니다.
   *
   * 현재 프론트에는 공개 문의 게시판 화면이 없으므로
   * API 함수만 유지합니다.
   */
  listPublic(
    params: {
      page?: number;
      size?: number;
    } = {},
  ) {
    return api.get<
      Page<InquirySummaryResponse>
    >(
      "/inquiries/public",
      params,
    );
  },

  /**
   * 로그인한 사용자의 문의 목록입니다.
   */
  listMine(
    params: {
      page?: number;
      size?: number;
    } = {},
  ) {
    return api.get<
      Page<InquirySummaryResponse>
    >(
      "/inquiries",
      params,
    );
  },

  /**
   * 본인 문의 상세 조회입니다.
   */
  getMine(
    inquiryId: number,
  ) {
    return api.get<
      InquiryDetailResponse
    >(
      `/inquiries/${inquiryId}`,
    );
  },

  /**
   * 문의 등록입니다.
   */
  create(
    payload:
      InquiryCreateRequest,
  ) {
    return api.post<
      InquiryDetailResponse
    >(
      "/inquiries",
      payload,
    );
  },

  /**
   * 문의 수정입니다.
   *
   * 백엔드 정책상 관리자 답변이 달린 문의는 수정할 수 없습니다.
   */
  update(
    inquiryId: number,
    payload:
      InquiryUpdateRequest,
  ) {
    return api.put<
      InquiryDetailResponse
    >(
      `/inquiries/${inquiryId}`,
      payload,
    );
  },

  /**
   * 문의 삭제입니다.
   *
   * 백엔드 정책상 관리자 답변이 달린 문의는 삭제할 수 없습니다.
   */
  delete(
    inquiryId: number,
  ) {
    return api.del<void>(
      `/inquiries/${inquiryId}`,
    );
  },
};

export const adminInquiryApi = {
  /**
   * 관리자 문의 목록입니다.
   */
  list(
    params: {
      page?: number;
      size?: number;
      keyword?: string;
    } = {},
  ) {
    return api.get<
      Page<InquirySummaryResponse>
    >(
      "/admin/inquiries",
      params,
    );
  },

  /**
   * 관리자 문의 상세 조회입니다.
   */
  getDetail(
    inquiryId: number,
  ) {
    return api.get<
      InquiryDetailResponse
    >(
      `/admin/inquiries/${inquiryId}`,
    );
  },

  /**
   * 관리자 답변 등록입니다.
   */
  addComment(
    inquiryId: number,
    content: string,
  ) {
    return api.post<
      InquiryCommentResponse
    >(
      `/admin/inquiries/${inquiryId}/comments`,
      {
        content,
      },
    );
  },

  /**
   * 관리자 답변 수정입니다.
   */
  updateComment(
    inquiryId: number,
    commentId: number,
    content: string,
  ) {
    return api.put<
      InquiryCommentResponse
    >(
      `/admin/inquiries/${inquiryId}/comments/${commentId}`,
      {
        content,
      },
    );
  },

  /**
   * 관리자 답변 삭제입니다.
   */
  deleteComment(
    inquiryId: number,
    commentId: number,
  ) {
    return api.del<void>(
      `/admin/inquiries/${inquiryId}/comments/${commentId}`,
    );
  },
};