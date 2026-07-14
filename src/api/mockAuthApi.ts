import {
  DEFAULT_CHARACTER_ID,
} from "@/data/characters";

import {
  api,
  clearAuthSession,
  tokenStore,
} from "./client";

const CURRENT_EMAIL_KEY =
  "gongsoop_current_email";

const CURRENT_MEMBER_KEY =
  "gongsoop_current_member";

export interface MockAccount {
  memberId?: number;
  email: string;
  password?: string;
  name: string;
  birthDate: string;
  nickname?: string;
  characterId?: number;

  userRole?:
    | "USER"
    | "ADMIN"
    | string;

  isAdmin?: boolean;
}

interface MemberResponse {
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
}

interface LoginResponse {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  member: MemberResponse;
}

function saveCurrentMember(
  member: MemberResponse,
): void {
  localStorage.setItem(
    CURRENT_EMAIL_KEY,
    member.email,
  );

  localStorage.setItem(
    CURRENT_MEMBER_KEY,
    JSON.stringify(
      member,
    ),
  );
}

function loadCurrentMember():
  MemberResponse | null {
  const raw =
    localStorage.getItem(
      CURRENT_MEMBER_KEY,
    );

  if (!raw) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(
        raw,
      ) as Partial<MemberResponse>;

    if (
      !parsed.memberId ||
      !parsed.email ||
      !parsed.name ||
      !parsed.birthdate ||
      !parsed.userRole
    ) {
      return null;
    }

    return {
      memberId:
        parsed.memberId,

      name:
        parsed.name,

      nickname:
        parsed.nickname
          ?.trim() ||
        parsed.name,

      birthdate:
        parsed.birthdate,

      email:
        parsed.email,

      userRole:
        parsed.userRole,

      characterId:
        parsed.characterId ??
        DEFAULT_CHARACTER_ID,
    };
  } catch {
    return null;
  }
}

function toAccount(
  member: MemberResponse,
): MockAccount {
  return {
    memberId:
      member.memberId,

    email:
      member.email,

    name:
      member.name,

    birthDate:
      member.birthdate,

    nickname:
      member.nickname
        ?.trim() ||
      member.name,

    characterId:
      member.characterId ??
      DEFAULT_CHARACTER_ID,

    userRole:
      member.userRole,

    isAdmin:
      member.userRole ===
      "ADMIN",
  };
}

export const mockAuthApi = {
  /**
   * 로그인 후 Access Token과 Refresh Token을 모두 저장합니다.
   */
  async login(
    email: string,
    password: string,
  ): Promise<void> {
    const response =
      await api.post<LoginResponse>(
        "/auth/login",
        {
          email:
            email.trim(),

          password,
        },
      );

    tokenStore.setTokens(
      response.accessToken,
      response.refreshToken,
    );

    saveCurrentMember(
      response.member,
    );
  },

    /**
   * 회원가입 첫 번째 화면의 입력값을 서버에서 검증합니다.
   *
   * 이 단계에서는 회원을 저장하지 않습니다.
   * 이메일 중복과 기본 입력 형식만 검증합니다.
   */
  async validateSignup(
    email: string,
    password: string,
    name: string,
    birthDate: string,
  ): Promise<void> {
    await api.post<void>(
      "/auth/signup/validate",
      {
        email:
          email.trim(),

        password,

        name:
          name.trim(),

        birthdate:
          birthDate,
      },
    );
  },

  /**
   * 닉네임과 캐릭터를 포함한 회원가입입니다.
   */
  async signup(
    email: string,
    password: string,
    name: string,
    birthDate: string,
    nickname: string,
    characterId: number,
  ): Promise<void> {
    await api.post<void>(
      "/auth/signup",
      {
        email:
          email.trim(),

        password,

        name:
          name.trim(),

        nickname:
          nickname.trim(),

        birthdate:
          birthDate,

        characterId,
      },
    );
  },

  /**
   * 닉네임과 캐릭터를 함께 수정합니다.
   */
  async setProfile(
    email: string,
    profile: {
      nickname: string;
      characterId: number;
    },
  ): Promise<void> {
    const currentMember =
      loadCurrentMember();

    if (
      !currentMember ||
      currentMember.email !==
        email
    ) {
      throw new Error(
        "현재 로그인한 회원 정보를 찾을 수 없습니다.",
      );
    }

    const updated =
      await api.patch<MemberResponse>(
        "/members/me/profile",
        {
          nickname:
            profile.nickname
              .trim(),

          characterId:
            profile.characterId,
        },
      );

    saveCurrentMember(
      updated,
    );
  },

  /**
   * 캐릭터만 변경합니다.
   */
  async setCharacter(
    email: string,
    characterId: number,
  ): Promise<void> {
    const currentMember =
      loadCurrentMember();

    if (
      !currentMember ||
      currentMember.email !==
        email
    ) {
      throw new Error(
        "현재 로그인한 회원 정보를 찾을 수 없습니다.",
      );
    }

    const updated =
      await api.patch<{
        characterId: number;
      }>(
        "/members/me/character",
        {
          characterId,
        },
      );

    currentMember.characterId =
      updated.characterId;

    saveCurrentMember(
      currentMember,
    );
  },

  getCurrentEmail():
    string | null {
    return localStorage.getItem(
      CURRENT_EMAIL_KEY,
    );
  },

  /**
   * 서버 로그아웃을 호출합니다.
   *
   * 백엔드 처리:
   * - 현재 Access Token 블랙리스트 등록
   * - Redis Refresh Token 삭제
   *
   * 서버 요청 결과와 관계없이 프론트 로그인 상태는 정리합니다.
   */
  async logout():
    Promise<void> {
    try {
      if (
        tokenStore.getAccess() ||
        tokenStore.getRefresh()
      ) {
        await api.post<void>(
          "/auth/logout",
        );
      }
    } catch {
      /**
       * 서버가 중단되어 있더라도 사용자는 프론트에서 로그아웃할 수 있어야 합니다.
       */
    } finally {
      clearAuthSession();
    }
  },

  /**
   * 회원탈퇴 후 프론트 로그인 상태도 제거합니다.
   */
  async withdraw():
    Promise<void> {
    try {
      await api.del<void>(
        "/members/me",
      );
    } finally {
      clearAuthSession();
    }
  },

  getCurrentAccount():
    MockAccount | null {
    const member =
      loadCurrentMember();

    return member
      ? toAccount(
          member,
        )
      : null;
  },

  isCurrentUserAdmin():
    boolean {
    return (
      mockAuthApi
        .getCurrentAccount()
        ?.isAdmin ===
      true
    );
  },

  listAccounts(): Omit<
    MockAccount,
    "password"
  >[] {
    const current =
      mockAuthApi
        .getCurrentAccount();

    return current
      ? [current]
      : [];
  },

  async deleteAccount(
    _email: string,
  ): Promise<void> {
    throw new Error(
      "회원 삭제는 관리자 회원 관리 API에서 처리해야 합니다",
    );
  },

  async findEmail(
    name: string,
    birthDate: string,
  ): Promise<string[]> {
    const email =
      await api.post<string>(
        "/auth/find-email",
        {
          name:
            name.trim(),

          birthdate:
            birthDate,
        },
      );

    return [
      email,
    ];
  },

  async resetPassword(
    email: string,
    name: string,
    birthDate: string,
    newPassword: string,
  ): Promise<void> {
    await api.post<void>(
      "/auth/reset-password",
      {
        email:
          email.trim(),

        name:
          name.trim(),

        birthdate:
          birthDate,

        newPassword,
      },
    );
  },
};