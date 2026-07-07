import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Input } from "@/components/ui";
import { C, ff, fs } from "@/styles/tokens";
import { mockAuthApi } from "@/api/mockAuthApi";

export default function FindPasswordPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !name || !birthDate) {
      setError("모든 항목을 입력해주세요");
      return;
    }
    setLoading(true);
    setError(null);
    setPassword(null);
    try {
      const found = await mockAuthApi.findPassword(email, name, birthDate);
      setPassword(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : "비밀번호를 찾을 수 없습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.pageBg, fontFamily: ff }}>
      <Card style={{ width: 320, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <span style={{ fontSize: 32, lineHeight: 1 }}>🔑</span>
          <span style={{ fontFamily: fs, fontWeight: 700, fontSize: 20, color: C.inkDark }}>비밀번호 찾기</span>
          <span style={{ fontSize: 11, color: C.inkMid }}>이메일·이름·생년월일로 비밀번호를 찾아드려요</span>
        </div>

        {password ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>비밀번호</div>
            <div style={{ fontSize: 13, color: C.inkDark, background: "rgba(58,96,48,0.14)", border: "1px solid #245020", padding: "8px 10px" }}>
              {password}
            </div>
            <Link to="/login" style={{ textAlign: "center", fontSize: 12, color: C.active, fontWeight: 700, textDecoration: "none", marginTop: 6 }}>
              로그인하러 가기 →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>이메일</span>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일을 입력하세요" style={{ width: "100%" }} />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>이름</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력하세요" style={{ width: "100%" }} />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>생년월일</span>
              <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} min="1900-01-01" max="2099-12-31" style={{ width: "100%" }} />
            </label>

            {error && (
              <div style={{ fontSize: 11, color: C.redB, background: "rgba(192,64,64,0.12)", border: `1px solid ${C.redB}`, padding: "6px 8px" }}>
                {error}
              </div>
            )}

            <Button type="submit" variant="green" block disabled={loading} style={{ marginTop: 6 }}>
              {loading ? "찾는 중..." : "비밀번호 찾기"}
            </Button>
          </form>
        )}

        <div style={{ textAlign: "center", fontSize: 11, color: C.inkMid, display: "flex", justifyContent: "center", gap: 10 }}>
          <Link to="/login" style={{ color: C.active, fontWeight: 700, textDecoration: "none" }}>로그인</Link>
          <span>·</span>
          <Link to="/find-id" style={{ color: C.active, fontWeight: 700, textDecoration: "none" }}>아이디 찾기</Link>
        </div>
      </Card>
    </div>
  );
}
