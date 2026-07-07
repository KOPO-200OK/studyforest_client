// ============================================================
// 관리자 "공지사항 관리" 목업 저장소 — 백엔드 준비 전까지 임시 사용.
// localStorage에 공지사항을 저장한다. 스터디룸 게시판 클릭 시 여기서 목록을 읽어 보여준다.
// 백엔드가 준비되면 이 파일을 지우고 실제 API로 교체.
// ============================================================

const NOTICES_KEY = "gongsoop_mock_notices";

export interface Notice {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  body: string;
}

export type CreateNoticeInput = Omit<Notice, "id">;

function seedNotices(): Notice[] {
  return [
    { id: 1, title: "서당 맵 오픈!", date: "2026-07-07", body: "새로운 학습 공간 '서당' 맵이 열렸어요. 좌측 사이드바의 맵 선택에서 골라보세요." },
    { id: 2, title: "배경음악 기능 추가", date: "2026-07-07", body: "상단 네비게이션 바에서 배경음악을 켜고 끌 수 있어요. 집중이 필요할 땐 켜보세요." },
    { id: 3, title: "장원급제 이벤트 안내", date: "2026-07-01", body: "이번 달 문제풀이 랭킹 상위 10명에게 특별 캐릭터 의상이 지급됩니다." },
  ];
}

function loadNotices(): Notice[] {
  const raw = localStorage.getItem(NOTICES_KEY);
  if (raw) return JSON.parse(raw) as Notice[];
  const seed = seedNotices();
  localStorage.setItem(NOTICES_KEY, JSON.stringify(seed));
  return seed;
}

function saveNotices(notices: Notice[]) {
  localStorage.setItem(NOTICES_KEY, JSON.stringify(notices));
}

export const mockNoticeApi = {
  listNotices(): Notice[] {
    // 최신순 정렬
    return loadNotices().slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  },

  addNotice(input: CreateNoticeInput): Notice {
    const notices = loadNotices();
    const nextId = notices.reduce((max, n) => Math.max(max, n.id), 0) + 1;
    const notice: Notice = { ...input, id: nextId };
    notices.push(notice);
    saveNotices(notices);
    return notice;
  },

  deleteNotice(id: number): void {
    saveNotices(loadNotices().filter((n) => n.id !== id));
  },
};
