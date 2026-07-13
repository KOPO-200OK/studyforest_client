import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Card,
  Button,
  Input,
} from "@/components/ui";

import {
  fs,
  ff,
} from "@/styles/tokens";

import {
  aiChatApi,
  type AiChatSender,
} from "@/api/aiChatApi";

interface ChatMessage {
  id: number;
  sender: AiChatSender;
  content: string;
}

export default function AiQuestionPage() {
  const nav =
    useNavigate();

  const params =
    useParams();

  const routeSessionId =
    params.chatSessionId
      ? Number(
          params.chatSessionId,
        )
      : null;

  /**
   * URL에 유효한 세션 ID가 있으면 초기 세션으로 사용합니다.
   */
  const [
    sessionId,
    setSessionId,
  ] = useState<
    number | null
  >(
    Number.isInteger(
      routeSessionId,
    ) &&
      routeSessionId !==
        null &&
      routeSessionId > 0
      ? routeSessionId
      : null,
  );

  const [
    messages,
    setMessages,
  ] = useState<
    ChatMessage[]
  >([]);

  const [
    input,
    setInput,
  ] = useState("");

  /**
   * AI 답변을 기다리는 상태입니다.
   */
  const [
    loading,
    setLoading,
  ] = useState(false);

  /**
   * 기존 채팅 이력을 불러오는 상태입니다.
   */
  const [
    historyLoading,
    setHistoryLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const bottomRef =
    useRef<
      HTMLDivElement
    >(null);

  /**
   * 새 세션을 만든 직후 URL이 변경되면
   * 메시지 조회 Effect가 실행됩니다.
   *
   * 이때 아직 비어 있는 서버 조회 결과가
   * 방금 화면에 추가한 메시지를 덮어쓰지 않도록
   * 새로 만든 세션 ID를 잠시 저장합니다.
   */
  const skipNextHistoryLoadRef =
    useRef<
      number | null
    >(null);

  /**
   * 메시지 또는 로딩 상태가 변경되면
   * 가장 아래쪽으로 이동합니다.
   */
  useEffect(() => {
    bottomRef.current
      ?.scrollIntoView({
        behavior:
          "smooth",
      });
  }, [
    messages,
    loading,
  ]);

  /**
   * URL에 채팅 세션 ID가 있으면
   * 기존 메시지를 서버에서 복구합니다.
   *
   * 예:
   * /question-bank/ai/15
   */
  useEffect(() => {
    let cancelled =
      false;

    /**
     * /question-bank/ai 주소는 새 대화 화면입니다.
     */
    if (
      params.chatSessionId ===
      undefined
    ) {
      setSessionId(
        null,
      );

      setMessages([]);

      setError(null);

      setHistoryLoading(
        false,
      );

      return () => {
        cancelled = true;
      };
    }

    const numericSessionId =
      Number(
        params.chatSessionId,
      );

    if (
      !Number.isInteger(
        numericSessionId,
      ) ||
      numericSessionId <= 0
    ) {
      setSessionId(
        null,
      );

      setMessages([]);

      setHistoryLoading(
        false,
      );

      setError(
        "AI 채팅 세션 번호가 올바르지 않습니다.",
      );

      return () => {
        cancelled = true;
      };
    }

    setSessionId(
      numericSessionId,
    );

    /**
     * 현재 화면에서 방금 생성한 세션이라면
     * 이미 화면에 메시지가 있으므로 조회를 건너뜁니다.
     */
    if (
      skipNextHistoryLoadRef
        .current ===
      numericSessionId
    ) {
      skipNextHistoryLoadRef
        .current = null;

      setHistoryLoading(
        false,
      );

      return () => {
        cancelled = true;
      };
    }

    async function loadMessages() {
      setHistoryLoading(
        true,
      );

      setError(null);

      try {
        const history =
          await aiChatApi
            .listMessages(
              numericSessionId,
            );

        if (cancelled) {
          return;
        }

        setMessages(
          history.map(
            (
              message,
            ): ChatMessage => ({
              id:
                message
                  .aiChatMessageId,

              sender:
                message.sender,

              content:
                message.message,
            }),
          ),
        );
      } catch (
        requestError
      ) {
        if (cancelled) {
          return;
        }

        setMessages([]);

        setError(
          requestError
            instanceof Error
            ? requestError
                .message
            : "AI 채팅 내역을 불러오지 못했습니다.",
        );
      } finally {
        if (!cancelled) {
          setHistoryLoading(
            false,
          );
        }
      }
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [
    params.chatSessionId,
  ]);

  /**
   * 세션이 없으면 새 채팅 세션을 생성합니다.
   */
  async function ensureSession():
    Promise<number> {
    if (
      sessionId !== null
    ) {
      return sessionId;
    }

    const session =
      await aiChatApi
        .createSession();

    setSessionId(
      session
        .aiChatSessionId,
    );

    skipNextHistoryLoadRef
      .current =
      session
        .aiChatSessionId;

    /**
     * URL에 세션 ID를 넣어 새로고침 복구가 가능하게 합니다.
     */
    nav(
      `/question-bank/ai/${session.aiChatSessionId}`,
      {
        replace: true,
      },
    );

    return session
      .aiChatSessionId;
  }

  /**
   * 메시지를 전송합니다.
   */
  async function handleSend() {
    const text =
      input.trim();

    if (
      !text ||
      loading ||
      historyLoading
    ) {
      return;
    }

    /**
     * 서버 응답 전에 화면에 표시할 임시 ID입니다.
     * DB ID와 충돌하지 않도록 음수를 사용합니다.
     */
    const temporaryUserMessageId =
      -Date.now();

    setInput("");

    setError(null);

    setMessages(
      (
        previous,
      ) => [
        ...previous,

        {
          id:
            temporaryUserMessageId,

          sender:
            "USER",

          content:
            text,
        },
      ],
    );

    setLoading(true);

    try {
      const activeSessionId =
        await ensureSession();

      const response =
        await aiChatApi
          .sendMessage(
            activeSessionId,
            text,
          );

      setMessages(
        (
          previous,
        ) => [
          ...previous,

          {
            id:
              temporaryUserMessageId -
              1,

            sender:
              "AI",

            content:
              response.answer,
          },
        ],
      );
    } catch (
      requestError
    ) {
      /**
       * 전송 실패 시 화면에 임시로 추가했던
       * 사용자 메시지를 제거합니다.
       */
      setMessages(
        (
          previous,
        ) =>
          previous.filter(
            (
              message,
            ) =>
              message.id !==
              temporaryUserMessageId,
          ),
      );

      /**
       * 실패한 메시지를 입력창에 다시 복구합니다.
       */
      setInput(text);

      setError(
        requestError
          instanceof Error
          ? requestError
              .message
          : "AI 응답을 받아오지 못했습니다.",
      );
    } finally {
      setLoading(false);
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

        display:
          "flex",

        flexDirection:
          "column",
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
            16,
        }}
      >
        🤖 AI 질의응답
      </h2>

      <Card
        style={{
          flex: 1,

          display:
            "flex",

          flexDirection:
            "column",

          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: 1,

            minHeight:
              220,

            maxHeight:
              "52vh",

            overflowY:
              "auto",

            display:
              "flex",

            flexDirection:
              "column",

            gap: 10,

            paddingRight:
              4,
          }}
        >
          {historyLoading && (
            <div
              style={{
                fontFamily:
                  ff,

                fontSize:
                  12,

                color:
                  "#9a7040",
              }}
            >
              기존 대화를 불러오는 중입니다.
            </div>
          )}

          {!historyLoading &&
            messages.length ===
              0 && (
              <div
                style={{
                  fontFamily:
                    ff,

                  fontSize:
                    12,

                  color:
                    "#9a7040",
                }}
              >
                한국사 개념이나 방금 푼 문제에 대해 자유롭게 물어보세요.
              </div>
            )}

          {messages.map(
            (
              message,
            ) => (
              <div
                key={
                  message.id
                }
                style={{
                  alignSelf:
                    message.sender ===
                    "USER"
                      ? "flex-end"
                      : "flex-start",

                  maxWidth:
                    "80%",
                }}
              >
                <div
                  style={{
                    fontFamily:
                      ff,

                    fontSize:
                      12,

                    lineHeight:
                      1.6,

                    padding:
                      "8px 12px",

                    whiteSpace:
                      "pre-wrap",

                    background:
                      message.sender ===
                      "USER"
                        ? "linear-gradient(135deg,#3a6030,#1e4018)"
                        : "#fdf4db",

                    color:
                      message.sender ===
                      "USER"
                        ? "#c0f0a0"
                        : "#2a1808",

                    border:
                      `1px solid ${
                        message.sender ===
                        "USER"
                          ? "#1a3010"
                          : "#c4a060"
                      }`,
                  }}
                >
                  {
                    message.content
                  }
                </div>
              </div>
            ),
          )}

          {loading && (
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
              AI가 답변을 작성 중…
            </div>
          )}

          <div
            ref={
              bottomRef
            }
          />
        </div>

        {error && (
          <div
            style={{
              fontFamily:
                ff,

              fontSize:
                11,

              color:
                "#c04040",

              marginTop:
                8,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display:
              "flex",

            gap: 8,

            marginTop:
              12,
          }}
        >
          <Input
            value={
              input
            }
            onChange={(
              event,
            ) =>
              setInput(
                event
                  .target
                  .value,
              )
            }
            onKeyDown={(
              event,
            ) => {
              /**
               * 한글 조합 중 Enter 입력이 두 번 처리되는 문제를 막습니다.
               */
              if (
                event.key ===
                  "Enter" &&
                !event
                  .nativeEvent
                  .isComposing
              ) {
                event.preventDefault();

                void handleSend();
              }
            }}
            placeholder="궁금한 점을 입력하세요"
            style={{
              flex: 1,
            }}
            disabled={
              loading ||
              historyLoading
            }
          />

          <Button
            variant="green"
            onClick={() =>
              void handleSend()
            }
            disabled={
              loading ||
              historyLoading ||
              !input.trim()
            }
          >
            보내기
          </Button>
        </div>
      </Card>
    </div>
  );
}