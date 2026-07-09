import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import { createMockExam } from "@/api/questionApi";
import type { ExamLevel } from "@/api/types";

const EXAM_LEVEL_OPTIONS: { value: ExamLevel; label: string; totalCount: number }[] = [
  { value: "BASIC", label: "기본", totalCount: 20 },
  { value: "ADVANCED", label: "심화", totalCount: 50 },
];

export default function MockExamStartPage() {
  const nav = useNavigate();
  const [examLevel, setExamLevel] = useState<ExamLevel>("BASIC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const level = EXAM_LEVEL_OPTIONS.find((l) => l.value === examLevel)!;
      const exam = await createMockExam({ examLevel, totalCount: level.totalCount });
      nav(`/question-bank/mock-exams/${exam.mockExamId}`, { state: { exam } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "모의고사를 시작하지 못했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
      <button onClick={() => nav("/question-bank")} style={{ background: "none", border: "none", color: "#c8a060", cursor: "pointer", fontFamily: ff, fontSize: 12, marginBottom: 16 }}>← 문제은행 홈</button>
      <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 18, marginBottom: 6 }}>📝 모의고사</h2>
      <p style={{ fontFamily: ff, color: "#9aaa80", fontSize: 12, marginBottom: 20 }}>급수를 고르면 새 회차가 시작돼요.</p>

      <Card style={{ maxWidth: 360 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>급수</span>
          <select
            value={examLevel}
            onChange={(e) => setExamLevel(e.target.value as ExamLevel)}
            style={{ fontSize: 12, padding: "8px 12px", background: C.inputBg, border: `1px solid ${C.inputBr}`, outline: "none", color: C.inkDark, fontFamily: ff, width: "100%" }}
          >
            {EXAM_LEVEL_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label} ({l.totalCount}문제)</option>)}
          </select>
        </label>

        {error && (
          <div style={{ fontSize: 11, color: C.redB, background: "rgba(192,64,64,0.12)", border: `1px solid ${C.redB}`, padding: "6px 8px", marginBottom: 12 }}>
            {error}
          </div>
        )}

        <Button variant="green" block disabled={loading} onClick={() => void handleStart()}>
          {loading ? "시작하는 중..." : "모의고사 시작하기"}
        </Button>
      </Card>
    </div>
  );
}
