// ============================================================
// 문제은행과 모의고사 화면에서 사용하는 프론트 공통 타입
// ============================================================

export type ExamLevel =
  | "BASIC"
  | "ADVANCED";

export type Difficulty =
  | "EASY"
  | "NORMAL"
  | "HARD";

export type PeriodCode =
  | "PREHISTORY"
  | "THREE_KINGDOMS"
  | "GORYEO"
  | "JOSEON"
  | "MODERN";

export type SolveType =
  | "PERIOD"
  | "RANDOM"
  | "MOCK"
  | "WRONG_RETRY";

export type MockExamStatus =
  | "IN_PROGRESS"
  | "SUBMITTED";

/**
 * 문제 보기
 */
export interface QuestionOptionResponse {
  questionOptionId: number;
  optionNo: number;
  optionContent: string;

  /**
   * 일반 문제 조회에서는 정답 노출 방지를 위해
   * 값이 내려오지 않습니다.
   */
  isCorrect?: boolean;

  optionExplanation?: string | null;
}

/**
 * 문제 목록용 요약 응답
 */
export interface QuestionSummaryResponse {
  questionId: number;

  examRound: number;
  qNo: number;

  era: string;
  category: string;
  point: number;

  periodCode: PeriodCode;
  topicName: string;
  difficulty: Difficulty;
  examLevel: ExamLevel;

  questionPreview: string;
}

/**
 * 문제 상세 응답
 */
export interface QuestionDetailResponse {
  questionId: number;

  examRound: number;
  qNo: number;

  era: string;
  category: string;
  point: number;

  periodCode: PeriodCode;
  topicName: string;
  difficulty: Difficulty;
  examLevel: ExamLevel;

  questionContent: string;
  passage?: string | null;

  options: QuestionOptionResponse[];
}

/**
 * 일반 문제 채점 응답
 */
export interface SolveResultResponse {
  isCorrect: boolean;
  correctOptionId: number;
  explanation?: string | null;
  solveRecordId: number;
}

/**
 * 오답노트 요약 응답
 */
export interface WrongAnswerSummaryResponse {
  wrongAnswerId: number;
  question: QuestionSummaryResponse;
  wrongCount: number;
  isResolved: boolean;
  lastSelectedAnswer?: number;
  correctAnswer?: number;
  createdAt: string;
}

/**
 * 모의고사 공통 응답
 */
export interface MockExamResponse {
  mockExamId: number;
  title: string;

  examLevel: ExamLevel;
  totalCount: number;

  status: MockExamStatus;

  startedAt: string;
  submittedAt?: string | null;
}

/**
 * 모의고사 응시 화면 응답
 */
export interface MockExamDetailResponse
  extends MockExamResponse {
  questions: QuestionDetailResponse[];

  /**
   * 문제 ID를 키로 사용하는 저장 답안입니다.
   *
   * 예:
   * {
   *   57001: 2,
   *   57002: 4
   * }
   */
  selectedAnswers: Record<number, number>;
}

/**
 * 모의고사 문제별 채점 결과
 */
export interface MockExamAnswerResultResponse {
  questionId: number;
  questionOrder: number;

  selectedOptionId: number;
  correctOptionId: number;

  isCorrect: boolean;
}

/**
 * 모의고사 최종 결과
 */
export interface MockExamResultResponse
  extends MockExamResponse {
  correctCount: number;
  score: number;

  submittedAt: string;

  answers: MockExamAnswerResultResponse[];
}

/**
 * 모의고사 목록 응답
 */
export interface MockExamSummaryResponse
  extends MockExamResponse {
  correctCount?: number;
  score?: number;
}

/**
 * Spring 페이지 응답
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * AI 채팅 세션
 */
export interface AiChatSessionResponse {
  aiChatSessionId: number;
  title: string;
}

/**
 * AI 채팅 메시지
 */
export interface AiChatMessageResponse {
  aiChatMessageId: number;
  senderType: "USER" | "AI";
  messageContent: string;
  createdAt: string;
}