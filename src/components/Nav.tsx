import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, Volume2, VolumeX, Menu } from "lucide-react";
import { C, ff, fs } from "@/styles/tokens";
import { mockAuthApi } from "@/api/mockAuthApi";
import ProfileAvatar from "@/components/ProfileAvatar";
import { DEFAULT_CHARACTER_ID } from "@/data/characters";
import { useBgm } from "@/audio/BgmProvider";
import { useSidebar } from "@/context/SidebarContext";
import { isJangwonWinner } from "@/data/jangwonWinners";
import logoImg from "@/imports/rogo/rogo.png";

const NAV_ITEMS = [
  { to: "/study-room",   label: "스터디룸" },
  { to: "/question-bank",label: "문제은행" },
  { to: "/my-study",     label: "나의 공부" },
  { to: "/jangwon",      label: "장원급제" },
  { to: "/inquiry",      label: "문의하기" },
  { to: "/admin",        label: "관리자" },
];

export default function Nav() {
  const navigate = useNavigate();
  const account = mockAuthApi.getCurrentAccount();
  const nickname = account?.nickname ?? "학습자";
  const characterId = account?.characterId ?? DEFAULT_CHARACTER_ID;
  const bgm = useBgm();
  const sidebar = useSidebar();
  const [showMenu, setShowMenu] = useState(false);
  const navItems = NAV_ITEMS.filter((item) => item.to !== "/admin" || account?.isAdmin);

  function handleLogout() {
    mockAuthApi.logout();
    setShowMenu(false);
    navigate("/login", { replace: true });
  }

  async function handleWithdraw() {
  if (!confirm("정말 회원을 탈퇴하시겠어요? 저장된 계정 정보가 모두 삭제됩니다.")) return;
  try {
    await mockAuthApi.withdraw();
    setShowMenu(false);
    navigate("/login", { replace: true });
  } catch (err) {
    alert(err instanceof Error ? err.message : "회원탈퇴에 실패했습니다");
  }
}

  return (
    <nav style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 16px", gap: 4, zIndex: 50, background: C.navBg, borderBottom: `3px solid ${C.navBr}`, boxShadow: `0 3px 0 ${C.sidebarBr}, 0 4px 20px rgba(0,0,0,0.65)` }}>
      <button
        onClick={sidebar.toggle}
        title="사이드바 열기/닫기"
        style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 20, background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <img src={logoImg} alt="공숲" style={{ width: 34, height: 34, objectFit: "contain", flexShrink: 0 }} />
        <span style={{ fontFamily: fs, fontWeight: 700, fontSize: 18, color: "#f5e6c8" }}>공숲</span>
        <span style={{ fontSize: 10, padding: "2px 6px", background: "#7a4f2e", color: C.gold, border: `1px solid ${C.inputBr}`, fontWeight: 700 }}>한국사</span>
      </button>
      {navItems.map(item => (
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
        <button
          onClick={bgm.toggle}
          title={bgm.hasTracks ? (bgm.enabled ? "배경음악 끄기" : "배경음악 켜기") : "배경음악 파일이 없습니다"}
          disabled={!bgm.hasTracks}
          style={{ background: "none", border: "none", padding: 0, cursor: bgm.hasTracks ? "pointer" : "default", display: "flex", opacity: bgm.hasTracks ? 1 : 0.4 }}
        >
          {bgm.enabled ? (
            <Volume2 size={17} style={{ color: "#c8a060" }} />
          ) : (
            <VolumeX size={17} style={{ color: "#887060" }} />
          )}
        </button>
        <Bell size={17} style={{ color: "#c8a060", cursor: "pointer" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", background: "rgba(139,94,60,0.22)", border: "1px solid #8b5e3c" }}>
          <div style={{ width: 20, height: 20, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ProfileAvatar id={characterId} size={20} />
          </div>
          <span style={{ fontSize: 13, color: "#f5e6c8", fontFamily: ff, display: "flex", alignItems: "center", gap: 3 }}>
            {isJangwonWinner(nickname) && <span title="장원급제">👑</span>}
            {nickname}
          </span>
          <button
            onClick={() => setShowMenu((v) => !v)}
            title="메뉴"
            style={{ background: "none", border: "none", padding: 0, display: "flex", cursor: "pointer" }}
          >
            <Menu size={15} style={{ color: "#c8a060" }} />
          </button>

          {showMenu && (
            <>
              <div onClick={() => setShowMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 61, width: 220,
                background: "linear-gradient(160deg,#fdf4db,#eedda0)", border: "2px solid #9a6a30",
                boxShadow: "3px 4px 0 #5a3a08, 0 8px 24px rgba(0,0,0,0.5)", padding: 14,
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#5a3010" }}>배경음 조절</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={bgm.toggle}
                      disabled={!bgm.hasTracks}
                      style={{ background: "none", border: "none", padding: 0, display: "flex", cursor: bgm.hasTracks ? "pointer" : "default", opacity: bgm.hasTracks ? 1 : 0.4 }}
                    >
                      {bgm.enabled ? <Volume2 size={16} style={{ color: "#5a3010" }} /> : <VolumeX size={16} style={{ color: "#5a3010" }} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={bgm.volume}
                      onChange={(e) => bgm.setVolume(Number(e.target.value))}
                      disabled={!bgm.hasTracks}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div style={{ height: 1, background: "#c4a060" }} />

                <button
                  onClick={handleLogout}
                  style={{ textAlign: "left", fontSize: 12, fontWeight: 700, padding: "6px 8px", background: "rgba(139,94,60,0.12)", border: "1px solid #c4a060", color: "#5a3010", cursor: "pointer", fontFamily: ff }}
                >
                  🚪 로그아웃
                </button>
                <button
                  onClick={handleWithdraw}
                  style={{ textAlign: "left", fontSize: 12, fontWeight: 700, padding: "6px 8px", background: "rgba(192,64,64,0.1)", border: "1px solid #9a2020", color: "#7a1010", cursor: "pointer", fontFamily: ff }}
                >
                  ⚠️ 회원탈퇴
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
