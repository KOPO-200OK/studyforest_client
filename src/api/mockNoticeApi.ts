import { noticeApi } from "./noticeApi";

export interface Notice {
  id: number;
  title: string;
  date: string;
  body: string;
}

export type CreateNoticeInput = Omit<Notice, "id">;

function mapNotice(n: { noticeId: number; title: string; contentPreview: string; createdAt: string }): Notice {
  return {
    id: n.noticeId,
    title: n.title,
    date: n.createdAt ? n.createdAt.slice(0, 10) : "",
    body: n.contentPreview,
  };
}

let cache: Notice[] = [];

export const mockNoticeApi = {
  listNotices(): Notice[] {
    return cache;
  },

  async loadNotices(): Promise<Notice[]> {
    const page = await noticeApi.listAdmin({ page: 0, size: 50 });
    cache = page.content.map(mapNotice);
    return cache;
  },

  async addNotice(input: CreateNoticeInput): Promise<Notice> {
    const created = await noticeApi.create({
      title: input.title,
      content: input.body,
      isPinned: false,
      isPublished: true,
    });

    const notice = {
      id: created.noticeId,
      title: created.title,
      date: created.createdAt ? created.createdAt.slice(0, 10) : input.date,
      body: created.content,
    };

    cache = [notice, ...cache];
    return notice;
  },

  async deleteNotice(id: number): Promise<void> {
    await noticeApi.delete(id);
    cache = cache.filter((n) => n.id !== id);
  },
};