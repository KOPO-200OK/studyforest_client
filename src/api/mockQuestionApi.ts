import { adminApi } from "./adminApi";
import type { Difficulty, ExamLevel, PeriodCode } from "./types";

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

const PERIOD_LABEL: Record<PeriodCode, string> = {
  PREHISTORY: "선사·고조선",
  THREE_KINGDOMS: "삼국·남북국",
  GORYEO: "고려",
  JOSEON: "조선",
  MODERN: "근현대",
};

function periodFromEra(era?: string | null): PeriodCode {
  const found = (Object.entries(PERIOD_LABEL) as [PeriodCode, string][]).find(([key, label]) => era === key || era === label);
  return found?.[0] ?? "PREHISTORY";
}

let cache: MockQuestion[] = [];

function mapQuestion(q: {
  questionId: number;
  era?: string | null;
  category?: string | null;
  questionPreview?: string;
  questionText?: string;
}): MockQuestion {
  return {
    questionId: q.questionId,
    periodCode: periodFromEra(q.era),
    topicName: q.category ?? "-",
    questionContent: q.questionText ?? q.questionPreview ?? "",
    difficulty: "NORMAL",
    examLevel: "BASIC",
    options: [],
  };
}

export const mockQuestionApi = {
  listQuestions(): MockQuestion[] {
    return cache;
  },

  async loadQuestions(): Promise<MockQuestion[]> {
    const page = await adminApi.listQuestions({ page: 0, size: 50, isDeleted: false });
    cache = page.content.map(mapQuestion);
    return cache;
  },

  async addQuestion(input: CreateQuestionInput): Promise<MockQuestion> {
    const correct = input.options.find((o) => o.isCorrect)?.optionNo ?? 1;
    const nextQNo = cache.length + 1;

    const created = await adminApi.createQuestion({
      examRound: 1,
      qNo: nextQNo,
      questionText: input.questionContent,
      passage: null,
      point: 2,
      choice1: input.options[0]?.optionContent ?? "-",
      choice2: input.options[1]?.optionContent ?? "-",
      choice3: input.options[2]?.optionContent ?? "-",
      choice4: input.options[3]?.optionContent ?? "-",
      choice5: "위 내용 중 정답 없음",
      answer: correct,
      era: PERIOD_LABEL[input.periodCode],
      category: input.topicName,
    });

    const question: MockQuestion = {
      ...input,
      questionId: created.questionId,
    };

    cache = [question, ...cache];
    return question;
  },

  async deleteQuestion(questionId: number): Promise<void> {
    await adminApi.deleteQuestion(questionId);
    cache = cache.filter((q) => q.questionId !== questionId);
  },
};