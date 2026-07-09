import { api } from "./client";
import type { Page } from "./types";

export interface AdminMemberSummaryResponse {
  memberId: number;
  name: string;
  birthdate: string;
  email: string;
  userRole: "USER" | "ADMIN" | string;
  isDeleted: boolean;
}

export interface AdminQuestionSummaryResponse {
  questionId: number;
  examRound: number;
  qNo: number;
  era?: string | null;
  category?: string | null;
  point: number;
  questionPreview: string;
  isDeleted: boolean;
}

export interface AdminQuestionDetailResponse extends AdminQuestionSummaryResponse {
  questionText: string;
  passage?: string | null;
  choices: { choiceNo: number; choiceText: string }[];
  answer: number;
}

export interface AdminQuestionPayload {
  examRound: number;
  qNo: number;
  questionText: string;
  passage?: string | null;
  point: number;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  choice5: string;
  answer: number;
  era?: string | null;
  category?: string | null;
}

export const adminApi = {
  listMembers(params: { page?: number; size?: number; keyword?: string; userRole?: string; isDeleted?: boolean } = {}) {
    return api.get<Page<AdminMemberSummaryResponse>>("/admin/members", params);
  },

  updateMemberRole(memberId: number, userRole: "USER" | "ADMIN") {
    return api.patch<AdminMemberSummaryResponse>(`/admin/members/${memberId}/role`, { userRole });
  },

  updateMemberDeleteStatus(memberId: number, isDeleted: boolean) {
    return api.patch<AdminMemberSummaryResponse>(`/admin/members/${memberId}/delete-status`, { isDeleted });
  },

  listQuestions(params: { page?: number; size?: number; examRound?: number; era?: string; category?: string; keyword?: string; isDeleted?: boolean } = {}) {
    return api.get<Page<AdminQuestionSummaryResponse>>("/admin/questions", params);
  },

  createQuestion(payload: AdminQuestionPayload) {
    return api.post<AdminQuestionDetailResponse>("/admin/questions", payload);
  },

  deleteQuestion(questionId: number) {
    return api.del<void>(`/admin/questions/${questionId}`);
  },
};