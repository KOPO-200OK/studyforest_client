import { api } from "./client";
import type { Page } from "./types";

export interface AdminDashboardResponse {
  totalMemberCount: number;
  activeMemberCount: number;
  deletedMemberCount: number;
  histQuestionCount: number;
  histSolveRecordCount: number;
  mockExamCount: number;
  aiGeneratedQuestionSetCount: number;
  aiChatSessionCount: number;
}

export interface AdminMemberSummaryResponse {
  memberId: number;
  name: string;
  nickname: string;
  birthdate: string;
  email: string;

  userRole:
    | "USER"
    | "ADMIN"
    | string;

  characterId: number;
  isDeleted: boolean;
}

export interface AdminQuestionSummaryResponse {
  questionId: number;
  examRound: number;
  qNo: number;
  era?: string | null;
  category?: string | null;
  point: number;
  questionPreview: string;
  isDeleted: boolean;
}

export interface AdminQuestionChoiceResponse {
  choiceNo: number;
  choiceText?: string | null;
}

export interface AdminQuestionDetailResponse {
  questionId: number;
  examRound: number;
  qNo: number;
  questionText: string;
  passage?: string | null;
  point: number;
  era?: string | null;
  category?: string | null;
  choices: AdminQuestionChoiceResponse[];
  answer: number;
  isDeleted: boolean;
}

export interface AdminQuestionCreatePayload {
  examRound: number;
  qNo: number;
  questionText: string;
  passage?: string | null;
  point: number;

  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  choice5?: string | null;

  answer: number;
  era?: string | null;
  category?: string | null;
}

export interface AdminQuestionUpdatePayload {
  questionText: string;
  passage?: string | null;
  point: number;

  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  choice5?: string | null;

  answer: number;
  era?: string | null;
  category?: string | null;
  isDeleted: boolean;
}

export const adminApi = {
  getDashboard() {
    return api.get<AdminDashboardResponse>(
      "/admin/dashboard",
    );
  },

  listMembers(
    params: {
      page?: number;
      size?: number;
      keyword?: string;
      userRole?: string;
      isDeleted?: boolean;
    } = {},
  ) {
    return api.get<Page<AdminMemberSummaryResponse>>(
      "/admin/members",
      params,
    );
  },

  updateMemberRole(
    memberId: number,
    userRole: "USER" | "ADMIN",
  ) {
    return api.patch<AdminMemberSummaryResponse>(
      `/admin/members/${memberId}/role`,
      {
        userRole,
      },
    );
  },

  updateMemberDeleteStatus(
    memberId: number,
    isDeleted: boolean,
  ) {
    return api.patch<AdminMemberSummaryResponse>(
      `/admin/members/${memberId}/delete-status`,
      {
        isDeleted,
      },
    );
  },

  /**
   * 관리자 문제 목록 조회
   */
  listQuestions(
    params: {
      page?: number;
      size?: number;
      examRound?: number;
      era?: string;
      category?: string;
      keyword?: string;
      isDeleted?: boolean;
    } = {},
  ) {
    return api.get<Page<AdminQuestionSummaryResponse>>(
      "/admin/questions",
      params,
    );
  },

  /**
   * 관리자 문제 상세 조회
   */
  getQuestionDetail(
    questionId: number,
  ) {
    return api.get<AdminQuestionDetailResponse>(
      `/admin/questions/${questionId}`,
    );
  },

  /**
   * 관리자 문제 생성
   */
  createQuestion(
    payload: AdminQuestionCreatePayload,
  ) {
    return api.post<AdminQuestionDetailResponse>(
      "/admin/questions",
      payload,
    );
  },

  /**
   * 관리자 문제 수정
   */
  updateQuestion(
    questionId: number,
    payload: AdminQuestionUpdatePayload,
  ) {
    return api.put<AdminQuestionDetailResponse>(
      `/admin/questions/${questionId}`,
      payload,
    );
  },

  /**
   * 관리자 문제 삭제
   *
   * 백엔드에서는 IS_DELETED를 1로 변경합니다.
   */
  deleteQuestion(
    questionId: number,
  ) {
    return api.del<void>(
      `/admin/questions/${questionId}`,
    );
  },
};