import type { ReactNode } from "react";
import { C, fs } from "@/styles/tokens";

interface Props {
  title: string;
  icon?: ReactNode;
  accent?: string;   // 헤더 배경 (기본: 나무색)
  children: ReactNode;
}

/** 공숲 한지 패널 (나무 헤더 + 한지 본문). 사이드바/카드 공통 컨테이너 */
export default function Panel({ title, icon, accent, children }: Props) {
  return (
    <div style={{ background: C.hanji, border: `2px solid ${C.hanjiB}`, boxShadow: `0 3px 0 ${C.hanjiSh}, 0 5px 16px rgba(0,0,0,0.3)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: accent ?? C.wood, borderBottom: "2px solid rgba(0,0,0,0.28)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
        {icon && <span style={{ color: C.active, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>{icon}</span>}
        <span style={{ color: "#ddd0b8", fontFamily: fs, fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{title}</span>
      </div>
      <div style={{ padding: 12 }}>{children}</div>
    </div>
  );
}
