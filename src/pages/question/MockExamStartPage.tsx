import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Card,
  Button,
} from "@/components/ui";

import {
  fs,
  ff,
  C,
} from "@/styles/tokens";

import {
  createMockExam,
  getMockExamList,
} from "@/api/questionApi";

import type {
  ExamLevel,
  MockExamSummaryResponse,
} from "@/api/types";

const EXAM_LEVEL_OPTIONS: {
  value: ExamLevel;
  label: string;
  totalCount: number;
}[] = [
  {
    value: "BASIC",
    label: "기본",
    totalCount: 20,
  },
  {
    value: "ADVANCED",
    label: "심화",
    totalCount: 50,
  },
];

const HISTORY_PAGE_SIZE = 50;

/**
 * 서버 날짜를 사용자 화면용 한국어 날짜로 변환합니다.
 */
function formatDateTime(
  value?: string | null,
): string {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "ko-KR",
  );
}

/**
 * 점수를 화면에 표시합니다.
 *
 * 정수 점수는 소수점 없이,
 * 소수점 점수는 한 자리까지 표시합니다.
 */
function formatScore(
  score?: number,
): string {
  if (
    score === undefined
  ) {
    return "-";
  }

  return Number.isInteger(
    score,
  )
    ? String(score)
    : score.toFixed(1);
}

/**
 * 백엔드 페이지 크기는 최대 50이므로
 * 모의고사 이력의 전체 페이지를 순차적으로 조회합니다.
 */
