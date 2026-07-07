// ============================================================
// 좌석 활성화/비활성화 설정 — 관리자 "스터디 공간 관리"에서 제어.
// localStorage에 저장하며, 스터디룸 화면은 페이지 진입 시 이 값을 읽어 좌석 상태에 반영한다.
// 백엔드가 준비되면 이 파일을 지우고 실제 API로 교체.
// ============================================================

const DISABLED_SEATS_KEY = "gongsoop_disabled_seats";

export function getDisabledSeatIds(): number[] {
  const raw = localStorage.getItem(DISABLED_SEATS_KEY);
  return raw ? (JSON.parse(raw) as number[]) : [];
}

function saveDisabledSeatIds(ids: number[]) {
  localStorage.setItem(DISABLED_SEATS_KEY, JSON.stringify(ids));
}

export function isSeatDisabled(seatId: number): boolean {
  return getDisabledSeatIds().includes(seatId);
}

export function setSeatDisabled(seatId: number, disabled: boolean): void {
  const ids = getDisabledSeatIds();
  const next = disabled
    ? (ids.includes(seatId) ? ids : [...ids, seatId])
    : ids.filter((id) => id !== seatId);
  saveDisabledSeatIds(next);
}
