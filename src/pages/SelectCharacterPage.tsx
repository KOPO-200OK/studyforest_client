import {
  useState,
  type FormEvent,
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import type {
  PendingSignupData,
} from "@/pages/SignupPage";

import {
  Button,
  Card,
  Input,
} from "@/components/ui";

import ProfileAvatar from "@/components/ProfileAvatar";

import {
  C,
  ff,
  fs,
  woodFrameBorder,
} from "@/styles/tokens";

import {
  mockAuthApi,
} from "@/api/mockAuthApi";

import {
  CHARACTERS,
  type CharacterMeta,
} from "@/data/characters";

import chBackground from "@/imports/ch_background.png";

type Step =
  | "gender"
  | "character"
  | "nickname";

type Gender =
  CharacterMeta["gender"];

export default function SelectCharacterPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const pendingSignup =
    (
      location.state as {
        pendingSignup?:
          PendingSignupData;
      } | null
    )?.pendingSignup;

  const [
    step,
    setStep,
  ] = useState<Step>(
    "character",
  );

  const [
    gender,
    setGender,
  ] = useState<
    Gender | null
  >(
    "남",
  );

  const [
    characterId,
    setCharacterId,
  ] = useState<
    number | null
  >(
    null,
  );

  const [
    nickname,
    setNickname,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  if (!pendingSignup) {
    return (
      <Navigate
        to="/signup"
        replace
      />
    );
  }

  const signupData =
    pendingSignup;

  function chooseGender(
    selectedGender:
      Gender,
  ) {
    setGender(
      selectedGender,
    );

    setStep(
      "character",
    );
  }

  function chooseCharacter(
    id: number,
  ) {
    setCharacterId(
      id,
    );

    setStep(
      "nickname",
    );
  }

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      characterId ===
      null
    ) {
      return;
    }

    if (
      !nickname.trim()
    ) {
      setError(
        "닉네임을 입력해주세요",
      );

      return;
    }

    setLoading(true);
    setError(null);

    try {
      await mockAuthApi.signup(
        signupData.email,
        signupData.password,
        signupData.name,
        signupData.birthDate,
        nickname.trim(),
        characterId,
      );

      navigate(
        "/login",
        {
          replace: true,

          state: {
            justSignedUp:
              true,
          },
        },
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "저장에 실패했습니다",
      );
    } finally {
      setLoading(false);
    }
  }

  const genderChars =
    gender
      ? CHARACTERS.filter(
          (character) =>
            character.gender ===
            "남",
        )
      : [];

  return (
    <div style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ff, padding: "32px 16px", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <img src={chBackground} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated", filter: "brightness(0.85)", transform: "scale(1.04)" }} />
      </div>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "linear-gradient(180deg,rgba(10,20,6,0.2) 0%,rgba(10,20,6,0.45) 100%)" }} />

      <Card style={{ position: "relative", zIndex: 1, width: 420, display: "flex", flexDirection: "column", gap: 16, ...woodFrameBorder(20) }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <span style={{ fontFamily: fs, fontWeight: 700, fontSize: 20, color: C.inkDark }}>캐릭터를 선택해주세요</span>
          <span style={{ fontSize: 11, color: C.inkMid }}>
            {step === "gender" && "먼저 성별을 선택해주세요"}
            {step === "character" && "캐릭터를 선택해주세요"}
            {step === "nickname" && "마지막으로 닉네임을 정해주세요"}
          </span>
        </div>

        {step === "gender" && (
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={() => chooseGender("남")}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                padding: "28px 12px", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: ff,
                background: C.blue, border: `2px solid ${C.blueB}`, color: C.blueTx,
              }}
            >
              <span style={{ fontSize: 32 }}>♂</span>
              남성
            </button>
          </div>
        )}

        {step === "character" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {genderChars.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => chooseCharacter(ch.id)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    padding: "12px 8px", cursor: "pointer",
                    background: "rgba(139,94,60,0.08)", border: `2px solid ${C.hanjiB}`,
                  }}
                >
                  <ProfileAvatar id={ch.id} size={72} />
                  <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 600 }}>{ch.era}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setStep(
                  "gender",
                )
              }
              style={{ fontSize: 11, color: C.inkMid, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              ← 성별 다시 선택
            </button>
          </div>
        )}

        {step === "nickname" && characterId !== null && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ProfileAvatar id={characterId} size={96} />
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>닉네임</span>

              <Input
                value={nickname}
                onChange={(event) =>
                  setNickname(
                    event.target.value,
                  )
                }
                placeholder="닉네임을 입력하세요"
                maxLength={16}
                autoFocus
                style={{
                  width: "100%",
                }}
              />
            </label>

            {error && (
              <div style={{ fontSize: 11, color: C.redB, background: "rgba(192,64,64,0.12)", border: `1px solid ${C.redB}`, padding: "6px 8px" }}>
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="green"
              block
              disabled={loading}
            >
              {loading
                ? "저장 중..."
                : "이 캐릭터로 시작하기"}
            </Button>

            <button
              type="button"
              onClick={() =>
                setStep(
                  "character",
                )
              }
              style={{ fontSize: 11, color: C.inkMid, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              ← 캐릭터 다시 선택
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}