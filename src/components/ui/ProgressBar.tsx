/** 진행률/점수 바 */
export default function ProgressBar({ pct, color = "#4a8030" }: { pct: number; color?: string }) {
  return (
    <div style={{ background: "#c8a860", border: "1px solid #9a7830", height: 8, position: "relative", overflow: "hidden" }}>
      <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: "100%", background: `linear-gradient(90deg,${color},${color}aa)`, transition: "width 0.4s", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" }} />
      {[25, 50, 75].map(t => <div key={t} style={{ position: "absolute", left: `${t}%`, top: 0, bottom: 0, width: 1, background: "rgba(0,0,0,0.15)" }} />)}
    </div>
  );
}
