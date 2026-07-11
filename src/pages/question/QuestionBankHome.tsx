import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, ProgressBar } from "@/components/ui";
import { fs, ff } from "@/styles/tokens";
import { studyApi, type StudySummaryResponse } from "@/api/studyApi";

const MENU = [
  { to: "periods",      icon: "🏛️", label: "시대별 문제",  sub: "시대·주제·난이도별 풀이" },
  { to: "random",       icon: "🎲", label: "랜덤 문제",    sub: "조건에 맞는 무작위 출제" },
  { to: "mock-exams",   icon: "📝", label: "모의고사",     sub: "실전형 시험 (기본/심화)" },
  { to: "wrong-answers",icon: "📕", label: "오답노트",     sub: "틀린 문제 다시 풀기" },
  { to: "ai",           icon: "🤖", label: "AI 질의응답",  sub: "해설·개념 질문" },
  { to: "ai-generate",  icon: "🪄", label: "AI로 문제지 만들기", sub: "AI가 즉석에서 문제 생성" },
];

const ERA_LABEL: Record<string, string> = {
  PREHISTORY: "선사·고조선",
  THREE_KINGDOMS: "삼국·남북국",
  GORYEO: "고려",
  JOSEON: "조선",
  MODERN: "근현대",
};

export default function QuestionBankHome() {
  const nav = useNavigate();
  const [summary, setSummary] = useState<StudySummaryResponse | null>(null);
  const [summaryError, setSummaryError] = useState(false);
  const [weakestEra, setWeakestEra] = useState<string | null>(null);

  useEffect(() => {
    studyApi.getSummary().then(setSummary).catch(() => setSummaryError(true));
    studyApi.getWeaknessAnalysis()
      .then((res) => {
        const weakest = res.items[0];
        if (weakest) setWeakestEra(ERA_LABEL[weakest.era] ?? weakest.era);
      })
      .catch(() => setWeakestEra(null));
  }, []);

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
      <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 20, marginBottom: 6 }}>📚 공숲 문제은행</h2>
      <p style={{ fontFamily: ff, color: "#9aaa80", fontSize: 12, marginBottom: 24 }}>한국사능력검정시험 대비</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 16, marginBottom: 24 }}>
        {MENU.map(m => (
          <Card key={m.to} onClick={() => nav(m.to)}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 15, color: "#2a1808" }}>{m.label}</div>
            <div style={{ fontFamily: ff, fontSize: 11, color: "#7a5828", marginTop: 4 }}>{m.sub}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 14, color: "#2a1808", marginBottom: 12 }}>누적 학습 현황</div>
        {summaryError ? (
          <div style={{ fontFamily: ff, fontSize: 12, color: "#c04040" }}>학습 현황을 불러오지 못했습니다</div>
        ) : summary === null ? (
          <div style={{ fontFamily: ff, fontSize: 12, color: "#9a7040" }}>불러오는 중...</div>
        ) : (
          <div style={{ fontFamily: ff, fontSize: 12, color: "#5a3010", display: "flex", flexDirection: "column", gap: 8 }}>
            <div>누적 풀이: <strong>{summary.totalSolvedCount}문제</strong> · 정답률 <strong>{Math.round(summary.accuracyRate)}%</strong></div>
            <ProgressBar pct={Math.round(summary.accuracyRate)} />
            {weakestEra && <div>취약 시대: <strong style={{ color: "#c04040" }}>{weakestEra}</strong></div>}
          </div>
        )}
      </Card>
    </div>
  );
}
