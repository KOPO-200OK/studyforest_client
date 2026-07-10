import { DEFAULT_CHARACTER_ID } from "@/data/characters";
import { api, tokenStore } from "./client";

const CURRENT_EMAIL_KEY = "gongsoop_current_email";
const CURRENT_MEMBER_KEY = "gongsoop_current_member";
const PROFILE_KEY = "gongsoop_local_profiles";

export interface MockAccount {
  memberId?: number;
  email: string;
  password?: string;
  name: string;
  birthDate: string;
  nickname?: string;
  characterId?: number;
  userRole?: "USER" | "ADMIN" | string;
  isAdmin?: boolean;
}

interface MemberResponse {
  memberId: number;
  name: string;
  birthdate: string;
  email: string;
  userRole: "USER" | "ADMIN" | string;
  characterId: number;
}

interface LoginResponse {
  tokenType: string;
  accessToken: string;
  member: MemberResponse;
}

interface LocalProfile {
  nickname?: string;
  characterId?: number;
}

type LocalProfiles = Record<string, LocalProfile>;

function loadProfiles(): LocalProfiles {
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? (JSON.parse(raw) as LocalProfiles) : {};
}

function saveProfiles(profiles: LocalProfiles) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
}

function saveCurrentMember(member: MemberResponse) {
  localStorage.setItem(CURRENT_EMAIL_KEY, member.email);
  localStorage.setItem(CURRENT_MEMBER_KEY, JSON.stringify(member));
}

function loadCurrentMember(): MemberResponse | null {
  const raw = localStorage.getItem(CURRENT_MEMBER_KEY);
  return raw ? (JSON.parse(raw) as MemberResponse) : null;
}

function toAccount(member: MemberResponse, profile?: LocalProfile): MockAccount {
  return {
    memberId: member.memberId,
    email: member.email,
    name: member.name,
    birthDate: member.birthdate,
    userRole: member.userRole,
    isAdmin: member.userRole === "ADMIN",
    nickname: profile?.nickname ?? member.name,
    characterId: member.characterId ?? profile?.characterId ?? DEFAULT_CHARACTER_ID,
  };
}

export const mockAuthApi = {
  async login(email: string, password: string): Promise<void> {
    const response = await api.post<LoginResponse>("/auth/login", { email, password });
    tokenStore.set(response.accessToken);
    try {
      const pendingCharacterId = loadProfiles()[response.member.email]?.characterId;
      if (pendingCharacterId && pendingCharacterId !== response.member.characterId) {
        const updated = await api.patch<{ characterId: number }>("/members/me/character", {
          characterId: pendingCharacterId,
        });
        response.member.characterId = updated.characterId;
      }
      saveCurrentMember(response.member);
    } catch (error) {
      tokenStore.clear();
      throw error;
    }
  },

  async signup(email: string, password: string, name: string, birthDate: string): Promise<void> {
    await api.post<void>("/auth/signup", {
      email,
      password,
      name,
      birthdate: birthDate,
    });
  },

  async setProfile(email: string, profile: { nickname: string; characterId: number }): Promise<void> {
    const profiles = loadProfiles();
    profiles[email] = profile;
    saveProfiles(profiles);
  },

  async setCharacter(email: string, characterId: number): Promise<void> {
    const updated = await api.patch<{ characterId: number }>("/members/me/character", { characterId });
    const profiles = loadProfiles();
    profiles[email] = { ...(profiles[email] ?? {}), characterId: updated.characterId };
    saveProfiles(profiles);
    const member = loadCurrentMember();
    if (member?.email === email) {
      member.characterId = updated.characterId;
      saveCurrentMember(member);
    }
  },

  getCurrentEmail(): string | null {
    return localStorage.getItem(CURRENT_EMAIL_KEY);
  },

  logout(): void {
    tokenStore.clear();
    localStorage.removeItem(CURRENT_EMAIL_KEY);
    localStorage.removeItem(CURRENT_MEMBER_KEY);
  },

  async withdraw(): Promise<void> {
    await api.del<void>("/members/me");
    mockAuthApi.logout();
  },

  getCurrentAccount(): MockAccount | null {
    const member = loadCurrentMember();
    if (!member) return null;
    const profile = loadProfiles()[member.email];
    return toAccount(member, profile);
  },

  isCurrentUserAdmin(): boolean {
    return mockAuthApi.getCurrentAccount()?.isAdmin === true;
  },

  listAccounts(): Omit<MockAccount, "password">[] {
    const current = mockAuthApi.getCurrentAccount();
    return current ? [current] : [];
  },

  async deleteAccount(_email: string): Promise<void> {
    throw new Error("회원 삭제는 관리자 회원 관리 API에서 처리해야 합니다");
  },

  async findEmail(name: string, birthDate: string): Promise<string[]> {
    const email = await api.post<string>("/auth/find-email", { name, birthdate: birthDate });
    return [email];
  },

  async resetPassword(email: string, name: string, birthDate: string, newPassword: string): Promise<void> {
    await api.post<void>("/auth/reset-password", {
      email,
      name,
      birthdate: birthDate,
      newPassword,
    });
  },

  async findPassword(_email: string, _name: string, _birthDate: string): Promise<string> {
    throw new Error("현재 백엔드는 비밀번호 조회를 지원하지 않습니다. 비밀번호 재설정 API로 화면 로직을 바꿔야 합니다");
  },
};
