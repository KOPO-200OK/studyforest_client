import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import { getQuestions, getQuestion, solveQuestion } from "@/api/questionApi";
import type { PeriodCode, QuestionDetailResponse, SolveResultResponse } from "@/api/types";
import { PERIOD_OPTIONS, selectStyle, QuestionSolveView, type ViewDensity } from "./solveShared";

const COUNT_OPTIONS = [5, 10, 15, 20, 30];

export default function PeriodQuestionPage() {
  const nav = useNavigate();

  const [periodCode, setPeriodCode] = useState<PeriodCode>("PREHISTORY");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuestionDetailResponse[] | null>(null);
  const [viewDensity, setViewDensity] = useState<ViewDensity>(1);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [results, setResults] = useState<Record<number, SolveResultResponse>>({});

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const list = await getQuestions({ period: periodCode, page: 0, size: count });
      const details = await Promise.all(list.content.map((q) => getQuestion(q.questionId)));
      setQuestions(details);
      setPage(0);
      setSelected({});
      setResults({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "문제를 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(q: QuestionDetailResponse, optionId: number) {
    if (results[q.questionId] !== undefined) return;
    setSelected((prev) => ({ ...prev, [q.questionId]: optionId }));
    try {
      const result = await solveQuestion(q.questionId, optionId, "PERIOD");
      setResults((prev) => ({ ...prev, [q.questionId]: result }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "채점에 실패했습니다 (서버 연결을 확인해주세요)");
    }
  }

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
      <button onClick={() => nav("/question-bank")} style={{ background: "none", border: "none", color: "#c8a060", cursor: "pointer", fontFamily: ff, fontSize: 12, marginBottom: 16 }}>← 문제은행 홈</button>
      <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 18, marginBottom: 16 }}>🏛️ 시대별 문제</h2>

      {!questions && (
        <Card style={{ maxWidth: 480 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>시대</span>
              <select value={periodCode} onChange={(e) => setPeriodCode(e.target.value as PeriodCode)} style={selectStyle}>
                {PERIOD_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>
            <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>개수</span>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))} style={selectStyle}>
                {COUNT_OPTIONS.map((n) => <option key={n} value={n}>{n}문제</option>)}
              </select>
            </label>
          </div>

          {error && (
            <div style={{ fontSize: 11, color: C.redB, background: "rgba(192,64,64,0.12)", border: `1px solid ${C.redB}`, padding: "6px 8px", marginBottom: 12 }}>
              {error}
            </div>
          )}

          <Button variant="green" block disabled={loading} onClick={() => void handleStart()}>
            {loading ? "불러오는 중..." : "문제 가져오기"}
          </Button>
        </Card>
      )}

      {questions && (
        <>
          {error && (
            <div style={{ fontSize: 11, color: C.redB, background: "rgba(192,64,64,0.12)", border: `1px solid ${C.redB}`, padding: "6px 8px", marginBottom: 14 }}>
              {error}
            </div>
          )}
          <QuestionSolveView
            questions={questions}
            selected={selected}
            results={results}
            isLocked={(qid) => results[qid] !== undefined}
            onSelect={(q, optionId) => void handleSelect(q, optionId)}
            viewDensity={viewDensity}
            onViewDensityChange={setViewDensity}
            page={page}
            onPageChange={setPage}
            statusText={`${Object.keys(results).length}/${questions.length} 채점 완료`}
            footer={
              <button
                onClick={() => setQuestions(null)}
                style={{ marginTop: 10, width: "100%", background: "none", border: "none", color: "#9a7040", fontSize: 11, cursor: "pointer", fontFamily: ff }}
              >
                ← 설정으로 돌아가기
              </button>
            }
          />
        </>
      )}
    </div>
  );
}
