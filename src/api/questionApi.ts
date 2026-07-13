// ============================================================
// 문제은행 및 모의고사 API
//
// 백엔드의 실제 DTO를 이 파일에서 프론트 화면 DTO로 변환합니다.
// ============================================================

import { api } from "./client";

import type {
  AiChatSessionResponse,
  Difficulty,
  ExamLevel,
  MockExamAnswerResultResponse,
  MockExamDetailResponse,
  MockExamResultResponse,
  MockExamStatus,
  MockExamSummaryResponse,
  Page,
  PeriodCode,
  QuestionDetailResponse,
  QuestionOptionResponse,
  QuestionSummaryResponse,
  SolveResultResponse,
  SolveType,
  WrongAnswerSummaryResponse,
} from "./types";

/**
 * 백엔드 문제 목록 응답
 */
interface BackendQuestionSummaryResponse {
  questionId: number;
  examRound: number;
  qNo: number;

  era?: string | null;
  category?: string | null;
  point?: number | null;

  questionPreview: string;
}

/**
 * 백엔드 문제 보기 응답
 */
interface BackendQuestionOptionResponse {
  questionOptionId: number;
  optionNo: number;

  optionContent?: string | null;

  isCorrect?: boolean | null;
  optionExplanation?: string | null;
}

/**
 * 백엔드 문제 상세 응답
 */
interface BackendQuestionDetailResponse {
  questionId: number;

  examRound: number;
  qNo: number;

  questionContent: string;
  passage?: string | null;

  point?: number | null;
  era?: string | null;
  category?: string | null;

  options: BackendQuestionOptionResponse[];
}

/**
 * 백엔드 오답노트 응답
 */
interface BackendWrongAnswerSummaryResponse {
  wrongAnswerId: number;

  question: BackendQuestionSummaryResponse;

  wrongCount: number;
  isResolved: boolean;

  lastSelectedAnswer?: number | null;
  correctAnswer?: number | null;

  createdAt: string;
}

/**
 * 백엔드 모의고사 문제 응답
 *
 * 문제 정보가 question 필드 안에 한 번 더 중첩되어 있습니다.
 */
interface BackendMockExamQuestionResponse {
  questionOrder: number;

  selectedOptionId?: number | null;

  question: BackendQuestionDetailResponse;
}

/**
 * 백엔드 모의고사 생성 및 응시 조회 응답
 */
interface BackendMockExamStartResponse {
  mockExamId: number;
  title: string;

  totalQuestionCount: number;

  /**
   * 백엔드에서는 STARTED 또는 SUBMITTED를 사용합니다.
   */
  status: string;

  startedAt: string;

  questions: BackendMockExamQuestionResponse[];
}

/**
 * 백엔드 모의고사 문제별 결과
 */
interface BackendMockExamAnswerResultResponse {
  questionId: number;
  questionOrder: number;

  selectedOptionId: number;
  correctOptionId: number;

  isCorrect: boolean;
}

/**
 * 백엔드 모의고사 제출 결과
 */
interface BackendMockExamResultResponse {
  mockExamId: number;
  title: string;

  totalQuestionCount: number;
  correctCount: number;
  score: number;

  status: string;

  startedAt: string;
  submittedAt: string;

  answers: BackendMockExamAnswerResultResponse[];
}

/**
 * 백엔드 모의고사 목록 응답
 */
interface BackendMockExamSummaryResponse {
  mockExamId: number;
  title: string;

  totalQuestionCount: number;

  correctCount?: number | null;
  score?: number | null;

  status: string;

  startedAt: string;
  submittedAt?: string | null;
}

/**
 * 모의고사 답안 요청
 */
export interface MockExamAnswerRequest {
  questionId: number;
  selectedOptionId: number;
}

/**
 * DB의 ERA 문자열을 프론트 시대 코드로 변환합니다.
 */
