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

export interface NoticeDetailResponse extends NoticeSummaryResponse {
  content: string;
}

export const noticeApi = {
  listAdmin(params: { page?: number; size?: number; keyword?: string; isPublished?: boolean } = {}) {
    return api.get<Page<NoticeSummaryResponse>>("/admin/notices", params);
  },

  create(payload: { title: string; content: string; isPinned?: boolean; isPublished?: boolean }) {
    return api.post<NoticeDetailResponse>("/admin/notices", payload);
  },

  delete(noticeId: number) {
    return api.del<void>(`/admin/notices/${noticeId}`);
  },
};