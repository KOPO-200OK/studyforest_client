import { useEffect, useRef, useState, type DragEvent } from "react";
import { C, ff, fs } from "@/styles/tokens";
import { Button } from "@/components/ui";
import ProfileAvatar from "@/components/ProfileAvatar";
import { mockAuthApi } from "@/api/mockAuthApi";
import { mockJangwonApi, type JangwonApplication } from "@/api/mockJangwonApi";
import { getJangwonWinnersByYear } from "@/data/jangwonWinners";
import { DEFAULT_CHARACTER_ID } from "@/data/characters";

function ScrollRoller() {
  return (
    <div style={{ display: "flex", alignItems: "center", height: 22 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #a9773f, #5a3a18)", border: "2px solid #3a2008", flexShrink: 0, marginLeft: -11, zIndex: 1 }} />
      <div style={{ flex: 1, height: 16, background: "linear-gradient(180deg, #a9773f, #7a5030 50%, #5a3a18)", border: "2px solid #3a2008", borderLeft: "none", borderRight: "none" }} />
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #a9773f, #5a3a18)", border: "2px solid #3a2008", flexShrink: 0, marginRight: -11, zIndex: 1 }} />
    </div>
  );
}

export default function JangwonPage() {
  const account = mockAuthApi.getCurrentAccount();
  const email = mockAuthApi.getCurrentEmail();
  const existing = email ? mockJangwonApi.getApplicationByEmail(email) : null;

  const [imagePreview, setImagePreview] = useState<string | null>(existing?.imageDataUrl ?? null);
  const [dragOver, setDragOver] = useState(false);
  const [application, setApplication] = useState<JangwonApplication | null>(existing);

  useEffect(() => {
    if (!email) return;

    mockJangwonApi.loadMyApplications()
      .then((applications) => {
        const latest = applications[0] ?? null;
        setApplication(latest);
        setImagePreview(latest?.imageDataUrl ?? null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "장원급제 신청 내역을 불러오지 못했습니다");
      });
  }, [email]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const winnersByYear = getJangwonWinnersByYear();

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 첨부할 수 있어요");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  async function handleSubmit() {
  if (!email) return;
  if (!imagePreview) {
    setError("인증 이미지를 첨부해주세요");
    return;
  }

  try {
    const created = await mockJangwonApi.addApplication({
      email,
      nickname: account?.nickname ?? "학습자",
      characterId: account?.characterId ?? DEFAULT_CHARACTER_ID,
      imageDataUrl: imagePreview,
    });

    setApplication(created);
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : "장원급제 신청에 실패했습니다");
  }
}

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
      <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 20, marginBottom: 6 }}>🏆 장원급제</h2>
      <p style={{ fontFamily: ff, color: "#9aaa80", fontSize: 12, marginBottom: 24 }}>이달의 명예의 전당 · 학습왕에 도전해보세요</p>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* 두루마리 — 올해 · 작년 장원급제 */}
        <div style={{ width: 380, flexShrink: 0 }}>
          <ScrollRoller />
          <div style={{ background: C.hanji, borderLeft: "2px solid #b8a880", borderRight: "2px solid #b8a880", boxShadow: "0 0 20px rgba(0,0,0,0.35) inset", padding: "20px 22px" }}>
            <div style={{ textAlign: "center", fontFamily: fs, fontWeight: 700, fontSize: 16, color: C.inkDark, marginBottom: 20 }}>
              壯元及第
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {winnersByYear.map((group, i) => (
                <div key={group.year} style={{ paddingBottom: i < winnersByYear.length - 1 ? 20 : 0, borderBottom: i < winnersByYear.length - 1 ? "1px solid rgba(184,168,128,0.6)" : "none" }}>
                  <div style={{ textAlign: "center", fontFamily: ff, fontSize: 11, fontWeight: 700, color: C.inkMid, letterSpacing: "0.06em", marginBottom: 14 }}>{group.year}년 장원급제</div>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "18px 14px" }}>
                    {group.winners.map((w) => (
                      <div key={w.nickname} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 68 }}>
                        <div style={{ position: "relative", width: 56, height: 56 }}>
                          <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 22, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }}>👑</div>
                          <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", border: "3px solid #c8a030", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                            <ProfileAvatar id={w.characterId} size={56} />
                          </div>
                        </div>
                        <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 13, color: C.inkDark, textAlign: "center" }}>{w.nickname}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ScrollRoller />
        </div>

        {/* 신청 폼 */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ background: C.hanji, border: `2px solid ${C.hanjiB}`, boxShadow: `0 3px 0 ${C.hanjiSh}`, padding: 20 }}>
            <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 15, color: C.inkDark, marginBottom: 6 }}>
              📜 장원급제 신청
            </div>
            <p style={{ fontFamily: ff, fontSize: 12, color: C.inkMid, marginBottom: 16 }}>
              이번 달 학습 인증 이미지를 첨부해서 신청해보세요. 관리자 확인 후 명단에 반영됩니다.
            </p>

            {application?.status === "approved" && (
              <div style={{ fontSize: 12, color: "#245020", background: "rgba(58,96,48,0.14)", border: "1px solid #245020", padding: "8px 10px", marginBottom: 14, fontFamily: ff }}>
                👑 축하드립니다! 장원급제로 선정되셨습니다.
              </div>
            )}
            {application?.status === "rejected" && (
              <div style={{ fontSize: 12, color: "#7a1010", background: "rgba(192,64,64,0.1)", border: "1px solid #9a2020", padding: "8px 10px", marginBottom: 14, fontFamily: ff }}>
                📩 신청이 반려되었습니다.
                {application.rejectReason && <div style={{ marginTop: 4 }}>사유: {application.rejectReason}</div>}
              </div>
            )}
            {application?.status === "pending" && (
              <div style={{ fontSize: 12, color: "#245020", background: "rgba(58,96,48,0.14)", border: "1px solid #245020", padding: "8px 10px", marginBottom: 14, fontFamily: ff }}>
                ✅ 신청이 접수되었습니다. 관리자 검토를 기다리고 있어요. 다시 신청하면 이전 신청을 덮어씁니다.
              </div>
            )}

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                cursor: "pointer", padding: imagePreview ? 10 : "36px 16px", textAlign: "center",
                background: dragOver ? "rgba(200,160,48,0.14)" : "rgba(139,94,60,0.06)",
                border: `2px dashed ${dragOver ? C.active : C.inputBr}`, marginBottom: 12,
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="첨부 이미지 미리보기" style={{ maxWidth: "100%", maxHeight: 220, display: "block", margin: "0 auto" }} />
              ) : (
                <div style={{ fontFamily: ff, fontSize: 12, color: C.inkMid }}>
                  🖼️ 이미지를 여기로 끌어다 놓거나, 클릭해서 파일을 선택하세요
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
              style={{ display: "none" }}
            />

            {error && (
              <div style={{ fontSize: 11, color: C.redB, background: "rgba(192,64,64,0.12)", border: `1px solid ${C.redB}`, padding: "6px 8px", marginBottom: 12 }}>
                {error}
              </div>
            )}

            <Button variant="green" block onClick={() => void handleSubmit()}>
              {application ? "다시 신청하기" : "신청하기"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
