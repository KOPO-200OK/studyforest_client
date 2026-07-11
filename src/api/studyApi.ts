import { api } from "./client";

export interface StudySummaryResponse {
  totalSolvedCount: number;
  correctCount: number;
  wrongCount: number;
  accuracyRate: number;
  unresolvedWrongCount: number;
  submittedMockExamCount: number;
  averageMockExamScore: number;
  todayStudySeconds: number;
  weeklyStudySeconds: number;
}

export interface WeaknessItemResponse {
  era: string;
  category: string;
  solvedCount: number;
  correctCount: number;
  wrongCount: number;
  accuracyRate: number;
}

export interface WeaknessAnalysisResponse {
  items: WeaknessItemResponse[];
}

export const studyApi = {
  getSummary() {
    return api.get<StudySummaryResponse>("/study/summary");
  },
  getWeaknessAnalysis() {
    return api.get<WeaknessAnalysisResponse>("/study/weakness");
  },
};
