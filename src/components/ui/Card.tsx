import type { ReactNode, CSSProperties } from "react";

interface Props { children: ReactNode; style?: CSSProperties; onClick?: () => void; }

/** 한지 카드 (헤더 없는 단순 컨테이너) */
export default function Card({ children, style, onClick }: Props) {
  return (
    <div onClick={onClick} style={{
      background: "linear-gradient(160deg,#fdf4db,#eedda0)",
      border: "2px solid #9a6a30",
      boxShadow: "3px 4px 0 #5a3a08",
      padding: "20px 24px",
      cursor: onClick ? "pointer" : undefined,
      ...style,
    }}>
      {children}
    </div>
  );
}
