import { Link } from "react-router-dom";
import { fs, ff, C } from "@/styles/tokens";
export default function NotFoundPage() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center", fontFamily: fs }}>
      <div style={{ fontSize: 22, color: "#f5e6c8" }}>🍂 페이지를 찾을 수 없습니다</div>
      <Link to="/study-room" style={{ fontFamily: ff, fontSize: 13, color: C.active }}>스터디룸으로 돌아가기 →</Link>
    </div>
  );
}
