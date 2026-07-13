import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Bot,
  FileQuestion,
  FileText,
  MessageCircle,
  RefreshCw,
  UserCheck,
  UserRoundX,
  Users,
} from "lucide-react";

import {
  adminDashboardApi,
  type AdminDashboardResponse,
} from "@/api/adminDashboardApi";

import {
  Button,
  Card,
} from "@/components/ui";

import {
  C,
  ff,
  fs,
} from "@/styles/tokens";

interface DashboardCard {
  label: string;
  value: number;
  icon: ReactNode;
}

export default function AdminDashboardPage() {
  const [
    dashboard,
    setDashboard,
  ] = useState<
    AdminDashboardResponse | null
  >(null);

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

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const response =
        await adminDashboardApi
          .getDashboard();

      setDashboard(
        response,
      );
    } catch (
      requestError
    ) {
      setDashboard(
        null,
      );

      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "관리자 대시보드를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const cards:
    DashboardCard[] =
    dashboard
      ? [
          {
            label:
              "전체 회원",

            value:
              dashboard
                .totalMemberCount,

            icon: (
              <Users
                size={20}
              />
            ),
          },
          {
            label:
              "활성 회원",

            value:
              dashboard
                .activeMemberCount,

            icon: (
              <UserCheck
                size={20}
              />
            ),
          },
          {
            label:
              "탈퇴 회원",

            value:
              dashboard
                .deletedMemberCount,

            icon: (
              <UserRoundX
                size={20}
              />
            ),
          },
          {
            label:
              "등록 문제",

            value:
              dashboard
                .histQuestionCount,

            icon: (
              <FileQuestion
                size={20}
              />
            ),
          },
          {
            label:
              "문제 풀이 기록",

            value:
              dashboard
                .histSolveRecordCount,

            icon: (
              <FileText
                size={20}
              />
            ),
          },
          {
            label:
              "모의고사",

            value:
              dashboard
                .mockExamCount,

            icon: (
              <FileText
                size={20}
              />
            ),
          },
          {
            label:
              "AI 문제 세트",

            value:
              dashboard
                .aiGeneratedQuestionSetCount,

            icon: (
              <Bot
                size={20}
              />
            ),
          },
          {
            label:
              "AI 채팅 세션",

            value:
              dashboard
                .aiChatSessionCount,

            icon: (
              <MessageCircle
                size={20}
              />
            ),
          },
        ]
      : [];

  return (
    <div>
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
            16,
        }}
      >
        <p
          style={{
            fontFamily:
              ff,

            color:
              "#9aaa80",

            fontSize:
              12,

            margin: 0,
          }}
        >
          전체 서비스 현황을 확인합니다.
        </p>

        <Button
          variant="wood"
          disabled={loading}
          onClick={() =>
            void loadDashboard()
          }
          style={{
            display:
              "flex",

            alignItems:
              "center",

            gap: 5,

            padding:
              "5px 10px",

            fontSize:
              10,
          }}
        >
          <RefreshCw
            size={12}
          />

          새로고침
        </Button>
      </div>

      {error && (
        <div
          style={{
            fontFamily:
              ff,

            fontSize:
              11,

            color:
              C.redB,

            background:
              "rgba(192,64,64,0.12)",

            border:
              `1px solid ${C.redB}`,

            padding:
              "7px 9px",

            marginBottom:
              14,
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <Card>
          <div
            style={{
              padding: 18,
              textAlign:
                "center",

              fontFamily:
                ff,

              fontSize:
                12,

              color:
                "#7a5828",
            }}
          >
            관리자 대시보드를 불러오는 중입니다.
          </div>
        </Card>
      )}

      {!loading &&
        dashboard && (
        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "repeat(auto-fill, minmax(190px, 1fr))",

            gap: 14,
          }}
        >
          {cards.map(
            (
              card,
            ) => (
              <Card
                key={
                  card.label
                }
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
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily:
                          ff,

                        fontSize:
                          11,

                        color:
                          C.inkMid,

                        marginBottom:
                          6,
                      }}
                    >
                      {
                        card.label
                      }
                    </div>

                    <div
                      style={{
                        fontFamily:
                          fs,

                        fontWeight:
                          700,

                        fontSize:
                          22,

                        color:
                          C.inkDark,
                      }}
                    >
                      {
                        card.value
                      }
                    </div>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      width: 42,
                      height: 42,

                      color:
                        "#7a5828",

                      background:
                        "rgba(139,94,60,0.12)",

                      border:
                        `1px solid ${C.inputBr}`,
                    }}
                  >
                    {
                      card.icon
                    }
                  </div>
                </div>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}