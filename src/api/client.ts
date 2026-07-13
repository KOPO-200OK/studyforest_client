// ============================================================
// StudyForest 공통 API 클라이언트
//
// 기능:
// - 백엔드 ApiResponse의 data 자동 추출
// - Access Token 자동 첨부
// - 401 발생 시 Refresh Token으로 자동 재발급
// - 재발급 후 기존 API 요청 1회 재시도
// - 동시에 여러 401이 발생해도 재발급 요청은 1회만 실행
// - 인증 만료 시 저장된 로그인 상태 삭제 후 로그인 화면 이동
// ============================================================

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "/api/v1";

const ACCESS_TOKEN_KEY =
  "gongsoop_access_token";

const REFRESH_TOKEN_KEY =
  "gongsoop_refresh_token";

const CURRENT_EMAIL_KEY =
  "gongsoop_current_email";

const CURRENT_MEMBER_KEY =
  "gongsoop_current_member";

export const AUTH_EXPIRED_EVENT =
  "gongsoop:auth-expired";

type QueryValue =
  | string
  | number
  | boolean
  | undefined;

interface RequestOptions {
  body?: unknown;

  params?: Record<
    string,
    QueryValue
  >;
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  code?: string;
  message?: string;
}

interface JwtPayload {
  exp?: number;
  type?: string;
}

/**
 * Access Token과 Refresh Token 저장소입니다.
 *
 * 기존 WebSocket 코드가 tokenStore.get()을 사용하므로
 * get/set 호환 메서드를 유지합니다.
 */
export const tokenStore = {
  getAccess():
    string | null {
    return localStorage.getItem(
      ACCESS_TOKEN_KEY,
    );
  },

  setAccess(
    accessToken: string,
  ): void {
    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      accessToken,
    );
  },

  getRefresh():
    string | null {
    return localStorage.getItem(
      REFRESH_TOKEN_KEY,
    );
  },

  setRefresh(
    refreshToken: string,
  ): void {
    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken,
    );
  },

  setTokens(
    accessToken: string,
    refreshToken: string,
  ): void {
    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      accessToken,
    );

    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken,
    );
  },

  clear(): void {
    localStorage.removeItem(
      ACCESS_TOKEN_KEY,
    );

    localStorage.removeItem(
      REFRESH_TOKEN_KEY,
    );
  },

  /**
   * 기존 좌석·음성 WebSocket 코드 호환용입니다.
   */
  get():
    string | null {
    return tokenStore.getAccess();
  },

  set(
    accessToken: string,
  ): void {
    tokenStore.setAccess(
      accessToken,
    );
  },
};

/**
 * 토큰뿐 아니라 현재 로그인 회원 정보도 삭제합니다.
 */
export function clearAuthSession(): void {
  tokenStore.clear();

  localStorage.removeItem(
    CURRENT_EMAIL_KEY,
  );

  localStorage.removeItem(
    CURRENT_MEMBER_KEY,
  );
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(
    status: number,
    code: string,
    message: string,
  ) {
    super(message);

    this.name =
      "ApiError";

    this.status =
      status;

    this.code =
      code;
  }
}

/**
 * JWT payload를 디코딩합니다.
 *
 * 서명 검증은 서버가 담당하며,
 * 프론트에서는 만료 시각 확인에만 사용합니다.
 */
function decodeJwtPayload(
  token: string,
): JwtPayload | null {
  try {
    const parts =
      token.split(".");

    if (
      parts.length !== 3
    ) {
      return null;
    }

    const base64Url =
      parts[1];

    const base64 =
      base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(
          Math.ceil(
            base64Url.length / 4,
          ) * 4,
          "=",
        );

    const json =
      window.atob(
        base64,
      );

    return JSON.parse(
      json,
    ) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Access Token이 곧 만료되는지 확인합니다.
 *
 * 만료 30초 전부터 재발급 대상으로 판단합니다.
 */
function isAccessTokenExpiring(
  token: string,
): boolean {
  const payload =
    decodeJwtPayload(
      token,
    );

  if (!payload?.exp) {
    return false;
  }

  const expirationMs =
    payload.exp * 1000;

  return (
    expirationMs -
      Date.now() <=
    30_000
  );
}

/**
 * 응답 본문을 안전하게 ApiResponse 형식으로 읽습니다.
 */
async function readEnvelope<T>(
  response: Response,
): Promise<ApiEnvelope<T>> {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(
      text,
    ) as ApiEnvelope<T>;
  } catch {
    return {
      success:
        response.ok,

      message:
        text,
    };
  }
}

/**
 * 쿼리 파라미터가 포함된 URL을 생성합니다.
 */
function createUrl(
  path: string,
  params?: Record<
    string,
    QueryValue
  >,
): URL {
  const url =
    new URL(
      BASE_URL + path,
      window.location.origin,
    );

  if (params) {
    for (
      const [
        key,
        value,
      ] of Object.entries(
        params,
      )
    ) {
      if (
        value !==
        undefined
      ) {
        url.searchParams.set(
          key,
          String(value),
        );
      }
    }
  }

  return url;
}

/**
 * 실제 HTTP 요청을 한 번 수행합니다.
 */
async function executeRequest<T>(
  method: string,
  path: string,
  options: RequestOptions,
): Promise<{
  response: Response;
  envelope: ApiEnvelope<T>;
}> {
  const url =
    createUrl(
      path,
      options.params,
    );

  const headers:
    Record<string, string> = {
      "Content-Type":
        "application/json",
  };

  const accessToken =
    tokenStore.getAccess();

  if (accessToken) {
    headers.Authorization =
      `Bearer ${accessToken}`;
  }

  const response =
    await fetch(
      url.toString(),
      {
        method,
        headers,

        body:
          options.body !==
          undefined
            ? JSON.stringify(
                options.body,
              )
            : undefined,
      },
    );

  if (
    response.status ===
    204
  ) {
    return {
      response,

      envelope: {
        success: true,

        data:
          undefined as T,
      },
    };
  }

  const envelope =
    await readEnvelope<T>(
      response,
    );

  return {
    response,
    envelope,
  };
}

/**
 * 로그인·회원가입 등의 공개 인증 API는
 * 기존 Refresh Token으로 재시도하지 않습니다.
 */
function canAttemptRefresh(
  path: string,
): boolean {
  const excludedPaths = [
    "/auth/login",
    "/auth/signup",
    "/auth/find-email",
    "/auth/reset-password",
    "/auth/refresh",
  ];

  return !excludedPaths.some(
    (excludedPath) =>
      path.startsWith(
        excludedPath,
      ),
  );
}

let refreshRequest:
  Promise<string> | null =
  null;

/**
 * Refresh Token을 사용해 새로운 Access Token을 발급받습니다.
 *
 * 여러 요청이 동시에 호출해도 실제 서버 요청은 한 번만 실행됩니다.
 */
export async function refreshAccessToken():
  Promise<string> {
  if (refreshRequest) {
    return refreshRequest;
  }

  const refreshToken =
    tokenStore.getRefresh();

  if (!refreshToken) {
    throw new ApiError(
      401,
      "REFRESH_TOKEN_NOT_FOUND",
      "로그인 세션이 만료되었습니다.",
    );
  }

  refreshRequest =
    (async () => {
      const url =
        createUrl(
          "/auth/refresh",
        );

      const response =
        await fetch(
          url.toString(),
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                refreshToken,
              }),
          },
        );

      const envelope =
        await readEnvelope<string>(
          response,
        );

      if (
        !response.ok ||
        envelope.success ===
          false ||
        !envelope.data
      ) {
        throw new ApiError(
          response.status,
          envelope.code ??
            "REFRESH_FAILED",

          envelope.message ??
            "로그인 세션을 갱신하지 못했습니다.",
        );
      }

      tokenStore.setAccess(
        envelope.data,
      );

      return envelope.data;
    })().finally(() => {
      refreshRequest =
        null;
    });

  return refreshRequest;
}

