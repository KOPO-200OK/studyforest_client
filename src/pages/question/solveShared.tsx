import type { CSSProperties } from "react";
import { Card } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import type { PeriodCode, QuestionDetailResponse, SolveResultResponse } from "@/api/types";

export type ViewDensity = 1 | 2 | 4;

export const PERIOD_OPTIONS: { value: PeriodCode; label: string }[] = [
  { value: "PREHISTORY", label: "선사·고조선" },
  { value: "THREE_KINGDOMS", label: "삼국·남북국" },
  { value: "GORYEO", label: "고려" },
  { value: "JOSEON", label: "조선" },
  { value: "MODERN", label: "근현대" },
];
export const PERIOD_LABEL: Record<PeriodCode, string> = Object.fromEntries(
  PERIOD_OPTIONS.map((p) => [p.value, p.label]),
) as Record<PeriodCode, string>;

export const selectStyle: CSSProperties = {
  fontSize: 12, padding: "8px 12px", background: C.inputBg, border: `1px solid ${C.inputBr}`,
  outline: "none", color: C.inkDark, fontFamily: ff, width: "100%",
};

export function toggleStyle(active: boolean): CSSProperties {
  return {
    padding: "6px 12px", fontFamily: ff, fontWeight: 700, fontSize: 11,
    background: active ? "rgba(200,160,48,0.22)" : "rgba(139,94,60,0.06)",
    border: `1px solid ${active ? C.active : C.inputBr}`,
    color: active ? C.active : "#887060", cursor: "pointer",
  };
}

export function ViewDensityToggle({ value, onChange }: { value: ViewDensity; onChange: (d: ViewDensity) => void }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {([1, 2, 4] as ViewDensity[]).map((n) => (
        <button key={n} onClick={() => onChange(n)} style={toggleStyle(value === n)}>{n}개씩 보기</button>
      ))}
    </div>
  );
}

export function QuestionCard({
  q, index, chosen, result, locked, onSelect,
}: {
  q: QuestionDetailResponse;
  index: number;
  chosen?: number;
  result?: SolveResultResponse;
  locked: boolean;
  onSelect: (optionId: number) => void;
}) {
  return (
    <Card>
      <div style={{ fontFamily: ff, fontSize: 11, color: "#9a7040", marginBottom: 6 }}>
        {index + 1}번 · {PERIOD_LABEL[q.periodCode]} · {q.difficulty}
      </div>
      <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 14, color: C.inkDark, marginBottom: 12 }}>
        {q.questionContent}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {q.options.map((o) => {
          const isChosen = chosen === o.questionOptionId;
          let bg: string = "rgba(139,94,60,0.06)";
          let border: string = C.inputBr;
          if (result) {
            if (o.questionOptionId === result.correctOptionId) { bg = "rgba(58,96,48,0.18)"; border = "#245020"; }
            else if (isChosen) { bg = "rgba(192,64,64,0.14)"; border = "#9a2020"; }
          } else if (isChosen) {
            bg = "rgba(200,160,48,0.18)"; border = C.active;
          }
          return (
            <button
              key={o.questionOptionId}
              disabled={locked}
              onClick={() => onSelect(o.questionOptionId)}
              style={{
                textAlign: "left", padding: "8px 10px", fontFamily: ff, fontSize: 12,
                background: bg, border: `1px solid ${border}`, color: C.inkDark,
                cursor: locked ? "default" : "pointer",
              }}
            >
              {o.optionNo}. {o.optionContent}
            </button>
          );
        })}
      </div>
      {result && (
        <div style={{ marginTop: 10, fontFamily: ff, fontSize: 11, color: C.inkMid, background: "rgba(139,94,60,0.08)", padding: "8px 10px" }}>
          {result.isCorrect ? "✅ 정답이에요!" : "❌ 오답이에요."}{result.explanation ? ` — ${result.explanation}` : ""}
        </div>
      )}
    </Card>
  );
}

