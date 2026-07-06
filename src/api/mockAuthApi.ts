// ============================================================
// 프론트 목업 인증 — 백엔드(Spring, /auth/login 등) 준비 전까지 임시 사용.
// localStorage에 계정을 저장해 회원가입/로그인 흐름만 재현한다.
// 백엔드가 준비되면 이 파일을 지우고 client.ts의 api.post("/auth/...")로 교체.
// ============================================================

import { tokenStore } from "./client";

const ACCOUNTS_KEY = "gongsoop_mock_accounts";

interface MockAccount {
  username: string;
  password: string;
}

function loadAccounts(): MockAccount[] {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (raw) return JSON.parse(raw) as MockAccount[];
  const seed: MockAccount[] = [{ username: "admin", password: "1234" }];
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(seed));
  return seed;
}

function saveAccounts(accounts: MockAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export const mockAuthApi = {
  async login(username: string, password: string): Promise<void> {
    const accounts = loadAccounts();
    const found = accounts.some((a) => a.username === username && a.password === password);
    if (!found) throw new Error("아이디 또는 비밀번호가 올바르지 않습니다");
    tokenStore.set(`mock-token.${username}`);
  },

  async signup(username: string, password: string): Promise<void> {
    const accounts = loadAccounts();
    if (accounts.some((a) => a.username === username)) {
      throw new Error("이미 사용 중인 아이디입니다");
    }
    accounts.push({ username, password });
    saveAccounts(accounts);
  },
};
