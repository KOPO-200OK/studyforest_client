import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Input } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import { aiApi, type AiDifficulty, type AiQuestionType, type GeneratedQuestionResponse } from "@/api/aiApi";

const TOPIC_PRESETS = ["선사·고조선", "삼국·남북국", "고려", "조선", "근현대"];

const DIFFICULTY_OPTIONS: { value: AiDifficulty; label: string }[] = [
  { value: "basic", label: "기초" },
  { value: "intermediate", label: "보통" },
  { value: "advanced", label: "심화" },
];

const QUESTION_TYPE_OPTIONS: { value: AiQuestionType; label: string }[] = [
  { value: "multiple_choice", label: "객관식" },
  { value: "ox", label: "OX" },
  { value: "short_answer", label: "단답형" },
];

const selectStyle = {
  fontSize: 12, padding: "8px 12px", background: C.inputBg, border: `1px solid ${C.inputBr}`,
  outline: "none", color: C.inkDark, fontFamily: ff, width: "100%",
};

function normalize(text: string): string {
  return text.replace(/\s+/g, "").trim().toLowerCase();
}

export default function AiQuestionGeneratePage() {
  const nav = useNavigate();
  const [topic, setTopic] = useState("선사·고조선");
  const [difficulty, setDifficulty] = useState<AiDifficulty>("intermediate");
  const [questionType, setQuestionType] = useState<AiQuestionType>("multiple_choice");
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GeneratedQuestionResponse[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [draftAnswer, setDraftAnswer] = useState<Record<number, string>>({});

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setAnswers({});
    setDraftAnswer({});
    try {
      const result = await aiApi.generateQuestions({ topic: topic.trim(), difficulty, questionType, count });
      setQuestions(result.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 문제 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }

  function selectChoice(index: number, choice: string) {
    if (answers[index] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [index]: choice }));
  }

  function submitShortAnswer(index: number) {
    const value = (draftAnswer[index] ?? "").trim();
    if (!value || answers[index] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }

  const answeredCount = questions ? questions.filter((_, i) => answers[i] !== undefined).length : 0;
  const correctCount = questions
    ? questions.filter((q, i) => answers[i] !== undefined && normalize(answers[i]) === normalize(q.answer)).length
    : 0;

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
      <button onClick={() => nav("/question-bank")} style={{ background: "none", border: "none", color: "#c8a060", cursor: "pointer", fontFamily: ff, fontSize: 12, marginBottom: 16 }}>← 문제은행 홈</button>
      <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 18, marginBottom: 6 }}>🪄 AI로 문제지 만들기</h2>
      <p style={{ fontFamily: ff, color: "#9aaa80", fontSize: 12, marginBottom: 20 }}>
        주제를 정하면 실제 AI가 그 자리에서 문제를 만들어줘요.
      </p>

      <Card style={{ maxWidth: 640, marginBottom: 24 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>주제</span>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="예: 삼국시대, 고려 정치, 조선 후기" />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            {TOPIC_PRESETS.map((preset) => (
              <button key={preset} type="button" onClick={() => setTopic(preset)}
                style={{ fontSize: 10, padding: "4px 8px", fontFamily: ff, cursor: "pointer",
                  background: topic === preset ? "rgba(58,96,48,0.18)" : "rgba(139,94,60,0.08)",
                  border: `1px solid ${topic === preset ? "#245020" : C.inputBr}`, color: C.inkMid }}>
                {preset}
              </button>
            ))}
          </div>
        </label>

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>난이도</span>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as AiDifficulty)} style={selectStyle}>
              {DIFFICULTY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>문제 유형</span>
            <select value={questionType} onChange={(e) => setQuestionType(e.target.value as AiQuestionType)} style={selectStyle}>
              {QUESTION_TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>문제 개수</span>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} style={selectStyle}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n}문제</option>)}
            </select>
          </label>
        </div>
        <Button variant="green" block onClick={() => void handleGenerate()} disabled={loading || !topic.trim()}>
          {loading ? "🤖 AI가 문제를 만들고 있어요..." : questions ? "다시 생성하기" : "AI 문제 생성하기"}
        </Button>
        {error && <div style={{ marginTop: 10, fontFamily: ff, fontSize: 11, color: "#c04040" }}>{error}</div>}
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
            const chosen = answers[i];
            const answered = chosen !== undefined;
            const isShortAnswer = q.choices.length === 0;
            return (
              <Card key={i}>
                <div style={{ fontFamily: ff, fontSize: 11, color: "#9a7040", marginBottom: 6 }}>
                  {i + 1}번 · {q.era} · {q.topic} · {q.difficulty}
                </div>
                <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 14, color: C.inkDark, marginBottom: 12 }}>
                  {q.question}
                </div>

                {isShortAnswer ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Input
                      value={draftAnswer[i] ?? ""}
                      onChange={(e) => setDraftAnswer((prev) => ({ ...prev, [i]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") submitShortAnswer(i); }}
                      placeholder="답을 입력하세요"
                      disabled={answered}
                      style={{ flex: 1 }}
                    />
                    <Button variant="green" onClick={() => submitShortAnswer(i)} disabled={answered || !(draftAnswer[i] ?? "").trim()}>제출</Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {q.choices.map((choice, ci) => {
                      const isChosen = chosen === choice;
                      const isAnswerChoice = normalize(choice) === normalize(q.answer);
                      let bg: string = "rgba(139,94,60,0.06)";
                      let border: string = C.inputBr;
                      if (answered && isAnswerChoice) { bg = "rgba(58,96,48,0.18)"; border = "#245020"; }
                      else if (answered && isChosen && !isAnswerChoice) { bg = "rgba(192,64,64,0.14)"; border = "#9a2020"; }
                      return (
                        <button
                          key={ci}
                          onClick={() => selectChoice(i, choice)}
                          disabled={answered}
                          style={{
                            textAlign: "left", padding: "8px 10px", fontFamily: ff, fontSize: 12,
                            background: bg, border: `1px solid ${border}`, color: C.inkDark,
                            cursor: answered ? "default" : "pointer",
                          }}
                        >
                          {ci + 1}. {choice}
                        </button>
                      );
                    })}
                  </div>
                )}

                {answered && (
                  <div style={{ marginTop: 10, fontFamily: ff, fontSize: 11, color: C.inkMid, background: "rgba(139,94,60,0.08)", padding: "8px 10px" }}>
                    {isShortAnswer && (
                      <div style={{ marginBottom: 6, fontWeight: 700, color: normalize(chosen) === normalize(q.answer) ? "#245020" : "#9a2020" }}>
                        {normalize(chosen) === normalize(q.answer) ? "✅ 정답" : `❌ 오답 (정답: ${q.answer})`}
                      </div>
                    )}
                    💡 {q.explanation}
                    {q.examTip && <div style={{ marginTop: 6, color: "#9a7040" }}>📌 {q.examTip}</div>}
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
