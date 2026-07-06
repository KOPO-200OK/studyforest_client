// ============================================================
// 백엔드 DTO 응답 타입 — 백엔드 공통 설계 규칙 5.1 네이밍 준수
//   목록: {Domain}SummaryResponse / 상세: {Domain}DetailResponse
// 테이블 규칙 3.1: question_option (option 단독명 금지 → question_option)
// ============================================================

export type ExamLevel = "BASIC" | "ADVANCED";
export type Difficulty = "EASY" | "NORMAL" | "HARD";
export type PeriodCode = "PREHISTORY" | "THREE_KINGDOMS" | "GORYEO" | "JOSEON" | "MODERN";
export type SolveType = "PERIOD" | "RANDOM" | "MOCK" | "WRONG_RETRY";

/** question_option 행 (구 question_choice) */
export interface QuestionOptionResponse {
  questionOptionId: number;
  optionNo: number;
  optionContent: string;
  /** 채점 전 목록/상세 응답에는 내려주지 않음 (정답 노출 방지) */
  isCorrect?: boolean;
  optionExplanation?: string | null;
}

/** 목록용 요약 응답 */
export interface QuestionSummaryResponse {
  questionId: number;
  periodCode: PeriodCode;
  topicName: string;
  difficulty: Difficulty;
  examLevel: ExamLevel;
  /** 목록 미리보기용 앞부분 */
  questionPreview: string;
}

/** 상세 응답 (풀이 화면) */
export interface QuestionDetailResponse {
  questionId: number;
  periodCode: PeriodCode;
  topicId: number;
  questionContent: string;
  difficulty: Difficulty;
  examLevel: ExamLevel;
  options: QuestionOptionResponse[];
}

/** 채점 응답 */
export interface SolveResultResponse {
  isCorrect: boolean;
  correctOptionId: number;
  explanation?: string | null;
  solveRecordId: number;
}

/** 오답노트 요약 응답 */
export interface WrongAnswerSummaryResponse {
  wrongAnswerId: number;
  question: QuestionSummaryResponse;
  wrongCount: number;
  isResolved: boolean;
  createdAt: string; // ISO (LocalDateTime)
}

/** 모의고사 응답 */
export interface MockExamResponse {
  mockExamId: number;
  title: string;
  examLevel: ExamLevel;
  totalCount: number;
  correctCount?: number;
  score?: number;
  status: "IN_PROGRESS" | "SUBMITTED";
}

export interface MockExamDetailResponse extends MockExamResponse {
  questions: QuestionDetailResponse[];
}

/** Spring Data Page 응답 (페이지 0부터 시작 — 규칙 4.5) */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** AI 질의응답 */
export interface AiChatSessionResponse {
  aiChatSessionId: number;
  title: string;
}
export interface AiChatMessageResponse {
  aiChatMessageId: number;
  senderType: "USER" | "AI";
  messageContent: string;
  createdAt: string;
}
