// ============================================================
// AI 문제 생성 API — studyforest_server(Spring) → studyforest_AI(FastAPI/OpenAI) 프록시
//   POST /api/v1/ai/questions/generate (AiController.generateQuestions)
// ============================================================
import { api } from "./client";

export type AiDifficulty = "basic" | "intermediate" | "advanced";
export type AiQuestionType = "multiple_choice" | "short_answer" | "ox";

export interface GeneratedQuestionResponse {
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
  questions: GeneratedQuestionResponse[];
}

export const aiApi = {
  generateQuestions(input: {
    topic: string;
    difficulty?: AiDifficulty;
    questionType?: AiQuestionType;
    count?: number;
    includeExplanation?: boolean;
  }) {
    return api.post<GenerateAiQuestionResponse>("/ai/questions/generate", {
      topic: input.topic,
      difficulty: input.difficulty ?? "intermediate",
      question_type: input.questionType ?? "multiple_choice",
      count: input.count ?? 5,
      include_explanation: input.includeExplanation ?? true,
    });
  },
};
