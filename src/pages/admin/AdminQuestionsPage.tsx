import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Card,
  Button,
  Input,
} from "@/components/ui";

import {
  fs,
  ff,
  C,
} from "@/styles/tokens";

import {
  adminApi,
  type AdminQuestionDetailResponse,
  type AdminQuestionSummaryResponse,
} from "@/api/adminApi";

import type {
  Difficulty,
  ExamLevel,
  PeriodCode,
} from "@/api/types";

const PERIOD_OPTIONS: {
  value: PeriodCode;
  label: string;
}[] = [
  {
    value: "PREHISTORY",
    label: "선사·고조선",
  },
  {
    value: "THREE_KINGDOMS",
    label: "삼국·남북국",
  },
  {
    value: "GORYEO",
    label: "고려",
  },
  {
    value: "JOSEON",
    label: "조선",
  },
  {
    value: "MODERN",
    label: "근현대",
  },
];

const DIFFICULTY_OPTIONS: Difficulty[] = [
  "EASY",
  "NORMAL",
  "HARD",
];

const EXAM_LEVEL_OPTIONS: ExamLevel[] = [
  "BASIC",
  "ADVANCED",
];

const ADMIN_BASIC_EXAM_ROUND = 900;
const ADMIN_ADVANCED_EXAM_ROUND = 901;

const ADMIN_QUESTION_PAGE_SIZE = 50;
const MAX_QUESTION_NUMBER = 100;

interface AdminQuestionOption {
  optionNo: number;
  optionContent: string;
}

interface AdminQuestionView {
  questionId: number;
  periodCode: PeriodCode;
  topicName: string;
  questionContent: string;
  difficulty: Difficulty;
  examLevel: ExamLevel;
}

function createEmptyOptions(): AdminQuestionOption[] {
  return [
    {
      optionNo: 1,
      optionContent: "",
    },
    {
      optionNo: 2,
      optionContent: "",
    },
    {
      optionNo: 3,
      optionContent: "",
    },
    {
      optionNo: 4,
      optionContent: "",
    },
    {
      optionNo: 5,
      optionContent: "",
    },
  ];
}

const PERIOD_LABEL: Record<PeriodCode, string> = {
  PREHISTORY: "선사",
  THREE_KINGDOMS: "고대(삼국·남북국)",
  GORYEO: "고려",
  JOSEON: "조선",
  MODERN: "근대~현대",
};

const DIFFICULTY_POINT: Record<Difficulty, number> = {
  EASY: 1,
  NORMAL: 2,
  HARD: 3,
};

const selectStyle = {
  fontSize: 12,
  padding: "8px 12px",
  background: C.inputBg,
  border: `1px solid ${C.inputBr}`,
  outline: "none",
  color: C.inkDark,
  fontFamily: ff,
  width: "100%",
};

function periodFromEra(
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

  if (
    normalized.includes("고려")
  ) {
    return "GORYEO";
  }

  if (
    normalized.startsWith("조선")
  ) {
    return "JOSEON";
  }

  return "MODERN";
}

