import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { BGM_TRACKS } from "./bgm";

const ENABLED_KEY = "gongsoop_bgm_enabled";
const VOLUME_KEY = "gongsoop_bgm_volume";

interface BgmContextValue {
  enabled: boolean;
  toggle: () => void;
  volume: number;
  setVolume: (v: number) => void;
  hasTracks: boolean;
}

const BgmContext = createContext<BgmContextValue | null>(null);

export function BgmProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackIndex = useRef(0);
  const [enabled, setEnabled] = useState(() => localStorage.getItem(ENABLED_KEY) === "true");
  const [volume, setVolumeState] = useState(() => {
    const raw = localStorage.getItem(VOLUME_KEY);
    return raw ? Number(raw) : 0.4;
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || BGM_TRACKS.length === 0) return;
    audio.volume = volume;
    if (enabled) {
      audio.src = BGM_TRACKS[trackIndex.current];
      // 브라우저 자동재생 정책상 사용자 상호작용 전에는 재생이 막힐 수 있음 — 실패해도 무시
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    localStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume]);

  function handleEnded() {
    if (BGM_TRACKS.length === 0) return;
    trackIndex.current = (trackIndex.current + 1) % BGM_TRACKS.length;
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = BGM_TRACKS[trackIndex.current];
    audio.play().catch(() => {});
  }

  function toggle() {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(ENABLED_KEY, String(next));
      return next;
    });
  }

  function setVolume(v: number) {
    setVolumeState(Math.max(0, Math.min(1, v)));
  }

  return (
    <BgmContext.Provider value={{ enabled, toggle, volume, setVolume, hasTracks: BGM_TRACKS.length > 0 }}>
      <audio ref={audioRef} onEnded={handleEnded} />
      {children}
    </BgmContext.Provider>
  );
}

export function useBgm() {
  const ctx = useContext(BgmContext);
  if (!ctx) throw new Error("useBgm은 BgmProvider 안에서만 사용할 수 있습니다");
  return ctx;
}
