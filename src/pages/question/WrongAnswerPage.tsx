import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button } from "@/components/ui";
import {
  getQuestion,
  getWrongAnswer,
  getWrongAnswers,
  retryWrongAnswer,
} from "@/api/questionApi";
import type {
  QuestionDetailResponse,
  SolveResultResponse,
  WrongAnswerSummaryResponse,
} from "@/api/types";
import { fs, ff, C } from "@/styles/tokens";

const PAGE_SIZE = 50;

function getOptionLabel(
  optionNo?: number,
  optionContent?: string | null,
) {
  if (typeof optionNo === "number") {
    return `${optionNo}번`;
  }

  if (optionContent) {
    return optionContent;
  }

  return "보기";
}

export default function WrongAnswerPage() {
  const nav = useNavigate();
  const params = useParams();

  const [
    items,
    setItems,
  ] = useState<
    WrongAnswerSummaryResponse[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    activeWrongAnswerId,
    setActiveWrongAnswerId,
  ] = useState<
    number | null
  >(null);

  const [
    selectedQuestion,
    setSelectedQuestion,
  ] = useState<
    QuestionDetailResponse | null
  >(null);

  const [
    selectedOptionId,
    setSelectedOptionId,
  ] = useState<
    number | null
  >(null);

  const [
    retryResult,
    setRetryResult,
  ] = useState<
    SolveResultResponse | null
  >(null);

  const [
    retrying,
    setRetrying,
  ] = useState(false);

  /**
   * 오답노트 전체 목록을 조회합니다.
   *
   * resolved 값을 보내지 않으므로 미해결과 해결 완료
   * 문제를 모두 조회합니다.
   *
   * 화면에서 이미 해결완료/미해결 상태를 표시하고 있기
   * 때문에 전체 조회가 화면 구조와 일치합니다.
   */
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getWrongAnswers({
      page: 0,
      size: PAGE_SIZE,
    })
      .then((page) => {
        if (cancelled) {
          return;
        }

        setItems(
          (previous) => {
            /**
             * 상세 URL을 통해 먼저 불러온 오답이 있다면
             * 목록 조회 결과에서 사라지지 않도록 병합합니다.
             */
            const additionalItems =
              previous.filter(
                (existing) =>
                  !page.content.some(
                    (loaded) =>
                      loaded.wrongAnswerId ===
                      existing.wrongAnswerId,
                  ),
              );

            return [
              ...page.content,
              ...additionalItems,
            ];
          },
        );
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setItems([]);

        setError(
          requestError instanceof Error
            ? requestError.message
            : "오답노트를 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * URL에 wrongAnswerId가 있을 때 오답 정보와
   * 문제 상세 정보를 복구합니다.
   *
   * 예:
   * /question-bank/wrong-answers/10
   */
  useEffect(() => {
    let cancelled = false;

    async function restoreWrongAnswer() {
      if (!params.wrongAnswerId) {
        setActiveWrongAnswerId(
          null,
        );

        setSelectedQuestion(
          null,
        );

        setSelectedOptionId(
          null,
        );

        setRetryResult(
          null,
        );

        return;
      }

      const targetId =
        Number(
          params.wrongAnswerId,
        );

      if (
        !Number.isInteger(
          targetId,
        ) ||
        targetId <= 0
      ) {
        setError(
          "오답노트 번호가 올바르지 않습니다.",
        );

        return;
      }

      setActiveWrongAnswerId(
        targetId,
      );

      setSelectedOptionId(
        null,
      );

      setRetryResult(
        null,
      );

      setRetrying(
        true,
      );

      setError(
        null,
      );

      try {
        let targetItem =
          items.find(
            (item) =>
              item.wrongAnswerId ===
              targetId,
          );

        /**
         * 현재 목록에 없으면 단건 조회 API를 사용합니다.
         */
        if (!targetItem) {
          targetItem =
            await getWrongAnswer(
              targetId,
            );

          if (!cancelled) {
            setItems(
              (previous) => {
                const exists =
                  previous.some(
                    (item) =>
                      item.wrongAnswerId ===
                      targetId,
                  );

                if (exists) {
                  return previous;
                }

                return [
                  targetItem as WrongAnswerSummaryResponse,
                  ...previous,
                ];
              },
            );
          }
        }

        /**
         * 오답노트 요약에는 보기 목록이 없으므로
         * 문제 상세 API를 추가 호출합니다.
         */
        const question =
          await getQuestion(
            targetItem.question
              .questionId,
          );

        if (!cancelled) {
          setSelectedQuestion(
            question,
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setSelectedQuestion(
            null,
          );

          setError(
            requestError instanceof Error
              ? requestError.message
              : "문제를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!cancelled) {
          setRetrying(
            false,
          );
        }
      }
    }

    void restoreWrongAnswer();

    return () => {
      cancelled = true;
    };
  }, [params.wrongAnswerId]);

  const activeItem =
    useMemo(
      () =>
        items.find(
          (item) =>
            item.wrongAnswerId ===
            activeWrongAnswerId,
        ) ?? null,

      [
        items,
        activeWrongAnswerId,
      ],
    );

  /**
   * 다시 풀기 버튼을 누르면 URL에도 오답 ID를 반영합니다.
   */
  const openRetry = (
    item:
      WrongAnswerSummaryResponse,
  ) => {
    nav(
      `/question-bank/wrong-answers/${item.wrongAnswerId}`,
    );
  };

  /**
   * 오답 문제를 다시 채점합니다.
   */
  const submitRetry =
    async () => {
      if (
        !activeItem ||
        selectedOptionId ===
          null
      ) {
        return;
      }

      setRetrying(
        true,
      );

      setError(
        null,
      );

      try {
        const result =
          await retryWrongAnswer(
            activeItem
              .wrongAnswerId,

            selectedOptionId,
          );

        setRetryResult(
          result,
        );

        /**
         * 백엔드의 HistWrongAnswer 변경 규칙과 동일하게
         * 프론트 상태를 갱신합니다.
         *
         * 정답:
         * - isResolved = true
         * - wrongCount 유지
         *
         * 오답:
         * - isResolved = false
         * - wrongCount 1 증가
         */
        setItems(
          (previous) =>
            previous.map(
              (item) => {
                if (
                  item.wrongAnswerId !==
                  activeItem
                    .wrongAnswerId
                ) {
                  return item;
                }

                return {
                  ...item,

                  isResolved:
                    result.isCorrect,

                  wrongCount:
                    result.isCorrect
                      ? item.wrongCount
                      : item.wrongCount +
                        1,

                  lastSelectedAnswer:
                    selectedOptionId,

                  correctAnswer:
                    result.correctOptionId,
                };
              },
            ),
        );
      } catch (
        requestError
      ) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "다시 풀기 요청에 실패했습니다.",
        );
      } finally {
        setRetrying(
          false,
        );
      }
    };

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
          marginBottom: 16,
        }}
      >
        📕 오답노트
      </h2>

      {error && (
        <Card
          style={{
            marginBottom: 16,
            border:
              "2px solid #a94444",
          }}
        >
          <div
            style={{
              fontFamily: ff,
              fontSize: 12,
              color: "#7a1f1f",
            }}
          >
            {error}
          </div>
        </Card>
      )}

      <div
        style={{
          display: "grid",
          gap: 16,

          gridTemplateColumns:
            "minmax(280px, 360px) 1fr",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: 12,
          }}
        >
          <Card
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: ff,
                fontSize: 13,
                color: "#5a3010",
                lineHeight: 1.8,
              }}
            >
              틀린 문제를 다시 풀고, 내가 선택한 답안과 정답을 바로
              확인할 수 있습니다.
            </div>

            <Button
              variant="green"
              onClick={() =>
                nav(
                  "/question-bank/solve",
                )
              }
            >
              문제 풀이 화면으로
            </Button>
          </Card>

          {loading ? (
            <Card>
              <div
                style={{
                  fontFamily: ff,
                  fontSize: 12,
                  color: "#5a3010",
                }}
              >
                오답노트를 불러오는 중입니다...
              </div>
            </Card>
          ) : items.length === 0 ? (
            <Card>
              <div
                style={{
                  fontFamily: ff,
                  fontSize: 12,
                  color: "#5a3010",
                }}
              >
                아직 틀린 문제가 없습니다.
              </div>
            </Card>
          ) : (
            items.map(
              (item) => {
                const isActive =
                  item.wrongAnswerId ===
                  activeWrongAnswerId;

                return (
                  <Card
                    key={
                      item.wrongAnswerId
                    }
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap: 8,

                      border:
                        isActive
                          ? "2px solid #c8a030"
                          : undefined,
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "center",

                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          fontFamily:
                            ff,

                          fontSize:
                            11,

                          color:
                            "#9a7040",
                        }}
                      >
                        {
                          item.question
                            .era
                        }
                        {" · "}
                        {
                          item.question
                            .topicName
                        }
                      </div>

                      <div
                        style={{
                          fontFamily:
                            ff,

                          fontSize:
                            11,

                          fontWeight:
                            700,

                          color:
                            item.isResolved
                              ? "#2f6b2f"
                              : "#8f2424",
                        }}
                      >
                        {item.isResolved
                          ? "해결완료"
                          : "미해결"}
                      </div>
                    </div>

                    <div
                      style={{
                        fontFamily:
                          fs,

                        fontSize:
                          13,

                        color:
                          C.inkDark,

                        lineHeight:
                          1.5,
                      }}
                    >
                      {
                        item.question
                          .questionPreview
                      }
                    </div>

                    <div
                      style={{
                        display:
                          "flex",

                        gap: 8,

                        flexWrap:
                          "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontFamily:
                            ff,

                          fontSize:
                            11,

                          padding:
                            "4px 8px",

                          background:
                            "rgba(139,94,60,0.12)",

                          border:
                            "1px solid #c4a060",

                          color:
                            "#5a3010",
                        }}
                      >
                        {
                          item.question
                            .difficulty
                        }
                      </span>

                      <span
                        style={{
                          fontFamily:
                            ff,

                          fontSize:
                            11,

                          padding:
                            "4px 8px",

                          background:
                            "rgba(139,94,60,0.12)",

                          border:
                            "1px solid #c4a060",

                          color:
                            "#5a3010",
                        }}
                      >
                        {
                          item.wrongCount
                        }
                        회 오답
                      </span>
                    </div>

                    <div
                      style={{
                        fontFamily:
                          ff,

                        fontSize:
                          12,

                        color:
                          "#5a3010",

                        lineHeight:
                          1.6,
                      }}
                    >
                      <div>
                        내가 눌렀던 답:{" "}
                        {item.lastSelectedAnswer
                          ? `${item.lastSelectedAnswer}번`
                          : "기록 없음"}
                      </div>

                      <div>
                        정답:{" "}
                        {item.correctAnswer
                          ? `${item.correctAnswer}번`
                          : "미확인"}
                      </div>

                      <div>
                        생성일:{" "}
                        {new Date(
                          item.createdAt,
                        ).toLocaleString(
                          "ko-KR",
                        )}
                      </div>
                    </div>

                    <Button
                      variant="wood"
                      onClick={() =>
                        openRetry(
                          item,
                        )
                      }
                      disabled={
                        retrying
                      }
                    >
                      다시 풀기
                    </Button>
                  </Card>
                );
              },
            )
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: 12,
          }}
        >
          <Card
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: 10,
            }}
          >
            <div
              style={{
                fontFamily: ff,
                fontSize: 13,
                fontWeight: 700,
                color: "#5a3010",
              }}
            >
              {activeItem
                ? "선택한 오답 문제"
                : "오답 문제를 선택하면 여기서 다시 풀 수 있습니다."}
            </div>

            {activeItem ? (
              <>
                <div
                  style={{
                    fontFamily:
                      ff,

                    fontSize:
                      12,

                    color:
                      "#5a3010",

                    lineHeight:
                      1.6,
                  }}
                >
                  문제 ID{" "}
                  {
                    activeItem
                      .question
                      .questionId
                  }
                  {" · "}
                  틀린 횟수{" "}
                  {
                    activeItem
                      .wrongCount
                  }
                  회
                </div>

                {selectedQuestion ? (
                  <>
                    <div
                      style={{
                        fontFamily:
                          fs,

                        fontSize:
                          14,

                        color:
                          C.inkDark,

                        whiteSpace:
                          "pre-wrap",

                        lineHeight:
                          1.6,
                      }}
                    >
                      {
                        selectedQuestion
                          .questionContent
                      }
                    </div>

                    <div
                      style={{
                        display:
                          "flex",

                        flexDirection:
                          "column",

                        gap: 8,
                      }}
                    >
                      {selectedQuestion.options.map(
                        (
                          option,
                        ) => {
                          const isSelected =
                            selectedOptionId ===
                            option.questionOptionId;

                          return (
                            <button
                              key={
                                option.questionOptionId
                              }
                              onClick={() => {
                                setSelectedOptionId(
                                  option.questionOptionId,
                                );

                                setRetryResult(
                                  null,
                                );
                              }}
                              style={{
                                border:
                                  isSelected
                                    ? "2px solid #c8a030"
                                    : "1px solid #c4a060",

                                background:
                                  isSelected
                                    ? "rgba(200,160,48,0.18)"
                                    : "rgba(139,94,60,0.06)",

                                padding:
                                  "10px 12px",

                                textAlign:
                                  "left",

                                cursor:
                                  "pointer",

                                fontFamily:
                                  ff,

                                fontSize:
                                  12,

                                color:
                                  C.inkDark,
                              }}
                            >
                              <strong>
                                {getOptionLabel(
                                  option.optionNo,
                                  option.optionContent,
                                )}
                              </strong>

                              {option.optionContent
                                ? ` · ${option.optionContent}`
                                : ""}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <Button
                      variant="green"
                      onClick={() =>
                        void submitRetry()
                      }
                      disabled={
                        retrying ||
                        selectedOptionId ===
                          null
                      }
                    >
                      정답 제출
                    </Button>

                    {retryResult && (
                      <div
                        style={{
                          padding:
                            "10px 12px",

                          background:
                            retryResult.isCorrect
                              ? "rgba(58,96,48,0.16)"
                              : "rgba(192,64,64,0.12)",

                          border:
                            retryResult.isCorrect
                              ? "1px solid #245020"
                              : "1px solid #9a2020",

                          fontFamily:
                            ff,

                          fontSize:
                            12,

                          color:
                            C.inkDark,

                          lineHeight:
                            1.6,
                        }}
                      >
                        {retryResult.isCorrect
                          ? "정답입니다!"
                          : `오답입니다. 정답은 ${retryResult.correctOptionId}번입니다.`}

                        <div
                          style={{
                            marginTop:
                              4,
                          }}
                        >
                          선택한 답:{" "}
                          {selectedOptionId ??
                            "-"}
                          번
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      fontFamily:
                        ff,

                      fontSize:
                        12,

                      color:
                        "#5a3010",
                    }}
                  >
                    {retrying
                      ? "문제를 불러오는 중입니다..."
                      : "다시 풀기 버튼을 눌러 문제를 불러오세요."}
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  fontFamily: ff,
                  fontSize: 12,
                  color: "#5a3010",
                }}
              >
                오답 문제를 선택하면 상세 보기와 재풀이가 표시됩니다.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}