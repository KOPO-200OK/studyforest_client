// ============================================================
// "문의하기" 목업 저장소 — 백엔드 준비 전까지 임시 사용.
// localStorage에 문의 내역을 저장한다.
// 백엔드가 준비되면 이 파일을 지우고 실제 문의 API로 교체.
// ============================================================

const INQUIRIES_KEY = "gongsoop_mock_inquiries";

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  content: string;
  submittedAt: string; // ISO
}

export type CreateInquiryInput = Omit<Inquiry, "id" | "submittedAt">;

function loadInquiries(): Inquiry[] {
  const raw = localStorage.getItem(INQUIRIES_KEY);
  return raw ? (JSON.parse(raw) as Inquiry[]) : [];
}

function saveInquiries(inquiries: Inquiry[]) {
  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
}

export const mockInquiryApi = {
  listInquiries(): Inquiry[] {
    return loadInquiries().slice().sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  },

  addInquiry(input: CreateInquiryInput): Inquiry {
    const inquiries = loadInquiries();
    const nextId = inquiries.reduce((max, i) => Math.max(max, i.id), 0) + 1;
    const inquiry: Inquiry = { ...input, id: nextId, submittedAt: new Date().toISOString() };
    inquiries.push(inquiry);
    saveInquiries(inquiries);
    return inquiry;
  },

  deleteInquiry(id: number): void {
    saveInquiries(loadInquiries().filter((i) => i.id !== id));
  },
};
