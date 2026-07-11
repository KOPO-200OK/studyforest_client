import { useEffect, useState } from "react";
import { Card, Button } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import { adminInquiryApi, type InquiryDetailResponse, type InquirySummaryResponse } from "@/api/inquiryApi";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquirySummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [detail, setDetail] = useState<InquiryDetailResponse | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const page = await adminInquiryApi.list({ page: 0, size: 50 });
      setInquiries(page.content);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggleDetail(inquiryId: number) {
    if (openId === inquiryId) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(inquiryId);
    setDetail(null);
    setReplyDraft("");
    const d = await adminInquiryApi.getDetail(inquiryId);
    setDetail(d);
  }

  async function handleReply(inquiryId: number) {
    const content = replyDraft.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      await adminInquiryApi.addComment(inquiryId, content);
      const d = await adminInquiryApi.getDetail(inquiryId);
      setDetail(d);
      setReplyDraft("");
      setInquiries((prev) => prev.map((i) => (i.inquiryId === inquiryId ? { ...i, hasComment: true } : i)));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(inquiryId: number, commentId: number) {
    if (!confirm("이 답변을 삭제할까요?")) return;
    await adminInquiryApi.deleteComment(inquiryId, commentId);
    const d = await adminInquiryApi.getDetail(inquiryId);
    setDetail(d);
    setInquiries((prev) => prev.map((i) => (i.inquiryId === inquiryId ? { ...i, hasComment: d.comments.length > 0 } : i)));
  }

  return (
    <div>
      <p style={{ fontFamily: ff, color: "#9aaa80", fontSize: 12, marginBottom: 16 }}>
        접수된 문의 {inquiries.length}건
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
        {loading && <div style={{ fontFamily: ff, fontSize: 12, color: "#9aaa80" }}>불러오는 중...</div>}

        {inquiries.map((i) => (
          <Card key={i.inquiryId}>
            <div
              onClick={() => void toggleDetail(i.inquiryId)}
              style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}
            >
              <div>
                <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 14, color: "#2a1808" }}>{i.isSecret && "🔒 "}{i.title}</div>
                <div style={{ fontFamily: ff, fontSize: 11, color: "#9a7040" }}>{i.authorName}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <span style={{
                  fontSize: 10, fontFamily: ff, fontWeight: 700, padding: "2px 8px",
                  color: i.hasComment ? "#245020" : "#9a2020",
                  background: i.hasComment ? "rgba(58,96,48,0.14)" : "rgba(192,64,64,0.1)",
                }}>
                  {i.hasComment ? "답변완료" : "미답변"}
                </span>
                <span style={{ fontFamily: ff, fontSize: 10, color: "#9a7040" }}>{new Date(i.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {openId === i.inquiryId && detail && (
              <div style={{ paddingTop: 10, borderTop: `1px solid ${C.inputBr}` }}>
                <div style={{ fontFamily: ff, fontSize: 12, color: "#5a3010", whiteSpace: "pre-wrap", marginBottom: 10 }}>{detail.content}</div>

                {detail.comments.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                    {detail.comments.map((c) => (
                      <div key={c.commentId} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, background: "rgba(58,96,48,0.1)", border: "1px solid #245020", padding: "8px 10px" }}>
                        <span style={{ fontFamily: ff, fontSize: 11, color: "#245020" }}>💬 {c.content}</span>
                        <button onClick={() => void handleDeleteComment(i.inquiryId, c.commentId)} style={{ fontSize: 10, color: "#9a2020", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>삭제</button>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder="답변을 입력하세요"
                  rows={3}
                  style={{ width: "100%", fontSize: 12, padding: "8px 10px", background: C.inputBg, border: `1px solid ${C.inputBr}`, outline: "none", color: C.inkDark, fontFamily: ff, resize: "vertical" }}
                />
                <Button variant="green" onClick={() => void handleReply(i.inquiryId)} disabled={submitting || !replyDraft.trim()} style={{ marginTop: 8, padding: "6px 14px", fontSize: 11 }}>
                  답변 등록
                </Button>
              </div>
            )}
          </Card>
        ))}

        {!loading && inquiries.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "#7a5828", fontFamily: fs, fontSize: 13 }}>
            아직 문의 내역이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