function difficultyFromPoint(
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

function examLevelFromRound(
  examRound: number,
): ExamLevel {
  return examRound ===
    ADMIN_BASIC_EXAM_ROUND
    ? "BASIC"
    : "ADVANCED";
}

function examRoundFromLevel(
  examLevel: ExamLevel,
): number {
  return examLevel ===
    "BASIC"
    ? ADMIN_BASIC_EXAM_ROUND
    : ADMIN_ADVANCED_EXAM_ROUND;
}

function mapQuestion(
  question: AdminQuestionSummaryResponse,
): AdminQuestionView {
  return {
    questionId:
      question.questionId,

    periodCode:
      periodFromEra(
        question.era,
      ),

    topicName:
      question.category
        ?.trim() ||
      "-",

    questionContent:
      question.questionPreview ||
      "",

    difficulty:
      difficultyFromPoint(
        question.point,
      ),

    examLevel:
      examLevelFromRound(
        question.examRound,
      ),
  };
}

function getChoiceText(
  detail: AdminQuestionDetailResponse,
  choiceNo: number,
): string {
  return (
    detail.choices.find(
      (choice) =>
        choice.choiceNo ===
        choiceNo,
    )?.choiceText ??
    ""
  );
}

async function loadAllQuestions(
  params: {
    examRound?: number;
    isDeleted?: boolean;
  } = {},
): Promise<AdminQuestionSummaryResponse[]> {
  const firstPage =
    await adminApi.listQuestions({
      ...params,
      page: 0,
      size:
        ADMIN_QUESTION_PAGE_SIZE,
    });

  const questions = [
    ...firstPage.content,
  ];

  for (
    let pageNumber = 1;
    pageNumber <
    firstPage.totalPages;
    pageNumber += 1
  ) {
    const nextPage =
      await adminApi.listQuestions({
        ...params,
        page:
          pageNumber,
        size:
          ADMIN_QUESTION_PAGE_SIZE,
      });

    questions.push(
      ...nextPage.content,
    );
  }

  return questions;
}

async function getNextQuestionNumber(
  examRound: number,
): Promise<number> {
  const questions =
    await loadAllQuestions({
      examRound,
    });

  const maxQuestionNumber =
    questions.reduce(
      (
        maximum,
        question,
      ) =>
        Math.max(
          maximum,
          question.qNo,
        ),
      0,
    );

  if (
    maxQuestionNumber >=
    MAX_QUESTION_NUMBER
  ) {
    throw new Error(
      `${examRound}회 관리자 등록 문제는 최대 ${MAX_QUESTION_NUMBER}개까지 등록할 수 있습니다.`,
    );
  }

  return maxQuestionNumber + 1;
}

export default function AdminQuestionsPage() {
  const [
    questions,
    setQuestions,
  ] = useState<AdminQuestionView[]>([]);

  const [
    editingQuestionId,
    setEditingQuestionId,
  ] = useState<number | null>(null);

  const [
    periodCode,
    setPeriodCode,
  ] = useState<PeriodCode>(
    "PREHISTORY",
  );

  const [
    topicName,
    setTopicName,
  ] = useState("");

  const [
    difficulty,
    setDifficulty,
  ] = useState<Difficulty>(
    "NORMAL",
  );

  const [
    examLevel,
    setExamLevel,
  ] = useState<ExamLevel>(
    "BASIC",
  );

  const [
    questionContent,
    setQuestionContent,
  ] = useState("");

  const [
    passage,
    setPassage,
  ] = useState<string | null>(
    null,
  );

  const [
    options,
    setOptions,
  ] = useState<AdminQuestionOption[]>(
    createEmptyOptions,
  );

  const [
    answerNo,
    setAnswerNo,
  ] = useState(1);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    loadingDetailQuestionId,
    setLoadingDetailQuestionId,
  ] = useState<number | null>(
    null,
  );

  const [
    deletingQuestionId,
    setDeletingQuestionId,
  ] = useState<number | null>(
    null,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  function updateOption(
    index: number,
    patch: Partial<AdminQuestionOption>,
  ) {
    setOptions(
      (previous) =>
        previous.map(
          (
            option,
            optionIndex,
          ) =>
            optionIndex ===
            index
              ? {
                  ...option,
                  ...patch,
                }
              : option,
        ),
    );
  }

  function resetForm() {
    setEditingQuestionId(
      null,
    );

    setPeriodCode(
      "PREHISTORY",
    );

    setTopicName("");
    setDifficulty("NORMAL");
    setExamLevel("BASIC");
    setQuestionContent("");
    setPassage(null);

    setOptions(
      createEmptyOptions(),
    );

    setAnswerNo(1);
    setError(null);
  }

  async function reloadQuestions() {
    const loadedQuestions =
      await loadAllQuestions({
        isDeleted: false,
      });

    setQuestions(
      loadedQuestions.map(
        mapQuestion,
      ),
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      setError(null);

      try {
        const loadedQuestions =
          await loadAllQuestions({
            isDeleted: false,
          });

        if (!cancelled) {
          setQuestions(
            loadedQuestions.map(
              mapQuestion,
            ),
          );
        }
      } catch (
        requestError
      ) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "문제 목록을 불러오지 못했습니다",
          );
        }
      }
    }

    void loadQuestions();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleEdit(
    questionId: number,
  ) {
    setLoadingDetailQuestionId(
      questionId,
    );

    setError(null);

    try {
      const detail =
        await adminApi.getQuestionDetail(
          questionId,
        );

      setEditingQuestionId(
        detail.questionId,
      );

      setPeriodCode(
        periodFromEra(
          detail.era,
        ),
      );

      setTopicName(
        detail.category
          ?.trim() ||
        "",
      );

      setDifficulty(
        difficultyFromPoint(
          detail.point,
        ),
      );

      setExamLevel(
        examLevelFromRound(
          detail.examRound,
        ),
      );

      setQuestionContent(
        detail.questionText,
      );

      setPassage(
        detail.passage ??
        null,
      );

      setOptions(
        [
          1,
          2,
          3,
          4,
          5,
        ].map(
          (
            choiceNo,
          ) => ({
            optionNo:
              choiceNo,

            optionContent:
              getChoiceText(
                detail,
                choiceNo,
              ),
          }),
        ),
      );

      setAnswerNo(
        detail.answer,
      );
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "문제 상세 정보를 불러오지 못했습니다",
      );
    } finally {
      setLoadingDetailQuestionId(
        null,
      );
    }
  }

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      !topicName.trim() ||
      !questionContent.trim() ||
      options.some(
        (option) =>
          !option
            .optionContent
            .trim(),
      )
    ) {
      setError(
        "문제 내용과 1번부터 5번까지 모든 보기를 입력해주세요",
      );

      return;
    }

    if (
      answerNo < 1 ||
      answerNo > 5
    ) {
      setError(
        "정답을 하나 선택해주세요",
      );

      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const commonPayload = {
        questionText:
          questionContent
            .trim(),

        passage:
          passage?.trim() ||
          null,

        point:
          DIFFICULTY_POINT[
            difficulty
          ],

        choice1:
          options[0]
            .optionContent
            .trim(),

        choice2:
          options[1]
            .optionContent
            .trim(),

        choice3:
          options[2]
            .optionContent
            .trim(),

        choice4:
          options[3]
            .optionContent
            .trim(),

        choice5:
          options[4]
            .optionContent
            .trim(),

        answer:
          answerNo,

        era:
          PERIOD_LABEL[
            periodCode
          ],

        category:
          topicName
            .trim(),
      };

      if (
        editingQuestionId ===
        null
      ) {
        const examRound =
          examRoundFromLevel(
            examLevel,
          );

        const qNo =
          await getNextQuestionNumber(
            examRound,
          );

        await adminApi.createQuestion({
          examRound,
          qNo,
          ...commonPayload,
        });
      } else {
        await adminApi.updateQuestion(
          editingQuestionId,
          {
            ...commonPayload,
            isDeleted: false,
          },
        );
      }

      await reloadQuestions();
      resetForm();
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : editingQuestionId ===
              null
            ? "문제 등록에 실패했습니다"
            : "문제 수정에 실패했습니다",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  async function handleDelete(
    questionId: number,
  ) {
    if (
      !window.confirm(
        "이 문제를 삭제하시겠습니까?",
      )
    ) {
      return;
    }

    setDeletingQuestionId(
      questionId,
    );

    setError(null);

    try {
      await adminApi.deleteQuestion(
        questionId,
      );

      setQuestions(
        (previous) =>
          previous.filter(
            (question) =>
              question.questionId !==
              questionId,
          ),
      );

      if (
        editingQuestionId ===
        questionId
      ) {
        resetForm();
      }
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "문제 삭제에 실패했습니다",
      );
    } finally {
      setDeletingQuestionId(
        null,
      );
    }
  }

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      <Card style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 14, color: "#2a1808" }}>
          {editingQuestionId === null ? "➕ 문제 추가" : "✏️ 문제 수정"}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>시대</span>

              <select
                value={periodCode}
                onChange={(event) =>
                  setPeriodCode(
                    event.target.value as PeriodCode,
                  )
                }
                style={selectStyle}
              >
                {PERIOD_OPTIONS.map(
                  (period) => (
                    <option
                      key={period.value}
                      value={period.value}
                    >
                      {period.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>난이도</span>

              <select
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(
                    event.target.value as Difficulty,
                  )
                }
                style={selectStyle}
              >
                {DIFFICULTY_OPTIONS.map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>급수</span>

              <select
                value={examLevel}
                onChange={(event) =>
                  setExamLevel(
                    event.target.value as ExamLevel,
                  )
                }
                style={selectStyle}
                disabled={
                  editingQuestionId !==
                  null
                }
              >
                {EXAM_LEVEL_OPTIONS.map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>주제</span>

            <Input
              value={topicName}
              onChange={(event) =>
                setTopicName(
                  event.target.value,
                )
              }
              placeholder="예: 무신정권"
              style={{
                width: "100%",
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>문제 내용</span>

            <textarea
              value={questionContent}
              onChange={(event) =>
                setQuestionContent(
                  event.target.value,
                )
              }
              placeholder="문제를 입력하세요"
              rows={3}
              style={{
                ...selectStyle,
                resize: "vertical",
                fontFamily: ff,
              }}
            />
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: C.inkMid,
                fontWeight: 700,
              }}
            >
              본문(제시문)
            </span>

            <textarea
              value={passage ?? ""}
              onChange={(event) =>
                setPassage(
                  event.target.value,
                )
              }
              placeholder="문제에 필요한 본문 또는 제시문을 입력하세요 (선택사항)"
              rows={5}
              maxLength={4000}
              style={{
                ...selectStyle,
                resize: "vertical",
                fontFamily: ff,
              }}
            />

            <span
              style={{
                alignSelf: "flex-end",
                fontSize: 10,
                color: C.inkMid,
              }}
            >
              {(passage ?? "").length}/4000
            </span>
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>
              선택지 (정답 라디오로 선택)
            </span>

            {options.map(
              (
                option,
                index,
              ) => (
                <div
                  key={
                    option.optionNo
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <input
                    type="radio"
                    name="correct-option"
                    checked={
                      answerNo ===
                      option.optionNo
                    }
                    onChange={() =>
                      setAnswerNo(
                        option.optionNo,
                      )
                    }
                  />

                  <Input
                    value={
                      option.optionContent
                    }
                    onChange={(event) =>
                      updateOption(
                        index,
                        {
                          optionContent:
                            event.target.value,
                        },
                      )
                    }
                    placeholder={`선택지 ${option.optionNo}`}
                    style={{
                      flex: 1,
                    }}
                  />
                </div>
              ),
            )}
          </div>

          {error && (
            <div
              style={{
                fontSize: 11,
                color: C.redB,
                background:
                  "rgba(192,64,64,0.12)",
                border:
                  `1px solid ${C.redB}`,
                padding: "6px 8px",
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="green"
            block
            disabled={submitting}
          >
            {submitting
              ? "저장 중..."
              : editingQuestionId ===
                  null
                ? "문제 추가"
                : "문제 수정"}
          </Button>

          {editingQuestionId !==
            null && (
            <Button
              type="button"
              block
              disabled={submitting}
              onClick={
                resetForm
              }
            >
              수정 취소
            </Button>
          )}
        </form>
      </Card>

      <Card style={{ flex: 1, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", fontFamily: fs, fontWeight: 700, fontSize: 14, color: "#2a1808", borderBottom: `1px solid ${C.hanjiB}` }}>
          등록된 문제 ({questions.length})
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {questions.map((question) => (
            <div key={question.questionId} style={{ padding: "12px 14px", borderBottom: `1px solid ${C.hanjiB}`, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <div style={{ fontFamily: ff, fontSize: 12 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, padding: "2px 6px", background: "#7a4f2e", color: C.gold, fontWeight: 700 }}>
                    {
                      PERIOD_OPTIONS.find(
                        (period) =>
                          period.value ===
                          question.periodCode,
                      )?.label
                    }
                  </span>

                  <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(139,94,60,0.15)", color: "#7a5828", fontWeight: 700 }}>
                    {question.topicName}
                  </span>

                  <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(139,94,60,0.15)", color: "#7a5828", fontWeight: 700 }}>
                    {question.difficulty} · {question.examLevel}
                  </span>
                </div>

                <div style={{ color: "#2a1808" }}>
                  {question.questionContent}
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <Button
                  variant="wood"
                  disabled={
                    loadingDetailQuestionId ===
                    question.questionId
                  }
                  onClick={() =>
                    void handleEdit(
                      question.questionId,
                    )
                  }
                  style={{
                    padding: "4px 10px",
                    fontSize: 10,
                    flexShrink: 0,
                  }}
                >
                  {loadingDetailQuestionId ===
                  question.questionId
                    ? "불러오는 중"
                    : "수정"}
                </Button>

                <Button
                  variant="red"
                  disabled={
                    deletingQuestionId ===
                    question.questionId
                  }
                  onClick={() =>
                    void handleDelete(
                      question.questionId,
                    )
                  }
                  style={{
                    padding: "4px 10px",
                    fontSize: 10,
                    flexShrink: 0,
                  }}
                >
                  {deletingQuestionId ===
                  question.questionId
                    ? "삭제 중"
                    : "삭제"}
                </Button>
              </div>
            </div>
          ))}

          {questions.length ===
            0 && (
            <div style={{ padding: 24, textAlign: "center", color: "#7a5828", fontFamily: fs, fontSize: 13 }}>
              등록된 문제가 없습니다
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}