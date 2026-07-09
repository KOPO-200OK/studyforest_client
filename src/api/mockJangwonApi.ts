// ============================================================
// "장원급제 신청" 목업 저장소 — 백엔드 준비 전까지 임시 사용.
// localStorage에 신청 내역(이미지는 base64)을 저장한다.
// 백엔드가 준비되면 이 파일을 지우고 실제 업로드 API로 교체.
// ============================================================

import { DEFAULT_CHARACTER_ID } from "@/data/characters";
import { setJangwonWinner } from "@/data/jangwonWinners";

const APPLICATIONS_KEY = "gongsoop_mock_jangwon_applications";

export type JangwonApplicationStatus = "pending" | "approved" | "rejected";

export interface JangwonApplication {
  id: number;
  email: string;
  nickname: string;
  characterId?: number;
  imageDataUrl: string;
  submittedAt: string; // ISO
  status: JangwonApplicationStatus;
  rejectReason?: string;
  reviewedAt?: string; // ISO
}

export type CreateApplicationInput = Omit<JangwonApplication, "id" | "submittedAt" | "status" | "rejectReason" | "reviewedAt">;

function loadApplications(): JangwonApplication[] {
  const raw = localStorage.getItem(APPLICATIONS_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as JangwonApplication[];
  return parsed.map((a) => ({ ...a, status: a.status ?? "pending" }));
}

function saveApplications(applications: JangwonApplication[]) {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
}

export const mockJangwonApi = {
  listApplications(): JangwonApplication[] {
    return loadApplications().slice().sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  },

  getApplicationByEmail(email: string): JangwonApplication | null {
    return loadApplications().find((a) => a.email === email) ?? null;
  },

  /** 신청 — 같은 이메일로 이미 신청한 게 있으면 덮어씀(재신청, 검토 상태는 초기화) */
  addApplication(input: CreateApplicationInput): JangwonApplication {
    const applications = loadApplications().filter((a) => a.email !== input.email);
    const nextId = loadApplications().reduce((max, a) => Math.max(max, a.id), 0) + 1;
    const application: JangwonApplication = { ...input, id: nextId, submittedAt: new Date().toISOString(), status: "pending" };
    applications.push(application);
    saveApplications(applications);
    return application;
  },

  /** 관리자 수락 — 신청자를 올해의 장원급제 수상자로 등록 */
  approveApplication(id: number): void {
    const applications = loadApplications();
    const application = applications.find((a) => a.id === id);
    if (!application) return;
    application.status = "approved";
    application.reviewedAt = new Date().toISOString();
    delete application.rejectReason;
    saveApplications(applications);
    setJangwonWinner({
      year: new Date().getFullYear(),
      nickname: application.nickname,
      characterId: application.characterId ?? DEFAULT_CHARACTER_ID,
    });
  },

  /** 관리자 반려 — 사유와 함께 신청자에게 안내 */
  rejectApplication(id: number, reason: string): void {
    const applications = loadApplications();
    const application = applications.find((a) => a.id === id);
    if (!application) return;
    application.status = "rejected";
    application.rejectReason = reason;
    application.reviewedAt = new Date().toISOString();
    saveApplications(applications);
  },

  deleteApplication(id: number): void {
    saveApplications(loadApplications().filter((a) => a.id !== id));
  },
};
