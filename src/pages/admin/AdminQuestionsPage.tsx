import { useEffect, useState, type FormEvent } from "react";
import { Card, Button, Input } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import { mockQuestionApi, type MockQuestionOption } from "@/api/mockQuestionApi";
import type { Difficulty, ExamLevel, PeriodCode } from "@/api/types";

const PERIOD_OPTIONS: { value: PeriodCode; label: string }[] = [
  { value: "PREHISTORY", label: "선사·고조선" },
  { value: "THREE_KINGDOMS", label: "삼국·남북국" },
  { value: "GORYEO", label: "고려" },
  { value: "JOSEON", label: "조선" },
  { value: "MODERN", label: "근현대" },
];
const DIFFICULTY_OPTIONS: Difficulty[] = ["EASY", "NORMAL", "HARD"];
const EXAM_LEVEL_OPTIONS: ExamLevel[] = ["BASIC", "ADVANCED"];

const EMPTY_OPTIONS: MockQuestionOption[] = [
  { optionNo: 1, optionContent: "", isCorrect: true },
  { optionNo: 2, optionContent: "", isCorrect: false },
  { optionNo: 3, optionContent: "", isCorrect: false },
  { optionNo: 4, optionContent: "", isCorrect: false },
];

const selectStyle = {
  fontSize: 12, padding: "8px 12px", background: C.inputBg, border: `1px solid ${C.inputBr}`,
  outline: "none", color: C.inkDark, fontFamily: ff, width: "100%",
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState(() => mockQuestionApi.listQuestions());
  const [periodCode, setPeriodCode] = useState<PeriodCode>("PREHISTORY");
  const [topicName, setTopicName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("NORMAL");
  const [examLevel, setExamLevel] = useState<ExamLevel>("BASIC");
  const [questionContent, setQuestionContent] = useState("");
  const [options, setOptions] = useState<MockQuestionOption[]>(EMPTY_OPTIONS);
  const [error, setError] = useState<string | null>(null);

  function updateOption(index: number, patch: Partial<MockQuestionOption>) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  }

  useEffect(() => {
  mockQuestionApi.loadQuestions()
    .then(setQuestions)
    .catch((err) => setError(err instanceof Error ? err.message : "문제 목록을 불러오지 못했습니다"));
}, []);

async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  if (!topicName.trim() || !questionContent.trim() || options.some((o) => !o.optionContent.trim())) {
    setError("모든 항목을 입력해주세요");
    return;
  }
  if (!options.some((o) => o.isCorrect)) {
    setError("정답을 하나 선택해주세요");
    return;
  }

  setError(null);

  try {
    await mockQuestionApi.addQuestion({
      periodCode,
      topicName: topicName.trim(),
      difficulty,
      examLevel,
      questionContent: questionContent.trim(),
      options,
    });

    setQuestions(await mockQuestionApi.loadQuestions());
    setTopicName("");
    setQuestionContent("");
    setOptions(EMPTY_OPTIONS);
  } catch (err) {
    setError(err instanceof Error ? err.message : "문제 등록에 실패했습니다");
  }
}

async function handleDelete(questionId: number) {
  try {
    await mockQuestionApi.deleteQuestion(questionId);
    setQuestions(mockQuestionApi.listQuestions());
  } catch (err) {
    setError(err instanceof Error ? err.message : "문제 삭제에 실패했습니다");
  }
}

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      <Card style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 14, color: "#2a1808" }}>➕ 문제 추가</div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
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
              <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>급수</span>
              <select value={examLevel} onChange={(e) => setExamLevel(e.target.value as ExamLevel)} style={selectStyle}>
                {EXAM_LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>주제</span>
            <Input value={topicName} onChange={(e) => setTopicName(e.target.value)} placeholder="예: 무신정권" style={{ width: "100%" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>문제 내용</span>
            <textarea
              value={questionContent}
              onChange={(e) => setQuestionContent(e.target.value)}
              placeholder="문제를 입력하세요"
              rows={3}
              style={{ ...selectStyle, resize: "vertical", fontFamily: ff }}
            />
          </label>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>선택지 (정답 라디오로 선택)</span>
            {options.map((o, i) => (
              <div key={o.optionNo} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name="correct-option"
                  checked={o.isCorrect}
                  onChange={() => setOptions((prev) => prev.map((opt, idx) => ({ ...opt, isCorrect: idx === i })))}
                />
                <Input
                  value={o.optionContent}
                  onChange={(e) => updateOption(i, { optionContent: e.target.value })}
                  placeholder={`선택지 ${o.optionNo}`}
                  style={{ flex: 1 }}
                />
              </div>
            ))}
          </div>

          {error && (
            <div style={{ fontSize: 11, color: C.redB, background: "rgba(192,64,64,0.12)", border: `1px solid ${C.redB}`, padding: "6px 8px" }}>
              {error}
            </div>
          )}

          <Button type="submit" variant="green" block>문제 추가</Button>
        </form>
      </Card>

      <Card style={{ flex: 1, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", fontFamily: fs, fontWeight: 700, fontSize: 14, color: "#2a1808", borderBottom: `1px solid ${C.hanjiB}` }}>
          등록된 문제 ({questions.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {questions.map((q) => (
            <div key={q.questionId} style={{ padding: "12px 14px", borderBottom: `1px solid ${C.hanjiB}`, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <div style={{ fontFamily: ff, fontSize: 12 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, padding: "2px 6px", background: "#7a4f2e", color: C.gold, fontWeight: 700 }}>{PERIOD_OPTIONS.find((p) => p.value === q.periodCode)?.label}</span>
                  <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(139,94,60,0.15)", color: "#7a5828", fontWeight: 700 }}>{q.topicName}</span>
                  <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(139,94,60,0.15)", color: "#7a5828", fontWeight: 700 }}>{q.difficulty} · {q.examLevel}</span>
                </div>
                <div style={{ color: "#2a1808" }}>{q.questionContent}</div>
              </div>
              <Button variant="red" onClick={() => void handleDelete(q.questionId)} style={{ padding: "4px 10px", fontSize: 10, flexShrink: 0 }}>
                삭제
                </Button>
            </div>
          ))}
          {questions.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "#7a5828", fontFamily: fs, fontSize: 13 }}>
              등록된 문제가 없습니다
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
