import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  aiApi,
  type AiGeneratedQuestionSetDetailResponse,
  type AiGeneratedQuestionSetSummaryResponse,
} from "@/api/aiApi";

import {
  Button,
  Card,
} from "@/components/ui";

import {
  C,
  ff,
  fs,
} from "@/styles/tokens";

const PAGE_SIZE = 50;

const DIFFICULTY_LABEL:
  Record<string, string> = {
    basic: "기초",
    intermediate: "보통",
    advanced: "심화",
  };

const QUESTION_TYPE_LABEL:
  Record<string, string> = {
    multiple_choice: "객관식",
    short_answer: "단답형",
    ox: "OX",
  };

function formatDateTime(
  value: string,
): string {
  return new Date(
    value,
  ).toLocaleString(
    "ko-KR",
  );
}

/**
 * 백엔드 페이지 크기는 최대 50이므로
 * 전체 페이지를 순차적으로 조회합니다.
 */
async function loadAllSets():
  Promise<
    AiGeneratedQuestionSetSummaryResponse[]
  > {
  const firstPage =
    await aiApi
      .listGeneratedQuestionSets({
        page: 0,
        size: PAGE_SIZE,
      });

  const result = [
    ...firstPage.content,
  ];

  for (
    let pageNumber = 1;
    pageNumber <
    firstPage.totalPages;
    pageNumber += 1
  ) {
    const nextPage =
      await aiApi
        .listGeneratedQuestionSets({
          page:
            pageNumber,

          size:
            PAGE_SIZE,
        });

    result.push(
      ...nextPage.content,
    );
  }

  return result;
}

