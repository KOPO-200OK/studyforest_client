import { Navigate, NavLink, Outlet } from "react-router-dom";
import { C, ff, fs } from "@/styles/tokens";
import { mockAuthApi } from "@/api/mockAuthApi";

const ADMIN_MENU = [
  { to: "members", label: "회원 관리" },
  { to: "questions", label: "문제 관리" },
  { to: "notices", label: "공지사항 관리" },
  { to: "ai", label: "AI 관리" },
  { to: "jangwon", label: "장원급제 관리" },
  { to: "study-rooms", label: "스터디 공간 관리" },
];

export default function AdminLayout() {
  if (!mockAuthApi.isCurrentUserAdmin()) {
    return <Navigate to="/study-room" replace />;
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
      <div style={{ padding: "20px 28px 0" }}>
        <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 20, marginBottom: 14 }}>🛠️ 관리자</h2>
        <div style={{ display: "flex", gap: 4, borderBottom: `2px solid ${C.navBr}` }}>
          {ADMIN_MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                padding: "8px 16px",
                fontSize: 13,
                fontFamily: ff,
                textDecoration: "none",
                color: isActive ? C.active : "#887060",
                fontWeight: isActive ? 700 : 400,
                background: isActive ? "rgba(200,160,48,0.12)" : "transparent",
                borderBottom: isActive ? `2px solid ${C.active}` : "2px solid transparent",
                marginBottom: -2,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28 }}>
        <Outlet />
      </div>
    </div>
  );
}
