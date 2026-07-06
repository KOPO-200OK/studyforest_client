// ============================================================
// 문제은행 API — 백엔드 공통 설계 규칙 준수
//   URL: /api/v1 + 복수형 kebab-case (규칙 4.1)
//   페이징: page 0부터 (규칙 4.5)
//   응답: client가 공통 래퍼 언래핑 후 data만 반환
// ============================================================
import { api } from "./client";
import type {
  QuestionSummaryResponse, QuestionDetailResponse, SolveResultResponse,
  WrongAnswerSummaryResponse, MockExamResponse, MockExamDetailResponse,
  AiChatSessionResponse, Page, ExamLevel, Difficulty, PeriodCode, SolveType,
} from "./types";

// ── 시대별/목록 조회 ──
export function getQuestions(params: {
  period?: PeriodCode; examLevel?: ExamLevel; difficulty?: Difficulty;
  topicId?: number; page?: number; size?: number;
}) {
  return api.get<Page<QuestionSummaryResponse>>("/questions", params);
}

export function getQuestion(questionId: number) {
  return api.get<QuestionDetailResponse>(`/questions/${questionId}`);
}

// ── 채점 (POST = 업무 실행, 규칙 4.2 / 오답 시 서버가 MERGE) ──
export function solveQuestion(questionId: number, selectedOptionId: number, solveType: SolveType = "PERIOD") {
  return api.post<SolveResultResponse>(`/questions/${questionId}/solve`, { selectedOptionId, solveType });
}

// ── 랜덤 ──
export function getRandomQuestions(params: {
  count?: number; examLevel?: ExamLevel; difficulty?: Difficulty; periods?: string;
}) {
  return api.get<QuestionDetailResponse[]>("/questions/random", params);
}

// ── 모의고사 ──
export function createMockExam(body: { examLevel: ExamLevel; totalCount: number }) {
  return api.post<MockExamDetailResponse>("/mock-exams", body);
}
export function saveMockAnswers(mockExamId: number, answers: { questionId: number; selectedOptionId: number }[]) {
  return api.patch<void>(`/mock-exams/${mockExamId}/answers`, { answers });
}
export function submitMockExam(mockExamId: number) {
  return api.post<MockExamResponse>(`/mock-exams/${mockExamId}/submit`);
}

// ── 오답노트 ──
export function getWrongAnswers(params: { period?: PeriodCode; resolved?: boolean; page?: number; size?: number }) {
  return api.get<Page<WrongAnswerSummaryResponse>>("/wrong-answers", params);
}
export function retryWrongAnswer(wrongAnswerId: number, selectedOptionId: number) {
  return api.post<SolveResultResponse>(`/wrong-answers/${wrongAnswerId}/retry`, { selectedOptionId });
}

// ── AI 질의응답 ──
export function createChatSession(body: { questionId?: number }) {
  return api.post<AiChatSessionResponse>("/ai/chat-sessions", body);
}
export function sendChatMessage(chatSessionId: number, message: string) {
  return api.post<{ answer: string }>(`/ai/chat-sessions/${chatSessionId}/messages`, { message });
}
