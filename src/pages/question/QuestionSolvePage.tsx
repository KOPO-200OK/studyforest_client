import { useNavigate } from "react-router-dom";
import { Card, Button } from "@/components/ui";
import { fs, ff } from "@/styles/tokens";

/** ✍️ 문제 풀이 — 시대별/랜덤/모의고사 각 화면에서 실제 풀이가 이뤄진다. 이 화면은 안내용 허브. */
export default function QuestionSolvePage() {
  const nav = useNavigate();
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
      <button onClick={() => nav("/question-bank")} style={{ background: "none", border: "none", color: "#c8a060", cursor: "pointer", fontFamily: ff, fontSize: 12, marginBottom: 16 }}>← 문제은행 홈</button>
      <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 18, marginBottom: 16 }}>✍️ 문제 풀이</h2>
      <Card style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
        <div style={{ fontFamily: ff, fontSize: 13, color: "#5a3010", lineHeight: 1.8 }}>
          시대별 문제, 랜덤 문제, 모의고사 중 하나를 골라 풀어보세요.
        </div>
        <Button variant="green" onClick={() => nav("/question-bank/periods")}>🏛️ 시대별 문제</Button>
        <Button variant="green" onClick={() => nav("/question-bank/random")}>🎲 랜덤 문제</Button>
        <Button variant="green" onClick={() => nav("/question-bank/mock-exams")}>📝 모의고사</Button>
      </Card>
    </div>
  );
}
