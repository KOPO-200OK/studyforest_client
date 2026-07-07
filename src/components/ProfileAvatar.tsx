// 캐릭터 프로필 사진 (charId → 이미지, 160×160 썸네일)
import profile1 from "@/imports/프로필/thumb/석기_프로필_남.png";
import profile2 from "@/imports/프로필/thumb/석기_프로필_여.png";
import profile3 from "@/imports/프로필/thumb/화랑_프로필_남.png";
import profile4 from "@/imports/프로필/thumb/화랑_프로필_여.png";
import profile5 from "@/imports/프로필/thumb/유생_프로필_남.png";
import profile6 from "@/imports/프로필/thumb/유생_프로필_여.png";
import profile7 from "@/imports/프로필/thumb/근현대_프로필_남.png";
import profile8 from "@/imports/프로필/thumb/근현대_프로필 여.png";

export const PROFILE_IMAGES: Partial<Record<number, string>> = {
  1: profile1, 2: profile2, 3: profile3, 4: profile4,
  5: profile5, 6: profile6, 7: profile7, 8: profile8,
};

export default function ProfileAvatar({ id, size = 48 }: { id: number; size?: number }) {
  const src = PROFILE_IMAGES[id];
  if (!src) return <span style={{ fontSize: size * 0.7, lineHeight: 1 }}>🧑‍🎓</span>;
  return <img src={src} alt="" style={{ width: size, height: size, objectFit: "cover" }} />;
}