let redirectingToLogin =
  false;

/**
 * Refresh Token까지 만료되었을 때 로그인 상태를 정리합니다.
 */
function handleAuthExpired(): void {
  clearAuthSession();

  window.dispatchEvent(
    new CustomEvent(
      AUTH_EXPIRED_EVENT,
    ),
  );

  if (
    redirectingToLogin ||
    window.location.pathname ===
      "/login"
  ) {
    return;
  }

  redirectingToLogin =
    true;

  window.location.replace(
    "/login",
  );
}

/**
 * WebSocket 연결 전에 사용할 유효한 Access Token을 반환합니다.
 *
 * 토큰이 30초 이내에 만료될 예정이면 미리 재발급합니다.
 */
export async function ensureAccessToken():
  Promise<string | null> {
  const accessToken =
    tokenStore.getAccess();

  if (
    accessToken &&
    !isAccessTokenExpiring(
      accessToken,
    )
  ) {
    return accessToken;
  }

  if (
    !tokenStore.getRefresh()
  ) {
    return accessToken;
  }

  try {
    return await refreshAccessToken();
  } catch {
    handleAuthExpired();

    return null;
  }
}

/**
 * API 요청을 실행합니다.
 *
 * 401 발생 시 Refresh Token으로 Access Token을 갱신하고,
 * 원래 요청을 정확히 한 번 다시 실행합니다.
 */
async function request<T>(
  method: string,
  path: string,
  options:
    RequestOptions = {},
  allowRefresh = true,
): Promise<T> {
  const {
    response,
    envelope,
  } =
    await executeRequest<T>(
      method,
      path,
      options,
    );

  if (
    response.status === 401 &&
    allowRefresh &&
    canAttemptRefresh(path) &&
    tokenStore.getRefresh()
  ) {
    try {
      await refreshAccessToken();

      return await request<T>(
        method,
        path,
        options,
        false,
      );
    } catch {
      handleAuthExpired();

      throw new ApiError(
        401,
        "SESSION_EXPIRED",
        "로그인 세션이 만료되었습니다.",
      );
    }
  }

  if (
    !response.ok ||
    envelope.success ===
      false
  ) {
    /**
     * 재발급 후 재시도했는데도 401이면
     * 로그인 상태를 완전히 정리합니다.
     */
    if (
      response.status ===
        401 &&
      canAttemptRefresh(path)
    ) {
      handleAuthExpired();
    }

    throw new ApiError(
      response.status,

      envelope.code ??
        "UNKNOWN_ERROR",

      envelope.message ??
        `요청 실패 (${response.status})`,
    );
  }

  return envelope.data as T;
}

export const api = {
  get<T>(
    path: string,
    params?: Record<
      string,
      QueryValue
    >,
  ) {
    return request<T>(
      "GET",
      path,
      {
        params,
      },
    );
  },

  post<T>(
    path: string,
    body?: unknown,
  ) {
    return request<T>(
      "POST",
      path,
      {
        body,
      },
    );
  },

  put<T>(
    path: string,
    body?: unknown,
  ) {
    return request<T>(
      "PUT",
      path,
      {
        body,
      },
    );
  },

  patch<T>(
    path: string,
    body?: unknown,
  ) {
    return request<T>(
      "PATCH",
      path,
      {
        body,
      },
    );
  },

  del<T>(
    path: string,
  ) {
    return request<T>(
      "DELETE",
      path,
    );
  },
};