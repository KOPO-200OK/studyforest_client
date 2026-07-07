import { NavLink } from "react-router-dom";
import { Bell } from "lucide-react";
import { C, ff, fs } from "@/styles/tokens";
import { mockAuthApi } from "@/api/mockAuthApi";
import ProfileAvatar from "@/components/ProfileAvatar";
import { DEFAULT_CHARACTER_ID } from "@/data/characters";

const NAV_ITEMS = [
  { to: "/study-room",   label: "스터디룸" },
  { to: "/question-bank",label: "문제은행" },
  { to: "/my-study",     label: "나의 공부" },
  { to: "/jangwon",      label: "장원급제" },
  { to: "/admin",        label: "관리자" },
];

export default function Nav() {
  const account = mockAuthApi.getCurrentAccount();
  const nickname = account?.nickname ?? "학습자";
  const characterId = account?.characterId ?? DEFAULT_CHARACTER_ID;
  return (
    <nav style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 16px", gap: 4, zIndex: 50, background: C.navBg, borderBottom: `3px solid ${C.navBr}`, boxShadow: `0 3px 0 ${C.sidebarBr}, 0 4px 20px rgba(0,0,0,0.65)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 20 }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>🌲</span>
        <span style={{ fontFamily: fs, fontWeight: 700, fontSize: 18, color: "#f5e6c8" }}>공숲</span>
        <span style={{ fontSize: 10, padding: "2px 6px", background: "#7a4f2e", color: C.gold, border: `1px solid ${C.inputBr}`, fontWeight: 700 }}>한국사</span>
      </div>
      {NAV_ITEMS.map(item => (
        <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
          padding: "5px 12px", fontSize: 13, textDecoration: "none", fontFamily: ff,
          color: isActive ? C.active : "#887060",
          fontWeight: isActive ? 700 : 400,
          background: isActive ? "rgba(200,160,48,0.1)" : "transparent",
          border: isActive ? "1px solid rgba(200,160,48,0.22)" : "1px solid transparent",
        })}>
          {item.label}
        </NavLink>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <Bell size={17} style={{ color: "#c8a060", cursor: "pointer" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", background: "rgba(139,94,60,0.22)", border: "1px solid #8b5e3c" }}>
          <div style={{ width: 20, height: 20, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ProfileAvatar id={characterId} size={20} />
          </div>
          <span style={{ fontSize: 13, color: "#f5e6c8", fontFamily: ff }}>{nickname}</span>
          <span style={{ fontSize: 10, padding: "2px 6px", background: "#2c4a7c", color: "#a0c0f0", border: "1px solid #1e3060", fontWeight: 700 }}>Lv.7</span>
        </div>
      </div>
    </nav>
  );
}
