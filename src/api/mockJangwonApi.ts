import { DEFAULT_CHARACTER_ID } from "@/data/characters";
import { setJangwonWinner } from "@/data/jangwonWinners";
import { jangwonApi, type JangwonApplicationResponse } from "./jangwonApi";

export type JangwonApplicationStatus = "pending" | "approved" | "rejected";

export interface JangwonApplication {
  id: number;
  email: string;
  nickname: string;
  characterId?: number;
  imageDataUrl: string;
  submittedAt: string;
  status: JangwonApplicationStatus;
  rejectReason?: string;
  reviewedAt?: string;
}

export type CreateApplicationInput = Omit<
  JangwonApplication,
  "id" | "submittedAt" | "status" | "rejectReason" | "reviewedAt"
>;

let cache: JangwonApplication[] = [];

function toStatus(status: string): JangwonApplicationStatus {
  if (status === "APPROVED") return "approved";
  if (status === "REJECTED") return "rejected";
  return "pending";
}

function toCharacterId(characterName: string | null | undefined): number {
  const id = Number(characterName);
  return Number.isFinite(id) && id > 0 ? id : DEFAULT_CHARACTER_ID;
}

function mapApplication(a: JangwonApplicationResponse): JangwonApplication {
  return {
    id: a.jangwonApplicationId,
    email: a.displayName,
    nickname: a.displayNickname,
    characterId: toCharacterId(a.characterName),
    imageDataUrl: a.certificateImageUrl,
    submittedAt: a.appliedAt,
    status: toStatus(a.status),
    rejectReason: a.adminMemo ?? undefined,
    reviewedAt: a.reviewedAt ?? undefined,
  };
}

export const mockJangwonApi = {
  listApplications(): JangwonApplication[] {
    return cache.slice().sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  },

  getApplicationByEmail(_email: string): JangwonApplication | null {
    return cache[0] ?? null;
  },

  async loadMyApplications(): Promise<JangwonApplication[]> {
    const page = await jangwonApi.listMyApplications({ page: 0, size: 10 });
    cache = page.content.map(mapApplication);
    return mockJangwonApi.listApplications();
  },

  async loadAdminApplications(): Promise<JangwonApplication[]> {
    const page = await jangwonApi.listAdminApplications({ page: 0, size: 50 });
    cache = page.content.map(mapApplication);
    return mockJangwonApi.listApplications();
  },

  async addApplication(input: CreateApplicationInput): Promise<JangwonApplication> {
    const created = await jangwonApi.apply({
      displayNickname: input.nickname,
      characterName: String(input.characterId ?? DEFAULT_CHARACTER_ID),
      characterImageUrl: null,
      certificateImageUrl: input.imageDataUrl,
    });

    const application = mapApplication(created);
    cache = [application, ...cache.filter((a) => a.id !== application.id)];
    return application;
  },

  async approveApplication(id: number): Promise<void> {
    const approved = await jangwonApi.approve(id);
    const application = mapApplication(approved);

    cache = cache.map((a) => (a.id === id ? application : a));

    setJangwonWinner({
      year: new Date().getFullYear(),
      nickname: application.nickname,
      characterId: application.characterId ?? DEFAULT_CHARACTER_ID,
    });
  },

  async rejectApplication(id: number, reason: string): Promise<void> {
    const rejected = await jangwonApi.reject(id, reason);
    const application = mapApplication(rejected);

    cache = cache.map((a) => (a.id === id ? application : a));
  },

  async deleteApplication(id: number): Promise<void> {
    await jangwonApi.delete(id);
    cache = cache.filter((a) => a.id !== id);
  },
};