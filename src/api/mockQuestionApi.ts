// ============================================================
// 관리자 "문제 관리" 목업 저장소 — 백엔드(문제 등록 API) 준비 전까지 임시 사용.
// localStorage에 문제를 저장한다. 실제 문제은행 풀이 화면과는 아직 연결돼 있지 않다.
// 백엔드가 준비되면 이 파일을 지우고 questionApi.ts에 실제 등록 API를 추가해 교체.
// ============================================================

import type { Difficulty, ExamLevel, PeriodCode } from "./types";

const QUESTIONS_KEY = "gongsoop_mock_questions";

export interface MockQuestionOption {
  optionNo: number;
  optionContent: string;
  isCorrect: boolean;
  optionExplanation?: string;
}

export interface MockQuestion {
  questionId: number;
  periodCode: PeriodCode;
  topicName: string;
  questionContent: string;
  difficulty: Difficulty;
  examLevel: ExamLevel;
  options: MockQuestionOption[];
}

export type CreateQuestionInput = Omit<MockQuestion, "questionId">;

function loadQuestions(): MockQuestion[] {
  const raw = localStorage.getItem(QUESTIONS_KEY);
  return raw ? (JSON.parse(raw) as MockQuestion[]) : [];
}

function saveQuestions(questions: MockQuestion[]) {
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
}

export const mockQuestionApi = {
  listQuestions(): MockQuestion[] {
    return loadQuestions();
  },

  addQuestion(input: CreateQuestionInput): MockQuestion {
    const questions = loadQuestions();
    const nextId = questions.reduce((max, q) => Math.max(max, q.questionId), 0) + 1;
    const question: MockQuestion = { ...input, questionId: nextId };
    questions.push(question);
    saveQuestions(questions);
    return question;
  },

  deleteQuestion(questionId: number): void {
    saveQuestions(loadQuestions().filter((q) => q.questionId !== questionId));
  },
};
