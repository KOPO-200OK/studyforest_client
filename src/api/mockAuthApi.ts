// ============================================================
// 프론트 목업 인증 — 백엔드(Spring, /auth/login 등) 준비 전까지 임시 사용.
// localStorage에 계정을 저장해 회원가입/로그인/캐릭터 선택 흐름을 재현한다.
// 백엔드가 준비되면 이 파일을 지우고 client.ts의 api.post("/auth/...")로 교체.
// ============================================================

import { DEFAULT_CHARACTER_ID } from "@/data/characters";
import { tokenStore } from "./client";

const ACCOUNTS_KEY = "gongsoop_mock_accounts";
const CURRENT_EMAIL_KEY = "gongsoop_current_email";

export interface MockAccount {
  email: string;
  password: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  nickname?: string;
  characterId?: number;
  /** 관리자 페이지 접근 권한 — 회원가입으로는 부여되지 않음 */
  isAdmin?: boolean;
}

function loadAccounts(): MockAccount[] {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  const accounts: MockAccount[] = raw ? (JSON.parse(raw) as MockAccount[]) : [];

  // admin 계정은 항상 존재하고 관리자 권한을 갖도록 보정 (삭제됐거나, isAdmin 필드 도입 전에 만들어졌거나 둘 다 처리)
  const admin = accounts.find((a) => a.email === "admin");
  if (!admin) {
    accounts.push({ email: "admin", password: "1234", name: "관리자", birthDate: "2000-01-01", nickname: "관리자", characterId: DEFAULT_CHARACTER_ID, isAdmin: true });
    saveAccounts(accounts);
  } else if (!admin.isAdmin) {
    admin.isAdmin = true;
    saveAccounts(accounts);
  }
  return accounts;
}

function saveAccounts(accounts: MockAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(local.length - visible.length, 3))}@${domain}`;
}

export const mockAuthApi = {
  async login(email: string, password: string): Promise<void> {
    const accounts = loadAccounts();
    const found = accounts.some((a) => a.email === email && a.password === password);
    if (!found) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다");
    tokenStore.set(`mock-token.${email}`);
    localStorage.setItem(CURRENT_EMAIL_KEY, email);
  },

  async signup(email: string, password: string, name: string, birthDate: string): Promise<void> {
    const accounts = loadAccounts();
    if (accounts.some((a) => a.email === email)) {
      throw new Error("이미 사용 중인 이메일입니다");
    }
    accounts.push({ email, password, name, birthDate });
    saveAccounts(accounts);
  },

  /** 회원가입 직후 캐릭터 선택 화면에서 닉네임/캐릭터를 확정할 때 사용 */
  async setProfile(email: string, profile: { nickname: string; characterId: number }): Promise<void> {
    const accounts = loadAccounts();
    const account = accounts.find((a) => a.email === email);
    if (!account) throw new Error("계정을 찾을 수 없습니다");
    account.nickname = profile.nickname;
    account.characterId = profile.characterId;
    saveAccounts(accounts);
  },

  /** 스터디룸에서 캐릭터를 다시 고를 때 사용 (닉네임은 유지) */
  setCharacter(email: string, characterId: number): void {
    const accounts = loadAccounts();
    const account = accounts.find((a) => a.email === email);
    if (!account) return;
    account.characterId = characterId;
    saveAccounts(accounts);
  },

  getCurrentEmail(): string | null {
    return localStorage.getItem(CURRENT_EMAIL_KEY);
  },

  /** 로그아웃 — 토큰과 현재 계정 정보만 지움 (계정 자체는 유지) */
  logout(): void {
    tokenStore.clear();
    localStorage.removeItem(CURRENT_EMAIL_KEY);
  },

  /** 회원 탈퇴 — 현재 로그인된 계정을 삭제하고 로그아웃 처리 */
  withdraw(): void {
    const email = mockAuthApi.getCurrentEmail();
    if (email) {
      const accounts = loadAccounts().filter((a) => a.email !== email);
      saveAccounts(accounts);
    }
    mockAuthApi.logout();
  },

  getCurrentAccount(): MockAccount | null {
    const email = mockAuthApi.getCurrentEmail();
    if (!email) return null;
    return loadAccounts().find((a) => a.email === email) ?? null;
  },

  /** 현재 로그인한 계정이 관리자 페이지에 접근할 수 있는지 */
  isCurrentUserAdmin(): boolean {
    return mockAuthApi.getCurrentAccount()?.isAdmin === true;
  },

  /** 관리자 회원 관리 화면용 — 비밀번호는 빼고 반환 */
  listAccounts(): Omit<MockAccount, "password">[] {
    return loadAccounts().map(({ password: _password, ...rest }) => rest);
  },

  /** 관리자 회원 관리 화면에서 계정 삭제 */
  deleteAccount(email: string): void {
    const accounts = loadAccounts().filter((a) => a.email !== email);
    saveAccounts(accounts);
  },

  /** 아이디(이메일) 찾기 — 이름+생년월일 일치하는 계정의 마스킹된 이메일 목록 */
  async findEmail(name: string, birthDate: string): Promise<string[]> {
    const matches = loadAccounts().filter((a) => a.name === name && a.birthDate === birthDate);
    if (matches.length === 0) throw new Error("일치하는 계정을 찾을 수 없습니다");
    return matches.map((a) => maskEmail(a.email));
  },

  /** 비밀번호 찾기 — 이메일+이름+생년월일 모두 일치해야 비밀번호 반환 */
  async findPassword(email: string, name: string, birthDate: string): Promise<string> {
    const account = loadAccounts().find((a) => a.email === email && a.name === name && a.birthDate === birthDate);
    if (!account) throw new Error("일치하는 계정을 찾을 수 없습니다");
    return account.password;
  },
};
