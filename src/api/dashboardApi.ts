import { api } from "./client";

export type DashboardActivityType =
  | "HIST_SOLVE"
  | "AI_GENERATED_SOLVE"
  | "MOCK_EXAM"
  | "AI_GENERATED_SET"
  | "AI_CHAT";

export interface DashboardSummaryResponse {
  totalSolvedCount: number;
  correctCount: number;
  wrongCount: number;
  accuracyRate: number;

  histSolvedCount: number;
  aiGeneratedSolvedCount: number;

  unresolvedWrongCount: number;
  generatedQuestionSetCount: number;
  aiChatSessionCount: number;

  submittedMockExamCount: number;
  averageMockExamScore: number;
}

export interface RecentActivityResponse {
  activityType: DashboardActivityType | string;
  title: string;
  description: string;
  targetId: number;
  createdAt: string;
}

export interface DashboardResponse {
  summary: DashboardSummaryResponse;
  recentActivities: RecentActivityResponse[];
}

export const dashboardApi = {
  /**
   * 대시보드 요약과 최근 활동을 함께 조회합니다.
   */
  getDashboard() {
    return api.get<DashboardResponse>(
      "/dashboard",
    );
  },

  /**
   * 대시보드 통계만 조회합니다.
   */
  getSummary() {
    return api.get<DashboardSummaryResponse>(
      "/dashboard/summary",
    );
  },

  /**
   * 최근 학습 활동을 조회합니다.
   *
   * 백엔드는 최대 30개까지 허용합니다.
   */
  getRecentActivities(
    limit = 10,
  ) {
    return api.get<RecentActivityResponse[]>(
      "/dashboard/recent-activities",
      {
        limit,
      },
    );
  },
};