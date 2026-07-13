import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Bot,
  BookOpen,
  Clock3,
  FileText,
  MessageCircle,
  RefreshCw,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  dashboardApi,
  type RecentActivityResponse,
} from "@/api/dashboardApi";

import {
  C,
  ff,
  fs,
} from "@/styles/tokens";

interface ActivityPresentation {
  icon: ReactNode;
  label: string;
}

function getActivityPresentation(
  activityType: string,
): ActivityPresentation {
  switch (activityType) {
    case "HIST_SOLVE":
      return {
        icon: (
          <BookOpen
            size={13}
          />
        ),
        label: "기출 문제",
      };

    case "AI_GENERATED_SOLVE":
      return {
        icon: (
          <Bot
            size={13}
          />
        ),
        label: "AI 문제 풀이",
      };

    case "MOCK_EXAM":
      return {
        icon: (
          <FileText
            size={13}
          />
        ),
        label: "모의고사",
      };

    case "AI_GENERATED_SET":
      return {
        icon: (
          <Bot
            size={13}
          />
        ),
        label: "AI 문제 생성",
      };

    case "AI_CHAT":
      return {
        icon: (
          <MessageCircle
            size={13}
          />
        ),
        label: "AI 채팅",
      };

    default:
      return {
        icon: (
          <Clock3
            size={13}
          />
        ),
        label: "학습 활동",
      };
  }
}

/**
 * 활동 유형에 맞는 화면 주소를 반환합니다.
 */
function getActivityRoute(
  activity:
    RecentActivityResponse,
): string {
  switch (
    activity.activityType
  ) {
    case "HIST_SOLVE":
      /**
       * targetId는 기출문제 합성 ID이지만
       * 현재 단일 문제 직접 접근 화면은 없으므로
       * 시대별 문제 화면으로 이동합니다.
       */
      return "/question-bank/periods";

    case "AI_GENERATED_SOLVE":
      /**
       * targetId는 AI 생성 문제 ID입니다.
       * 세트 ID가 아니므로 AI 문제 기록 목록으로 이동합니다.
       */
      return "/question-bank/ai-generated-sets";

    case "MOCK_EXAM":
      return activity.description.includes(
        "진행 중",
      )
        ? `/question-bank/mock-exams/${activity.targetId}`
        : `/question-bank/mock-exams/${activity.targetId}/result`;

    case "AI_GENERATED_SET":
      return `/question-bank/ai-generated-sets/${activity.targetId}`;

    case "AI_CHAT":
      return `/question-bank/ai/${activity.targetId}`;

    default:
      return "/my-study";
  }
}

function formatActivityDate(
  value: string,
): string {
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
    {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export default function RecentActivityPanel() {
  const navigate =
    useNavigate();

  const [
    activities,
    setActivities,
  ] = useState<
    RecentActivityResponse[]
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

  async function loadActivities() {
    setLoading(true);
    setError(null);

    try {
      const response =
        await dashboardApi
          .getRecentActivities(
            10,
          );

      setActivities(
        response,
      );
    } catch (
      requestError
    ) {
      setActivities([]);

      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "최근 활동을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadActivities();
  }, []);

  return (
    <div
      style={{
        background:
          C.hanji,

        border:
          `2px solid ${C.hanjiB}`,

        boxShadow:
          `0 3px 0 ${C.hanjiSh}, 0 5px 16px rgba(0,0,0,0.3)`,
      }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          background:
            "#3a2a18",

          borderBottom:
            "2px solid rgba(0,0,0,0.28)",

          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <span
          style={{
            color:
              "#c8a030",

            filter:
              "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
          }}
        >
          <Clock3
            size={14}
          />
        </span>

        <span
          style={{
            color:
              "#ddd0b8",

            fontFamily:
              fs,

            fontWeight:
              700,

            fontSize:
              12,

            letterSpacing:
              "0.04em",

            textShadow:
              "0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          최근 학습 활동
        </span>

        <button
          type="button"
          onClick={() =>
            void loadActivities()
          }
          disabled={loading}
          title="최근 활동 새로고침"
          style={{
            marginLeft:
              "auto",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            padding: 2,

            border:
              "none",

            background:
              "transparent",

            color:
              "#c8a030",

            cursor:
              loading
                ? "default"
                : "pointer",

            opacity:
              loading
                ? 0.5
                : 1,
          }}
        >
          <RefreshCw
            size={13}
          />
        </button>
      </div>

      <div
        className="p-3"
      >
        {loading && (
          <div
            style={{
              fontFamily:
                ff,

              fontSize:
                11,

              color:
                "#9a7040",

              padding:
                "8px 0",
            }}
          >
            최근 활동을 불러오는 중입니다.
          </div>
        )}

        {!loading &&
          error && (
          <div
            style={{
              fontFamily:
                ff,

              fontSize:
                11,

              color:
                "#9a2020",

              background:
                "rgba(192,64,64,0.1)",

              border:
                "1px solid #9a2020",

              padding:
                "7px 9px",
            }}
          >
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          activities.length ===
            0 && (
          <div
            style={{
              fontFamily:
                ff,

              fontSize:
                11,

              color:
                "#9a7040",

              textAlign:
                "center",

              padding:
                "12px 0",
            }}
          >
            아직 학습 활동이 없습니다.
          </div>
        )}

        {!loading &&
          !error &&
          activities.length >
            0 && (
          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",

              gap: 8,
            }}
          >
            {activities.map(
              (
                activity,
                index,
              ) => {
                const presentation =
                  getActivityPresentation(
                    activity.activityType,
                  );

                return (
                  <button
                    key={`${activity.activityType}-${activity.targetId}-${activity.createdAt}-${index}`}
                    type="button"
                    onClick={() =>
                      navigate(
                        getActivityRoute(
                          activity,
                        ),
                      )
                    }
                    style={{
                      display:
                        "flex",

                      alignItems:
                        "flex-start",

                      gap: 8,

                      width:
                        "100%",

                      padding:
                        "8px 10px",

                      textAlign:
                        "left",

                      cursor:
                        "pointer",

                      background:
                        "rgba(139,94,60,0.07)",

                      border:
                        `1px solid ${C.inputBr}`,

                      fontFamily:
                        ff,
                    }}
                  >
                    <span
                      style={{
                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        flexShrink:
                          0,

                        width: 24,
                        height: 24,

                        color:
                          "#7a5828",

                        background:
                          "rgba(139,94,60,0.12)",

                        border:
                          `1px solid ${C.inputBr}`,
                      }}
                    >
                      {
                        presentation.icon
                      }
                    </span>

                    <span
                      style={{
                        minWidth:
                          0,

                        flex: 1,
                      }}
                    >
                      <span
                        style={{
                          display:
                            "block",

                          fontSize:
                            10,

                          fontWeight:
                            700,

                          color:
                            "#9a7040",

                          marginBottom:
                            2,
                        }}
                      >
                        {
                          presentation.label
                        }
                      </span>

                      <span
                        style={{
                          display:
                            "block",

                          fontSize:
                            11,

                          fontWeight:
                            700,

                          color:
                            C.inkDark,

                          whiteSpace:
                            "nowrap",

                          overflow:
                            "hidden",

                          textOverflow:
                            "ellipsis",
                        }}
                      >
                        {
                          activity.title
                        }
                      </span>

                      <span
                        style={{
                          display:
                            "block",

                          fontSize:
                            10,

                          color:
                            C.inkMid,

                          marginTop:
                            2,
                        }}
                      >
                        {
                          activity.description
                        }
                        {" · "}
                        {formatActivityDate(
                          activity.createdAt,
                        )}
                      </span>
                    </span>
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}