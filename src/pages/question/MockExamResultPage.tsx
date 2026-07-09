import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, Button } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import type { MockExamResponse } from "@/api/types";

export default function MockExamResultPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { mockExamId } = useParams();
  const state = location.state as { result?: MockExamResponse; totalCount?: number } | null;

  if (!state?.result) {
    return (
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
        <button onClick={() => nav("/question-bank/mock-exams")} style={{ background: "none", border: "none", color: "#c8a060", cursor: "pointer", fontFamily: ff, fontSize: 12, marginBottom: 16 }}>← 모의고사 시작하기</button>
        <Card style={{ maxWidth: 420 }}>
          <div style={{ fontFamily: ff, fontSize: 13, color: C.inkDark }}>
            결과 정보를 찾을 수 없어요. 새로고침했거나 직접 주소로 들어온 경우일 수 있어요.
          </div>
        </Card>
      </div>
    );
  }

  const { result, totalCount } = state;

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
      <button onClick={() => nav("/question-bank")} style={{ background: "none", border: "none", color: "#c8a060", cursor: "pointer", fontFamily: ff, fontSize: 12, marginBottom: 16 }}>← 문제은행 홈</button>
      <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 18, marginBottom: 16 }}>📝 {mockExamId}회차 결과</h2>

      <Card style={{ maxWidth: 420 }}>
        <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 22, color: C.inkDark, textAlign: "center", marginBottom: 8 }}>
          {result.correctCount ?? "-"} / {totalCount ?? "-"} 정답
        </div>
        {result.score !== undefined && (
          <div style={{ fontFamily: ff, fontSize: 14, color: C.inkMid, textAlign: "center", marginBottom: 16 }}>
            점수 {result.score}점
          </div>
        )}
        <Button variant="green" block onClick={() => nav("/question-bank/mock-exams")}>다시 응시하기</Button>
      </Card>
    </div>
  );
}
