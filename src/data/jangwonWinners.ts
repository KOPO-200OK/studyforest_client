// ============================================================
// 장원급제 연도별 수상자 — 목업 저장소. localStorage에 저장한다.
// 백엔드가 준비되면 이 파일을 지우고 실제 API로 교체.
// ============================================================

const WINNERS_KEY = "gongsoop_mock_jangwon_winners";

export interface JangwonWinner {
  year: number;
  nickname: string;
  characterId: number;
}

const DEFAULT_WINNERS: JangwonWinner[] = [];

function loadWinners(): JangwonWinner[] {
  const raw = localStorage.getItem(WINNERS_KEY);
  if (!raw) {
    localStorage.setItem(WINNERS_KEY, JSON.stringify(DEFAULT_WINNERS));
    return DEFAULT_WINNERS;
  }
  return JSON.parse(raw) as JangwonWinner[];
}

function saveWinners(winners: JangwonWinner[]) {
  localStorage.setItem(WINNERS_KEY, JSON.stringify(winners));
}

/** 연도별 장원급제 수상자 목록 (최신 연도순) */
export function getJangwonWinners(): JangwonWinner[] {
  return loadWinners().slice().sort((a, b) => b.year - a.year);
}

/** 연도별로 묶은 장원급제 수상자 목록 (한 해에 여러 명이 있을 수 있음, 최신 연도순) */
export function getJangwonWinnersByYear(): { year: number; winners: JangwonWinner[] }[] {
  const winners = getJangwonWinners();
  const years = Array.from(new Set(winners.map((w) => w.year))).sort((a, b) => b - a);
  return years.map((year) => ({ year, winners: winners.filter((w) => w.year === year) }));
}

/** 해당 연도의 장원급제 수상자를 등록한다 (한 해에 여러 명 등록 가능, 관리자가 신청을 수락했을 때 호출) */
export function setJangwonWinner(winner: JangwonWinner): void {
  const winners = loadWinners().filter((w) => !(w.year === winner.year && w.nickname === winner.nickname));
  winners.push(winner);
  saveWinners(winners);
}

/** 닉네임이 역대 장원급제 수상자 명단에 있는지 (이름표에 왕관 표시용) */
export function isJangwonWinner(nickname: string | undefined | null): boolean {
  if (!nickname) return false;
  return loadWinners().some((w) => w.nickname === nickname);
}