function mapPeriodCode(
  era?: string | null,
): PeriodCode {
  const normalized =
    era?.replace(/\s/g, "") ?? "";

  if (
    normalized.startsWith("선사") ||
    normalized.includes("고조선")
  ) {
    return "PREHISTORY";
  }

  if (
    normalized.startsWith("고대") ||
    normalized.includes("삼국") ||
    normalized.includes("남북국")
  ) {
    return "THREE_KINGDOMS";
  }

  if (normalized.includes("고려")) {
    return "GORYEO";
  }

  if (normalized.startsWith("조선")) {
    return "JOSEON";
  }

  if (
    normalized.startsWith("근대") ||
    normalized.startsWith("일제") ||
    normalized.startsWith("현대")
  ) {
    return "MODERN";
  }

  return "MODERN";
}

/**
 * 문제 배점을 화면 난이도로 변환합니다.
 */
function mapDifficulty(
  point?: number | null,
): Difficulty {
  if (
    point !== undefined &&
    point !== null &&
    point <= 1
  ) {
    return "EASY";
  }

  if (
    point !== undefined &&
    point !== null &&
    point >= 3
  ) {
    return "HARD";
  }

  return "NORMAL";
}

/**
 * 관리자 등록 기본 문제는 900회,
 * 관리자 등록 심화 문제는 901회를 사용합니다.
 *
 * 기존 한국사 기출문제는 심화 문제로 처리합니다.
 */
function mapExamLevel(
  examRound?: number,
): ExamLevel {
  return examRound === 900
    ? "BASIC"
    : "ADVANCED";
}

/**
 * 문제 보기 응답을 변환합니다.
 */
function mapQuestionOption(
  option: BackendQuestionOptionResponse,
): QuestionOptionResponse {
  return {
    questionOptionId:
      option.questionOptionId,

    optionNo:
      option.optionNo,

    optionContent:
      option.optionContent?.trim() ?? "",

    isCorrect:
      option.isCorrect ?? undefined,

    optionExplanation:
      option.optionExplanation ?? null,
  };
}

/**
 * 문제 목록 응답을 변환합니다.
 */
function mapQuestionSummary(
  question: BackendQuestionSummaryResponse,
): QuestionSummaryResponse {
  const era =
    question.era?.trim() || "미분류";

  const category =
    question.category?.trim() || "미분류";

  const point =
    question.point ?? 2;

  return {
    questionId:
      question.questionId,

    examRound:
      question.examRound,

    qNo:
      question.qNo,

    era,
    category,
    point,

    periodCode:
      mapPeriodCode(era),

    topicName:
      category,

    difficulty:
      mapDifficulty(point),

    examLevel:
      mapExamLevel(
        question.examRound,
      ),

    questionPreview:
      question.questionPreview,
  };
}

/**
 * 문제 상세 응답을 변환합니다.
 */
function mapQuestionDetail(
  question: BackendQuestionDetailResponse,
): QuestionDetailResponse {
  const era =
    question.era?.trim() || "미분류";

  const category =
    question.category?.trim() || "미분류";

  const point =
    question.point ?? 2;

  return {
    questionId:
      question.questionId,

    examRound:
      question.examRound,

    qNo:
      question.qNo,

    era,
    category,
    point,

    periodCode:
      mapPeriodCode(era),

    topicName:
      category,

    difficulty:
      mapDifficulty(point),

    examLevel:
      mapExamLevel(),

    questionContent:
      question.questionContent,

    passage:
      question.passage ?? null,

    /**
     * 백엔드에서 빈 5번 보기가 내려오는 경우
     * 화면에 출력되지 않도록 제거합니다.
     */
    options:
      question.options
        .filter(
          (option) =>
            option.optionContent !== null &&
            option.optionContent !== undefined &&
            option.optionContent.trim().length > 0,
        )
        .map(mapQuestionOption),
  };
}

/**
 * 백엔드 모의고사 상태를 프론트 상태로 변환합니다.
 *
 * 백엔드:
 * STARTED
 * SUBMITTED
 *
 * 프론트:
 * IN_PROGRESS
 * SUBMITTED
 */
