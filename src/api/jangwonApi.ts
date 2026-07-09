import { api } from "./client";
import type { Page } from "./types";

export interface JangwonApplicationResponse {
  jangwonApplicationId: number;
  memberId: number;
  displayNickname: string;
  displayName: string;
  characterName: string;
  characterImageUrl?: string | null;
  certificateImageUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
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

export const jangwonApi = {
  listWinners(params: { page?: number; size?: number } = {}) {
    return api.get<Page<JangwonWinnerResponse>>("/jangwon", params);
  },

  apply(payload: {
    displayNickname: string;
    characterName: string;
    characterImageUrl?: string | null;
    certificateImageUrl: string;
  }) {
    return api.post<JangwonApplicationResponse>("/jangwon/applications", payload);
  },

  listMyApplications(params: { page?: number; size?: number } = {}) {
    return api.get<Page<JangwonApplicationResponse>>("/jangwon/applications/me", params);
  },

  listAdminApplications(params: {
    page?: number;
    size?: number;
    status?: string;
    keyword?: string;
  } = {}) {
    return api.get<Page<JangwonApplicationResponse>>("/admin/jangwon/applications", params);
  },

  approve(applicationId: number) {
    return api.patch<JangwonApplicationResponse>(`/admin/jangwon/applications/${applicationId}/approve`, {});
  },

  reject(applicationId: number, adminMemo: string) {
    return api.patch<JangwonApplicationResponse>(`/admin/jangwon/applications/${applicationId}/reject`, {
      adminMemo,
    });
  },

  delete(applicationId: number) {
    return api.del<void>(`/admin/jangwon/applications/${applicationId}`);
  },
};