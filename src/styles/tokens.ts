// ============================================================
// 공숲 디자인 토큰 (Figma 베이스에서 추출)
// 새 컴포넌트/화면은 이 토큰을 import 해서 사용합니다.
// ============================================================

// ── 폰트 ──────────────────────────────────────────────
export const ff = "'Noto Sans KR',sans-serif";   // 본문
export const fs = "'Noto Serif KR',serif";        // 제목/헤더

// ── 색상 팔레트 ───────────────────────────────────────
export const C = {
  // 종이(한지) 카드
  hanji:    "linear-gradient(160deg,#ede8d8 0%,#e0d8c4 50%,#d8d0bc 100%)",
  hanjiB:   "#b8a880",   // 테두리
  hanjiSh:  "#7a6040",   // 그림자

  // 나무 헤더
  wood:     "linear-gradient(90deg,#5a3a18,#7a5030)",
  woodB:    "#3a2010",

  // 먹색/갈색 텍스트
  inkDark:  "#241408",
  inkMid:   "#6a4e28",
  inkLight: "#9a8060",
  fg:       "#ccc0a8",   // 사이드바 텍스트

  // 버튼 - 초록
  green:    "linear-gradient(135deg,#3a6030,#245020)",
  greenTx:  "#c0f0a0",
  greenB:   "#1a3010",
  greenSh:  "#0e2008",

  // 버튼 - 파랑
  blue:     "linear-gradient(135deg,#2c4a7c,#1a2e60)",
  blueTx:   "#a0c0f0",
  blueB:    "#1a2a50",
  blueSh:   "#0a1430",

  // 버튼 - 빨강
  red:      "linear-gradient(135deg,#c04040,#9a2020)",
  redTx:    "#f5e6c8",
  redB:     "#7a1010",
  redSh:    "#4a0808",

  // 버튼 - 우드
  woodBtn:  "linear-gradient(135deg,#8b5e3c,#6a3a1a)",
  woodBtnTx:"#f5e6c8",
  woodBtnB: "#5a3010",
  woodBtnSh:"#3a1808",

  // 레이아웃
  sidebarBg:"linear-gradient(180deg,rgba(10,6,2,0.96),rgba(16,10,4,0.94))",
  sidebarBr:"#3a2008",
  navBg:    "linear-gradient(90deg,#120804,#16100a,#120804)",
  navBr:    "#6a4020",
  pageBg:   "#0e1a0a",

  // 강조(금색)
  active:   "#c8a030",
  gold:     "#f5c842",

  // 입력창
  inputBg:  "rgba(240,220,160,0.45)",
  inputBr:  "#c4a060",
} as const;

// ── 시멘틱 컬러 (버튼 variant 매핑) ───────────────────
export const BUTTON_VARIANTS = {
  green: { bg: C.green,   tx: C.greenTx,   br: C.greenB,   sh: C.greenSh },
  blue:  { bg: C.blue,    tx: C.blueTx,    br: C.blueB,    sh: C.blueSh },
  red:   { bg: C.red,     tx: C.redTx,     br: C.redB,     sh: C.redSh },
  wood:  { bg: C.woodBtn, tx: C.woodBtnTx, br: C.woodBtnB, sh: C.woodBtnSh },
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

// ── 간격/모서리 ──────────────────────────────────────
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
