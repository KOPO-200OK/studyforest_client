import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Circle, MessageCircle, PenLine, BarChart2,
  BookOpen, Bell, Send, Target, ChevronRight,
  Clock, Play, Pause, RotateCcw,
} from "lucide-react";

// ── 맵: 공숲 (시간대별 이미지) ─────────────────────────────────────
import morningImg   from "@/imports/forest/image-3.png";
import afternoonImg from "@/imports/forest/image-7.png";
import eveningImg   from "@/imports/forest/image-5.png";

// ── 맵: 서당 (시간대별 이미지) ─────────────────────────────────────
import seodangMorningImg   from "@/imports/Seodang/dang_1.png";
import seodangAfternoonImg from "@/imports/Seodang/dang_2.png";
import seodangEveningImg   from "@/imports/Seodang/dang_3.png";

// ── 맵: 카페 (시간대별 이미지) ─────────────────────────────────────
import cafeMorningImg   from "@/imports/cafe/cafe_1.png";
import cafeAfternoonImg from "@/imports/cafe/cafe_2.png";
import cafeEveningImg   from "@/imports/cafe/cafe_3.png";

// ── 맵: 오피스 (시간대별 이미지) ───────────────────────────────────
import saMorningImg   from "@/imports/sa/sa_1.png";
import saAfternoonImg from "@/imports/sa/sa_2.png";
import saEveningImg   from "@/imports/sa/sa_3.png";

// ── 캐릭터 스프라이트 시트 (charId → 이미지) ─────────────────────
// 8방향 시트: 4열 × 2행
// col/row: 0=정면, 1=뒤, 2=앞우, 3=우, 4=앞좌, 5=뒤좌, 6=뒤우, 7=우
import sheet2 from "@/imports/image-6.png"; // 선사시대 여

const SPRITE_SHEETS: Partial<Record<number, string>> = {
  2: sheet2,
  // 나머지 캐릭터는 이미지 추가 시 여기에 등록
};

// ── 캐릭터 방향별 누끼컷 (charId → 방향번호 → 이미지) ─────────────
// 방향 번호 1~8: 0도=12시 방향(후면)에서 시계방향으로 45°씩 증가
// 1=후면 2=뒤우 3=우측 4=앞우 5=정면 6=앞좌 7=좌측 8=뒤좌
// (일부 캐릭터는 4번 방향 원본이 없어 비워둠 — 어떤 좌석도 4번을 쓰지 않아 문제없음)

// 1. 선사시대 남
import c1d1 from "@/imports/character_cuts_outer_only_all/prehistoric_male/trimmed/석기_남_1.png";
import c1d2 from "@/imports/character_cuts_outer_only_all/prehistoric_male/trimmed/석기_남_2.png";
import c1d3 from "@/imports/character_cuts_outer_only_all/prehistoric_male/trimmed/석기_남_3.png";
import c1d5 from "@/imports/character_cuts_outer_only_all/prehistoric_male/trimmed/석기_남_5.png";
import c1d6 from "@/imports/character_cuts_outer_only_all/prehistoric_male/trimmed/석기_남_6.png";
import c1d7 from "@/imports/character_cuts_outer_only_all/prehistoric_male/trimmed/석기_남_7.png";
import c1d8 from "@/imports/character_cuts_outer_only_all/prehistoric_male/trimmed/석기_남_8.png";

// 2. 선사시대 여
import c2d1 from "@/imports/character_cuts_outer_only_all/prehistoric_female/trimmed/석기_여_1.png";
import c2d2 from "@/imports/character_cuts_outer_only_all/prehistoric_female/trimmed/석기_여_2.png";
import c2d3 from "@/imports/character_cuts_outer_only_all/prehistoric_female/trimmed/석기_여_3.png";
import c2d4 from "@/imports/character_cuts_outer_only_all/prehistoric_female/trimmed/석기_여_4.png";
import c2d5 from "@/imports/character_cuts_outer_only_all/prehistoric_female/trimmed/석기_여_5.png";
import c2d6 from "@/imports/character_cuts_outer_only_all/prehistoric_female/trimmed/석기_여_6.png";
import c2d7 from "@/imports/character_cuts_outer_only_all/prehistoric_female/trimmed/석기_여_7.png";
import c2d8 from "@/imports/character_cuts_outer_only_all/prehistoric_female/trimmed/석기_여_8.png";

// 3. 화랑 남
import c3d1 from "@/imports/character_cuts_outer_only_all/hwarang_male/trimmed/화랑_남_1.png";
import c3d2 from "@/imports/character_cuts_outer_only_all/hwarang_male/trimmed/화랑_남_2.png";
import c3d3 from "@/imports/character_cuts_outer_only_all/hwarang_male/trimmed/화랑_남_3.png";
import c3d5 from "@/imports/character_cuts_outer_only_all/hwarang_male/trimmed/화랑_남_5.png";
import c3d6 from "@/imports/character_cuts_outer_only_all/hwarang_male/trimmed/화랑_남_6.png";
import c3d7 from "@/imports/character_cuts_outer_only_all/hwarang_male/trimmed/화랑_남_7.png";
import c3d8 from "@/imports/character_cuts_outer_only_all/hwarang_male/trimmed/화랑_남_8.png";

// 4. 화랑 여
import c4d1 from "@/imports/character_cuts_outer_only_all/hwarang_female/trimmed/화랑_여_1.png";
import c4d2 from "@/imports/character_cuts_outer_only_all/hwarang_female/trimmed/화랑_여_2.png";
import c4d3 from "@/imports/character_cuts_outer_only_all/hwarang_female/trimmed/화랑_여_3.png";
import c4d5 from "@/imports/character_cuts_outer_only_all/hwarang_female/trimmed/화랑_여_5.png";
import c4d6 from "@/imports/character_cuts_outer_only_all/hwarang_female/trimmed/화랑_여_6.png";
import c4d7 from "@/imports/character_cuts_outer_only_all/hwarang_female/trimmed/화랑_여_7.png";
import c4d8 from "@/imports/character_cuts_outer_only_all/hwarang_female/trimmed/화랑_여_8.png";

// 5. 유생 남
import c5d1 from "@/imports/character_cuts_outer_only_all/scholar_male/trimmed/유생_남_1.png";
import c5d2 from "@/imports/character_cuts_outer_only_all/scholar_male/trimmed/유생_남_2.png";
import c5d3 from "@/imports/character_cuts_outer_only_all/scholar_male/trimmed/유생_남_3.png";
import c5d4 from "@/imports/character_cuts_outer_only_all/scholar_male/trimmed/유생_남_4.png";
import c5d5 from "@/imports/character_cuts_outer_only_all/scholar_male/trimmed/유생_남_5.png";
import c5d6 from "@/imports/character_cuts_outer_only_all/scholar_male/trimmed/유생_남_6.png";
import c5d7 from "@/imports/character_cuts_outer_only_all/scholar_male/trimmed/유생_남_7.png";
import c5d8 from "@/imports/character_cuts_outer_only_all/scholar_male/trimmed/유생_남_8.png";

// 6. 유생 여
import c6d1 from "@/imports/character_cuts_outer_only_all/scholar_female/trimmed/유생_여_1.png";
import c6d2 from "@/imports/character_cuts_outer_only_all/scholar_female/trimmed/유생_여_2.png";
import c6d3 from "@/imports/character_cuts_outer_only_all/scholar_female/trimmed/유생_여_3.png";
import c6d4 from "@/imports/character_cuts_outer_only_all/scholar_female/trimmed/유생_여_4.png";
import c6d5 from "@/imports/character_cuts_outer_only_all/scholar_female/trimmed/유생_여_5.png";
import c6d6 from "@/imports/character_cuts_outer_only_all/scholar_female/trimmed/유생_여_6.png";
import c6d7 from "@/imports/character_cuts_outer_only_all/scholar_female/trimmed/유생_여_7.png";
import c6d8 from "@/imports/character_cuts_outer_only_all/scholar_female/trimmed/유생_여_8.png";

// 7. 개화기 남
import c7d1 from "@/imports/character_cuts_outer_only_all/modern_male/trimmed/근대_남_1.png";
import c7d2 from "@/imports/character_cuts_outer_only_all/modern_male/trimmed/근대_남_2.png";
import c7d3 from "@/imports/character_cuts_outer_only_all/modern_male/trimmed/근대_남_3.png";
import c7d4 from "@/imports/character_cuts_outer_only_all/modern_male/trimmed/근대_남_4.png";
import c7d5 from "@/imports/character_cuts_outer_only_all/modern_male/trimmed/근대_남_5.png";
import c7d6 from "@/imports/character_cuts_outer_only_all/modern_male/trimmed/근대_남_6.png";
import c7d7 from "@/imports/character_cuts_outer_only_all/modern_male/trimmed/근대_남_7.png";
import c7d8 from "@/imports/character_cuts_outer_only_all/modern_male/trimmed/근대_남_8.png";

// 8. 개화기 여
import c8d1 from "@/imports/character_cuts_outer_only_all/modern_female/trimmed/근대_여_1.png";
import c8d2 from "@/imports/character_cuts_outer_only_all/modern_female/trimmed/근대_여_2.png";
import c8d3 from "@/imports/character_cuts_outer_only_all/modern_female/trimmed/근대_여_3.png";
import c8d4 from "@/imports/character_cuts_outer_only_all/modern_female/trimmed/근대_여_4.png";
import c8d5 from "@/imports/character_cuts_outer_only_all/modern_female/trimmed/근대_여_5.png";
import c8d6 from "@/imports/character_cuts_outer_only_all/modern_female/trimmed/근대_여_6.png";
import c8d7 from "@/imports/character_cuts_outer_only_all/modern_female/trimmed/근대_여_7.png";
import c8d8 from "@/imports/character_cuts_outer_only_all/modern_female/trimmed/근대_여_8.png";

const CUTOUT_SPRITES: Partial<Record<number, Partial<Record<number, string>>>> = {
  1: { 1: c1d1, 2: c1d2, 3: c1d3, 5: c1d5, 6: c1d6, 7: c1d7, 8: c1d8 },
  2: { 1: c2d1, 2: c2d2, 3: c2d3, 4: c2d4, 5: c2d5, 6: c2d6, 7: c2d7, 8: c2d8 },
  3: { 1: c3d1, 2: c3d2, 3: c3d3, 5: c3d5, 6: c3d6, 7: c3d7, 8: c3d8 },
  4: { 1: c4d1, 2: c4d2, 3: c4d3, 5: c4d5, 6: c4d6, 7: c4d7, 8: c4d8 },
  5: { 1: c5d1, 2: c5d2, 3: c5d3, 4: c5d4, 5: c5d5, 6: c5d6, 7: c5d7, 8: c5d8 },
  6: { 1: c6d1, 2: c6d2, 3: c6d3, 4: c6d4, 5: c6d5, 6: c6d6, 7: c6d7, 8: c6d8 },
  7: { 1: c7d1, 2: c7d2, 3: c7d3, 4: c7d4, 5: c7d5, 6: c7d6, 7: c7d7, 8: c7d8 },
  8: { 1: c8d1, 2: c8d2, 3: c8d3, 4: c8d4, 5: c8d5, 6: c8d6, 7: c8d7, 8: c8d8 },
};

// 누끼컷은 이미지 여백을 딱 맞게 잘라둔 상태라 고정 높이로 렌더링 — 좌석 좌표와의
// 정렬 계산(translateY)이 매번 달라지지 않도록 size prop과 무관하게 고정한다.
const CUTOUT_HEIGHT = 70;

// 좌석별 방향 번호 (좌석/벤치가 놓인 방향 — 캐릭터와 무관하게 고정)
function getSeatDirection(seatId: number): number {
  if (seatId >= 101) return 1;                                                          // 서당: 전원 선생님(정면 상단)을 바라봄 = 후면
  if ([1, 10].includes(seatId)) return 5;                                              // 정면
  if ([2, 3, 4, 5, 6, 7, 8, 9, 14, 15, 20, 21].includes(seatId)) return 1;              // 후면
  if ([11, 18, 23].includes(seatId)) return 7;                                          // 왼쪽 보기
  if ([12, 24].includes(seatId)) return 3;                                              // 오른쪽 보기
  if ([13, 19].includes(seatId)) return 2;
  if ([16, 17, 22].includes(seatId)) return 8;
  return 5;
}

import ProfileAvatar from "@/components/ProfileAvatar";
import { mockAuthApi } from "@/api/mockAuthApi";
import { mockNoticeApi } from "@/api/mockNoticeApi";
import { isJangwonWinner } from "@/data/jangwonWinners";
import { CHARACTERS } from "@/data/characters";
import { getDisabledSeatIds } from "@/data/seatConfig";
import { useSidebar } from "@/context/SidebarContext";
import { ApiError } from "@/api/client";
import { studySpaceApi, type StudyChannel, type StudyRoom } from "@/api/studySpaceApi";

// 스프라이트 시트: 4열 × 2행 배치
const SHEET_COLS = 4;
const SHEET_ROWS = 2;

