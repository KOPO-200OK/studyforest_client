import { api } from "./client";

export type AiChatSender =
  | "USER"
  | "AI";

/**
 * 채팅 세션 생성·제목 수정 응답
 */
export interface AiChatSessionResponse {
  aiChatSessionId: number;
  title: string;
}

/**
 * 채팅 세션 목록 응답
 */
export interface AiChatSessionSummaryResponse {
  aiChatSessionId: number;
  title: string;
  questionId?: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 저장된 채팅 메시지 응답
 *
 * 백엔드 ChatMessageResponse 필드:
 * - aiChatMessageId
 * - sender
 * - message
 * - createdAt
 */
export interface AiChatMessageResponse {
  aiChatMessageId: number;
  sender: AiChatSender;
  message: string;
  createdAt: string;
}

/**
 * AI 답변 응답
 */
export interface AiChatAnswerResponse {
  answer: string;
}

/**
 * 채팅 세션 생성 요청
 *
 * 일반 상담은 빈 객체를 전송합니다.
 * 특정 기출문제 상담은 questionId를 전송합니다.
 */
export interface CreateAiChatSessionRequest {
  questionId?: number;
}

export const aiChatApi = {
  /**
   * 새로운 AI 채팅 세션을 생성합니다.
   *
   * POST /api/v1/ai/chat-sessions
   */
  createSession(
    payload:
      CreateAiChatSessionRequest = {},
  ) {
    return api.post<
      AiChatSessionResponse
    >(
      "/ai/chat-sessions",
      payload,
    );
  },

  /**
   * 현재 사용자의 전체 채팅 세션을 조회합니다.
   *
   * GET /api/v1/ai/chat-sessions
   */
  listSessions() {
    return api.get<
      AiChatSessionSummaryResponse[]
    >(
      "/ai/chat-sessions",
    );
  },

  /**
   * 특정 채팅 세션의 저장된 메시지를 조회합니다.
   *
   * GET /api/v1/ai/chat-sessions/{sessionId}/messages
   */
  listMessages(
    chatSessionId: number,
  ) {
    return api.get<
      AiChatMessageResponse[]
    >(
      `/ai/chat-sessions/${chatSessionId}/messages`,
    );
  },

  /**
   * 사용자 메시지를 전송하고 AI 답변을 받습니다.
   *
   * POST /api/v1/ai/chat-sessions/{sessionId}/messages
   *
   * 백엔드에서 사용자 메시지와 AI 메시지를
   * AI_CHAT_MESSAGES 테이블에 모두 저장합니다.
   */
  sendMessage(
    chatSessionId: number,
    message: string,
  ) {
    return api.post<
      AiChatAnswerResponse
    >(
      `/ai/chat-sessions/${chatSessionId}/messages`,
      {
        message,
      },
    );
  },

  /**
   * 채팅 세션 제목을 수정합니다.
   *
   * PATCH /api/v1/ai/chat-sessions/{sessionId}
   */
  updateSessionTitle(
    chatSessionId: number,
    title: string,
  ) {
    return api.patch<
      AiChatSessionResponse
    >(
      `/ai/chat-sessions/${chatSessionId}`,
      {
        title,
      },
    );
  },

  /**
   * 채팅 세션과 해당 메시지를 삭제합니다.
   *
   * DELETE /api/v1/ai/chat-sessions/{sessionId}
   */
  deleteSession(
    chatSessionId: number,
  ) {
    return api.del<void>(
      `/ai/chat-sessions/${chatSessionId}`,
    );
  },
};