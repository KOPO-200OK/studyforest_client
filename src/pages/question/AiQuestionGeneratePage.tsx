import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  aiApi,
  type AiDifficulty,
  type AiQuestionType,
  type GeneratedQuestionResponse,
  type SolveAiGeneratedQuestionResponse,
} from "@/api/aiApi";

const TOPIC_PRESETS = [
  "선사·고조선",
  "삼국·남북국",
  "고려",
  "조선",
  "근현대",
];

const DIFFICULTY_OPTIONS: {
  value: AiDifficulty;
  label: string;
}[] = [
  {
    value: "basic",
    label: "기초",
  },
  {
    value: "intermediate",
    label: "보통",
  },
  {
    value: "advanced",
    label: "심화",
  },
];

const QUESTION_TYPE_OPTIONS: {
  value: AiQuestionType;
  label: string;
}[] = [
  {
    value: "multiple_choice",
    label: "객관식",
  },
  {
    value: "ox",
    label: "OX",
  },
  {
    value: "short_answer",
    label: "단답형",
  },
];

const selectStyle = {
  fontSize: 12,
  padding: "8px 12px",
  background: C.inputBg,

  border:
    `1px solid ${C.inputBr}`,

  outline: "none",
  color: C.inkDark,
  fontFamily: ff,
  width: "100%",
};

function normalize(
  text: string,
): string {
  return text
    .replace(/\s+/g, "")
    .replace(/①/g, "1")
    .replace(/②/g, "2")
    .replace(/③/g, "3")
    .replace(/④/g, "4")
    .replace(/⑤/g, "5")
    .trim()
    .toLowerCase();
}

/**
 * 서버 정답 문자열에서 객관식 정답 번호를 추출합니다.
 *
 * 지원 예:
 * - 1
 * - 1번
 * - 정답은 1번
 * - ①
 */
function extractAnswerIndex(
  answer: string,
): number | null {
  const normalized =
    answer.trim();

  if (
    normalized.includes("①")
  ) {
    return 1;
  }

  if (
    normalized.includes("②")
  ) {
    return 2;
  }

  if (
    normalized.includes("③")
  ) {
    return 3;
  }

  if (
    normalized.includes("④")
  ) {
    return 4;
  }

  if (
    normalized.includes("⑤")
  ) {
    return 5;
  }

  const numberMatch =
    normalized.match(
      /(?:^|\D)([1-5])(?:\D|$)/,
    );

  return numberMatch
    ? Number(numberMatch[1])
    : null;
}

/**
 * 서버 응답을 기준으로 특정 보기가 정답인지 확인합니다.
 */
function isCorrectChoice(
  choice: string,
  choiceIndex: number,
  result:
    SolveAiGeneratedQuestionResponse,
): boolean {
  const correctIndex =
    extractAnswerIndex(
      result.correctAnswerText,
    );

  if (
    correctIndex !== null
  ) {
    return (
      correctIndex ===
      choiceIndex + 1
    );
  }

  return (
    normalize(choice) ===
    normalize(
      result.correctAnswerText,
    )
  );
}

