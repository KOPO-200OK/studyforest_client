import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Input } from "@/components/ui";
import { C, ff, fs } from "@/styles/tokens";
import logoImg from "@/imports/rogo/rogo.png";

export interface PendingSignupData {
  email: string;
  password: string;
  name: string;
  birthDate: string;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(
  event: FormEvent,
) {
  event.preventDefault();

  if (
    !email ||
    !password ||
    !confirmPassword ||
    !name ||
    !birthDate
  ) {
    setError(
      "모든 항목을 입력해주세요",
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

  setError(null);

  const pendingSignup:
    PendingSignupData = {
      email:
        email.trim(),

      password,

      name:
        name.trim(),

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
}

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.pageBg, fontFamily: ff }}>
      <Card style={{ width: 320, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <img src={logoImg} alt="공숲" style={{ width: 64, height: 64, objectFit: "contain" }} />
          <span style={{ fontFamily: fs, fontWeight: 700, fontSize: 20, color: C.inkDark }}>공숲</span>
          <span style={{ fontSize: 11, color: C.inkMid }}>회원가입하고 한국사 공부를 시작해보세요</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>이메일</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              autoComplete="email"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>이름</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              autoComplete="name"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>생년월일</span>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              autoComplete="bday"
              min="1900-01-01"
              max="2099-12-31"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>비밀번호</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete="new-password"
              style={{ width: "100%" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>비밀번호 확인</span>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              autoComplete="new-password"
              style={{ width: "100%" }}
            />
          </label>

          {error && (
            <div style={{ fontSize: 11, color: C.redB, background: "rgba(192,64,64,0.12)", border: `1px solid ${C.redB}`, padding: "6px 8px" }}>
              {error}
            </div>
          )}

          <Button type="submit" variant="green" block disabled={loading} style={{ marginTop: 6 }}>
            {loading ? "가입 중..." : "회원가입"}
          </Button>
        </form>

        <div style={{ textAlign: "center", fontSize: 11, color: C.inkMid }}>
          이미 계정이 있으신가요?{" "}
          <Link to="/login" style={{ color: C.active, fontWeight: 700, textDecoration: "none" }}>
            로그인
          </Link>
        </div>
      </Card>
    </div>
  );
}
