import { useNavigate } from "react-router-dom";
import { Card, Button } from "@/components/ui";
import { fs, ff } from "@/styles/tokens";

/** 🎲 랜덤 문제 — ERD 화면설계서 기준 스텁. TODO: 실제 구현 */
export default function RandomQuestionPage() {
  const nav = useNavigate();
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
      <button onClick={() => nav("/question-bank")} style={{ background: "none", border: "none", color: "#c8a060", cursor: "pointer", fontFamily: ff, fontSize: 12, marginBottom: 16 }}>← 문제은행 홈</button>
      <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 18, marginBottom: 16 }}>🎲 랜덤 문제</h2>
      <Card>
        <div style={{ fontFamily: ff, fontSize: 13, color: "#5a3010", lineHeight: 1.8 }}>
          문제 수·난이도·시험 등급·출제 범위를 골라 무작위로 출제합니다.
          <div style={{ marginTop: 12, color: "#9a7040", fontSize: 11 }}>🚧 구현 예정 (ERD 화면설계서 참고)</div>
        </div>
        <div style={{ marginTop: 16 }}><Button variant="green" onClick={() => nav("/question-bank/solve")}>문제 풀이 화면으로</Button></div>
      </Card>
    </div>
  );
}
