import {
  DEFAULT_CHARACTER_ID,
} from "@/data/characters";

import {
  api,
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
  refreshToken?: string;
  member: MemberResponse;
}

function saveCurrentMember(
  member: MemberResponse,
) {
  localStorage.setItem(
    CURRENT_EMAIL_KEY,
    member.email,
  );

  localStorage.setItem(
    CURRENT_MEMBER_KEY,
    JSON.stringify(member),
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

    /**
     * 기존 localStorage 데이터에 nickname이 없으면
     * 실명으로 임시 대체합니다.
     */
    nickname:
      parsed.nickname?.trim() ||
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

    userRole:
      member.userRole,

    isAdmin:
      member.userRole ===
      "ADMIN",

    nickname:
      member.nickname?.trim() ||
      member.name,

    characterId:
      member.characterId ??
      DEFAULT_CHARACTER_ID,
  };
}

export const mockAuthApi = {
  async login(
    email: string,
    password: string,
  ): Promise<void> {
    const response =
      await api.post<LoginResponse>(
        "/auth/login",
        {
          email,
          password,
        },
      );

    tokenStore.set(
      response.accessToken,
    );

    saveCurrentMember(
      response.member,
    );
  },

  /**
   * 캐릭터와 닉네임 선택이 끝난 다음 호출합니다.
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
        email,
        password,
        name,
        nickname,
        birthdate:
          birthDate,
        characterId,
      },
    );
  },

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
            profile.nickname,

          characterId:
            profile.characterId,
        },
      );

    saveCurrentMember(
      updated,
    );
  },

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

  logout(): void {
    tokenStore.clear();

    localStorage.removeItem(
      CURRENT_EMAIL_KEY,
    );

    localStorage.removeItem(
      CURRENT_MEMBER_KEY,
    );
  },

  async withdraw():
    Promise<void> {
    await api.del<void>(
      "/members/me",
    );

    mockAuthApi.logout();
  },

  getCurrentAccount():
    MockAccount | null {
    const member =
      loadCurrentMember();

    return member
      ? toAccount(member)
      : null;
  },

  isCurrentUserAdmin():
    boolean {
    return (
      mockAuthApi
        .getCurrentAccount()
        ?.isAdmin === true
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
          name,
          birthdate:
            birthDate,
        },
      );

    return [email];
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
        email,
        name,
        birthdate:
          birthDate,
        newPassword,
      },
    );
  },
};