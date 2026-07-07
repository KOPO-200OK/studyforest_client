import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Input } from "@/components/ui";
import { C, ff, fs } from "@/styles/tokens";
import { mockAuthApi } from "@/api/mockAuthApi";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const justSignedUp = Boolean((location.state as { justSignedUp?: boolean } | null)?.justSignedUp);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await mockAuthApi.login(email, password);
      navigate("/study-room", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.pageBg, fontFamily: ff }}>
      <Card style={{ width: 320, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <span style={{ fontSize: 32, lineHeight: 1 }}>🌲</span>
          <span style={{ fontFamily: fs, fontWeight: 700, fontSize: 20, color: C.inkDark }}>공숲</span>
          <span style={{ fontSize: 11, color: C.inkMid }}>로그인하고 한국사 공부를 시작해보세요</span>
        </div>

        {justSignedUp && (
          <div style={{ fontSize: 11, color: "#245020", background: "rgba(58,96,48,0.14)", border: "1px solid #245020", padding: "6px 8px" }}>
            회원가입이 완료되었습니다. 로그인해주세요.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>이메일</span>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              autoComplete="email"
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
              autoComplete="current-password"
              style={{ width: "100%" }}
            />
          </label>

          {error && (
            <div style={{ fontSize: 11, color: C.redB, background: "rgba(192,64,64,0.12)", border: `1px solid ${C.redB}`, padding: "6px 8px" }}>
              {error}
            </div>
          )}

          <Button type="submit" variant="green" block disabled={loading} style={{ marginTop: 6 }}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <div style={{ textAlign: "center", fontSize: 11, color: C.inkMid }}>
          계정이 없으신가요?{" "}
          <Link to="/signup" style={{ color: C.active, fontWeight: 700, textDecoration: "none" }}>
            회원가입
          </Link>
        </div>

        <div style={{ textAlign: "center", fontSize: 11, color: C.inkMid, display: "flex", justifyContent: "center", gap: 10 }}>
          <Link to="/find-id" style={{ color: C.inkMid, textDecoration: "none" }}>아이디 찾기</Link>
          <span>·</span>
          <Link to="/find-password" style={{ color: C.inkMid, textDecoration: "none" }}>비밀번호 찾기</Link>
        </div>
      </Card>
    </div>
  );
}
