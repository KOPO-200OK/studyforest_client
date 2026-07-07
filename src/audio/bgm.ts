// ============================================================
// 배경음악(BGM) 파일 자동 등록
// src/imports/bgm/ 폴더에 mp3·ogg·wav 파일을 넣기만 하면 자동으로 목록에 등록된다.
// (코드 수정 없이 파일만 추가/삭제하면 됨 — Vite import.meta.glob 사용)
// ============================================================

const modules = import.meta.glob("/src/imports/bgm/*.{mp3,ogg,wav}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const BGM_TRACKS: string[] = Object.keys(modules)
  .sort()
  .map((key) => modules[key]);
