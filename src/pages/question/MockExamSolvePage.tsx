import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, Button } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import { saveMockAnswers, submitMockExam } from "@/api/questionApi";
import type { MockExamDetailResponse, QuestionDetailResponse } from "@/api/types";
import { QuestionSolveView, type ViewDensity } from "./solveShared";

export default function MockExamSolvePage() {
  const nav = useNavigate();
  const location = useLocation();
  const { mockExamId } = useParams();
  const exam = (location.state as { exam?: MockExamDetailResponse } | null)?.exam;

  const [viewDensity, setViewDensity] = useState<ViewDensity>(1);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!exam) {
    return (
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
        <button onClick={() => nav("/question-bank/mock-exams")} style={{ background: "none", border: "none", color: "#c8a060", cursor: "pointer", fontFamily: ff, fontSize: 12, marginBottom: 16 }}>← 모의고사 시작하기</button>
        <Card style={{ maxWidth: 420 }}>
          <div style={{ fontFamily: ff, fontSize: 13, color: C.inkDark }}>
            응시 중인 모의고사 정보를 찾을 수 없어요. 새로고침했거나 직접 주소로 들어온 경우일 수 있어요. 다시 시작해주세요.
          </div>
        </Card>
      </div>
    );
  }

  function handleSelect(q: QuestionDetailResponse, optionId: number) {
    setSelected((prev) => ({ ...prev, [q.questionId]: optionId }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const answers = Object.entries(selected).map(([questionId, selectedOptionId]) => ({
        questionId: Number(questionId),
        selectedOptionId,
      }));
      await saveMockAnswers(exam!.mockExamId, answers);
      const result = await submitMockExam(exam!.mockExamId);
      nav(`/question-bank/mock-exams/${exam!.mockExamId}/result`, { state: { result, totalCount: exam!.questions.length } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "제출에 실패했습니다 (서버 연결을 확인해주세요)");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
      <button onClick={() => nav("/question-bank")} style={{ background: "none", border: "none", color: "#c8a060", cursor: "pointer", fontFamily: ff, fontSize: 12, marginBottom: 16 }}>← 문제은행 홈</button>
      <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 18, marginBottom: 16 }}>📝 {mockExamId}회차 모의고사</h2>

      {error && (
        <div style={{ fontSize: 11, color: C.redB, background: "rgba(192,64,64,0.12)", border: `1px solid ${C.redB}`, padding: "6px 8px", marginBottom: 14 }}>
          {error}
        </div>
      )}

      <QuestionSolveView
        questions={exam.questions}
        selected={selected}
        results={{}}
        isLocked={() => false}
        onSelect={handleSelect}
        viewDensity={viewDensity}
        onViewDensityChange={setViewDensity}
        page={page}
        onPageChange={setPage}
        statusText={`${Object.keys(selected).length}/${exam.questions.length} 답변 완료`}
        footer={
          <Button variant="green" block disabled={submitting} onClick={() => void handleSubmit()} style={{ marginTop: 12 }}>
            {submitting ? "제출 중..." : "제출하기"}
          </Button>
        }
      />
    </div>
  );
}