/** 문제 목록 + 페이지네이션(1/2/4개씩) + 오른쪽 OMR 카드 */
export function QuestionSolveView({
  questions, selected, results, isLocked, onSelect,
  viewDensity, onViewDensityChange, page, onPageChange,
  statusText, footer,
}: {
  questions: QuestionDetailResponse[];
  selected: Record<number, number>;
  results: Record<number, SolveResultResponse>;
  isLocked: (questionId: number) => boolean;
  onSelect: (q: QuestionDetailResponse, optionId: number) => void;
  viewDensity: ViewDensity;
  onViewDensityChange: (d: ViewDensity) => void;
  page: number;
  onPageChange: (p: number) => void;
  statusText?: string;
  footer?: React.ReactNode;
}) {
  const totalPages = Math.max(1, Math.ceil(questions.length / viewDensity));
  const clampedPage = Math.min(page, totalPages - 1);
  const start = clampedPage * viewDensity;
  const pageQuestions = questions.slice(start, start + viewDensity);

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 14 }}>
            {start + 1}~{Math.min(start + viewDensity, questions.length)} / {questions.length}문제
          </div>
          <ViewDensityToggle value={viewDensity} onChange={onViewDensityChange} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: viewDensity === 1 ? "1fr" : "repeat(2, 1fr)", gap: 14 }}>
          {pageQuestions.map((q, i) => (
            <QuestionCard
              key={q.questionId}
              q={q}
              index={start + i}
              chosen={selected[q.questionId]}
              result={results[q.questionId]}
              locked={isLocked(q.questionId)}
              onSelect={(optionId) => onSelect(q, optionId)}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => onPageChange(Math.max(0, clampedPage - 1))} disabled={clampedPage === 0} style={toggleStyle(false)}>← 이전</button>
            <span style={{ fontFamily: ff, fontSize: 12, color: "#c8a060" }}>{clampedPage + 1} / {totalPages}</span>
            <button onClick={() => onPageChange(Math.min(totalPages - 1, clampedPage + 1))} disabled={clampedPage === totalPages - 1} style={toggleStyle(false)}>다음 →</button>
          </div>
        )}
      </div>

      <Card style={{ width: 240, flexShrink: 0, position: "sticky", top: 0 }}>
        <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 13, color: C.inkDark, marginBottom: 10, textAlign: "center" }}>📋 OMR 답안지</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 420, overflowY: "auto" }}>
          {questions.map((q, i) => {
            const chosen = selected[q.questionId];
            const result = results[q.questionId];
            const locked = isLocked(q.questionId);
            return (
              <div key={q.questionId} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => onPageChange(Math.floor(i / viewDensity))}
                  style={{
                    width: 20, fontSize: 10, fontFamily: ff, fontWeight: 700, padding: 0,
                    background: i >= start && i < start + viewDensity ? "rgba(200,160,48,0.3)" : "transparent",
                    border: "none", cursor: "pointer", color: C.inkDark,
                  }}
                >
                  {i + 1}
                </button>
                {q.options.map((o) => {
                  const isChosen = chosen === o.questionOptionId;
                  let bg = "transparent";
                  let bd: string = C.inputBr;
                  if (result) {
                    if (o.questionOptionId === result.correctOptionId) { bg = "#245020"; bd = "#245020"; }
                    else if (isChosen) { bg = "#9a2020"; bd = "#9a2020"; }
                  } else if (isChosen) {
                    bg = C.active; bd = C.active;
                  }
                  return (
                    <button
                      key={o.questionOptionId}
                      onClick={() => onSelect(q, o.questionOptionId)}
                      disabled={locked}
                      title={`${o.optionNo}`}
                      style={{ width: 16, height: 16, borderRadius: "50%", border: `1px solid ${bd}`, background: bg, cursor: locked ? "default" : "pointer", padding: 0 }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {statusText && (
          <div style={{ marginTop: 12, fontFamily: ff, fontSize: 11, color: "#c8a060", textAlign: "center" }}>
            {statusText}
          </div>
        )}

        {footer}
      </Card>
    </div>
  );
}