export default function AiGeneratedQuestionHistoryPage() {
  const nav =
    useNavigate();

  const params =
    useParams();

  const routeSetId =
    params.setId ===
    undefined
      ? null
      : Number(
          params.setId,
        );

  const [
    sets,
    setSets,
  ] = useState<
    AiGeneratedQuestionSetSummaryResponse[]
  >([]);

  const [
    detail,
    setDetail,
  ] = useState<
    AiGeneratedQuestionSetDetailResponse
    | null
  >(null);

  const [
    listLoading,
    setListLoading,
  ] = useState(true);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    deletingSetId,
    setDeletingSetId,
  ] = useState<
    number | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  /**
   * AI 문제 세트 목록 조회
   */
  useEffect(() => {
    let cancelled =
      false;

    async function loadSets() {
      setListLoading(
        true,
      );

      setError(
        null,
      );

      try {
        const loadedSets =
          await loadAllSets();

        if (!cancelled) {
          setSets(
            loadedSets,
          );
        }
      } catch (
        requestError
      ) {
        if (!cancelled) {
          setError(
            requestError
              instanceof Error
              ? requestError
                  .message
              : "AI 문제 기록을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!cancelled) {
          setListLoading(
            false,
          );
        }
      }
    }

    void loadSets();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * URL의 setId를 기준으로 상세 조회
   *
   * 예:
   * /question-bank/ai-generated-sets/15
   */
  useEffect(() => {
    let cancelled =
      false;

    if (
      params.setId ===
      undefined
    ) {
      setDetail(
        null,
      );

      setDetailLoading(
        false,
      );

      return () => {
        cancelled = true;
      };
    }

    if (
      routeSetId ===
        null ||
      !Number.isInteger(
        routeSetId,
      ) ||
      routeSetId <= 0
    ) {
      setDetail(
        null,
      );

      setDetailLoading(
        false,
      );

      setError(
        "AI 문제 세트 번호가 올바르지 않습니다.",
      );

      return () => {
        cancelled = true;
      };
    }

    async function loadDetail() {
      setDetailLoading(
        true,
      );

      setError(
        null,
      );

      try {
        const loadedDetail =
          await aiApi
            .getGeneratedQuestionSet(
              routeSetId as number,
            );

        if (!cancelled) {
          setDetail(
            loadedDetail,
          );
        }
      } catch (
        requestError
      ) {
        if (!cancelled) {
          setDetail(
            null,
          );

          setError(
            requestError
              instanceof Error
              ? requestError
                  .message
              : "AI 문제 기록 상세를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(
            false,
          );
        }
      }
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [
    params.setId,
    routeSetId,
  ]);

  const selectedSetId =
    useMemo(
      () =>
        detail
          ?.aiGeneratedQuestionSetId ??
        routeSetId,

      [
        detail,
        routeSetId,
      ],
    );

  function openSet(
    setId: number,
  ) {
    nav(
      `/question-bank/ai-generated-sets/${setId}`,
    );
  }

  /**
   * AI 생성 문제 세트 삭제
   */
  async function handleDelete(
    setId: number,
  ) {
    if (
      !window.confirm(
        "이 AI 문제 기록을 삭제하시겠습니까?",
      )
    ) {
      return;
    }

    setDeletingSetId(
      setId,
    );

    setError(
      null,
    );

    try {
      await aiApi
        .deleteGeneratedQuestionSet(
          setId,
        );

      setSets(
        (previous) =>
          previous.filter(
            (item) =>
              item
                .aiGeneratedQuestionSetId !==
              setId,
          ),
      );

      if (
        selectedSetId ===
        setId
      ) {
        setDetail(
          null,
        );

        nav(
          "/question-bank/ai-generated-sets",
          {
            replace: true,
          },
        );
      }
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError
              .message
          : "AI 문제 기록 삭제에 실패했습니다.",
      );
    } finally {
      setDeletingSetId(
        null,
      );
    }
  }

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY:
          "auto",

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
          background:
            "none",

          border:
            "none",

          color:
            "#c8a060",

          cursor:
            "pointer",

          fontFamily:
            ff,

          fontSize:
            12,

          marginBottom:
            16,
        }}
      >
        ← 문제은행 홈
      </button>

      <h2
        style={{
          fontFamily:
            fs,

          color:
            "#f5e6c8",

          fontSize:
            18,

          marginBottom:
            6,
        }}
      >
        🗂️ AI 문제 기록
      </h2>

      <p
        style={{
          fontFamily:
            ff,

          color:
            "#9aaa80",

          fontSize:
            12,

          marginBottom:
            20,
        }}
      >
        이전에 생성한 AI 문제지와 상세 내용을 확인할 수 있습니다.
      </p>

      {error && (
        <Card
          style={{
            marginBottom:
              16,

            border:
              "2px solid #a94444",
          }}
        >
          <div
            style={{
              fontFamily:
                ff,

              fontSize:
                12,

              color:
                "#7a1f1f",
            }}
          >
            {error}
          </div>
        </Card>
      )}

      <div
        style={{
          display:
            "grid",

          gap: 16,

          gridTemplateColumns:
            "minmax(280px, 360px) 1fr",

          alignItems:
            "start",
        }}
      >
        <div
          style={{
            display:
              "flex",

            flexDirection:
              "column",

            gap: 12,
          }}
        >
          {listLoading ? (
            <Card>
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
                AI 문제 기록을 불러오는 중입니다.
              </div>
            </Card>
          ) : sets.length ===
              0 ? (
            <Card>
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
                저장된 AI 문제 기록이 없습니다.
              </div>
            </Card>
          ) : (
            sets.map(
              (set) => {
                const active =
                  selectedSetId ===
                  set
                    .aiGeneratedQuestionSetId;

                return (
                  <Card
                    key={
                      set
                        .aiGeneratedQuestionSetId
                    }
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap: 8,

                      border:
                        active
                          ? "2px solid #c8a030"
                          : undefined,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        openSet(
                          set
                            .aiGeneratedQuestionSetId,
                        )
                      }
                      style={{
                        padding:
                          0,

                        background:
                          "none",

                        border:
                          "none",

                        textAlign:
                          "left",

                        cursor:
                          "pointer",

                        fontFamily:
                          ff,
                      }}
                    >
                      <div
                        style={{
                          fontFamily:
                            fs,

                          fontWeight:
                            700,

                          fontSize:
                            13,

                          color:
                            C.inkDark,

                          marginBottom:
                            5,
                        }}
                      >
                        {set.topic}
                      </div>

                      <div
                        style={{
                          display:
                            "flex",

                          gap: 6,

                          flexWrap:
                            "wrap",

                          marginBottom:
                            6,
                        }}
                      >
                        <span
                          style={{
                            fontSize:
                              10,

                            padding:
                              "2px 6px",

                            background:
                              "rgba(139,94,60,0.15)",

                            color:
                              "#7a5828",

                            fontWeight:
                              700,
                          }}
                        >
                          {DIFFICULTY_LABEL[
                            set.difficulty
                          ] ??
                            set.difficulty}
                        </span>

                        <span
                          style={{
                            fontSize:
                              10,

                            padding:
                              "2px 6px",

                            background:
                              "rgba(139,94,60,0.15)",

                            color:
                              "#7a5828",

                            fontWeight:
                              700,
                          }}
                        >
                          {QUESTION_TYPE_LABEL[
                            set.questionType
                          ] ??
                            set.questionType}
                        </span>

                        <span
                          style={{
                            fontSize:
                              10,

                            padding:
                              "2px 6px",

                            background:
                              "rgba(139,94,60,0.15)",

                            color:
                              "#7a5828",

                            fontWeight:
                              700,
                          }}
                        >
                          {
                            set.questionCount
                          }
                          문제
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize:
                            10,

                          color:
                            "#9a7040",
                        }}
                      >
                        {formatDateTime(
                          set.createdAt,
                        )}
                      </div>
                    </button>

                    <Button
                      variant="red"
                      disabled={
                        deletingSetId ===
                        set
                          .aiGeneratedQuestionSetId
                      }
                      onClick={() =>
                        void handleDelete(
                          set
                            .aiGeneratedQuestionSetId,
                        )
                      }
                      style={{
                        padding:
                          "4px 10px",

                        fontSize:
                          10,
                      }}
                    >
                      {deletingSetId ===
                      set
                        .aiGeneratedQuestionSetId
                        ? "삭제 중"
                        : "삭제"}
                    </Button>
                  </Card>
                );
              },
            )
          )}
        </div>

        <div
          style={{
            display:
              "flex",

            flexDirection:
              "column",

            gap: 12,
          }}
        >
          {detailLoading ? (
            <Card>
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
                AI 문제 상세를 불러오는 중입니다.
              </div>
            </Card>
          ) : detail ===
              null ? (
            <Card>
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
                왼쪽에서 AI 문제 기록을 선택해주세요.
              </div>
            </Card>
          ) : (
            <>
              <Card>
                <div
                  style={{
                    fontFamily:
                      fs,

                    fontWeight:
                      700,

                    fontSize:
                      14,

                    color:
                      C.inkDark,

                    marginBottom:
                      8,
                  }}
                >
                  {detail.topic}
                </div>

                <div
                  style={{
                    fontFamily:
                      ff,

                    fontSize:
                      11,

                    color:
                      C.inkMid,

                    lineHeight:
                      1.7,
                  }}
                >
                  난이도:{" "}
                  {DIFFICULTY_LABEL[
                    detail.difficulty
                  ] ??
                    detail.difficulty}
                  {" · "}
                  유형:{" "}
                  {QUESTION_TYPE_LABEL[
                    detail.questionType
                  ] ??
                    detail.questionType}
                  {" · "}
                  문제 수:{" "}
                  {
                    detail.questionCount
                  }
                  {" · "}
                  생성일:{" "}
                  {formatDateTime(
                    detail.createdAt,
                  )}
                </div>
              </Card>

              {detail.questions.map(
                (
                  question,
                ) => (
                  <Card
                    key={
                      question
                        .aiGeneratedQuestionId
                    }
                  >
                    <div
                      style={{
                        fontFamily:
                          ff,

                        fontSize:
                          11,

                        color:
                          "#9a7040",

                        marginBottom:
                          6,
                      }}
                    >
                      {
                        question.questionOrder
                      }
                      번

                      {question.era
                        ? ` · ${question.era}`
                        : ""}

                      {question.topic
                        ? ` · ${question.topic}`
                        : ""}

                      {question.difficulty
                        ? ` · ${question.difficulty}`
                        : ""}
                    </div>

                    <div
                      style={{
                        fontFamily:
                          fs,

                        fontWeight:
                          700,

                        fontSize:
                          14,

                        color:
                          C.inkDark,

                        lineHeight:
                          1.6,

                        marginBottom:
                          12,

                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {
                        question.question
                      }
                    </div>

                    {question.choices
                      .length >
                      0 && (
                      <div
                        style={{
                          display:
                            "flex",

                          flexDirection:
                            "column",

                          gap: 6,

                          marginBottom:
                            10,
                        }}
                      >
                        {question.choices.map(
                          (
                            choice,
                            index,
                          ) => (
                            <div
                              key={
                                index
                              }
                              style={{
                                padding:
                                  "8px 10px",

                                fontFamily:
                                  ff,

                                fontSize:
                                  12,

                                background:
                                  "rgba(139,94,60,0.06)",

                                border:
                                  `1px solid ${C.inputBr}`,

                                color:
                                  C.inkDark,
                              }}
                            >
                              {index +
                                1}
                              .{" "}
                              {choice}
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        padding:
                          "8px 10px",

                        fontFamily:
                          ff,

                        fontSize:
                          11,

                        color:
                          C.inkMid,

                        lineHeight:
                          1.6,

                        background:
                          "rgba(139,94,60,0.08)",
                      }}
                    >
                      <div>
                        정답:{" "}
                        {
                          question.answer
                        }
                      </div>

                      {question.explanation && (
                        <div
                          style={{
                            marginTop:
                              5,
                          }}
                        >
                          해설:{" "}
                          {
                            question.explanation
                          }
                        </div>
                      )}

                      {question.examTip && (
                        <div
                          style={{
                            marginTop:
                              5,

                            color:
                              "#9a7040",
                          }}
                        >
                          시험 팁:{" "}
                          {
                            question.examTip
                          }
                        </div>
                      )}
                    </div>
                  </Card>
                ),
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}