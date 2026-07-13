import { api } from "./client";

export interface AdminDashboardResponse {
  totalMemberCount: number;
  activeMemberCount: number;
  deletedMemberCount: number;

  histQuestionCount: number;
  histSolveRecordCount: number;
  mockExamCount: number;

  aiGeneratedQuestionSetCount: number;
  aiChatSessionCount: number;
}

export const adminDashboardApi = {
  getDashboard() {
    return api.get<AdminDashboardResponse>(
      "/admin/dashboard",
    );
  },
};