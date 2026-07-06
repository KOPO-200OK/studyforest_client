import { fs } from "@/styles/tokens";

export default function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9a7040", fontFamily: fs, fontSize: 18 }}>
      🚧 {title} 페이지 준비 중입니다
    </div>
  );
}