function mapMockExamStatus(
  status: string,
): MockExamStatus {
  return status === "SUBMITTED"
    ? "SUBMITTED"
    : "IN_PROGRESS";
}

/**
 * 제목 또는 문제 수를 기준으로 급수를 추론합니다.
 */
function inferMockExamLevel(
  title: string,
  totalQuestionCount: number,
): ExamLevel {
  if (title.includes("심화")) {
    return "ADVANCED";
  }

  if (title.includes("기본")) {
    return "BASIC";
  }

  return totalQuestionCount > 20
    ? "ADVANCED"
    : "BASIC";
}

/**
 * 모의고사 생성 및 응시 조회 응답을 변환합니다.
 */
function mapMockExamStart(
  exam: BackendMockExamStartResponse,
): MockExamDetailResponse {
  const selectedAnswers:
    Record<number, number> = {};

  const questions = [...exam.questions]
    .sort(
      (left, right) =>
        left.questionOrder -
        right.questionOrder,
    )
    .map((item) => {
      const question =
        mapQuestionDetail(
          item.question,
        );

      if (
        item.selectedOptionId !== null &&
        item.selectedOptionId !== undefined
      ) {
        selectedAnswers[
          question.questionId
        ] = item.selectedOptionId;
      }

      return question;
    });

  return {
    mockExamId:
      exam.mockExamId,

    title:
      exam.title,

    examLevel:
      inferMockExamLevel(
        exam.title,
        exam.totalQuestionCount,
      ),

    totalCount:
      exam.totalQuestionCount,

    status:
      mapMockExamStatus(
        exam.status,
      ),

    startedAt:
      exam.startedAt,

    submittedAt:
      null,

    questions,
    selectedAnswers,
  };
}

/**
 * 모의고사 문제별 결과를 변환합니다.
 */
function mapMockExamAnswerResult(
  answer:
    BackendMockExamAnswerResultResponse,
): MockExamAnswerResultResponse {
  return {
    questionId:
      answer.questionId,

    questionOrder:
      answer.questionOrder,

    selectedOptionId:
      answer.selectedOptionId,

    correctOptionId:
      answer.correctOptionId,

    isCorrect:
      answer.isCorrect,
  };
}

/**
 * 모의고사 제출 결과를 변환합니다.
 */
function mapMockExamResult(
  exam: BackendMockExamResultResponse,
): MockExamResultResponse {
  return {
    mockExamId:
      exam.mockExamId,

    title:
      exam.title,

    examLevel:
      inferMockExamLevel(
        exam.title,
        exam.totalQuestionCount,
      ),

    totalCount:
      exam.totalQuestionCount,

    correctCount:
      exam.correctCount,

    score:
      exam.score,

    status:
      mapMockExamStatus(
        exam.status,
      ),

    startedAt:
      exam.startedAt,

    submittedAt:
      exam.submittedAt,

    answers:
      [...exam.answers]
        .sort(
          (left, right) =>
            left.questionOrder -
            right.questionOrder,
        )
        .map(
          mapMockExamAnswerResult,
        ),
  };
}

/**
 * 모의고사 목록 응답을 변환합니다.
 */
function mapMockExamSummary(
  exam: BackendMockExamSummaryResponse,
): MockExamSummaryResponse {
  return {
    mockExamId:
      exam.mockExamId,

    title:
      exam.title,

    examLevel:
      inferMockExamLevel(
        exam.title,
        exam.totalQuestionCount,
      ),

    totalCount:
      exam.totalQuestionCount,

    correctCount:
      exam.correctCount ?? undefined,

    score:
      exam.score ?? undefined,

    status:
      mapMockExamStatus(
        exam.status,
      ),

    startedAt:
      exam.startedAt,

    submittedAt:
      exam.submittedAt ?? null,
  };
}

// ============================================================
// 문제은행
// ============================================================

/**
 * 시대별 또는 조건별 문제 목록 조회
 */