export default function AiQuestionGeneratePage() {
  const nav =
    useNavigate();

  const [
    topic,
    setTopic,
  ] = useState(
    "선사·고조선",
  );

  const [
    difficulty,
    setDifficulty,
  ] = useState<AiDifficulty>(
    "intermediate",
  );

  const [
    questionType,
    setQuestionType,
  ] = useState<AiQuestionType>(
    "multiple_choice",
  );

  const [
    count,
    setCount,
  ] = useState(3);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    questions,
    setQuestions,
  ] = useState<
    GeneratedQuestionResponse[] | null
  >(null);

  /**
   * 사용자가 실제로 선택하거나 입력한 답안입니다.
   */
  const [
    answers,
    setAnswers,
  ] = useState<
    Record<number, string>
  >({});

  /**
   * 백엔드가 반환한 공식 채점 결과입니다.
   */
  const [
    results,
    setResults,
  ] = useState<
    Record<
      number,
      SolveAiGeneratedQuestionResponse
    >
  >({});

  const [
    draftAnswer,
    setDraftAnswer,
  ] = useState<
    Record<number, string>
  >({});

  /**
   * 현재 서버 채점 요청 중인 문제 번호입니다.
   */
  const [
    submittingIndexes,
    setSubmittingIndexes,
  ] = useState<
    Set<number>
  >(
    () => new Set(),
  );

  async function handleGenerate() {
    if (!topic.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setAnswers({});
    setResults({});
    setDraftAnswer({});

    setSubmittingIndexes(
      new Set(),
    );

    try {
      const response =
        await aiApi
          .generateQuestions({
            topic:
              topic.trim(),

            difficulty,

            questionType,

            count,
          });

      /**
       * 이전 백엔드 코드가 실행 중이면 문제 ID가 없을 수 있으므로
       * 잘못된 응답을 미리 차단합니다.
       */
      const invalidQuestion =
        response.questions.some(
          (question) =>
            !Number.isInteger(
              question
                .aiGeneratedQuestionId,
            ) ||
            question
              .aiGeneratedQuestionId <=
              0,
        );

      if (invalidQuestion) {
        throw new Error(
          "생성 문제의 서버 식별자를 확인할 수 없습니다. 백엔드 생성 응답을 확인해주세요.",
        );
      }

      setQuestions(
        response.questions,
      );
    } catch (
      requestError
    ) {
      setQuestions(
        null,
      );

      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "AI 문제 생성에 실패했습니다",
      );
    } finally {
      setLoading(false);
    }
  }

  function startSubmitting(
    index: number,
  ) {
    setSubmittingIndexes(
      (previous) => {
        const next =
          new Set(previous);

        next.add(index);

        return next;
      },
    );
  }

  function finishSubmitting(
    index: number,
  ) {
    setSubmittingIndexes(
      (previous) => {
        const next =
          new Set(previous);

        next.delete(index);

        return next;
      },
    );
  }

  /**
   * 객관식 또는 OX 답안을 서버로 전송합니다.
   */
  async function selectChoice(
    index: number,
    choice: string,
    choiceIndex: number,
  ) {
    const question =
      questions?.[index];

    if (
      !question ||
      results[index] !==
        undefined ||
      submittingIndexes.has(
        index,
      )
    ) {
      return;
    }

    startSubmitting(
      index,
    );

    setError(null);

    try {
      const result =
        await aiApi
          .solveGeneratedQuestion(
            question
              .aiGeneratedQuestionId,

            {
              /**
               * 백엔드는 1부터 시작하는 보기 번호를 사용합니다.
               */
              selectedChoiceIndex:
                choiceIndex + 1,

              selectedAnswerText:
                choice,
            },
          );

      setAnswers(
        (previous) => ({
          ...previous,

          [index]:
            choice,
        }),
      );

      setResults(
        (previous) => ({
          ...previous,

          [index]:
            result,
        }),
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "AI 생성 문제 채점에 실패했습니다",
      );
    } finally {
      finishSubmitting(
        index,
      );
    }
  }

  /**
   * 단답형 답안을 서버로 전송합니다.
   */
  async function submitShortAnswer(
    index: number,
  ) {
    const question =
      questions?.[index];

    const value =
      (
        draftAnswer[index] ??
        ""
      ).trim();

    if (
      !question ||
      !value ||
      results[index] !==
        undefined ||
      submittingIndexes.has(
        index,
      )
    ) {
      return;
    }

    startSubmitting(
      index,
    );

    setError(null);

    try {
      const result =
        await aiApi
          .solveGeneratedQuestion(
            question
              .aiGeneratedQuestionId,

            {
              selectedAnswerText:
                value,
            },
          );

      setAnswers(
        (previous) => ({
          ...previous,

          [index]:
            value,
        }),
      );

      setResults(
        (previous) => ({
          ...previous,

          [index]:
            result,
        }),
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "AI 생성 문제 채점에 실패했습니다",
      );
    } finally {
      finishSubmitting(
        index,
      );
    }
  }

  const answeredCount =
    questions
      ? questions.filter(
          (
            _,
            index,
          ) =>
            results[index] !==
            undefined,
        ).length
      : 0;

  const correctCount =
    questions
      ? questions.filter(
          (
            _,
            index,
          ) =>
            results[index]
              ?.isCorrect ===
            true,
        ).length
      : 0;

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: 28,

        background:
          "linear-gradient(160deg,#1a2a14,#0e1a0a)",
      }}
    >
      <button
        onClick={() =>
          nav(
            "/question-bank",
          )
        }
        style={{
          background: "none",
          border: "none",
          color: "#c8a060",
          cursor: "pointer",
          fontFamily: ff,
          fontSize: 12,
          marginBottom: 16,
        }}
      >
        ← 문제은행 홈
      </button>

      <h2
        style={{
          fontFamily: fs,
          color: "#f5e6c8",
          fontSize: 18,
          marginBottom: 6,
        }}
      >
        🪄 AI로 문제지 만들기
      </h2>

      <p
        style={{
          fontFamily: ff,
          color: "#9aaa80",
          fontSize: 12,
          marginBottom: 20,
        }}
      >
        주제를 정하면 실제 AI가 그 자리에서 문제를 만들어줘요.
      </p>

      <Card
        style={{
          maxWidth: 640,
          marginBottom: 24,
        }}
      >
        <label
          style={{
            display: "flex",
            flexDirection:
              "column",

            gap: 4,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: C.inkMid,
              fontWeight: 700,
            }}
          >
            주제
          </span>

          <Input
            value={topic}
            onChange={(
              event,
            ) =>
              setTopic(
                event.target
                  .value,
              )
            }
            placeholder="예: 삼국시대, 고려 정치, 조선 후기"
          />

          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginTop: 4,
            }}
          >
            {TOPIC_PRESETS.map(
              (preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setTopic(
                      preset,
                    )
                  }
                  style={{
                    fontSize: 10,
                    padding:
                      "4px 8px",

                    fontFamily: ff,
                    cursor:
                      "pointer",

                    background:
                      topic ===
                      preset
                        ? "rgba(58,96,48,0.18)"
                        : "rgba(139,94,60,0.08)",

                    border:
                      `1px solid ${
                        topic ===
                        preset
                          ? "#245020"
                          : C.inputBr
                      }`,

                    color:
                      C.inkMid,
                  }}
                >
                  {preset}
                </button>
              ),
            )}
          </div>
        </label>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <label
            style={{
              flex: 1,

              display:
                "flex",

              flexDirection:
                "column",

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
              난이도
            </span>

            <select
              value={difficulty}
              onChange={(
                event,
              ) =>
                setDifficulty(
                  event.target
                    .value as AiDifficulty,
                )
              }
              style={selectStyle}
            >
              {DIFFICULTY_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </label>

          <label
            style={{
              flex: 1,

              display:
                "flex",

              flexDirection:
                "column",

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
              문제 유형
            </span>

            <select
              value={
                questionType
              }
              onChange={(
                event,
              ) =>
                setQuestionType(
                  event.target
                    .value as AiQuestionType,
                )
              }
              style={selectStyle}
            >
              {QUESTION_TYPE_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </label>

          <label
            style={{
              flex: 1,

              display:
                "flex",

              flexDirection:
                "column",

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
              문제 개수
            </span>

            <select
              value={count}
              onChange={(
                event,
              ) =>
                setCount(
                  Number(
                    event
                      .target
                      .value,
                  ),
                )
              }
              style={selectStyle}
            >
              {[
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
              ].map(
                (number) => (
                  <option
                    key={number}
                    value={number}
                  >
                    {number}문제
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <Button
          variant="green"
          block
          onClick={() =>
            void handleGenerate()
          }
          disabled={
            loading ||
            !topic.trim()
          }
        >
          {loading
            ? "🤖 AI가 문제를 만들고 있어요..."
            : questions
              ? "다시 생성하기"
              : "AI 문제 생성하기"}
        </Button>

        {error && (
          <div
            style={{
              marginTop: 10,
              fontFamily: ff,
              fontSize: 11,
              color: "#c04040",
            }}
          >
            {error}
          </div>
        )}
      </Card>

      {questions && (
        <div
          style={{
            display: "flex",
            flexDirection:
              "column",

            gap: 16,
            maxWidth: 640,
          }}
        >
          {questions.length >
            0 &&
            answeredCount ===
              questions.length && (
              <Card
                style={{
                  background:
                    "linear-gradient(160deg,#fdf4db,#eedda0)",
                }}
              >
                <div
                  style={{
                    fontFamily: fs,
                    fontWeight: 700,
                    fontSize: 14,
                    color: C.inkDark,
                  }}
                >
                  결과:{" "}
                  {correctCount} /{" "}
                  {questions.length} 정답
                </div>
              </Card>
            )}

          {questions.map(
            (
              question,
              index,
            ) => {
              const chosen =
                answers[index];

              const result =
                results[index];

              const answered =
                result !==
                undefined;

              const submitting =
                submittingIndexes.has(
                  index,
                );

              const isShortAnswer =
                question.choices
                  .length === 0;

              return (
                <Card
                  key={
                    question
                      .aiGeneratedQuestionId
                  }
                >
                  <div
                    style={{
                      fontFamily: ff,
                      fontSize: 11,
                      color: "#9a7040",
                      marginBottom: 6,
                    }}
                  >
                    {index + 1}번
                    {" · "}
                    {question.era}
                    {" · "}
                    {question.topic}
                    {" · "}
                    {
                      question.difficulty
                    }
                  </div>

                  <div
                    style={{
                      fontFamily: fs,
                      fontWeight: 700,
                      fontSize: 14,
                      color: C.inkDark,
                      marginBottom: 12,
                    }}
                  >
                    {
                      question.question
                    }
                  </div>

                  {isShortAnswer ? (
                    <div
                      style={{
                        display:
                          "flex",

                        gap: 8,
                      }}
                    >
                      <Input
                        value={
                          draftAnswer[
                            index
                          ] ?? ""
                        }
                        onChange={(
                          event,
                        ) =>
                          setDraftAnswer(
                            (
                              previous,
                            ) => ({
                              ...previous,

                              [index]:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        onKeyDown={(
                          event,
                        ) => {
                          if (
                            event.key ===
                              "Enter" &&
                            !event
                              .nativeEvent
                              .isComposing
                          ) {
                            event.preventDefault();

                            void submitShortAnswer(
                              index,
                            );
                          }
                        }}
                        placeholder="답을 입력하세요"
                        disabled={
                          answered ||
                          submitting
                        }
                        style={{
                          flex: 1,
                        }}
                      />

                      <Button
                        variant="green"
                        onClick={() =>
                          void submitShortAnswer(
                            index,
                          )
                        }
                        disabled={
                          answered ||
                          submitting ||
                          !(
                            draftAnswer[
                              index
                            ] ?? ""
                          ).trim()
                        }
                      >
                        제출
                      </Button>
                    </div>
                  ) : (
                    <div
                      style={{
                        display:
                          "flex",

                        flexDirection:
                          "column",

                        gap: 6,
                      }}
                    >
                      {question.choices.map(
                        (
                          choice,
                          choiceIndex,
                        ) => {
                          const isChosen =
                            chosen ===
                            choice;

                          const isAnswerChoice =
                            result
                              ? isCorrectChoice(
                                  choice,
                                  choiceIndex,
                                  result,
                                )
                              : false;

                          let background:
                            string =
                              "rgba(139,94,60,0.06)";

                          let border:
                            string =
                              C.inputBr;

                          if (
                            answered &&
                            isAnswerChoice
                          ) {
                            background =
                              "rgba(58,96,48,0.18)";

                            border =
                              "#245020";
                          } else if (
                            answered &&
                            isChosen &&
                            !isAnswerChoice
                          ) {
                            background =
                              "rgba(192,64,64,0.14)";

                            border =
                              "#9a2020";
                          }

                          return (
                            <button
                              key={
                                choiceIndex
                              }
                              onClick={() =>
                                void selectChoice(
                                  index,
                                  choice,
                                  choiceIndex,
                                )
                              }
                              disabled={
                                answered ||
                                submitting
                              }
                              style={{
                                textAlign:
                                  "left",

                                padding:
                                  "8px 10px",

                                fontFamily:
                                  ff,

                                fontSize:
                                  12,

                                background,

                                border:
                                  `1px solid ${border}`,

                                color:
                                  C.inkDark,

                                cursor:
                                  answered ||
                                  submitting
                                    ? "default"
                                    : "pointer",
                              }}
                            >
                              {choiceIndex +
                                1}
                              . {choice}
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}

                  {answered &&
                    result && (
                      <div
                        style={{
                          marginTop: 10,
                          fontFamily: ff,
                          fontSize: 11,
                          color: C.inkMid,

                          background:
                            "rgba(139,94,60,0.08)",

                          padding:
                            "8px 10px",
                        }}
                      >
                        {isShortAnswer && (
                          <div
                            style={{
                              marginBottom:
                                6,

                              fontWeight:
                                700,

                              color:
                                result.isCorrect
                                  ? "#245020"
                                  : "#9a2020",
                            }}
                          >
                            {result.isCorrect
                              ? "✅ 정답"
                              : `❌ 오답 (정답: ${result.correctAnswerText})`}
                          </div>
                        )}

                        💡{" "}
                        {result.explanation ??
                          question.explanation}

                        {question.examTip && (
                          <div
                            style={{
                              marginTop:
                                6,

                              color:
                                "#9a7040",
                            }}
                          >
                            📌{" "}
                            {
                              question.examTip
                            }
                          </div>
                        )}
                      </div>
                    )}
                </Card>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}