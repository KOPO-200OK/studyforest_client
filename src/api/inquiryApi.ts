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

export const inquiryApi = {
  listPublic(params: { page?: number; size?: number } = {}) {
    return api.get<Page<InquirySummaryResponse>>("/inquiries/public", params);
  },
  listMine(params: { page?: number; size?: number } = {}) {
    return api.get<Page<InquirySummaryResponse>>("/inquiries", params);
  },
  getMine(inquiryId: number) {
    return api.get<InquiryDetailResponse>(`/inquiries/${inquiryId}`);
  },
  create(payload: { title: string; content: string; isSecret?: boolean }) {
    return api.post<InquiryDetailResponse>("/inquiries", payload);
  },
  update(inquiryId: number, payload: { title: string; content: string; isSecret?: boolean }) {
    return api.put<InquiryDetailResponse>(`/inquiries/${inquiryId}`, payload);
  },
  delete(inquiryId: number) {
    return api.del<void>(`/inquiries/${inquiryId}`);
  },
};

export const adminInquiryApi = {
  list(params: { page?: number; size?: number; keyword?: string } = {}) {
    return api.get<Page<InquirySummaryResponse>>("/admin/inquiries", params);
  },
  getDetail(inquiryId: number) {
    return api.get<InquiryDetailResponse>(`/admin/inquiries/${inquiryId}`);
  },
  addComment(inquiryId: number, content: string) {
    return api.post<InquiryCommentResponse>(`/admin/inquiries/${inquiryId}/comments`, { content });
  },
  updateComment(inquiryId: number, commentId: number, content: string) {
    return api.put<InquiryCommentResponse>(`/admin/inquiries/${inquiryId}/comments/${commentId}`, { content });
  },
  deleteComment(inquiryId: number, commentId: number) {
    return api.del<void>(`/admin/inquiries/${inquiryId}/comments/${commentId}`);
  },
};