export async function getQuestions(
  params: {
    periodCode?: PeriodCode;
    examRound?: number;
    era?: string;
    category?: string;
    page?: number;
    size?: number;
  },
): Promise<
  Page<QuestionSummaryResponse>
> {
  const page =
    await api.get<
      Page<BackendQuestionSummaryResponse>
    >(
      "/questions",
      params,
    );

  return {
    ...page,

    content:
      page.content.map(
        mapQuestionSummary,
      ),
  };
}

/**
 * 문제 상세 조회
 */
export async function getQuestion(
  questionId: number,
): Promise<QuestionDetailResponse> {
  const question =
    await api.get<
      BackendQuestionDetailResponse
    >(
      `/questions/${questionId}`,
    );

  return mapQuestionDetail(
    question,
  );
}

/**
 * 일반 문제 채점
 */
export function solveQuestion(
  questionId: number,
  selectedOptionId: number,
  solveType:
    SolveType = "PERIOD",
) {
  return api.post<
    SolveResultResponse
  >(
    `/questions/${questionId}/solve`,
    {
      selectedOptionId,
      solveType,
    },
  );
}

/**
 * 랜덤 문제 조회
 */
export async function getRandomQuestions(
  params: {
    count?: number;
    periodCode?: PeriodCode;
    examRound?: number;
    era?: string;
    category?: string;
  },
): Promise<
  QuestionDetailResponse[]
> {
  const questions =
    await api.get<
      BackendQuestionDetailResponse[]
    >(
      "/questions/random",
      params,
    );

  return questions.map(
    mapQuestionDetail,
  );
}

// ============================================================
// 모의고사
// ============================================================

/**
 * 모의고사 생성
 *
 * 프론트:
 * {
 *   examLevel,
 *   totalCount
 * }
 *
 * 백엔드:
 * {
 *   count,
 *   title
 * }
 */
export async function createMockExam(
  body: {
    examLevel: ExamLevel;
    totalCount: number;
  },
): Promise<
  MockExamDetailResponse
> {
  const exam =
    await api.post<
      BackendMockExamStartResponse
    >(
      "/mock-exams",
      {
        count:
          body.totalCount,

        title:
          body.examLevel ===
          "ADVANCED"
            ? "한국사 심화 모의고사"
            : "한국사 기본 모의고사",
      },
    );

  return mapMockExamStart(
    exam,
  );
}

/**
 * 진행 중인 모의고사 조회
 *
 * 응시 화면을 새로고침했을 때 사용합니다.
 */
export async function getMockExam(
  mockExamId: number,
): Promise<
  MockExamDetailResponse
> {
  const exam =
    await api.get<
      BackendMockExamStartResponse
    >(
      `/mock-exams/${mockExamId}`,
    );

  return mapMockExamStart(
    exam,
  );
}

/**
 * 모의고사 답안 임시 저장
 *
 * 일부 문제 답안만 전송해도 됩니다.
 */
export function saveMockAnswers(
  mockExamId: number,
  answers:
    MockExamAnswerRequest[],
) {
  return api.patch<void>(
    `/mock-exams/${mockExamId}/answers`,
    {
      answers,
    },
  );
}

/**
 * 모의고사 제출
 *
 * answers를 넘기면 제출 요청 본문에 전체 답안을 포함합니다.
 * answers가 없으면 서버에 임시 저장된 답안으로 제출합니다.
 */
export async function submitMockExam(
  mockExamId: number,
  answers?:
    MockExamAnswerRequest[],
): Promise<
  MockExamResultResponse
> {
  const exam =
    await api.post<
      BackendMockExamResultResponse
    >(
      `/mock-exams/${mockExamId}/submit`,

      answers === undefined
        ? undefined
        : {
            answers,
          },
    );

  return mapMockExamResult(
    exam,
  );
}

/**
 * 제출된 모의고사 결과 조회
 *
 * 결과 화면을 새로고침했을 때 사용합니다.
 */
export async function getMockExamResult(
  mockExamId: number,
): Promise<
  MockExamResultResponse
