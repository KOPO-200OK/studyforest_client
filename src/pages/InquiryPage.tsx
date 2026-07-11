import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { C, ff, fs } from "@/styles/tokens";
import { Button, Card, Input } from "@/components/ui";
import { mockAuthApi } from "@/api/mockAuthApi";
import { inquiryApi, type InquiryDetailResponse, type InquirySummaryResponse } from "@/api/inquiryApi";

const inputStyle = {
  fontSize: 12, padding: "8px 12px", background: C.inputBg, border: `1px solid ${C.inputBr}`,
  outline: "none", color: C.inkDark, fontFamily: ff, width: "100%",
};

export default function InquiryPage() {
  const account = mockAuthApi.getCurrentAccount();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [inquiries, setInquiries] = useState<InquirySummaryResponse[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [detail, setDetail] = useState<InquiryDetailResponse | null>(null);

  async function loadInquiries() {
    setLoadingList(true);
    try {
      const page = await inquiryApi.listMine({ page: 0, size: 20 });
      setInquiries(page.content);
    } catch {
      // 목록 조회 실패는 조용히 무시 (작성 폼은 계속 사용 가능)
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    if (account) void loadInquiries();
  }, [account?.email]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await inquiryApi.create({ title: title.trim(), content: content.trim(), isSecret });
      setTitle("");
      setContent("");
      setIsSecret(false);
      await loadInquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "문의 등록에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleDetail(inquiryId: number) {
    if (openId === inquiryId) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(inquiryId);
    setDetail(null);
    try {
      const d = await inquiryApi.getMine(inquiryId);
      setDetail(d);
    } catch {
      setOpenId(null);
    }
  }

  if (!account) {
    return (
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
        <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 20, marginBottom: 6 }}>✉️ 문의하기</h2>
        <Card style={{ maxWidth: 480 }}>
          <div style={{ fontFamily: ff, fontSize: 13, color: C.inkDark, marginBottom: 12 }}>
            문의를 남기려면 로그인이 필요합니다.
          </div>
          <Link to="/login"><Button variant="green">로그인하러 가기</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
      <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 20, marginBottom: 6 }}>✉️ 문의하기</h2>
      <p style={{ fontFamily: ff, color: "#9aaa80", fontSize: 12, marginBottom: 24 }}>궁금한 점이나 불편한 점을 남겨주시면 확인 후 답변드릴게요</p>

      <Card style={{ maxWidth: 480, marginBottom: 24 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>제목</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="문의 제목을 입력하세요" style={{ width: "100%" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>문의 내용</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="문의하실 내용을 입력하세요"
              rows={6}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.inkMid, fontFamily: ff }}>
            <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} />
            비밀글로 문의하기 (관리자만 열람)
          </label>

          {error && (
            <div style={{ fontSize: 11, color: C.redB, background: "rgba(192,64,64,0.12)", border: `1px solid ${C.redB}`, padding: "6px 8px" }}>
              {error}
            </div>
          )}

          <Button type="submit" variant="green" block disabled={submitting}>{submitting ? "등록 중..." : "문의 보내기"}</Button>
        </form>
      </Card>

      <div style={{ maxWidth: 480 }}>
        <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 14, color: "#f5e6c8", marginBottom: 10 }}>내 문의 내역</div>
        {loadingList && <div style={{ fontFamily: ff, fontSize: 12, color: "#9aaa80" }}>불러오는 중...</div>}
        {!loadingList && inquiries.length === 0 && (
          <div style={{ fontFamily: ff, fontSize: 12, color: "#9aaa80" }}>아직 등록한 문의가 없습니다</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {inquiries.map((i) => (
            <Card key={i.inquiryId} onClick={() => void toggleDetail(i.inquiryId)} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 13, color: "#2a1808" }}>
                  {i.isSecret && "🔒 "}{i.title}
                </div>
                <span style={{
                  fontSize: 10, fontFamily: ff, fontWeight: 700, padding: "2px 8px", flexShrink: 0,
                  color: i.hasComment ? "#245020" : "#9a7040",
                  background: i.hasComment ? "rgba(58,96,48,0.14)" : "rgba(139,94,60,0.1)",
                }}>
                  {i.hasComment ? "답변완료" : "답변대기"}
                </span>
              </div>
              <div style={{ fontFamily: ff, fontSize: 10, color: "#9a7040", marginTop: 4 }}>
                {new Date(i.createdAt).toLocaleString()}
              </div>

              {openId === i.inquiryId && detail && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.inputBr}` }}>
                  <div style={{ fontFamily: ff, fontSize: 12, color: "#5a3010", whiteSpace: "pre-wrap", marginBottom: 10 }}>
                    {detail.content}
                  </div>
                  {detail.comments.length === 0 ? (
                    <div style={{ fontFamily: ff, fontSize: 11, color: "#9a7040" }}>아직 답변이 등록되지 않았습니다</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {detail.comments.map((c) => (
                        <div key={c.commentId} style={{ background: "rgba(58,96,48,0.1)", border: "1px solid #245020", padding: "8px 10px", fontFamily: ff, fontSize: 11, color: "#245020" }}>
                          💬 {c.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
