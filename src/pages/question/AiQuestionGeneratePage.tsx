import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import { mockAiQuestionApi, type GeneratedQuestion } from "@/api/mockAiQuestionApi";
import type { Difficulty, PeriodCode } from "@/api/types";

const PERIOD_OPTIONS: { value: PeriodCode; label: string }[] = [
  { value: "PREHISTORY", label: "선사·고조선" },
  { value: "THREE_KINGDOMS", label: "삼국·남북국" },
  { value: "GORYEO", label: "고려" },
  { value: "JOSEON", label: "조선" },
  { value: "MODERN", label: "근현대" },
];
const DIFFICULTY_OPTIONS: Difficulty[] = ["EASY", "NORMAL", "HARD"];

const selectStyle = {
  fontSize: 12, padding: "8px 12px", background: C.inputBg, border: `1px solid ${C.inputBr}`,
  outline: "none", color: C.inkDark, fontFamily: ff, width: "100%",
};

export default function AiQuestionGeneratePage() {
  const nav = useNavigate();
  const [periodCode, setPeriodCode] = useState<PeriodCode>("PREHISTORY");
  const [difficulty, setDifficulty] = useState<Difficulty>("NORMAL");
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  async function handleGenerate() {
    setLoading(true);
    setAnswers({});
    try {
      const generated = await mockAiQuestionApi.generateQuestions({ periodCode, difficulty, count });
      setQuestions(generated);
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionId: number, optionNo: number) {
    if (answers[questionId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionNo }));
  }

  const answeredCount = questions ? questions.filter((q) => answers[q.id] !== undefined).length : 0;
  const correctCount = questions
    ? questions.filter((q) => {
        const chosen = answers[q.id];
        return chosen !== undefined && q.options.find((o) => o.optionNo === chosen)?.isCorrect;
      }).length
    : 0;

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
      <button onClick={() => nav("/question-bank")} style={{ background: "none", border: "none", color: "#c8a060", cursor: "pointer", fontFamily: ff, fontSize: 12, marginBottom: 16 }}>← 문제은행 홈</button>
      <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 18, marginBottom: 6 }}>🪄 AI로 문제지 만들기</h2>
      <p style={{ fontFamily: ff, color: "#9aaa80", fontSize: 12, marginBottom: 20 }}>
        조건을 고르면 AI가 그 자리에서 문제를 만들어줘요. 이 문제는 문제은행에 저장되지 않고 이번 화면에서만 사용돼요.
      </p>

      <Card style={{ maxWidth: 640, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>시대</span>
            <select value={periodCode} onChange={(e) => setPeriodCode(e.target.value as PeriodCode)} style={selectStyle}>
              {PERIOD_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </label>
          <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>난이도</span>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} style={selectStyle}>
              {DIFFICULTY_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>문제 개수</span>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} style={selectStyle}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}문제</option>)}
            </select>
          </label>
        </div>
        <Button variant="green" block onClick={() => void handleGenerate()} disabled={loading}>
          {loading ? "🤖 AI가 문제를 만들고 있어요..." : questions ? "다시 생성하기" : "AI 문제 생성하기"}
        </Button>
      </Card>

      {questions && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
          {questions.length > 0 && answeredCount === questions.length && (
            <Card style={{ background: "linear-gradient(160deg,#fdf4db,#eedda0)" }}>
              <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 14, color: C.inkDark }}>
                결과: {correctCount} / {questions.length} 정답
              </div>
            </Card>
          )}

          {questions.map((q, i) => {
            const chosen = answers[q.id];
            const answered = chosen !== undefined;
            return (
              <Card key={q.id}>
                <div style={{ fontFamily: ff, fontSize: 11, color: "#9a7040", marginBottom: 6 }}>
                  {i + 1}번 · {PERIOD_OPTIONS.find((p) => p.value === q.periodCode)?.label} · {q.difficulty}
                </div>
                <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 14, color: C.inkDark, marginBottom: 12 }}>
                  {q.questionContent}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {q.options.map((o) => {
                    const isChosen = chosen === o.optionNo;
                    let bg: string = "rgba(139,94,60,0.06)";
                    let border: string = C.inputBr;
                    if (answered && o.isCorrect) { bg = "rgba(58,96,48,0.18)"; border = "#245020"; }
                    else if (answered && isChosen && !o.isCorrect) { bg = "rgba(192,64,64,0.14)"; border = "#9a2020"; }
                    return (
                      <button
                        key={o.optionNo}
                        onClick={() => selectAnswer(q.id, o.optionNo)}
                        disabled={answered}
                        style={{
                          textAlign: "left", padding: "8px 10px", fontFamily: ff, fontSize: 12,
                          background: bg, border: `1px solid ${border}`, color: C.inkDark,
                          cursor: answered ? "default" : "pointer",
                        }}
                      >
                        {o.optionNo}. {o.optionContent}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div style={{ marginTop: 10, fontFamily: ff, fontSize: 11, color: C.inkMid, background: "rgba(139,94,60,0.08)", padding: "8px 10px" }}>
                    💡 {q.explanation}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
