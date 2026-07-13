import { api } from "./client";
import type { Page } from "./types";

export type AiDifficulty =
  | "basic"
  | "intermediate"
  | "advanced";

export type AiQuestionType =
  | "multiple_choice"
  | "short_answer"
  | "ox";

export interface GeneratedQuestionResponse {
  aiGeneratedQuestionId: number;
  questionOrder: number;
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
  era: string;
  topic: string;
  difficulty: string;
  examTip: string;
}

export interface GenerateAiQuestionResponse {
  aiGeneratedQuestionSetId: number;
  questions: GeneratedQuestionResponse[];
}

export interface SolveAiGeneratedQuestionRequest {
  selectedChoiceIndex?: number;
  selectedAnswerText?: string;
}

export interface SolveAiGeneratedQuestionResponse {
  solveRecordId: number;
  aiGeneratedQuestionId: number;

  selectedChoiceIndex?:
    | number
    | null;

  selectedAnswerText?:
    | string
    | null;

  correctAnswerText: string;
  isCorrect: boolean;

  explanation?:
    | string
    | null;
}

export interface AiGeneratedQuestionSetSummaryResponse {
  aiGeneratedQuestionSetId: number;
  topic: string;
  difficulty: string;
  questionType: string;
  questionCount: number;
  includeExplanation: boolean;
  createdAt: string;
}

export interface AiGeneratedQuestionDetailResponse {
  aiGeneratedQuestionId: number;
  questionOrder: number;
  question: string;
  choices: string[];
  answer: string;

  explanation?:
    | string
    | null;

  era?:
    | string
    | null;

  topic?:
    | string
    | null;

  difficulty?:
    | string
    | null;

  examTip?:
    | string
    | null;
}

export interface AiGeneratedQuestionSetDetailResponse {
  aiGeneratedQuestionSetId: number;
  topic: string;
  difficulty: string;
  questionType: string;
  questionCount: number;
  includeExplanation: boolean;
  createdAt: string;

  questions:
    AiGeneratedQuestionDetailResponse[];
}

export interface AiGeneratedQuestionSolveRecordResponse {
  solveRecordId: number;
  aiGeneratedQuestionId: number;

  question?:
    | string
    | null;

  selectedChoiceIndex?:
    | number
    | null;

  selectedAnswerText?:
    | string
    | null;

  correctAnswerText?:
    | string
    | null;

  isCorrect: boolean;
  solvedAt: string;
}

export const aiApi = {
  /**
   * AI 문제 생성
   */
  generateQuestions(input: {
    topic: string;
    difficulty?: AiDifficulty;
    questionType?: AiQuestionType;
    count?: number;
    includeExplanation?: boolean;
  }) {
    return api.post<GenerateAiQuestionResponse>(
      "/ai/questions/generate",
      {
        topic:
          input.topic,

        difficulty:
          input.difficulty ??
          "intermediate",

        question_type:
          input.questionType ??
          "multiple_choice",

        count:
          input.count ??
          5,

        include_explanation:
          input.includeExplanation ??
          true,
      },
    );
  },

  /**
   * AI 생성 문제 채점
   */
  solveGeneratedQuestion(
    aiGeneratedQuestionId: number,
    payload:
      SolveAiGeneratedQuestionRequest,
  ) {
    return api.post<SolveAiGeneratedQuestionResponse>(
      `/ai/generated-questions/${aiGeneratedQuestionId}/solve`,
      payload,
    );
  },

  /**
   * AI 생성 문제 세트 목록 조회
   */
  listGeneratedQuestionSets(
    params: {
      page?: number;
      size?: number;
    } = {},
  ) {
    return api.get<
      Page<AiGeneratedQuestionSetSummaryResponse>
    >(
      "/ai/generated-question-sets",
      params,
    );
  },

  /**
   * AI 생성 문제 세트 상세 조회
   */
  getGeneratedQuestionSet(
    setId: number,
  ) {
    return api.get<
      AiGeneratedQuestionSetDetailResponse
    >(
      `/ai/generated-question-sets/${setId}`,
    );
  },

  /**
   * AI 생성 문제 세트 삭제
   */
  deleteGeneratedQuestionSet(
    setId: number,
  ) {
    return api.del<void>(
      `/ai/generated-question-sets/${setId}`,
    );
  },

  /**
   * AI 생성 문제 풀이 기록 조회
   */
  listGeneratedQuestionSolveRecords(
    params: {
      page?: number;
      size?: number;
    } = {},
  ) {
    return api.get<
      Page<AiGeneratedQuestionSolveRecordResponse>
    >(
      "/ai/generated-question-solve-records",
      params,
    );
  },
};