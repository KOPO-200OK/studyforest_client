import type { ReactNode } from "react";
import { ff } from "@/styles/tokens";

type Tone = "neutral" | "red" | "blue";
const TONES: Record<Tone, { bg: string; color: string; border: string }> = {
  neutral: { bg: "#f0e0c0", color: "#5a3010", border: "#c4a060" },
  red:     { bg: "linear-gradient(135deg,#c04040,#a02020)", color: "white", border: "#8a1818" },
  blue:    { bg: "#2c4a7c", color: "#a0c0f0", border: "#1e3060" },
};

/** 작은 라벨 뱃지 (시대·급수·오답횟수 등) */
export default function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <span style={{ padding: "2px 8px", fontSize: 11, fontWeight: 700, fontFamily: ff, background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
      {children}
    </span>
  );
}
