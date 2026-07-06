// 8 캐릭터: 4 시대 × 2 성별
export interface CharacterMeta {
  id: number;
  era: string;
  gender: "남" | "여";
  label: string;
}

export const CHARACTERS: CharacterMeta[] = [
  { id: 1, era: "선사시대", gender: "남", label: "선사 남" },
  { id: 2, era: "선사시대", gender: "여", label: "선사 여" },
  { id: 3, era: "삼국(화랑)", gender: "남", label: "화랑 남" },
  { id: 4, era: "삼국(화랑)", gender: "여", label: "화랑 여" },
  { id: 5, era: "유생", gender: "남", label: "유생 남" },
  { id: 6, era: "유생", gender: "여", label: "유생 여" },
  { id: 7, era: "개화기", gender: "남", label: "개화기 남" },
  { id: 8, era: "개화기", gender: "여", label: "개화기 여" },
];

export const ERAS = ["선사시대", "삼국(화랑)", "유생", "개화기"];

export const DEFAULT_CHARACTER_ID = 5; // 유생 남
