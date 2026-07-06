// ============================================================
// API 클라이언트 (fetch 래퍼) — 백엔드 공통 설계 규칙 준수
// - 공통 응답: { success, data, message } → data 언래핑해서 반환
// - 오류 응답: { success:false, code, message } → ApiError(code)
// - 인증: JWT Bearer (Spring Security)
// - baseURL: VITE_API_BASE_URL (기본 /api/v1)
// ============================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";
const TOKEN_KEY = "gongsoop_access_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** 백엔드 공통 오류 응답의 code(대문자 SNAKE_CASE)를 담는 에러 */
export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  code?: string;    // 오류 시
  message?: string;
}

async function request<T>(
  method: string,
  path: string,
  options: { body?: unknown; params?: Record<string, string | number | boolean | undefined> } = {},
): Promise<T> {
  const url = new URL(BASE_URL + path, window.location.origin);
  if (options.params) {
    for (const [k, v] of Object.entries(options.params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = tokenStore.get();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // 204 No Content (삭제 성공 등)
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const envelope = (text ? JSON.parse(text) : {}) as ApiEnvelope<T>;

  if (!res.ok || envelope.success === false) {
    // 401이면 토큰 폐기 (만료·무효)
    if (res.status === 401) tokenStore.clear();
    throw new ApiError(
      res.status,
      envelope.code ?? "UNKNOWN_ERROR",
      envelope.message ?? `요청 실패 (${res.status})`,
    );
  }
  return envelope.data as T;
}

export const api = {
  get:   <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
           request<T>("GET", path, { params }),
  post:  <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  put:   <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, { body }),
  del:   <T>(path: string) => request<T>("DELETE", path),
};