> {
  const exam =
    await api.get<
      BackendMockExamResultResponse
    >(
      `/mock-exams/${mockExamId}/result`,
    );

  return mapMockExamResult(
    exam,
  );
}

/**
 * 내 모의고사 이력 조회
 */
export async function getMockExamList(
  params: {
    page?: number;
    size?: number;
  } = {},
): Promise<
  Page<MockExamSummaryResponse>
> {
  const page =
    await api.get<
      Page<BackendMockExamSummaryResponse>
    >(
      "/mock-exams",
      params,
    );

  return {
    ...page,

    content:
      page.content.map(
        mapMockExamSummary,
      ),
  };
}

// ============================================================
// 오답노트
// ============================================================

/**
 * 오답노트 목록 조회
 */
export async function getWrongAnswers(
  params: {
    resolved?: boolean;
    page?: number;
    size?: number;
  },
): Promise<
  Page<WrongAnswerSummaryResponse>
> {
  const page =
    await api.get<
      Page<
        BackendWrongAnswerSummaryResponse
      >
    >(
      "/wrong-answers",
      params,
    );

  return {
    ...page,

    content:
      page.content.map(
        (
          item,
        ): WrongAnswerSummaryResponse => ({
          wrongAnswerId:
            item.wrongAnswerId,

          question:
            mapQuestionSummary(
              item.question,
            ),

          wrongCount:
            item.wrongCount,

          isResolved:
            item.isResolved,

          lastSelectedAnswer:
            item.lastSelectedAnswer ??
            undefined,

          correctAnswer:
            item.correctAnswer ??
            undefined,

          createdAt:
            item.createdAt,
        }),
      ),
  };
}

/**
 * 오답노트 단건 조회
 *
 * URL로 직접 접근하거나 새로고침했을 때
 * 선택한 오답 정보를 복구하는 데 사용합니다.
 */
export async function getWrongAnswer(
  wrongAnswerId: number,
): Promise<WrongAnswerSummaryResponse> {
  const item =
    await api.get<
      BackendWrongAnswerSummaryResponse
    >(
      `/wrong-answers/${wrongAnswerId}`,
    );

  return {
    wrongAnswerId:
      item.wrongAnswerId,

    question:
      mapQuestionSummary(
        item.question,
      ),

    wrongCount:
      item.wrongCount,

    isResolved:
      item.isResolved,

    lastSelectedAnswer:
      item.lastSelectedAnswer ??
      undefined,

    correctAnswer:
      item.correctAnswer ??
      undefined,

    createdAt:
      item.createdAt,
  };
}

/**
 * 오답 문제 다시 풀기
 */
export function retryWrongAnswer(
  wrongAnswerId: number,
  selectedOptionId: number,
) {
  return api.post<
    SolveResultResponse
  >(
    `/wrong-answers/${wrongAnswerId}/retry`,
    {
      selectedOptionId,
      solveType:
        "WRONG_RETRY",
    },
  );
}

// ============================================================
// AI 질의응답
// ============================================================

/**
 * AI 채팅 세션 생성
 */
export function createChatSession(
  body: {
    questionId?: number;
  },
) {
  return api.post<
    AiChatSessionResponse
  >(
    "/ai/chat-sessions",
    body,
  );
}

/**
 * AI 채팅 메시지 전송
 */
export function sendChatMessage(
  chatSessionId: number,
  message: string,
) {
  return api.post<{
    answer: string;
  }>(
    `/ai/chat-sessions/${chatSessionId}/messages`,
    {
      message,
    },
  );
}

/**
 * 일반 기출문제의 AI 해설을 요청합니다.
 *
 * 채점 결과를 먼저 표시한 뒤 이 API를 별도로 호출하므로,
 * AI 서버가 느리거나 실패해도 문제 채점에는 영향을 주지 않습니다.
 */
export function getAiQuestionExplanation(
  questionId: number,
  selectedOptionId: number,
) {
  return api.post<{
    answer: string;
  }>(
    `/ai/questions/${questionId}/explanation`,
    {
      selectedOptionId,
    },
  );
}