async function loadAllMockExams():
  Promise<
    MockExamSummaryResponse[]
  > {
  const firstPage =
    await getMockExamList({
      page: 0,
      size:
        HISTORY_PAGE_SIZE,
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
      await getMockExamList({
        page:
          pageNumber,

        size:
          HISTORY_PAGE_SIZE,
      });

    result.push(
      ...nextPage.content,
    );
  }

  return result;
}

export default function MockExamStartPage() {
  const nav =
    useNavigate();

  const [
    examLevel,
    setExamLevel,
  ] = useState<ExamLevel>(
    "BASIC",
  );

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
    history,
    setHistory,
  ] = useState<
    MockExamSummaryResponse[]
  >([]);

  const [
    historyLoading,
    setHistoryLoading,
  ] = useState(true);

  const [
    historyError,
    setHistoryError,
  ] = useState<
    string | null
  >(null);

  /**
   * 현재 사용자의 전체 모의고사 이력을 조회합니다.
   */
  const loadHistory =
    useCallback(
      async () => {
        setHistoryLoading(
          true,
        );

        setHistoryError(
          null,
        );

        try {
          const loadedHistory =
            await loadAllMockExams();

          setHistory(
            loadedHistory,
          );
        } catch (
          requestError
        ) {
          setHistory([]);

          setHistoryError(
            requestError
              instanceof Error
              ? requestError
                  .message
              : "모의고사 이력을 불러오지 못했습니다.",
          );
        } finally {
          setHistoryLoading(
            false,
          );
        }
      },
      [],
    );

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  /**
   * 새로운 모의고사를 생성하고 응시 화면으로 이동합니다.
   */
  async function handleStart() {
    setLoading(true);
    setError(null);

    try {
      const level =
        EXAM_LEVEL_OPTIONS.find(
          (
            option,
          ) =>
            option.value ===
            examLevel,
        );

      if (!level) {
        throw new Error(
          "모의고사 급수 설정을 확인해주세요.",
        );
      }

      const exam =
        await createMockExam({
          examLevel,
          totalCount:
            level.totalCount,
        });

      nav(
        `/question-bank/mock-exams/${exam.mockExamId}`,
        {
          state: {
            exam,
          },
        },
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError
              .message
          : "모의고사를 시작하지 못했습니다",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * 진행 중 시험은 응시 화면으로,
   * 제출 완료 시험은 결과 화면으로 이동합니다.
   */
  function openMockExam(
    exam:
      MockExamSummaryResponse,
  ) {
    if (
      exam.status ===
      "SUBMITTED"
    ) {
      nav(
        `/question-bank/mock-exams/${exam.mockExamId}/result`,
      );

      return;
    }

    nav(
      `/question-bank/mock-exams/${exam.mockExamId}`,
    );
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
        📝 모의고사
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
        급수를 고르면 새 회차가 시작돼요.
      </p>

      {/*
       * 기존 모의고사 시작 카드
       *
       * 디자인과 스타일은 기존 코드를 그대로 유지합니다.
       */}
      <Card
        style={{
          maxWidth: 360,
        }}
      >
        <label
          style={{
            display:
              "flex",

            flexDirection:
              "column",

            gap: 4,

            marginBottom:
              16,
          }}
        >
          <span
            style={{
              fontSize:
                11,

              color:
                C.inkMid,

              fontWeight:
                700,
            }}
          >
            급수
          </span>

          <select
            value={
              examLevel
            }
            onChange={(
              event,
            ) =>
              setExamLevel(
                event
                  .target
                  .value as ExamLevel,
              )
            }
            style={{
              fontSize:
                12,

              padding:
                "8px 12px",

              background:
                C.inputBg,

              border:
                `1px solid ${C.inputBr}`,

              outline:
                "none",

              color:
                C.inkDark,

              fontFamily:
                ff,

              width:
                "100%",
            }}
          >
            {EXAM_LEVEL_OPTIONS.map(
              (
                option,
              ) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {option.label}
                  {" ("}
                  {option.totalCount}
                  문제)
                </option>
              ),
            )}
          </select>
        </label>

        {error && (
          <div
            style={{
              fontSize:
                11,

              color:
                C.redB,

              background:
                "rgba(192,64,64,0.12)",

              border:
                `1px solid ${C.redB}`,

              padding:
                "6px 8px",

              marginBottom:
                12,
            }}
          >
            {error}
          </div>
        )}

        <Button
          variant="green"
          block
          disabled={
            loading
          }
          onClick={() =>
            void handleStart()
          }
        >
          {loading
            ? "시작하는 중..."
            : "모의고사 시작하기"}
        </Button>
      </Card>

      {/*
       * 모의고사 이력
       */}
      <div
        style={{
          marginTop:
            24,

          maxWidth:
            760,
        }}
      >
        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            gap: 12,

            marginBottom:
              10,
          }}
        >
          <div
            style={{
              fontFamily:
                fs,

              fontWeight:
                700,

              fontSize:
                14,

              color:
                "#f5e6c8",
            }}
          >
            모의고사 이력
          </div>

          <Button
            variant="wood"
            disabled={
              historyLoading
            }
            onClick={() =>
              void loadHistory()
            }
            style={{
              padding:
                "4px 10px",

              fontSize:
                10,
            }}
          >
            새로고침
          </Button>
        </div>

        {historyError && (
          <Card
            style={{
              marginBottom:
                12,

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
              {
                historyError
              }
            </div>
          </Card>
        )}

        {historyLoading ? (
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
              모의고사 이력을 불러오는 중입니다.
            </div>
          </Card>
        ) : history.length ===
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
              아직 응시한 모의고사가 없습니다.
            </div>
          </Card>
        ) : (
          <div
            style={{
              display:
                "flex",

              flexDirection:
                "column",

              gap: 10,
            }}
          >
            {history.map(
              (
                exam,
              ) => {
                const submitted =
                  exam.status ===
                  "SUBMITTED";

                return (
                  <Card
                    key={
                      exam.mockExamId
                    }
                    style={{
                      display:
                        "flex",

                      justifyContent:
                        "space-between",

                      alignItems:
                        "center",

                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        minWidth:
                          0,

                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap: 6,

                          flexWrap:
                            "wrap",

                          marginBottom:
                            5,
                        }}
                      >
                        <span
                          style={{
                            fontFamily:
                              fs,

                            fontWeight:
                              700,

                            fontSize:
                              13,

                            color:
                              C.inkDark,
                          }}
                        >
                          {
                            exam.title
                          }
                        </span>

                        <span
                          style={{
                            fontFamily:
                              ff,

                            fontSize:
                              10,

                            padding:
                              "2px 6px",

                            background:
                              submitted
                                ? "rgba(58,96,48,0.16)"
                                : "rgba(200,160,48,0.18)",

                            border:
                              `1px solid ${
                                submitted
                                  ? "#245020"
                                  : "#c8a030"
                              }`,

                            color:
                              submitted
                                ? "#245020"
                                : "#7a5828",

                            fontWeight:
                              700,
                          }}
                        >
                          {submitted
                            ? "제출 완료"
                            : "진행 중"}
                        </span>

                        <span
                          style={{
                            fontFamily:
                              ff,

                            fontSize:
                              10,

                            padding:
                              "2px 6px",

                            background:
                              "rgba(139,94,60,0.12)",

                            border:
                              `1px solid ${C.inputBr}`,

                            color:
                              "#7a5828",

                            fontWeight:
                              700,
                          }}
                        >
                          {
                            exam.examLevel ===
                            "ADVANCED"
                              ? "심화"
                              : "기본"
                          }
                        </span>

                        <span
                          style={{
                            fontFamily:
                              ff,

                            fontSize:
                              10,

                            padding:
                              "2px 6px",

                            background:
                              "rgba(139,94,60,0.12)",

                            border:
                              `1px solid ${C.inputBr}`,

                            color:
                              "#7a5828",

                            fontWeight:
                              700,
                          }}
                        >
                          {
                            exam.totalCount
                          }
                          문제
                        </span>
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
                            1.6,
                        }}
                      >
                        시작:{" "}
                        {formatDateTime(
                          exam.startedAt,
                        )}
                      </div>

                      {submitted && (
                        <>
                          <div
                            style={{
                              fontFamily:
                                ff,

                              fontSize:
                                11,

                              color:
                                C.inkMid,

                              lineHeight:
                                1.6,
                            }}
                          >
                            제출:{" "}
                            {formatDateTime(
                              exam.submittedAt,
                            )}
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
                                1.6,
                            }}
                          >
                            정답:{" "}
                            <strong>
                              {
                                exam.correctCount ??
                                0
                              }
                              /{
                                exam.totalCount
                              }
                            </strong>
                            {" · "}
                            점수:{" "}
                            <strong>
                              {formatScore(
                                exam.score,
                              )}
                              점
                            </strong>
                          </div>
                        </>
                      )}
                    </div>

                    <Button
                      variant={
                        submitted
                          ? "wood"
                          : "green"
                      }
                      onClick={() =>
                        openMockExam(
                          exam,
                        )
                      }
                      style={{
                        padding:
                          "6px 12px",

                        fontSize:
                          10,

                        flexShrink:
                          0,
                      }}
                    >
                      {submitted
                        ? "결과 보기"
                        : "이어 풀기"}
                    </Button>
                  </Card>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}