import { useEffect, useState } from "react";
import { Card, Button } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import { mockJangwonApi } from "@/api/mockJangwonApi";
import ProfileAvatar from "@/components/ProfileAvatar";
import { DEFAULT_CHARACTER_ID } from "@/data/characters";

export default function AdminJangwonPage() {
  const [applications, setApplications] = useState(() => mockJangwonApi.listApplications());
  const [preview, setPreview] = useState<string | null>(null);

  async function loadApplications() {
    const loaded = await mockJangwonApi.loadAdminApplications();
    setApplications(loaded);
  }

  useEffect(() => {
    void loadApplications();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("이 신청을 삭제할까요?")) return;
    await mockJangwonApi.deleteApplication(id);
    setApplications(mockJangwonApi.listApplications());
  }

  async function handleApprove(id: number) {
    if (!confirm("이 신청을 수락하고 올해의 장원급제로 등록할까요?")) return;
    await mockJangwonApi.approveApplication(id);
    setApplications(mockJangwonApi.listApplications());
  }

  async function handleReject(id: number) {
    const reason = prompt("반려 사유를 입력해주세요");
    if (!reason) return;
    await mockJangwonApi.rejectApplication(id, reason);
    setApplications(mockJangwonApi.listApplications());
  }

  const STATUS_LABEL: Record<string, { text: string; color: string }> = {
    pending: { text: "검토 대기", color: "#8a6a20" },
    approved: { text: "✅ 수락됨", color: "#245020" },
    rejected: { text: "❌ 반려됨", color: "#9a2020" },
  };

  return (
    <div>
      <p style={{ fontFamily: ff, color: "#9aaa80", fontSize: 12, marginBottom: 16 }}>
        장원급제 신청 {applications.length}건
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {applications.map((a) => (
          <Card key={a.id} style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <img
              src={a.imageDataUrl}
              alt={`${a.nickname}의 인증 이미지`}
              onClick={() => setPreview(a.imageDataUrl)}
              style={{ width: "100%", height: 160, objectFit: "cover", cursor: "pointer", borderBottom: `1px solid ${C.hanjiB}` }}
            />
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, flexShrink: 0, overflow: "hidden", borderRadius: "50%" }}>
                  <ProfileAvatar id={a.characterId ?? DEFAULT_CHARACTER_ID} size={24} />
                </div>
                <div style={{ fontFamily: ff, fontWeight: 700, fontSize: 13, color: "#2a1808" }}>{a.nickname}</div>
              </div>
              <div style={{ fontFamily: ff, fontSize: 11, color: "#9a7040" }}>{a.email}</div>
              <div style={{ fontFamily: ff, fontSize: 10, color: "#9a7040" }}>{new Date(a.submittedAt).toLocaleString()}</div>
              <div style={{ fontFamily: ff, fontWeight: 700, fontSize: 11, color: STATUS_LABEL[a.status].color }}>
                {STATUS_LABEL[a.status].text}
              </div>
              {a.status === "rejected" && a.rejectReason && (
                <div style={{ fontFamily: ff, fontSize: 10, color: "#7a1010", background: "rgba(192,64,64,0.08)", padding: "4px 6px" }}>
                  사유: {a.rejectReason}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                {a.status === "pending" && (
                  <>
                    <Button variant="green" onClick={() => void handleApprove(a.id)} style={{ padding: "4px 10px", fontSize: 10 }}>
                      수락
                    </Button>
                    <Button variant="red" onClick={() => void handleReject(a.id)} style={{ padding: "4px 10px", fontSize: 10 }}>
                      반려
                    </Button>
                  </>
                )}
                <Button variant="red" onClick={() => void handleDelete(a.id)} style={{ padding: "4px 10px", fontSize: 10 }}>
                  삭제
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {applications.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: 24, textAlign: "center", color: "#7a5828", fontFamily: fs, fontSize: 13 }}>
            아직 신청 내역이 없습니다
          </div>
        )}
      </div>

      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 32 }}>
          <img src={preview} alt="인증 이미지 원본" style={{ maxWidth: "100%", maxHeight: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }} />
        </div>
      )}
    </div>
  );
}