// 좌석 구역별 방향 (col, row)
// 정면(앞) = col0,row0 / 뒤 = col1,row0 / 앞우 = col2,row0 / 우 = col3,row0
function getSeatOrientation(seatId: number): [number, number] {
  if (seatId <= 5)  return [0, 0]; // 집중의 숲 상단 - 정면
  if (seatId <= 10) return [0, 1]; // 집중의 숲 하단 - 정면(하)
  if (seatId === 11) return [2, 0]; // 계곡가 - 앞우
  if (seatId <= 14) return [0, 0]; // 집현전 북쪽
  if (seatId <= 16) return [0, 1]; // 집현전 남쪽
  if (seatId <= 18) return [3, 0]; // 집현전 우측
  if (seatId === 24) return [0, 0]; // 세계수 좌
  if (seatId >= 22) return [3, 0]; // 세계수 우
  return [2, 0];                   // 세계수 중간
}

// 누끼컷 → 스프라이트 시트 → SVG 순으로 폴백
function SeatSprite({ charId, seatId, size = 56 }: {
  charId: number; seatId: number; size?: number;
}) {
  const cutouts = CUTOUT_SPRITES[charId];
  if (cutouts) {
    const cutoutSrc = cutouts[getSeatDirection(seatId)];
    if (cutoutSrc) {
      return <img src={cutoutSrc} alt="" style={{ height: CUTOUT_HEIGHT, width: "auto", display: "block" }} />;
    }
  }

  const sheetSrc = SPRITE_SHEETS[charId];
  if (!sheetSrc) return <CharSVG id={charId} size={size} />;
  const [col, row] = getSeatOrientation(seatId);
  const sw = size;
  const sh = Math.round(size * (200 / 150)); // 스프라이트 셀 비율 3:4
  return (
    <div style={{ width: sw, height: sh, overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <img src={sheetSrc} style={{
        position: "absolute",
        width: sw * SHEET_COLS,
        height: sh * SHEET_ROWS,
        left: -(col * sw),
        top: -(row * sh),
        imageRendering: "pixelated",
      }} />
    </div>
  );
}

type TimeOfDay = "morning" | "afternoon" | "evening";

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  return "evening";
}

// 시간대별 공통 연출(필터/오버레이/배경색) — 이미지 자체는 맵마다 따로 등록(MAPS.timeImages)
const TIME_META: Record<TimeOfDay, {
  label: string; emoji: string;
  filter: string; overlay: string; bg: string;
}> = {
  morning: {
    label: "아침", emoji: "🌅",
    filter: "none",
    overlay: "transparent",
    bg: "#3a5a2a",
  },
  afternoon: {
    label: "오후", emoji: "☀️",
    filter: "none",
    overlay: "transparent",
    bg: "#2a4a1e",
  },
  evening: {
    label: "저녁", emoji: "🌙",
    filter: "none",
    overlay: "transparent",
    bg: "#0e0a18",
  },
};

interface Todo { id: number; text: string; }

const TODOS: Todo[] = [
  { id: 1, text: "구석기~청동기 개념 정리" },
  { id: 2, text: "삼국시대 왕 계보 암기" },
  { id: 3, text: "고려시대 오답 정리" },
  { id: 4, text: "조선시대 사화 문제 풀기" },
  { id: 5, text: "근현대 모의고사 1회" },
];

const ERA_SCORES = [
  { era: "선사/고조선", score: 78 },
  { era: "삼국/남북국", score: 62 },
  { era: "고려", score: 44 },
  { era: "조선", score: 71 },
  { era: "근현대", score: 53 },
];

const WRONG_ANSWERS = [
  { era: "고려", q: "무신정변의 원인", n: 4 },
  { era: "조선", q: "4대 사화 순서", n: 2 },
  { era: "삼국", q: "삼국 통일 과정", n: 2 },
  { era: "근현대", q: "일제강점기 독립운동", n: 3 },
];

const ZONES = [
  { id: 1, emoji: "🌲", name: "집중의 숲", sub: "1인 몰입 학습존", top: "8%", left: "4%" },
  { id: 2, emoji: "🌸", name: "세계수 광장", sub: "휴식 · 커뮤니티", top: "8%", left: "54%" },
  { id: 3, emoji: "💧", name: "계곡가 자유존", sub: "AI질문 · 오답정리", top: "56%", left: "4%" },
  { id: 4, emoji: "📚", name: "집현전 공터", sub: "그룹스터디 · 출석", top: "56%", left: "54%" },
];

const ff = "'Noto Sans KR',sans-serif";
const fs = "'Noto Serif KR',serif";

// ── 색상 팔레트 (채도 낮춤) ────────────────────────────────────
const C = {
  hanji:    "linear-gradient(160deg,#ede8d8 0%,#e0d8c4 50%,#d8d0bc 100%)", // 한지 (회베이지)
  hanjiB:   "#b8a880",   // 한지 테두리
  hanjiSh:  "#7a6040",   // 한지 그림자
  wood:     "linear-gradient(90deg,#5a3a18,#7a5030)", // 나무 헤더
  woodB:    "#3a2010",   // 나무 테두리
  inkDark:  "#241408",   // 먹색 텍스트
  inkMid:   "#6a4e28",   // 중간 갈색 텍스트
  inkLight: "#9a8060",   // 연한 갈색
  fg:       "#ccc0a8",   // 사이드바 텍스트
  green:    "linear-gradient(135deg,#2e5224,#1c3818)", // 녹색 버튼
  greenTx:  "#90b878",   // 녹색 버튼 텍스트
  greenB:   "#162e10",
  blue:     "linear-gradient(135deg,#243d6a,#162448)", // 파랑 버튼
  blueTx:   "#88aad0",
  blueB:    "#101c38",
  red:      "linear-gradient(135deg,#8a2828,#681818)",  // 빨강 버튼
  redTx:    "#d8b0b0",
  redB:     "#400808",
  sidebarBg:"linear-gradient(180deg,rgba(10,6,2,0.96),rgba(16,10,4,0.94))",
  sidebarBr:"#3a2008",
  navBg:    "linear-gradient(90deg,#120804,#16100a,#120804)",
  navBr:    "#6a4020",
  mapBg:    "#1e3614",
  active:   "#c8a030",   // 활성 텍스트 (금색, 낮춤)
};

/* ── Shared primitives ────────────────────────────────────────── */
function Bar({ pct, color = "#4a8030" }: { pct: number; color?: string }) {
  return (
    <div style={{ background: "#c8a860", border: "1px solid #9a7830", height: 8, position: "relative", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${color},${color}aa)`, transition: "width 0.4s", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)" }} />
      {[25, 50, 75].map(t => <div key={t} style={{ position: "absolute", left: `${t}%`, top: 0, bottom: 0, width: 1, background: "rgba(0,0,0,0.15)" }} />)}
    </div>
  );
}

function Panel({ title, icon, children, accent }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; accent?: string;
}) {
  const hdrBg = accent ?? C.wood;
  return (
    <div style={{ background: C.hanji, border: `2px solid ${C.hanjiB}`, boxShadow: `0 3px 0 ${C.hanjiSh}, 0 5px 16px rgba(0,0,0,0.3)` }}>
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: hdrBg, borderBottom: `2px solid rgba(0,0,0,0.28)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
        <span style={{ color: "#c8a030", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>{icon}</span>
        <span style={{ color: "#ddd0b8", fontFamily: fs, fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{title}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {[0, 1].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: 1, background: "#1e0e04", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }} />)}
        </div>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

/* ── Shared card contents ─────────────────────────────────────── */
function TodoContent({ todos, remove, add }: { todos: Todo[]; remove: (id: number) => void; add: (text: string) => void }) {
  const [input, setInput] = useState("");

  const submit = () => {
    const t = input.trim();
    if (!t) return;
    add(t);
    setInput("");
  };

  return (
    <>
      {/* Add input */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="할 일 추가..."
          style={{ flex: 1, fontSize: 11, padding: "6px 8px", background: "rgba(240,220,160,0.45)", border: "1px solid #c4a060", outline: "none", color: "#2a1808", fontFamily: ff }}
        />
        <button onClick={submit} style={{ padding: "6px 10px", background: "linear-gradient(135deg,#3a6030,#245020)", color: "#c0f0a0", border: "2px solid #1a3010", boxShadow: "2px 2px 0 #0e2008", cursor: "pointer", fontSize: 16, lineHeight: 1, fontWeight: 700 }}>+</button>
      </div>

      {/* List */}
      {todos.length === 0 && (
        <div style={{ fontSize: 11, color: "#9a7040", textAlign: "center", padding: "12px 0", fontFamily: ff }}>할 일이 없습니다 🎉</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {todos.map(t => (
          <button key={t.id} onClick={() => remove(t.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", cursor: "pointer", background: "rgba(139,94,60,0.07)", border: "1px solid #c4a060", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)", textAlign: "left", width: "100%" }}>
            <Circle size={14} style={{ color: "#c4a060", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#2a1808", fontFamily: ff, lineHeight: 1.4 }}>{t.text}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function WrongContent() {
  return (
    <>
      {WRONG_ANSWERS.map((wa, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 0", fontSize: 11, borderBottom: i < WRONG_ANSWERS.length - 1 ? "1px solid #e4cc88" : "none", fontFamily: ff }}>
          <span style={{ padding: "2px 6px", fontSize: 10, flexShrink: 0, background: "#f0e0c0", border: "1px solid #c4a060", color: "#5a3010", fontWeight: 700, boxShadow: "1px 1px 0 #9a7030" }}>{wa.era}</span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#2a1808" }}>{wa.q}</span>
          <span style={{ padding: "2px 7px", fontSize: 10, fontWeight: 700, flexShrink: 0, background: "linear-gradient(135deg,#c04040,#a02020)", color: "white", border: "1px solid #8a1818", boxShadow: "1px 1px 0 #4a0808" }}>{wa.n}회</span>
        </div>
      ))}
      <button style={{ marginTop: 8, width: "100%", fontSize: 11, padding: "6px", background: "rgba(139,94,60,0.1)", border: "1px solid #c4a060", color: "#5a3010", cursor: "pointer", fontFamily: ff, fontWeight: 600 }}>
        오답노트 전체 보기 →
      </button>
    </>
  );
}

function WeakEraContent() {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ERA_SCORES.map((e, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: ff }}>
              <span style={{ fontSize: 11, color: "#2a1808" }}>{e.era}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: e.score < 60 ? "#c04040" : e.score < 70 ? "#c07020" : "#4a8030" }}>{e.score}점</span>
            </div>
            <Bar pct={e.score} color={e.score < 60 ? "#c04040" : e.score < 70 ? "#c07020" : "#4a8030"} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 10, padding: "7px 9px", background: "rgba(192,64,64,0.09)", border: "1px solid #e0a8a8", color: "#8a2020", fontFamily: ff }}>
        ⚠️ 고려시대 집중 학습이 필요합니다
      </div>
    </>
  );
}

/* ── Zone sign for map ────────────────────────────────────────── */
function ZoneSign({ emoji, name, sub }: { emoji: string; name: string; sub: string }) {
  return (
    <div className="group cursor-pointer" style={{ background: "linear-gradient(135deg,#9a6030,#7a4a1a)", border: "2px solid #4a2808", boxShadow: "3px 3px 0 #2a1406, 0 6px 20px rgba(0,0,0,0.5)", padding: "6px 10px", minWidth: 140, position: "relative" }}>
      <div style={{ position: "absolute", top: 3, left: 5, width: 5, height: 5, background: "#2a1406", borderRadius: 1 }} />
      <div style={{ position: "absolute", top: 3, right: 5, width: 5, height: 5, background: "#2a1406", borderRadius: 1 }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.07, background: "repeating-linear-gradient(90deg,transparent 0px,transparent 4px,rgba(0,0,0,1) 4px,rgba(0,0,0,1) 5px)" }} />
      <div className="relative flex items-center gap-1.5">
        <span style={{ fontSize: 14 }}>{emoji}</span>
        <div>
          <div style={{ color: "#f8e8c0", fontFamily: fs, fontWeight: 700, fontSize: 12, textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>{name}</div>
          <div style={{ color: "#d4b88a", fontSize: 9.5, marginTop: 1, fontFamily: ff }}>{sub}</div>
        </div>
        <ChevronRight size={10} style={{ color: "#d4b88a", marginLeft: "auto" }} />
      </div>
    </div>
  );
}

/* ── Top nav ──────────────────────────────────────────────────── */
function Nav({ page, setPage }: { page: string; setPage: (p: string) => void }) {
  const NAV_ITEMS = ["스터디룸", "문제은행", "나의 공부", "장원급제", "관리자"];
  return (
    <nav style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 16px", gap: 4, zIndex: 50, background: C.navBg, borderBottom: `3px solid ${C.navBr}`, boxShadow: `0 3px 0 ${C.sidebarBr}, 0 4px 20px rgba(0,0,0,0.65)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 20 }}>
        <span style={{ fontSize: 22, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))", lineHeight: 1 }}>🌲</span>
        <span style={{ fontFamily: fs, fontWeight: 700, fontSize: 18, color: "#f5e6c8", textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}>공숲</span>
        <span style={{ fontSize: 10, padding: "2px 6px", background: "#7a4f2e", color: "#f5c842", border: "1px solid #c4a060", fontWeight: 700, boxShadow: "1px 1px 0 #3a2010" }}>한국사</span>
      </div>
      {NAV_ITEMS.map((item, i) => {
        const key = item;
        const active = page === key;
        return (
          <button key={i} onClick={() => setPage(key)} style={{ padding: "5px 12px", fontSize: 13, color: active ? C.active : "#887060", fontWeight: active ? 700 : 400, background: active ? "rgba(200,160,48,0.1)" : "transparent", border: active ? "1px solid rgba(200,160,48,0.22)" : "1px solid transparent", cursor: "pointer", fontFamily: ff }}>
            {item}
          </button>
        );
      })}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <Bell size={17} style={{ color: "#c8a060", cursor: "pointer" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", background: "rgba(139,94,60,0.22)", border: "1px solid #8b5e3c", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 1px 1px 0 #3a2010" }}>
          <span style={{ fontSize: 16 }}>🧑‍🎓</span>
          <span style={{ fontSize: 13, color: "#f5e6c8", fontFamily: ff }}>역사왕123</span>
          <span style={{ fontSize: 10, padding: "2px 6px", background: "#2c4a7c", color: "#a0c0f0", border: "1px solid #1e3060", fontWeight: 700 }}>Lv.7</span>
        </div>
      </div>
    </nav>
  );
}

/* ── HOME PAGE ────────────────────────────────────────────────── */
export function HomePage({ todos, remove, add, aiInput, setAiInput }: {
  todos: Todo[]; remove: (id: number) => void; add: (text: string) => void;
  aiInput: string; setAiInput: (v: string) => void;
}) {
  const navigate = useNavigate();
  const nickname = mockAuthApi.getCurrentAccount()?.nickname ?? "학습자";
  return (
    <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "auto" }}>
      {/* Map as blurred hero background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <img src={afternoonImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated", filter: "brightness(0.35) blur(2px)", transform: "scale(1.04)" }} />
      </div>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "linear-gradient(180deg,rgba(10,20,6,0.6) 0%,rgba(10,20,6,0.82) 100%)" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "28px 24px 32px" }}>

        {/* Greeting header */}
        <div style={{ marginBottom: 28, padding: "20px 28px", background: "linear-gradient(135deg,rgba(139,94,60,0.22),rgba(90,48,16,0.18))", border: "2px solid #8b5e3c", boxShadow: "0 4px 0 #4a2808, 0 8px 32px rgba(0,0,0,0.45)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 28 }}>🧑‍🎓</span>
                <div>
                  <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 20, color: "#f5e6c8", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                    {nickname}님, 오늘도 화이팅!
                  </div>
                  <div style={{ fontSize: 12, color: "#c8a060", fontFamily: ff, marginTop: 2 }}>
                    한양생 Lv.7 · 오늘 공부시간 <strong style={{ color: "#f5c842" }}>2h 34m</strong>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { label: "오늘 학습", value: "2h 34m", color: "#f5c842" },
                { label: "이번 주", value: "14h 22m", color: "#90d070" },
                { label: "경험치", value: "2,840", color: "#a0c0f0" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center", padding: "8px 16px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(139,94,60,0.4)" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#9a8060", marginTop: 2, fontFamily: ff }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3-column cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

          {/* 오늘 할 일 */}
          <Panel title="오늘 할 일" icon={<CheckCircle2 size={14} />} accent="#3a1e50">
            <TodoContent todos={todos} remove={remove} add={add} />
          </Panel>

          {/* 오답노트 */}
          <Panel title="오답노트" icon={<PenLine size={14} />} accent="#3a1818">
            <WrongContent />
          </Panel>

          {/* 취약 시대 분석 */}
          <Panel title="취약 시대 분석" icon={<BarChart2 size={14} />} accent="#1a3a2a">
            <WeakEraContent />
          </Panel>
        </div>

        {/* AI 질문 */}
        <div style={{ marginTop: 16 }}>
          <Panel title="AI 질문하기" icon={<MessageCircle size={14} />} accent="#1a2a5a">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input value={aiInput} onChange={e => setAiInput(e.target.value)}
                placeholder="한국사에 대해 무엇이든 질문하세요..."
                style={{ flex: 1, fontSize: 12, padding: "8px 12px", background: "rgba(240,220,160,0.45)", border: "1px solid #c4a060", outline: "none", color: "#2a1808", fontFamily: ff }} />
              <button style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#2c4a7c,#1a2e60)", color: "#a0c0f0", border: "2px solid #1a2a50", boxShadow: "2px 2px 0 #0a1430", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: ff }}>
                <Send size={13} />질문하기
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {["고려 무신정권의 특징은?", "조선시대 4대 사화 순서", "임진왜란 3대 대첩은?", "삼국통일 과정을 설명해줘"].map((q, i) => (
                <button key={i} onClick={() => setAiInput(q)} style={{ fontSize: 10, padding: "4px 10px", background: "rgba(44,74,124,0.15)", border: "1px solid #4a6a9a", color: "#6090c0", cursor: "pointer", fontFamily: ff }}>
                  {q}
                </button>
              ))}
            </div>
          </Panel>
        </div>

        {/* Quick nav to study room */}
        <div style={{ marginTop: 16, padding: "14px 20px", background: "rgba(58,96,48,0.2)", border: "2px solid #4a7030", boxShadow: "0 3px 0 #2a4010", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🗺️</span>
            <div>
              <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 13, color: "#f5e6c8" }}>공숲 학습 맵으로 이동</div>
              <div style={{ fontSize: 11, color: "#9aaa80", fontFamily: ff }}>4개 구역에서 다양한 방식으로 학습해보세요</div>
            </div>
          </div>
          <button onClick={() => navigate("/study-room")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "linear-gradient(135deg,#3a6030,#245020)", color: "#c0f0a0", border: "2px solid #1a3010", boxShadow: "2px 3px 0 #0e2008", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: ff }}>
            스터디룸 입장 <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Seat system ──────────────────────────────────────────────── */
type SeatStatus = "available" | "selected" | "occupied" | "disabled";
interface Seat { id: number; serverId?: number; x: number; y: number; zone: string; status: SeatStatus; }

const MAP_W = 1022;
const MAP_H = 620;

export const RAW_SEATS: Omit<Seat, "status">[] = [
  { id: 1,  x: 86,  y: 145, zone: "집중의 숲" },
  { id: 2,  x: 88,  y: 190, zone: "집중의 숲" },
  { id: 3,  x: 188, y: 158, zone: "집중의 숲" },
  { id: 4,  x: 350, y: 190, zone: "집중의 숲" },
  { id: 5,  x: 465, y: 185, zone: "집중의 숲" },
  { id: 6,  x: 463, y: 272, zone: "집중의 숲" },
  { id: 7,  x: 349, y: 305, zone: "집중의 숲" },
  { id: 8,  x: 175, y: 304, zone: "집중의 숲" },
  { id: 9,  x: 87,  y: 304, zone: "집중의 숲" },
  { id: 10, x: 84,  y: 262, zone: "집중의 숲" },
  { id: 11, x: 500, y: 525, zone: "계곡가 자유존" },
  { id: 12, x: 667, y: 455, zone: "집현전 공터" },
  { id: 13, x: 667, y: 497, zone: "집현전 공터" },
  { id: 14, x: 726, y: 529, zone: "집현전 공터" },
  { id: 15, x: 784, y: 532, zone: "집현전 공터" },
  { id: 16, x: 845, y: 529, zone: "집현전 공터" },
  { id: 17, x: 902, y: 506, zone: "집현전 공터" },
  { id: 18, x: 905, y: 471, zone: "집현전 공터" },
  { id: 19, x: 698, y: 275, zone: "세계수 광장" },
  { id: 20, x: 755, y: 295, zone: "세계수 광장" },
  { id: 21, x: 855, y: 298, zone: "세계수 광장" },
  { id: 22, x: 918, y: 263, zone: "세계수 광장" },
  { id: 23, x: 961, y: 214, zone: "세계수 광장" },
  { id: 24, x: 642, y: 217, zone: "세계수 광장" },
];

// 서당 맵 좌석 (2줄 × 10칸, id 101~120 — 공숲 좌석 id와 겹치지 않게 구분)
export const SEODANG_SEATS: Omit<Seat, "status">[] = [
  { id: 101, x: 88,  y: 327, zone: "서당 앞줄" },
  { id: 102, x: 179, y: 327, zone: "서당 앞줄" },
  { id: 103, x: 265, y: 327, zone: "서당 앞줄" },
  { id: 104, x: 353, y: 327, zone: "서당 앞줄" },
  { id: 105, x: 451, y: 327, zone: "서당 앞줄" },
  { id: 106, x: 579, y: 327, zone: "서당 앞줄" },
  { id: 107, x: 673, y: 327, zone: "서당 앞줄" },
  { id: 108, x: 766, y: 327, zone: "서당 앞줄" },
  { id: 109, x: 859, y: 327, zone: "서당 앞줄" },
  { id: 110, x: 947, y: 327, zone: "서당 앞줄" },
  { id: 111, x: 88,  y: 410, zone: "서당 뒷줄" },
  { id: 112, x: 181, y: 410, zone: "서당 뒷줄" },
  { id: 113, x: 265, y: 410, zone: "서당 뒷줄" },
  { id: 114, x: 353, y: 410, zone: "서당 뒷줄" },
  { id: 115, x: 448, y: 410, zone: "서당 뒷줄" },
  { id: 116, x: 579, y: 410, zone: "서당 뒷줄" },
  { id: 117, x: 673, y: 410, zone: "서당 뒷줄" },
  { id: 118, x: 763, y: 410, zone: "서당 뒷줄" },
  { id: 119, x: 854, y: 410, zone: "서당 뒷줄" },
  { id: 120, x: 942, y: 410, zone: "서당 뒷줄" },
];

// 카페 맵 좌석 (id 201~) — 1차 배치, 실측 후 미세조정 필요
export const CAFE_SEATS: Omit<Seat, "status">[] = [
  // 창가 2인석 (2줄) — 새 카페 이미지 기준 재배치
  { id: 201, x: 177, y: 257, zone: "카페 창가" },
  { id: 202, x: 272, y: 257, zone: "카페 창가" },
  { id: 203, x: 167, y: 347, zone: "카페 창가" },
  { id: 204, x: 251, y: 358, zone: "카페 창가" },
  // 안쪽 2인석
  { id: 205, x: 108, y: 439, zone: "카페 안쪽" },
  { id: 206, x: 191, y: 447, zone: "카페 안쪽" },
  { id: 207, x: 76,  y: 536, zone: "카페 안쪽" },
  { id: 208, x: 162, y: 545, zone: "카페 안쪽" },
  // 단체석 (긴 테이블)
  { id: 209, x: 324, y: 293, zone: "카페 단체석" },
  { id: 210, x: 435, y: 293, zone: "카페 단체석" },
  { id: 211, x: 324, y: 356, zone: "카페 단체석" },
  { id: 212, x: 435, y: 356, zone: "카페 단체석" },
  { id: 213, x: 324, y: 409, zone: "카페 단체석" },
  { id: 214, x: 435, y: 409, zone: "카페 단체석" },
  { id: 215, x: 324, y: 466, zone: "카페 단체석" },
  { id: 216, x: 435, y: 466, zone: "카페 단체석" },
  // 라운지 (소파)
  { id: 217, x: 731, y: 285, zone: "카페 라운지" },
  { id: 218, x: 781, y: 285, zone: "카페 라운지" },
  { id: 219, x: 826, y: 285, zone: "카페 라운지" },
  { id: 220, x: 727, y: 412, zone: "카페 라운지" },
  { id: 221, x: 778, y: 412, zone: "카페 라운지" },
  // 안쪽 테이블
  { id: 222, x: 502, y: 501, zone: "카페 테이블" },
  { id: 223, x: 562, y: 501, zone: "카페 테이블" },
  { id: 224, x: 648, y: 536, zone: "카페 테이블" },
  { id: 225, x: 692, y: 536, zone: "카페 테이블" },
  { id: 226, x: 737, y: 536, zone: "카페 테이블" },
  { id: 227, x: 807, y: 536, zone: "카페 테이블" },
  { id: 228, x: 858, y: 536, zone: "카페 테이블" },
];

// 오피스 맵 좌석 (id 301~) — 1차 배치, 실측 후 미세조정 필요
export const SA_SEATS: Omit<Seat, "status">[] = [
  // Zone 1 (원탁)
  { id: 301, x: 163, y: 160, zone: "Zone 1" },
  { id: 302, x: 259, y: 160, zone: "Zone 1" },
  { id: 303, x: 136, y: 203, zone: "Zone 1" },
  { id: 304, x: 273, y: 200, zone: "Zone 1" },
  { id: 305, x: 163, y: 247, zone: "Zone 1" },
  { id: 306, x: 256, y: 247, zone: "Zone 1" },
  // Zone 2
  { id: 307, x: 506, y: 80,  zone: "Zone 2" },
  { id: 308, x: 552, y: 80,  zone: "Zone 2" },
  { id: 309, x: 506, y: 130, zone: "Zone 2" },
  { id: 310, x: 552, y: 130, zone: "Zone 2" },
  // Zone 2-1
  { id: 311, x: 709, y: 80,  zone: "Zone 2-1" },
  { id: 312, x: 755, y: 80,  zone: "Zone 2-1" },
  { id: 313, x: 709, y: 130, zone: "Zone 2-1" },
  { id: 314, x: 755, y: 130, zone: "Zone 2-1" },
  // Zone 4
  { id: 315, x: 469, y: 290, zone: "Zone 4" },
  { id: 316, x: 562, y: 290, zone: "Zone 4" },
  { id: 317, x: 469, y: 350, zone: "Zone 4" },
  { id: 318, x: 562, y: 350, zone: "Zone 4" },
  // Zone 5
  { id: 319, x: 745, y: 307, zone: "Zone 5" },
  { id: 320, x: 765, y: 280, zone: "Zone 5" },
  { id: 321, x: 805, y: 270, zone: "Zone 5" },
  { id: 322, x: 842, y: 280, zone: "Zone 5" },
  { id: 323, x: 862, y: 307, zone: "Zone 5" },
  // 체리블라썸 허브
  { id: 324, x: 153, y: 430, zone: "체리블라썸 허브" },
  { id: 325, x: 273, y: 427, zone: "체리블라썸 허브" },
  { id: 326, x: 210, y: 477, zone: "체리블라썸 허브" },
];

// pre-occupied seats for visual context
const OCCUPIED_IDS = new Set<number>([]);

function makeSeats(rawSeats: Omit<Seat, "status">[]): Seat[] {
  const disabledIds = new Set(getDisabledSeatIds());
  return rawSeats.map(s => ({
    ...s,
    status: disabledIds.has(s.id) ? "disabled"
          : OCCUPIED_IDS.has(s.id) ? "occupied"
          : "available",
  }));
}

export type MapId = "forest" | "seodang" | "cafe" | "sa";

interface MapDef {
  id: MapId;
  label: string;
  emoji: string;
  seats: Omit<Seat, "status">[];
  hasTimeOfDay: boolean;
  staticBg?: string;
  timeImages?: Record<TimeOfDay, string>;
}

const MAPS: Record<MapId, MapDef> = {
  forest:  { id: "forest",  label: "공숲",   emoji: "🌲", seats: RAW_SEATS,     hasTimeOfDay: true,
    timeImages: { morning: morningImg, afternoon: afternoonImg, evening: eveningImg } },
  seodang: { id: "seodang", label: "서당",   emoji: "📜", seats: SEODANG_SEATS, hasTimeOfDay: true,
    timeImages: { morning: seodangMorningImg, afternoon: seodangAfternoonImg, evening: seodangEveningImg } },
  cafe:    { id: "cafe",    label: "카페",   emoji: "☕", seats: CAFE_SEATS,    hasTimeOfDay: true,
    timeImages: { morning: cafeMorningImg, afternoon: cafeAfternoonImg, evening: cafeEveningImg } },
  sa:      { id: "sa",      label: "오피스", emoji: "🏢", seats: SA_SEATS,      hasTimeOfDay: true,
    timeImages: { morning: saMorningImg, afternoon: saAfternoonImg, evening: saEveningImg } },
};

const SEAT_STYLE: Record<SeatStatus, { bg: string; border: string; text: string; glow: string }> = {
  available: { bg: "rgba(226, 242, 255, 0.8)",   border: "#141050", text: "#000000",  glow: "rgba(60,120,40,0.35)" },
  selected:  { bg: "rgba(200,168,48,0.95)", border: "#906800", text: "#241408",  glow: "rgba(200,168,48,0.4)" },
  occupied:  { bg: "rgba(94, 94, 94, 0.85)",   border: "#3a2008", text: "#c8b898",  glow: "none" },
  disabled:  { bg: "rgba(202, 0, 0, 0.65)",   border: "#222222", text: "#686868",  glow: "none" },
};

function getSeatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const messages: Record<string, string> = {
      SEAT_ALREADY_OCCUPIED: "방금 다른 사용자가 선택한 좌석입니다.",
      MEMBER_ALREADY_SEATED: "이미 이용 중인 좌석이 있습니다.",
      SEAT_NOT_IN_CHANNEL_ROOM: "현재 채널에서 선택할 수 없는 좌석입니다.",
      SEAT_NOT_FOUND: "이용 가능한 좌석을 찾을 수 없습니다.",
      ACTIVE_OCCUPANCY_NOT_FOUND: "현재 이용 중인 좌석 정보가 없습니다.",
    };
    return messages[error.code] ?? error.message;
  }
  return error instanceof Error ? error.message : "좌석 정보를 처리하지 못했습니다.";
}

function SeatMarker({ seat, isSelected, onClick }: { seat: Seat; isSelected: boolean; onClick: (id: number) => void }) {
  const status = isSelected ? "selected" : seat.status;
  const s = SEAT_STYLE[status];
  const clickable = seat.status === "available";
  return (
    <div
      onClick={() => clickable && onClick(seat.id)}
      title={`${seat.id}번 · ${seat.zone}`}
      style={{
        position: "absolute",
        left: `${(seat.x / MAP_W) * 100}%`,
        top:  `${(seat.y / MAP_H) * 100}%`,
        transform: "translate(-50%,-50%)",
        width: 32, height: 32,
        borderRadius: "50%",
        background: s.bg,
        border: `2.5px solid ${s.border}`,
        boxShadow: `0 0 0 3px ${s.glow !== "none" ? s.glow : "transparent"}, 0 3px 10px rgba(0,0,0,0.55)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: clickable ? "pointer" : "default",
        transition: "transform 0.12s, box-shadow 0.12s",
        zIndex: 20,
        userSelect: "none",
      }}
      onMouseEnter={e => { if (clickable) (e.currentTarget as HTMLElement).style.transform = "translate(-50%,-50%) scale(1.18)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translate(-50%,-50%) scale(1)"; }}
    >
      <span style={{ fontSize: 10, fontWeight: 800, color: s.text, fontFamily: ff, lineHeight: 1 }}>{seat.id}</span>
    </div>
  );
}

/* ── STUDY ROOM PAGE ──────────────────────────────────────────── */
export function StudyRoomPage({ todos, remove, add, char, setChar }: {
  todos: Todo[]; remove: (id: number) => void; add: (text: string) => void;
  char: number; setChar: (c: number) => void;
}) {
  const nickname = mockAuthApi.getCurrentAccount()?.nickname ?? "학습자";
  const { collapsed: sidebarCollapsed } = useSidebar();
  const [mapId, setMapId] = useState<MapId>("forest");
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [channels, setChannels] = useState<StudyChannel[]>([]);
  const [channel, setChannel] = useState<StudyChannel | null>(null);
  const [seats, setSeats] = useState<Seat[]>(() => makeSeats(MAPS.forest.seats));
  const [showSeats, setShowSeats] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [seatedAt, setSeatedAt] = useState<number | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay);
  const [showCharSelect, setShowCharSelect] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [todoOpen, setTodoOpen] = useState(true);
  const [studySessionId, setStudySessionId] = useState<number | null>(null);
  const [seatLoading, setSeatLoading] = useState(false);
  const [seatActionLoading, setSeatActionLoading] = useState(false);
  const [seatError, setSeatError] = useState<string | null>(null);

  const currentMap = MAPS[mapId];

  const mapNoById: Record<MapId, number> = { forest: 1, seodang: 2, cafe: 3, sa: 4 };

  useEffect(() => {
    studySpaceApi.getRooms()
      .then(setRooms)
      .catch(error => setSeatError(getSeatErrorMessage(error)));
  }, []);

  useEffect(() => {
    const room = rooms.find(item => item.mapNo === mapNoById[mapId]);
    if (!room) return;
    setSeatLoading(true);
    setSeatError(null);
    studySpaceApi.getChannels(room.studyRoomId)
      .then(items => {
        setChannels(items);
        setChannel(items[0] ?? null);
      })
      .catch(error => setSeatError(getSeatErrorMessage(error)))
      .finally(() => setSeatLoading(false));
  }, [rooms, mapId]);

  useEffect(() => {
    if (!channel) return;
    let cancelled = false;
    setSeatLoading(true);
    setSeatError(null);
    studySpaceApi.getSeats(channel.studyChannelId)
      .then(statuses => {
        if (cancelled) return;
        const statusBySeatNo = new Map(statuses.map(status => [status.seatNo, status]));
        setSeats(MAPS[mapId].seats.map(config => {
          const serverSeat = statusBySeatNo.get(config.id);
          return {
            ...config,
            serverId: serverSeat?.seatId,
            status: !serverSeat || !serverSeat.active ? "disabled"
              : serverSeat.occupied ? "occupied"
              : "available",
          };
        }));
      })
      .catch(error => !cancelled && setSeatError(getSeatErrorMessage(error)))
      .finally(() => !cancelled && setSeatLoading(false));
    return () => { cancelled = true; };
  }, [channel, mapId]);

  function handleSelectMap(id: MapId) {
    if (id === mapId || studySessionId !== null) return;
    setMapId(id);
    setSeats(makeSeats(MAPS[id].seats));
    setSelectedId(null);
    setShowSeats(false);
  }

  // ── 타이머 ──────────────────────────────────────────────────────
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerOn, setTimerOn] = useState(false);

  useEffect(() => {
    if (!timerOn) return;
    const id = setInterval(() => setTimerSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerOn]);

  useEffect(() => {
    if (studySessionId === null) return;
    const sendHeartbeat = () => {
      studySpaceApi.heartbeat(studySessionId)
        .then(tick => setTimerSecs(tick.displayElapsedSeconds))
        .catch(error => setSeatError(getSeatErrorMessage(error)));
    };
    const id = window.setInterval(sendHeartbeat, 30_000);
    return () => window.clearInterval(id);
  }, [studySessionId]);

  const fmtTimer = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };
  // ────────────────────────────────────────────────────────────────

  const timeMeta = TIME_META[timeOfDay];
  const TIME_CYCLE: TimeOfDay[] = ["morning", "afternoon", "evening"];

  const totalInitial = 5;
  const pct = Math.max(0, Math.round(((totalInitial - todos.length) / totalInitial) * 100));

  const selectedSeat = seats.find(s => s.id === selectedId) ?? null;
  const seatedSeat   = seats.find(s => s.id === seatedAt)   ?? null;

  const handleSeatClick = (id: number) => setSelectedId(prev => prev === id ? null : id);

  const handleSit = async () => {
    if (!selectedSeat?.serverId || !channel) return;
    setSeatActionLoading(true);
    setSeatError(null);
    try {
      const session = await studySpaceApi.occupySeat(channel.studyChannelId, selectedSeat.serverId);
      setSeats(ss => ss.map(s => s.id === selectedSeat.id ? { ...s, status: "occupied" } : s));
      setSeatedAt(selectedSeat.id);
      setStudySessionId(session.studySessionId);
      setTimerSecs(session.accumulatedSeconds);
      setShowSeats(false);
      setSelectedId(null);
      setTimerOn(true);
    } catch (error) {
      setSeatError(getSeatErrorMessage(error));
      const statuses = await studySpaceApi.getSeats(channel.studyChannelId).catch(() => null);
      if (statuses) {
        const occupiedIds = new Set(statuses.filter(s => s.occupied).map(s => s.seatId));
        setSeats(ss => ss.map(s => ({ ...s, status: s.serverId && occupiedIds.has(s.serverId) ? "occupied" : s.status })));
      }
    } finally {
      setSeatActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (seatedAt === null || studySessionId === null) return;
    setSeatActionLoading(true);
    setSeatError(null);
    try {
      await studySpaceApi.leaveSeat(studySessionId);
      setSeats(ss => ss.map(s => s.id === seatedAt ? { ...s, status: "available" } : s));
      setSeatedAt(null);
      setStudySessionId(null);
      setTimerOn(false);
    } catch (error) {
      setSeatError(getSeatErrorMessage(error));
    } finally {
      setSeatActionLoading(false);
    }
  };

  const ZONE_COLORS: Record<string, string> = {
    "집중의 숲":    "#2a5a18",
    "세계수 광장":  "#8a2a4a",
    "계곡가 자유존":"#1a4a6a",
    "집현전 공터":  "#6a4010",
    "서당 앞줄":    "#5a3a18",
    "서당 뒷줄":    "#3a2a14",
    "카페 창가":    "#6a4a2a",
    "카페 안쪽":    "#4a3a2a",
    "카페 단체석":  "#5a3010",
    "카페 라운지":  "#3a5a2a",
    "카페 테이블":  "#7a5020",
    "Zone 1":       "#1a5a7a",
    "Zone 2":       "#2a4a6a",
    "Zone 2-1":     "#2a4a6a",
    "Zone 4":       "#6a5a2a",
    "Zone 5":       "#7a3a2a",
    "체리블라썸 허브": "#a05070",
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex" }}>

      {/* LEFT SIDEBAR — 상단 "공숲" 로고 클릭으로 열고 닫기 */}
      {/* 바깥 래퍼가 폭만 접고, 안쪽은 항상 268px 고정이라 내용(이미지 등)이 찌그러지지 않음 */}
      <div style={{ width: sidebarCollapsed ? 0 : 268, flexShrink: 0, overflow: "hidden", transition: "width 0.22s ease" }}>
      <div style={{
        width: 268, height: "100%", flexShrink: 0, display: "flex", flexDirection: "column", gap: 10,
        padding: 10, overflowY: "auto", overflowX: "hidden",
        background: C.sidebarBg, borderRight: `3px solid ${C.sidebarBr}`,
        boxShadow: "inset -2px 0 6px rgba(0,0,0,0.35)",
      }}>

        {/* 맵 · 채널 선택 */}
        <Panel title="맵 · 채널" icon={<span style={{ fontSize: 13 }}>🗺️</span>} accent="linear-gradient(90deg,#162e12,#1e3e18)">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginBottom: 8 }}>
            {Object.values(MAPS).map(m => (
              <button key={m.id} disabled={studySessionId !== null} onClick={() => handleSelectMap(m.id)}
                style={{ padding: "6px 4px", fontSize: 11, fontWeight: 700, fontFamily: ff, cursor: studySessionId !== null ? "not-allowed" : "pointer",
                  background: mapId === m.id ? "linear-gradient(135deg,#3a6030,#1e4018)" : "rgba(139,94,60,0.12)",
                  color: mapId === m.id ? "#c0f0a0" : "#9a7040",
                  border: `2px solid ${mapId === m.id ? "#1a3010" : "#5a4020"}` }}>
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {channels.map(ch => (
              <button key={ch.studyChannelId} disabled={studySessionId !== null} onClick={() => setChannel(ch)}
                style={{ flex: 1, padding: "5px 4px", fontSize: 11, fontWeight: 700, fontFamily: ff, cursor: studySessionId !== null ? "not-allowed" : "pointer",
                  background: channel?.studyChannelId === ch.studyChannelId ? "rgba(200,160,48,0.25)" : "rgba(139,94,60,0.08)",
                  color: channel?.studyChannelId === ch.studyChannelId ? "#f5c842" : "#7a5828",
                  border: `1px solid ${channel?.studyChannelId === ch.studyChannelId ? "#c8a030" : "#5a4020"}` }}>
                {ch.channelNo}채널
              </button>
            ))}
          </div>
          {seatLoading && <div style={{ marginTop: 7, fontSize: 10, color: "#7a5828", fontFamily: ff }}>좌석 정보를 불러오는 중...</div>}
          {seatError && <div style={{ marginTop: 7, fontSize: 10, color: "#b03030", fontFamily: ff }}>{seatError}</div>}
        </Panel>

        {/* Seat entry panel */}
        <Panel title="좌석 선택" icon={<span style={{ fontSize: 13 }}>🪑</span>} accent="linear-gradient(90deg,#162e12,#1e3e18)">
          {seatedAt ? (
            <>
              <div style={{ fontSize: 11, color: "#4a8030", fontWeight: 700, marginBottom: 8, fontFamily: ff }}>
                ✅ {seatedAt}번 좌석에 착석 중
              </div>
              <div style={{ fontSize: 10, color: "#7a5828", marginBottom: 10, fontFamily: ff }}>
                구역: <strong>{seatedSeat?.zone}</strong>
              </div>
              <button disabled={seatActionLoading} onClick={handleLeave} style={{ width: "100%", padding: "8px", fontSize: 12, fontWeight: 700, background: "linear-gradient(135deg,#8b5e3c,#6a3a1a)", color: "#f5e6c8", border: "2px solid #5a3010", boxShadow: "2px 2px 0 #3a1808", cursor: seatActionLoading ? "wait" : "pointer", fontFamily: ff }}>
                {seatActionLoading ? "처리 중..." : "🚪 퇴장하기"}
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 11, color: "#9a7040", marginBottom: 8, fontFamily: ff }}>
                원하는 구역의 빈 좌석을 선택하세요
              </div>
              <button
                onClick={() => { setShowSeats(s => !s); setSelectedId(null); }}
                style={{ width: "100%", padding: "8px", fontSize: 12, fontWeight: 700, background: showSeats ? "linear-gradient(135deg,#8b5e3c,#5a3010)" : "linear-gradient(135deg,#3a6030,#1e4018)", color: showSeats ? "#f5e6c8" : "#c0f0a0", border: `2px solid ${showSeats ? "#4a2808" : "#1a3010"}`, boxShadow: `2px 2px 0 ${showSeats ? "#2a1006" : "#0e2008"}`, cursor: "pointer", fontFamily: ff }}>
                {showSeats ? "🙈 좌석 숨기기" : "🗺️ 입장하기"}
              </button>

              {/* Legend */}
              {showSeats && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                  {(["available", "selected", "occupied", "disabled"] as SeatStatus[]).map(st => (
                    <div key={st} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 10, fontFamily: ff }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: SEAT_STYLE[st].bg, border: `2px solid ${SEAT_STYLE[st].border}`, flexShrink: 0 }} />
                      <span style={{ color: "#5a4020" }}>{{ available: "빈 좌석", selected: "선택됨", occupied: "사용 중", disabled: "이용 불가" }[st]}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Panel>

        {/* Selected seat info */}
        {selectedSeat && showSeats && (
          <Panel title="선택한 좌석" icon={<span style={{ fontSize: 13 }}>📍</span>} accent={ZONE_COLORS[selectedSeat.zone] ?? "#4a2a0a"}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, fontFamily: ff }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#7a5828" }}>좌석 번호</span>
                <strong style={{ color: "#2a1808" }}>{selectedSeat.id}번</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#7a5828" }}>구역</span>
                <strong style={{ color: "#2a1808" }}>{selectedSeat.zone}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#7a5828" }}>상태</span>
                <span style={{ color: "#4a8030", fontWeight: 700 }}>빈 좌석</span>
              </div>
            </div>
            <button disabled={seatActionLoading} onClick={handleSit} style={{ marginTop: 10, width: "100%", padding: "9px", fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg,#3a6030,#1e4018)", color: "#c0f0a0", border: "2px solid #1a3010", boxShadow: "2px 3px 0 #0e2008", cursor: seatActionLoading ? "wait" : "pointer", fontFamily: ff }}>
              {seatActionLoading ? "처리 중..." : "✅ 착석하기"}
            </button>
            <button onClick={() => setSelectedId(null)} style={{ marginTop: 6, width: "100%", padding: "6px", fontSize: 11, background: "rgba(139,94,60,0.1)", border: "1px solid #c4a060", color: "#5a3010", cursor: "pointer", fontFamily: ff }}>
              취소
            </button>
          </Panel>
        )}

        {/* Timer — pixel HUD style */}
        <div style={{
          background: "#0c0a06",
          border: "3px solid #5a4010",
          boxShadow: "0 0 0 1px #2a1e08, 4px 4px 0 #060402, inset 0 0 24px rgba(0,0,0,0.6)",
          imageRendering: "pixelated",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Pixel corner accents */}
          {[[0,0],[0,"auto"],["auto",0],["auto","auto"]].map(([t,b],i) => (
            <div key={i} style={{ position:"absolute", top: t as any, bottom: b as any,
              left: i%2===0?0:"auto", right: i%2===1?0:"auto",
              width:8, height:8, background:"#8a6018" }} />
          ))}

          {/* Header strip */}
          <div style={{
            background: "linear-gradient(90deg,#1e1608,#2a200a,#1e1608)",
            borderBottom: "2px solid #5a4010",
            padding: "5px 10px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              {/* Pixel lantern icon */}
              <svg width="14" height="14" viewBox="0 0 8 8" style={{ imageRendering:"pixelated" }}>
                <rect x="3" y="0" width="2" height="1" fill="#c8a030"/>
                <rect x="2" y="1" width="4" height="1" fill="#c8a030"/>
                <rect x="1" y="2" width="6" height="4" fill="#e8c040"/>
                <rect x="2" y="2" width="4" height="4" fill="#f8e060"/>
                <rect x="2" y="6" width="4" height="1" fill="#c8a030"/>
                <rect x="3" y="7" width="2" height="1" fill="#c8a030"/>
              </svg>
              <span style={{ fontFamily:"monospace", fontSize:10, color:"#a88840", letterSpacing:"0.1em", fontWeight:700 }}>STUDY TIMER</span>
            </div>
            {/* Status LED */}
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{
                width:6, height:6,
                background: timerOn ? "#c89028" : "#3a3020",
                boxShadow: timerOn ? "0 0 6px #c89028, 0 0 12px #a07010" : "none",
                transition: "all 0.3s",
              }}/>
              <span style={{ fontFamily:"monospace", fontSize:9, color: timerOn ? "#c89028" : "#4a4030", letterSpacing:"0.08em" }}>
                {timerOn ? "REC" : "IDLE"}
              </span>
            </div>
          </div>

          {/* Main display */}
          <div style={{ padding:"8px 10px 8px", textAlign:"center" }}>
            {/* Scanline overlay effect */}
            <div style={{ position:"relative", display:"inline-block" }}>
              <div style={{
                fontFamily:"monospace", fontSize:30, fontWeight:900,
                letterSpacing:"0.1em", lineHeight:1,
                color: timerOn ? "#e0b840" : "#4a3a18",
                textShadow: timerOn
                  ? "0 0 8px #c89028, 0 0 20px rgba(200,144,40,0.45)"
                  : "none",
                transition: "color 0.4s, text-shadow 0.4s",
                fontVariantNumeric: "tabular-nums",
              }}>
                {fmtTimer(timerSecs)}
              </div>
              {/* CRT scanlines */}
              <div style={{
                position:"absolute", inset:0, pointerEvents:"none",
                background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.12) 2px,rgba(0,0,0,0.12) 4px)",
              }}/>
            </div>

            {/* Stats row */}
            <div style={{ display:"flex", gap:0, borderTop:"1px solid #2a1e08", paddingTop:6 }}>
              {[
                { label:"TODAY", value: fmtTimer(timerSecs + 2*3600 + 34*60).slice(0,5) },
                { label:"SESSION", value: fmtTimer(timerSecs).slice(0,5) },
              ].map((s,i) => (
                <div key={i} style={{ flex:1, textAlign:"center",
                  borderLeft: i>0?"1px solid #2a1e08":"none", padding:"0 4px" }}>
                  <div style={{ fontFamily:"monospace", fontSize:7, color:"#7a5a20",
                    letterSpacing:"0.08em", marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontFamily:"monospace", fontSize:11, color:"#d4a838",
                    fontWeight:700, letterSpacing:"0.06em" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Reset */}
            <button onClick={() => { setTimerOn(false); setTimerSecs(0); }} style={{
              marginTop:6, width:"100%", padding:"4px 0",
              display:"flex", alignItems:"center", justifyContent:"center", gap:5,
              fontFamily:"monospace", fontSize:9, letterSpacing:"0.1em",
              cursor:"pointer", color:"#7a5a20",
              background:"transparent",
              border:"1px solid #2a3a18",
              boxShadow:"none",
            }}>
              <RotateCcw size={9}/> RESET
            </button>
          </div>
        </div>

        {/* Todo — collapsible */}
        <div style={{ background: C.hanji, border: `2px solid ${C.hanjiB}`, boxShadow: `0 3px 0 ${C.hanjiSh}, 0 5px 16px rgba(0,0,0,0.3)` }}>
          <button
            onClick={() => setTodoOpen(o => !o)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", background: "linear-gradient(90deg,#4a2010,#6a3018)", borderBottom: todoOpen ? `2px solid rgba(0,0,0,0.28)` : "none", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
          >
            <span style={{ color: "#c8a030" }}><CheckCircle2 size={13} /></span>
            <span style={{ color: "#ddd0b8", fontFamily: fs, fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", flex: 1, textAlign: "left" }}>오늘 할 일</span>
            <span style={{ color: "#9a7848", fontSize: 10, fontFamily: "monospace", transition: "transform 0.2s", display: "inline-block", transform: todoOpen ? "rotate(0deg)" : "rotate(-90deg)" }}>▼</span>
          </button>
          {todoOpen && (
            <div style={{ padding: 12 }}>
              <TodoContent todos={todos} remove={remove} add={add} />
            </div>
          )}
        </div>

        {/* Online members */}
        <Panel title="지금 공부 중" icon={<BookOpen size={13} />} accent="#2a3a1a">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { name: "경주최씨", zone: "집중의 숲",    time: "1h 22m", color: "#f5c842" },
              { name: "한양이씨", zone: "집현전 공터",   time: "43m",    color: "#90d070" },
              { name: "평양박씨", zone: "세계수 광장",   time: "2h 05m", color: "#f0a0b0" },
              { name: "전주김씨", zone: "계곡가 자유존", time: "18m",    color: "#a0c0f0" },
            ].map((u, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontFamily: ff }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4a8030", flexShrink: 0, boxShadow: "0 0 6px rgba(74,128,48,0.8)" }} />
                <span style={{ fontWeight: 700, color: "#2a1808" }}>{u.name}</span>
                <span style={{ fontSize: 9, color: "#9a7040" }}>{u.zone}</span>
                <span style={{ marginLeft: "auto", color: u.color, fontWeight: 700 }}>{u.time}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: "#7a8060", textAlign: "center", fontFamily: ff }}>사용 중 {seats.filter(seat => seat.status === "occupied").length}석 · {channel?.channelNo ?? "-"}채널</div>
        </Panel>
      </div>
      </div>

      {/* CENTER MAP — aspect-ratio locked to 1022×620 */}
      <div style={{ flex: 1, minWidth: 0, background: currentMap.hasTimeOfDay ? timeMeta.bg : "#0e0a06", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", transition: "background 0.8s" }}>
        <div style={{ position: "relative", width: `min(100%, calc((100vh - 52px) * ${MAP_W / MAP_H}))`, aspectRatio: `${MAP_W} / ${MAP_H}`, overflow: "hidden" }}>

          {/* Map image — 맵마다 등록된 시간대별 이미지(공숲/카페/오피스) 또는 고정 배경(서당) */}
          <img
            src={currentMap.hasTimeOfDay ? currentMap.timeImages?.[timeOfDay] : currentMap.staticBg}
            alt={currentMap.label}
            style={{ display: "block", width: "100%", height: "100%", imageRendering: "pixelated", filter: currentMap.hasTimeOfDay ? timeMeta.filter : "none", transition: "filter 0.8s" }}
          />

          {/* 시간대 색상 오버레이 (공숲만) */}
          {currentMap.hasTimeOfDay && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: timeMeta.overlay, transition: "background 0.8s", mixBlendMode: "multiply" }} />
          )}

          {/* Vignette */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(6,12,4,0.45) 100%)" }} />

          {/* 시간대 전환 버튼 — 우하단 (공숲만) */}
          {currentMap.hasTimeOfDay && (
            <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 30, display: "flex", gap: 6 }}>
              {TIME_CYCLE.map(t => {
                const m = TIME_META[t];
                const active = t === timeOfDay;
                return (
                  <button key={t} onClick={() => setTimeOfDay(t)} title={m.label}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: ff, transition: "all 0.15s",
                      background: active ? "rgba(245,200,66,0.95)" : "rgba(16,8,2,0.78)",
                      color: active ? "#2a1808" : "#c8a060",
                      border: active ? "2px solid #c49820" : "2px solid #5a3010",
                      boxShadow: active ? "0 0 0 2px rgba(245,200,66,0.35), 2px 2px 0 #8a6010" : "2px 2px 0 #2a1006",
                    }}>
                    <span style={{ fontSize: 14 }}>{m.emoji}</span>{m.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Seat markers */}
          {showSeats && seats.map(seat => (
            <SeatMarker key={seat.id} seat={seat} isSelected={selectedId === seat.id} onClick={handleSeatClick} />
          ))}

          {/* 게시판 — 12번 좌석 위 안내판, 클릭하면 공지사항 표시 (공숲 맵에만 존재) */}
          {mapId === "forest" && (
            <div
              onClick={() => setShowNotice(true)}
              title="클릭하여 공지사항 보기"
              style={{ position: "absolute", left: `${(680 / MAP_W) * 100}%`, top: `${(388 / MAP_H) * 100}%`, transform: "translate(-50%, -50%)", zIndex: 22, width: 46, height: 34, cursor: "pointer" }}
            >
              <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)", background: "#c04040", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", whiteSpace: "nowrap", border: "1px solid #7a1010", boxShadow: "1px 1px 0 #4a0808", animation: "noticeBlink 1.4s ease-in-out infinite" }}>
                👆 클릭
              </div>
            </div>
          )}

          {/* 게시판 — 서당 훈장님 머리 위, 클릭하면 공지사항 표시 (서당 맵에만 존재) */}
          {mapId === "seodang" && (
            <div
              onClick={() => setShowNotice(true)}
              title="클릭하여 공지사항 보기"
              style={{ position: "absolute", left: `${(512 / MAP_W) * 100}%`, top: `${(150 / MAP_H) * 100}%`, transform: "translate(-50%, -50%)", zIndex: 22, width: 46, height: 34, cursor: "pointer" }}
            >
              {/* 위쪽 "誠敬" 현판과 겹치지 않도록 라벨을 옆(오른쪽)에 배치 */}
              <div style={{ position: "absolute", top: "50%", left: "calc(100% + 6px)", transform: "translateY(-50%)", background: "#c04040", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", whiteSpace: "nowrap", border: "1px solid #7a1010", boxShadow: "1px 1px 0 #4a0808", animation: "noticeBlink 1.4s ease-in-out infinite" }}>
                👆 클릭
              </div>
            </div>
          )}

          {/* 공지사항 모달 */}
          {showNotice && <NoticeBoardModal onClose={() => setShowNotice(false)} />}

          {/* Seated character */}
          {seatedSeat && (
            <>
              {/* 캐릭터 이미지 — 좌석 좌표에 이미지 하단(바닥 접촉점)을 맞춤 */}
              <div style={{ position: "absolute", left: `${(seatedSeat.x / MAP_W) * 100}%`, top: `${(seatedSeat.y / MAP_H) * 100}%`, transform: "translate(-50%, calc(-100% + 5px))", zIndex: 25, pointerEvents: "none", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.85))" }}>
                <SeatSprite charId={char} seatId={seatedSeat.id} size={52} />
              </div>
              {/* 닉네임 — 캐릭터 이미지 높이와 무관하게 좌석 좌표 바로 아래 고정 */}
              <div style={{ position: "absolute", left: `${(seatedSeat.x / MAP_W) * 100}%`, top: `${(seatedSeat.y / MAP_H) * 100}%`, transform: "translate(-50%, 2px)", zIndex: 25, textAlign: "center", pointerEvents: "none" }}>
                <span style={{ background: "rgba(16,8,2,0.88)", color: "#f5e6c8", fontSize: 9, padding: "2px 7px", border: "1px solid #8b5e3c", whiteSpace: "nowrap", fontFamily: ff, fontWeight: 700, boxShadow: "1px 1px 0 #3a1808" }}>
                  {isJangwonWinner(nickname) && "👑 "}{nickname}
                </span>
              </div>
            </>
          )}

          {/* Character select modal */}
          {showCharSelect && (
            <CharSelectModal current={char} onSelect={setChar} onClose={() => setShowCharSelect(false)} />
          )}

          {/* Profile card — click to change character */}
          <div
            onClick={() => setShowCharSelect(true)}
            title="클릭하여 캐릭터 변경"
            style={{ position: "absolute", top: 10, right: 10, zIndex: 30, background: "linear-gradient(150deg,#fdf4db,#eedda0)", border: "2px solid #9a6a30", boxShadow: "3px 4px 0 #5a3a08, 0 8px 24px rgba(0,0,0,0.6)", padding: "10px 12px", minWidth: 190, cursor: "pointer" }}>
            <div style={{ position: "absolute", top: 4, left: 6, width: 5, height: 5, background: "#3a1e06", borderRadius: 1 }} />
            <div style={{ position: "absolute", top: 4, right: 6, width: 5, height: 5, background: "#3a1e06", borderRadius: 1 }} />
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ position: "relative", width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "linear-gradient(135deg,#2c4a7c,#1a3060)", border: "2px solid #4a7ab8", boxShadow: "2px 2px 0 #0e1e40", overflow: "hidden" }}>
                <ProfileAvatar id={char} size={52} />
                <div style={{ position: "absolute", bottom: 0, right: 0, fontSize: 9, background: "#f5c842", border: "1px solid #b88010", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "1px 1px 0 #7a6010" }}>✏️</div>
              </div>
              <div>
                <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 13, color: "#2a1808" }}>
                  {isJangwonWinner(nickname) && "👑 "}{nickname}
                </div>
                <div style={{ fontSize: 9, color: "#9a7040", fontFamily: ff, marginTop: 2 }}>캐릭터 클릭하여 변경</div>
                <div style={{ fontSize: 10, marginTop: 3, color: "#7a5828", fontFamily: ff }}>⏱ 오늘 <strong style={{ color: "#c04040" }}>2h 34m</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

/* ── Character pixel art ──────────────────────────────────────── */
// 8 characters: 4 eras × 2 genders, viewBox="0 0 32 48"
const sk = "#e8c090"; // skin
const skf = "#f0d4a8"; // skin (female, lighter)

function CharSVG({ id, size = 48 }: { id: number; size?: number }) {
  const h = Math.round(size * 1.5);
  type R = { x:number; y:number; w:number; h:number; f:string };
  const r = (x:number,y:number,w:number,h:number,f:string): R => ({x,y,w,h,f});

  const chars: R[][] = [
    // ── 1. 선사시대 남 ─────────────────────────────────────────
    [
      r(8,0,16,4,"#3a1a08"),r(6,1,4,6,"#3a1a08"),r(22,1,4,6,"#3a1a08"), // wild hair
      r(8,2,16,6,"#5a2e10"),
      r(9,7,14,11,sk),                                  // head
      r(11,10,3,2,"#2a1808"),r(19,10,3,2,"#2a1808"),    // eyes
      r(13,15,6,1,"#c07858"),                            // mouth
      r(13,18,6,3,sk),                                   // neck
      r(6,21,20,13,"#8b5e3c"),r(9,22,14,2,"#a07050"),   // torso (fur)
      r(6,31,20,2,"#5a3010"),                            // belt
      r(0,21,6,12,sk),r(26,21,6,12,sk),                 // arms
      r(27,10,3,13,"#5a3010"),r(25,8,7,4,"#7a4820"),    // club
      r(8,34,7,13,"#7a4e2a"),r(17,34,7,13,"#7a4e2a"),   // legs
      r(7,45,9,3,"#4a2808"),r(17,45,9,3,"#4a2808"),     // feet
    ],
    // ── 2. 선사시대 여 ─────────────────────────────────────────
    [
      r(7,0,18,5,"#3a1a08"),r(5,1,5,10,"#3a1a08"),r(22,1,5,10,"#3a1a08"), // long wild hair
      r(8,2,16,7,"#5a2e10"),
      r(13,2,6,2,"#f0e090"),                             // bone hair ornament
      r(9,7,14,11,skf),                                  // head
      r(11,10,3,2,"#2a1808"),r(18,10,3,2,"#2a1808"),    // eyes
      r(13,14,6,2,"#e09090"),                            // lips
      r(13,18,6,3,skf),                                  // neck
      r(5,21,22,12,"#a07048"),r(8,22,16,2,"#c09060"),   // body (fur dress top)
      r(3,33,26,15,"#8b5e3c"),                           // wide skirt (fur)
      r(4,33,24,2,"#6a4020"),                            // skirt band
      r(0,21,5,11,skf),r(27,21,5,11,skf),               // arms
    ],
    // ── 3. 화랑 남 ─────────────────────────────────────────────
    [
      r(8,0,16,3,"#1a1a2a"),r(6,1,20,5,"#1a1a2a"),      // black hair
      r(7,4,18,3,"#c04040"),r(6,5,20,2,"#f5c842"),       // red headband + gold trim
      r(9,7,14,11,sk),                                    // head
      r(11,10,3,2,"#1a1a2a"),r(18,10,3,2,"#1a1a2a"),    // eyes
      r(12,15,8,1,"#c07858"),                             // mouth
      r(13,18,6,3,sk),                                    // neck
      r(5,21,22,14,"#2c4a7c"),                            // blue armor body
      r(5,21,22,2,"#f5c842"),r(5,33,22,2,"#f5c842"),     // gold armor trim
      r(8,23,16,2,"#4a6a9c"),r(8,27,16,2,"#4a6a9c"),    // armor lines
      r(0,21,5,14,"#2c4a7c"),r(27,21,5,14,"#2c4a7c"),   // arm armor
      r(1,21,3,2,"#f5c842"),r(28,21,3,2,"#f5c842"),      // shoulder gold
      r(0,32,5,4,"#1a1a2a"),r(27,32,5,4,"#1a1a2a"),     // gloves
      r(2,18,3,6,"#c8c8d0"),r(1,16,5,3,"#e0e0e8"),       // sword blade
      r(9,35,6,13,"#1e3060"),r(17,35,6,13,"#1e3060"),    // legs (armor)
      r(7,45,9,3,"#0e1e40"),r(17,45,9,3,"#0e1e40"),      // boots
    ],
    // ── 4. 화랑 여 ─────────────────────────────────────────────
    [
      r(8,0,16,3,"#1a1a2a"),r(7,1,18,5,"#1a1a2a"),       // black hair
      r(12,0,8,2,"#f5c842"),r(10,2,12,2,"#e8b030"),       // gold head ornament
      r(9,7,14,11,skf),                                   // head
      r(11,10,3,2,"#1a1a2a"),r(18,10,3,2,"#1a1a2a"),     // eyes
      r(12,14,8,2,"#e090a0"),                             // lips
      r(13,18,6,3,skf),                                   // neck
      r(6,21,20,12,"#e87090"),r(6,21,20,2,"#f5c842"),    // pink hanbok top + gold
      r(6,31,20,2,"#c04070"),                             // waist band
      r(4,33,24,15,"#f0a0c0"),                            // wide pink skirt
      r(5,33,22,2,"#f5c842"),                             // skirt band gold
      r(0,22,6,10,skf),r(26,22,6,10,skf),                // arms
      r(0,30,6,3,"#e87090"),r(26,30,6,3,"#e87090"),      // sleeve ends
    ],
    // ── 5. 유생 남 ─────────────────────────────────────────────
    [
      r(8,0,16,3,"#1a1a1a"),                              // 갓 brim
      r(10,1,12,8,"#1a1a1a"),r(12,0,8,1,"#1a1a1a"),      // 갓 crown (tall hat)
      r(6,8,20,2,"#2a2a2a"),                              // 갓 wide brim
      r(9,9,14,10,sk),                                    // head
      r(11,12,3,2,"#2a1808"),r(18,12,3,2,"#2a1808"),     // eyes
      r(13,17,6,1,"#c07858"),                             // mouth
      r(13,19,6,3,sk),                                    // neck
      r(5,22,22,13,"#f5e6c8"),r(5,22,22,2,"#e0d0a0"),    // white/cream hanbok
      r(11,24,10,10,"#e8d8b0"),                           // hanbok front panel
      r(6,33,5,2,"#c8b890"),r(21,33,5,2,"#c8b890"),      // sash ends
      r(0,22,5,12,"#f5e6c8"),r(27,22,5,12,"#f5e6c8"),    // arms
      r(27,28,6,8,"#c8a860"),                             // book in hand
      r(28,26,4,2,"#e8d090"),r(28,34,4,2,"#8b6030"),     // book covers
      r(9,35,7,13,"#d4c4a0"),r(16,35,7,13,"#d4c4a0"),    // legs (hanbok)
      r(8,45,9,3,"#2a1808"),r(16,45,9,3,"#2a1808"),      // shoes
    ],
    // ── 6. 유생 여 ─────────────────────────────────────────────
    [
      r(9,0,14,4,"#1a1a1a"),r(7,2,18,4,"#2a2020"),       // elegant bun
      r(14,0,4,3,"#f5c842"),r(12,1,8,2,"#d4a820"),        // binyeo (ornament)
      r(9,6,14,12,skf),                                   // head
      r(11,9,3,2,"#1a1a1a"),r(18,9,3,2,"#1a1a1a"),       // eyes
      r(12,13,8,2,"#e090a0"),                             // lips
      r(13,18,6,3,skf),                                   // neck
      r(6,21,20,5,"#c04040"),r(6,21,20,2,"#e06060"),     // red jeogori (top)
      r(8,25,16,2,"#f5c842"),                             // jeogori tie/ribbon
      r(3,27,26,21,"#2c4a7c"),r(4,27,24,2,"#4a6a9c"),    // blue chima (skirt)
      r(0,21,6,8,skf),r(26,21,6,8,skf),                  // arms
      r(0,28,6,3,"#c04040"),r(26,28,6,3,"#c04040"),      // sleeve ends
    ],
    // ── 7. 개화기 남 ─────────────────────────────────────────────
    [
      r(9,0,14,2,"#1a1a1a"),r(8,1,16,4,"#1a1a1a"),       // modern hat (top hat style)
      r(6,4,20,2,"#2a2a2a"),                              // hat brim
      r(9,6,14,12,sk),                                    // head
      r(11,9,3,2,"#1a1a1a"),r(19,9,3,2,"#1a1a1a"),       // eyes
      r(13,14,6,1,"#c07858"),                             // mouth
      r(13,18,6,3,sk),                                    // neck
      r(13,18,4,3,"#f5f5f5"),                             // white collar
      r(5,21,22,14,"#2a2a3a"),r(13,21,6,6,"#f5f5f5"),    // dark jacket + white shirt
      r(12,26,8,2,"#1a1a2a"),                             // jacket lapels
      r(0,21,5,14,"#2a2a3a"),r(27,21,5,14,"#2a2a3a"),    // jacket arms
      r(0,33,5,3,"#f5f5f5"),r(27,33,5,3,"#f5f5f5"),      // white shirt cuffs
      r(9,35,7,13,"#1a1a2a"),r(17,35,7,13,"#1a1a2a"),    // dark trousers
      r(8,45,9,3,"#0a0a14"),r(17,45,9,3,"#0a0a14"),      // leather shoes
    ],
    // ── 8. 개화기 여 ─────────────────────────────────────────────
    [
      r(9,0,14,3,"#1a1a1a"),r(8,1,16,5,"#2a2020"),       // shorter modern hair
      r(12,1,8,2,"#c04040"),                              // red ribbon
      r(9,6,14,12,skf),                                   // head
      r(11,9,3,2,"#1a1a1a"),r(18,9,3,2,"#1a1a1a"),       // eyes
      r(12,14,8,2,"#e08090"),                             // lips
      r(13,18,6,3,skf),                                   // neck
      r(13,18,4,3,"#f5f5f5"),                             // white collar
      r(6,21,20,6,"#c84870"),r(6,21,20,2,"#f5f5f5"),     // bright modern hanbok top
      r(8,26,16,2,"#f5c842"),                             // gold waist ribbon
      r(3,28,26,20,"#e05080"),r(4,28,24,2,"#f5c842"),    // bright skirt + band
      r(0,21,6,8,skf),r(26,21,6,8,skf),                  // arms
      r(0,28,6,3,"#c84870"),r(26,28,6,3,"#c84870"),      // sleeve ends
    ],
  ];

  const rects = chars[id - 1] ?? chars[0];
  return (
    <svg viewBox="0 0 32 48" width={size} height={h} xmlns="http://www.w3.org/2000/svg">
      {rects.map((p, i) => <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.f}/>)}
    </svg>
  );
}

/* ── Character select modal ───────────────────────────────────── */
function CharSelectModal({ current, onSelect, onClose }: {
  current: number; onSelect: (id: number) => void; onClose: () => void;
}) {
  const [selected, setSelected] = useState(current);
  const [nickname, setNickname] = useState(() => mockAuthApi.getCurrentAccount()?.nickname ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요");
      return;
    }
    const email = mockAuthApi.getCurrentEmail();
    if (email) void mockAuthApi.setProfile(email, { nickname: nickname.trim(), characterId: selected });
    onSelect(selected);
    onClose();
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.62)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 50,
        background: "linear-gradient(160deg,#fdf4db,#eedda0)", border: "3px solid #9a6a30",
        boxShadow: "4px 5px 0 #5a3a08, 0 16px 48px rgba(0,0,0,0.75)", padding: "24px 26px", width: 620 }}>

        {[0,1].map(i=>[
          <div key={`tl${i}`} style={{ position:"absolute", top:5, left:5, width:6, height:6, background:"#3a1e06", borderRadius:1 }}/>,
          <div key={`tr${i}`} style={{ position:"absolute", top:5, right:5, width:6, height:6, background:"#3a1e06", borderRadius:1 }}/>,
        ])}

        <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 15, color: "#2a1808", marginBottom: 16, textAlign: "center" }}>
          🎭 캐릭터 변경
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>
          {CHARACTERS.map(ch => {
            const active = ch.id === selected;
            return (
              <button key={ch.id} onClick={() => setSelected(ch.id)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "14px 8px", cursor: "pointer",
                  background: active ? "linear-gradient(135deg,#f5c842,#e8a820)" : "rgba(139,94,60,0.08)",
                  border: active ? "2px solid #b88010" : "2px solid #c4a060",
                  boxShadow: active ? "2px 3px 0 #8a6010" : "1px 2px 0 #9a7030",
                }}>
                <ProfileAvatar id={ch.id} size={92} />
                <span style={{ fontSize: 11, color: active ? "#5a3010" : "#7a5828",
                  fontWeight: active ? 700 : 500, fontFamily: ff, textAlign: "center", lineHeight: 1.2 }}>
                  {ch.label}
                </span>
              </button>
            );
          })}
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: "#7a5828", fontWeight: 700, fontFamily: ff }}>닉네임</span>
          <input value={nickname} onChange={e => setNickname(e.target.value)} maxLength={16}
            style={{ fontSize: 12, padding: "8px 12px", background: "rgba(240,220,160,0.45)", border: "1px solid #c4a060", outline: "none", color: "#2a1808", fontFamily: ff }} />
        </label>

        {error && (
          <div style={{ fontSize: 11, color: "#7a1010", background: "rgba(192,64,64,0.12)", border: "1px solid #7a1010", padding: "6px 8px", marginBottom: 10 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "8px", fontSize: 11,
            background: "rgba(139,94,60,0.1)", border: "1px solid #c4a060", color: "#5a3010", cursor: "pointer", fontFamily: ff }}>
            취소
          </button>
          <button onClick={handleConfirm} style={{ flex: 1, padding: "8px", fontSize: 11, fontWeight: 700,
            background: "linear-gradient(135deg,#3a6030,#245020)", border: "2px solid #1a3010", color: "#c0f0a0", cursor: "pointer", fontFamily: ff }}>
            저장하기
          </button>
        </div>
      </div>
    </>
  );
}

/* ── 공지사항 게시판 모달 ─────────────────────────────────────── */
function NoticeBoardModal({ onClose }: { onClose: () => void }) {
  const notices = mockNoticeApi.listNotices();
  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.62)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 50,
        background: "linear-gradient(160deg,#fdf4db,#eedda0)", border: "3px solid #9a6a30",
        boxShadow: "4px 5px 0 #5a3a08, 0 16px 48px rgba(0,0,0,0.75)", padding: "22px 24px", width: 400, maxHeight: "72vh", overflowY: "auto" }}>

        <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 15, color: "#2a1808", marginBottom: 16, textAlign: "center" }}>
          📌 공지사항
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notices.length === 0 && (
            <div style={{ textAlign: "center", fontSize: 12, color: "#9a7040", fontFamily: ff, padding: "16px 0" }}>등록된 공지사항이 없습니다</div>
          )}
          {notices.map((n) => (
            <div key={n.id} style={{ padding: "10px 12px", background: "rgba(139,94,60,0.08)", border: "1px solid #c4a060" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontFamily: ff, fontWeight: 700, fontSize: 13, color: "#2a1808" }}>{n.title}</span>
                <span style={{ fontFamily: ff, fontSize: 10, color: "#9a7040" }}>{n.date}</span>
              </div>
              <div style={{ fontFamily: ff, fontSize: 12, color: "#5a3010", lineHeight: 1.5 }}>{n.body}</div>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{ marginTop: 16, width: "100%", padding: "8px", fontSize: 11, fontWeight: 700,
          background: "rgba(139,94,60,0.1)", border: "1px solid #c4a060", color: "#5a3010", cursor: "pointer", fontFamily: ff }}>
          닫기
        </button>
      </div>
    </>
  );
}

/* ── Question Bank data ───────────────────────────────────────── */
const ERAS = [
  { id: "선사", label: "선사·고조선", color: "#8b5e3c", icon: "🪨", q: 24 },
  { id: "삼국", label: "삼국·남북국", color: "#2c4a7c", icon: "⚔️", q: 38 },
  { id: "고려", label: "고려",         color: "#4a7c40", icon: "🏯", q: 45 },
  { id: "조선", label: "조선",         color: "#c07020", icon: "📜", q: 62 },
  { id: "근현대", label: "근현대",     color: "#6a3a7c", icon: "🎖️", q: 53 },
];

const SAMPLE_QUESTIONS = [
  { id: 1, era: "고려", q: "고려의 중앙 통치 기구로 중서문하성과 함께 국정을 이끈 기구는?", choices: ["상서성","도병마사","삼사","중추원"], answer: 0 },
  { id: 2, era: "조선", q: "조선 성종 때 완성된 조선 최초의 성문 법전은?", choices: ["경국대전","대전통편","속대전","대전회통"], answer: 0 },
  { id: 3, era: "삼국", q: "신라가 삼국을 통일하는 데 결정적인 역할을 한 전투는?", choices: ["살수대첩","황산벌 전투","귀주대첩","매소성 전투"], answer: 1 },
  { id: 4, era: "근현대", q: "1919년 상하이에서 수립된 임시 정부의 초대 대통령은?", choices: ["김구","이승만","안창호","이동휘"], answer: 1 },
];

const WRONG_NOTE = [
  { era: "고려", q: "무신정권의 최씨 정권 순서", myAnswer: "최충헌→최우→최항→최의", correct: "최충헌→최우→최항→최의", n: 4, date: "07.01" },
  { era: "조선", q: "4대 사화 발생 순서", myAnswer: "무오→갑자→기묘→을사", correct: "무오→갑자→기묘→을사", n: 2, date: "07.02" },
  { era: "삼국", q: "삼국 통일 과정 전투 순서", myAnswer: "황산벌→백강→안시성→매소성", correct: "황산벌→백강→매소성→기벌포", n: 2, date: "07.03" },
  { era: "근현대", q: "광복 이후 신탁통치 찬반 세력", myAnswer: "좌익 반탁, 우익 찬탁", correct: "좌익 찬탁, 우익 반탁", n: 5, date: "07.03" },
];

type QBTab = "시대별" | "랜덤" | "모의고사" | "AI질의응답" | "오답노트";

export function QuestionBankPage() {
  const [tab, setTab] = useState<QBTab>("시대별");
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [aiQ, setAiQ] = useState("");
  const [aiHistory, setAiHistory] = useState<{ role: "user"|"ai"; text: string }[]>([
    { role: "ai", text: "안녕하세요! 한국사에 대해 무엇이든 질문해주세요 😊" },
  ]);
  const [mockStarted, setMockStarted] = useState(false);
  const [mockTime, setMockTime] = useState(80 * 60); // 80분
  const [mockQ, setMockQ] = useState(0);

  useEffect(() => {
    if (!mockStarted) return;
    const id = setInterval(() => setMockTime(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [mockStarted]);

  const fmtTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const TAB_ITEMS: { id: QBTab; icon: string; label: string }[] = [
    { id: "시대별",    icon: "🏛️", label: "시대별 문제" },
    { id: "랜덤",     icon: "🎲", label: "랜덤 문제"   },
    { id: "모의고사",  icon: "📝", label: "모의고사"    },
    { id: "AI질의응답",icon: "🤖", label: "AI 질의응답" },
    { id: "오답노트",  icon: "📕", label: "오답노트"    },
  ];

  const curQ = SAMPLE_QUESTIONS[qIndex % SAMPLE_QUESTIONS.length];

  const sendAI = () => {
    if (!aiQ.trim()) return;
    const q = aiQ.trim();
    setAiHistory(h => [...h,
      { role: "user", text: q },
      { role: "ai", text: `"${q}"에 대한 답변입니다. 실제 AI 연동 후 응답이 표시됩니다. 현재는 샘플 응답입니다.` },
    ]);
    setAiQ("");
  };

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>

      {/* Left nav */}
      <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", padding: 16, gap: 6,
        background: "rgba(12,8,3,0.95)", borderRight: "3px solid #5a3010" }}>
        <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 13, color: "#f5e6c8", marginBottom: 10,
          paddingBottom: 8, borderBottom: "1px solid #5a3010" }}>
          📚 문제은행
        </div>
        {TAB_ITEMS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              cursor: "pointer", textAlign: "left", fontFamily: ff, fontSize: 12, fontWeight: active ? 700 : 400,
              background: active ? "linear-gradient(90deg,#8b5e3c,#7a4f2e)" : "transparent",
              color: active ? "#f5e6c8" : "#c8a060",
              border: active ? "2px solid #5a3010" : "2px solid transparent",
              boxShadow: active ? "2px 2px 0 #3a1808" : "none",
              transition: "all 0.12s",
            }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>{t.label}
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: 28 }}>

        {/* ── 시대별 문제 ── */}
        {tab === "시대별" && (
          <div>
            <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 18, marginBottom: 20 }}>🏛️ 시대별 문제</h2>
            {!selectedEra ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 16 }}>
                {ERAS.map(era => (
                  <button key={era.id} onClick={() => setSelectedEra(era.id)} style={{
                    padding: "24px 20px", cursor: "pointer", textAlign: "left",
                    background: "linear-gradient(160deg,#fdf4db,#eedda0)",
                    border: `3px solid ${era.color}`,
                    boxShadow: `4px 4px 0 ${era.color}88, 0 8px 24px rgba(0,0,0,0.3)`,
                    transition: "transform 0.1s",
                  }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform="translateY(-2px)"}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform="translateY(0)"}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>{era.icon}</div>
                    <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 15, color: "#2a1808", marginBottom: 4 }}>{era.label}</div>
                    <div style={{ fontSize: 11, color: "#7a5828", fontFamily: ff }}>문제 {era.q}개</div>
                    <div style={{ marginTop: 10 }}><Bar pct={Math.random()*60+30} color={era.color} /></div>
                    <div style={{ fontSize: 10, color: "#9a7040", marginTop: 4, fontFamily: ff }}>최근 정답률</div>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <button onClick={() => setSelectedEra(null)} style={{ fontSize: 12, color: "#c8a060", background: "none", border: "none", cursor: "pointer", fontFamily: ff, marginBottom: 16 }}>
                  ← 시대 목록으로
                </button>
                <EraQuestionView era={selectedEra} />
              </div>
            )}
          </div>
        )}

        {/* ── 랜덤 문제 ── */}
        {tab === "랜덤" && (
          <div style={{ maxWidth: 680 }}>
            <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 18, marginBottom: 20 }}>🎲 랜덤 문제</h2>
            <QuestionCard q={curQ} revealed={revealed} selected={selected}
              onSelect={i => { setSelected(i); setRevealed(true); }}
              onNext={() => { setQIndex(n => n + 1); setRevealed(false); setSelected(null); }} />
          </div>
        )}

        {/* ── 모의고사 ── */}
        {tab === "모의고사" && (
          <div style={{ maxWidth: 680 }}>
            <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 18, marginBottom: 20 }}>📝 모의고사</h2>
            {!mockStarted ? (
              <div style={{ background: "linear-gradient(160deg,#fdf4db,#eedda0)", border: "2px solid #9a6a30",
                boxShadow: "3px 4px 0 #5a3a08", padding: "32px 36px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
                <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 18, color: "#2a1808", marginBottom: 8 }}>한국사능력검정시험 모의고사</div>
                <div style={{ fontSize: 13, color: "#7a5828", fontFamily: ff, marginBottom: 24 }}>50문항 · 제한시간 80분</div>
                <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 28 }}>
                  {[{ l:"최고점",v:"87점",c:"#c04040"},{l:"평균",v:"74점",c:"#2a1808"},{l:"응시횟수",v:"3회",c:"#2c4a7c"}].map((s,i)=>(
                    <div key={i} style={{ textAlign:"center" }}>
                      <div style={{ fontSize:20, fontWeight:700, color:s.c, fontFamily:"monospace" }}>{s.v}</div>
                      <div style={{ fontSize:10, color:"#9a7040", fontFamily:ff }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setMockStarted(true); setMockTime(80*60); setMockQ(0); }}
                  style={{ padding:"12px 36px", fontSize:14, fontWeight:700, cursor:"pointer",
                    background:"linear-gradient(135deg,#c04040,#9a2020)", color:"#f5e6c8",
                    border:"2px solid #7a1010", boxShadow:"3px 3px 0 #4a0808", fontFamily:ff }}>
                  ⚡ 시험 시작하기
                </button>
              </div>
            ) : (
              <div>
                {/* Timer bar */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16,
                  background:"linear-gradient(160deg,#fdf4db,#eedda0)", padding:"10px 16px",
                  border:"2px solid #9a6a30", boxShadow:"2px 2px 0 #5a3a08" }}>
                  <span style={{ fontFamily:ff, fontSize:13, color:"#5a3010", fontWeight:700 }}>문제 {mockQ+1} / 50</span>
                  <span style={{ fontFamily:"monospace", fontSize:18, fontWeight:700,
                    color: mockTime < 600 ? "#c04040" : "#2a1808" }}>⏱ {fmtTime(mockTime)}</span>
                  <button onClick={() => setMockStarted(false)} style={{ fontSize:11, padding:"4px 10px",
                    background:"rgba(192,64,64,0.1)", border:"1px solid #e0a0a0", color:"#8a2020", cursor:"pointer", fontFamily:ff }}>
                    종료
                  </button>
                </div>
                <QuestionCard q={SAMPLE_QUESTIONS[mockQ % SAMPLE_QUESTIONS.length]} revealed={revealed} selected={selected}
                  onSelect={i => { setSelected(i); setRevealed(true); }}
                  onNext={() => { setMockQ(n=>n+1); setRevealed(false); setSelected(null); }} />
              </div>
            )}
          </div>
        )}

        {/* ── AI 질의응답 ── */}
        {tab === "AI질의응답" && (
          <div style={{ maxWidth: 680, display:"flex", flexDirection:"column", height:"calc(100vh - 200px)" }}>
            <h2 style={{ fontFamily:fs, color:"#f5e6c8", fontSize:18, marginBottom:16 }}>🤖 AI 질의응답</h2>
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:12, marginBottom:16,
              background:"rgba(0,0,0,0.25)", border:"2px solid #3a2810", padding:16 }}>
              {aiHistory.map((m,i) => (
                <div key={i} style={{ display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start" }}>
                  <div style={{ maxWidth:"78%", padding:"10px 14px", fontSize:12, fontFamily:ff, lineHeight:1.7,
                    background: m.role==="user"
                      ? "linear-gradient(135deg,#2c4a7c,#1e3060)"
                      : "linear-gradient(160deg,#fdf4db,#eedda0)",
                    color: m.role==="user" ? "#c0d8f8" : "#2a1808",
                    border: m.role==="user" ? "2px solid #1a2a50" : "2px solid #c4a060",
                    boxShadow: "2px 2px 0 rgba(0,0,0,0.35)",
                  }}>{m.text}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={aiQ} onChange={e=>setAiQ(e.target.value)}
                onKeyDown={e=>e.key==="Enter" && sendAI()}
                placeholder="한국사에 대해 질문하세요..."
                style={{ flex:1, padding:"10px 12px", fontSize:12, fontFamily:ff,
                  background:"rgba(240,220,160,0.35)", border:"2px solid #c4a060",
                  outline:"none", color:"#f5e6c8" }} />
              <button onClick={sendAI} style={{ padding:"10px 20px", fontSize:12, fontWeight:700, cursor:"pointer",
                background:"linear-gradient(135deg,#2c4a7c,#1a2e60)", color:"#a0c0f0",
                border:"2px solid #1a2a50", boxShadow:"2px 2px 0 #0a1430", fontFamily:ff }}>
                전송
              </button>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
              {["무신정권 순서","4대 사화란?","고려와 조선의 차이","일제강점기 독립운동"].map((q,i)=>(
                <button key={i} onClick={()=>setAiQ(q)} style={{ fontSize:10, padding:"4px 10px",
                  background:"rgba(44,74,124,0.18)", border:"1px solid #4a6a9a",
                  color:"#80a8d8", cursor:"pointer", fontFamily:ff }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 오답노트 ── */}
        {tab === "오답노트" && (
          <div style={{ maxWidth: 720 }}>
            <h2 style={{ fontFamily:fs, color:"#f5e6c8", fontSize:18, marginBottom:20 }}>📕 오답노트</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {WRONG_NOTE.map((w,i) => (
                <div key={i} style={{ background:"linear-gradient(160deg,#fdf4db,#eedda0)",
                  border:"2px solid #9a6a30", boxShadow:"3px 3px 0 #5a3a08", padding:"16px 20px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <span style={{ padding:"2px 8px", fontSize:11, fontWeight:700,
                      background:"#f0e0c0", border:"1px solid #c4a060", color:"#5a3010" }}>{w.era}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#2a1808", fontFamily:fs, flex:1 }}>{w.q}</span>
                    <span style={{ fontSize:10, color:"#9a7040", fontFamily:ff }}>{w.date}</span>
                    <span style={{ padding:"2px 8px", fontSize:11, fontWeight:700,
                      background:"linear-gradient(135deg,#c04040,#a02020)", color:"white",
                      border:"1px solid #8a1818" }}>오답 {w.n}회</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, fontSize:11, fontFamily:ff }}>
                    <div style={{ padding:"8px 12px", background:"rgba(192,64,64,0.08)", border:"1px solid #e0a0a0" }}>
                      <div style={{ color:"#c04040", fontWeight:700, marginBottom:4 }}>❌ 내 답</div>
                      <div style={{ color:"#5a2020" }}>{w.myAnswer}</div>
                    </div>
                    <div style={{ padding:"8px 12px", background:"rgba(40,120,40,0.08)", border:"1px solid #80c080" }}>
                      <div style={{ color:"#2a7030", fontWeight:700, marginBottom:4 }}>✅ 정답</div>
                      <div style={{ color:"#1a4020" }}>{w.correct}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Question card (shared) ───────────────────────────────────── */
function QuestionCard({ q, revealed, selected, onSelect, onNext }: {
  q: typeof SAMPLE_QUESTIONS[0]; revealed: boolean; selected: number | null;
  onSelect: (i: number) => void; onNext: () => void;
}) {
  return (
    <div style={{ background:"linear-gradient(160deg,#fdf4db,#eedda0)", border:"2px solid #9a6a30",
      boxShadow:"3px 4px 0 #5a3a08", padding:"24px 28px" }}>
      <div style={{ display:"flex", gap:8, marginBottom:16, alignItems:"center" }}>
        <span style={{ padding:"2px 8px", fontSize:11, fontWeight:700, background:"#f0e0c0",
          border:"1px solid #c4a060", color:"#5a3010" }}>{q.era}</span>
        <span style={{ fontSize:11, color:"#9a7040", fontFamily:ff }}>객관식 4지선다</span>
      </div>
      <div style={{ fontFamily:fs, fontWeight:700, fontSize:16, color:"#2a1808", lineHeight:1.7, marginBottom:24 }}>
        {q.q}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {q.choices.map((c, i) => {
          const isCorrect = i === q.answer;
          const isSelected = i === selected;
          let bg = "rgba(139,94,60,0.08)", border = "2px solid #c4a060", color = "#2a1808";
          if (revealed) {
            if (isCorrect) { bg="rgba(40,120,40,0.15)"; border="2px solid #4a8030"; color="#1a4020"; }
            else if (isSelected) { bg="rgba(192,64,64,0.12)"; border="2px solid #c04040"; color="#6a1010"; }
          }
          if (isSelected && !revealed) { bg="rgba(44,74,124,0.18)"; border="2px solid #4a6a9c"; }
          return (
            <button key={i} onClick={() => !revealed && onSelect(i)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"12px 16px", textAlign:"left",
              cursor: revealed?"default":"pointer", background:bg, border, color,
              fontFamily:ff, fontSize:13, fontWeight: revealed && isCorrect ? 700 : 400,
              transition:"all 0.15s",
            }}>
              <span style={{ fontWeight:700, minWidth:18 }}>{["①","②","③","④"][i]}</span>{c}
              {revealed && isCorrect && <span style={{ marginLeft:"auto" }}>✅</span>}
              {revealed && isSelected && !isCorrect && <span style={{ marginLeft:"auto" }}>❌</span>}
            </button>
          );
        })}
      </div>
      {revealed && (
        <button onClick={onNext} style={{ marginTop:20, width:"100%", padding:"12px", fontSize:13, fontWeight:700,
          cursor:"pointer", background:"linear-gradient(135deg,#3a6030,#1e4018)", color:"#c0f0a0",
          border:"2px solid #1a3010", boxShadow:"2px 3px 0 #0e2008", fontFamily:ff }}>
          다음 문제 →
        </button>
      )}
    </div>
  );
}

/* ── Era question view ────────────────────────────────────────── */
function EraQuestionView({ era }: { era: string }) {
  const [qi, setQi] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const qs = SAMPLE_QUESTIONS.filter(q => q.era === era);
  const all = qs.length ? qs : SAMPLE_QUESTIONS;
  const cur = all[qi % all.length];
  return (
    <QuestionCard q={cur} revealed={revealed} selected={selected}
      onSelect={i => { setSelected(i); setRevealed(true); }}
      onNext={() => { setQi(n=>n+1); setRevealed(false); setSelected(null); }} />
  );
}

/* ── App ──────────────────────────────────────────────────────── */
