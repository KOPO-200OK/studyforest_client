import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Button,
  Card,
  Input,
} from "@/components/ui";

import {
  mockAuthApi,
} from "@/api/mockAuthApi";

import {
  C,
  ff,
  fs,
} from "@/styles/tokens";

import logoImg from "@/imports/rogo/rogo.png";

export interface PendingSignupData {
  email: string;
  password: string;
  name: string;
  birthDate: string;
}

interface PasswordRuleProps {
  matched: boolean;
  text: string;
}

function PasswordRule({
  matched,
  text,
}: PasswordRuleProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 10,

        color:
          matched
            ? "#2f6b2f"
            : C.inkMid,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 12,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        {matched
          ? "✓"
          : "·"}
      </span>

      <span>
        {text}
      </span>
    </div>
  );
}

function getLocalToday():
  string {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      now.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

export default function SignupPage() {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    name,
    setName,
  ] = useState("");

  const [
    birthDate,
    setBirthDate,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const passwordRules =
    useMemo(
      () => ({
        minimumLength:
          password.length >= 8,

        uppercase:
          /[A-Z]/.test(
            password,
          ),

        specialCharacter:
          /[^a-zA-Z0-9]/.test(
            password,
          ),
      }),
      [password],
    );

  const isPasswordValid =
    passwordRules.minimumLength
    && passwordRules.uppercase
    && passwordRules.specialCharacter;

  const maxBirthDate =
    getLocalToday();

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    const trimmedEmail =
      email.trim();

    const trimmedName =
      name.trim();

    if (
      !trimmedEmail
      || !password
      || !confirmPassword
      || !trimmedName
      || !birthDate
    ) {
      setError(
        "모든 항목을 입력해주세요",
      );

      return;
    }

    if (
      trimmedName.length > 100
    ) {
      setError(
        "이름은 100자 이하로 입력해주세요",
      );

      return;
    }

    if (
      birthDate >=
      maxBirthDate
    ) {
      setError(
        "유효하지 않은 생년월일입니다",
      );

      return;
    }

    if (
      !isPasswordValid
    ) {
      setError(
        "비밀번호는 8자 이상이며, 대문자와 특수문자를 각 1개 이상 포함해야 합니다",
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "비밀번호가 일치하지 않습니다",
      );

      return;
    }

    setLoading(true);
    setError(null);

    try {
      /*
       * 닉네임·캐릭터 화면으로 이동하기 전에
       * 서버에서 입력값과 이메일 중복을 확인합니다.
       */
      await mockAuthApi
        .validateSignup(
          trimmedEmail,
          password,
          trimmedName,
          birthDate,
        );

      const pendingSignup:
        PendingSignupData = {
          email:
            trimmedEmail,

          password,

          name:
            trimmedName,

          birthDate,
        };

      navigate(
        "/select-character",
        {
          state: {
            pendingSignup,
          },
        },
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "회원가입 정보를 확인하지 못했습니다",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: C.pageBg,
        fontFamily: ff,
        padding: "24px 16px",
      }}
    >
      <Card
        style={{
          width: 320,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            marginBottom: 4,
          }}
        >
          <img
            src={logoImg}
            alt="공숲"
            style={{
              width: 64,
              height: 64,
              objectFit: "contain",
            }}
          />

          <span
            style={{
              fontFamily: fs,
              fontWeight: 700,
              fontSize: 20,
              color: C.inkDark,
            }}
          >
            공숲
          </span>

          <span
            style={{
              fontSize: 11,
              color: C.inkMid,
            }}
          >
            회원가입하고 한국사 공부를 시작해보세요
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: C.inkMid,
                fontWeight: 700,
              }}
            >
              이메일
            </span>

            <Input
              type="email"
              value={email}
              onChange={(
                event,
              ) => {
                setEmail(
                  event.target.value,
                );

                setError(null);
              }}
              placeholder="이메일을 입력하세요"
              autoComplete="email"
              maxLength={320}
              required
              style={{
                width: "100%",
              }}
            />

            <span
              style={{
                fontSize: 10,
                color: C.inkMid,
                lineHeight: 1.4,
              }}
            >
              다음 단계로 이동하기 전에 이메일 중복 여부를 확인합니다.
            </span>
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: C.inkMid,
                fontWeight: 700,
              }}
            >
              이름
            </span>

            <Input
              value={name}
              onChange={(
                event,
              ) => {
                setName(
                  event.target.value,
                );

                setError(null);
              }}
              placeholder="이름을 입력하세요"
              autoComplete="name"
              maxLength={100}
              required
              style={{
                width: "100%",
              }}
            />
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: C.inkMid,
                fontWeight: 700,
              }}
            >
              생년월일
            </span>

            <Input
              type="date"
              value={birthDate}
              onChange={(
                event,
              ) => {
                setBirthDate(
                  event.target.value,
                );

                setError(null);
              }}
              autoComplete="bday"
              min="1900-01-01"
              max={maxBirthDate}
              required
              style={{
                width: "100%",
              }}
            />
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: C.inkMid,
                fontWeight: 700,
              }}
            >
              비밀번호
            </span>

            <Input
              type="password"
              value={password}
              onChange={(
                event,
              ) => {
                setPassword(
                  event.target.value,
                );

                setError(null);
              }}
              placeholder="비밀번호를 입력하세요"
              autoComplete="new-password"
              required
              style={{
                width: "100%",
              }}
            />

            <div
              aria-live="polite"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: "5px 7px",

                background:
                  "rgba(139,94,60,0.06)",

                border:
                  `1px solid ${C.inputBr}`,
              }}
            >
              <PasswordRule
                matched={
                  passwordRules.minimumLength
                }
                text="8자 이상"
              />

              <PasswordRule
                matched={
                  passwordRules.uppercase
                }
                text="영문 대문자 1개 이상"
              />

              <PasswordRule
                matched={
                  passwordRules.specialCharacter
                }
                text="특수문자 1개 이상"
              />
            </div>
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: C.inkMid,
                fontWeight: 700,
              }}
            >
              비밀번호 확인
            </span>

            <Input
              type="password"
              value={confirmPassword}
              onChange={(
                event,
              ) => {
                setConfirmPassword(
                  event.target.value,
                );

                setError(null);
              }}
              placeholder="비밀번호를 다시 입력하세요"
              autoComplete="new-password"
              required
              style={{
                width: "100%",
              }}
            />
          </label>

          {error && (
            <div
              style={{
                fontSize: 11,
                color: C.redB,

                background:
                  "rgba(192,64,64,0.12)",

                border:
                  `1px solid ${C.redB}`,

                padding: "6px 8px",
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="green"
            block
            disabled={loading}
            style={{
              marginTop: 6,
            }}
          >
            {loading
              ? "검증 중..."
              : "다음"}
          </Button>
        </form>

        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: C.inkMid,
          }}
        >
          이미 계정이 있으신가요?{" "}

          <Link
            to="/login"
            style={{
              color: C.active,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            로그인
          </Link>
        </div>
      </Card>
    </div>
  );
}