import { useState, type FormEvent } from "react";
import { C, ff, fs } from "@/styles/tokens";
import { Button, Card, Input } from "@/components/ui";
import { mockAuthApi } from "@/api/mockAuthApi";
import { mockInquiryApi } from "@/api/mockInquiryApi";

const inputStyle = {
  fontSize: 12, padding: "8px 12px", background: C.inputBg, border: `1px solid ${C.inputBr}`,
  outline: "none", color: C.inkDark, fontFamily: ff, width: "100%",
};

export default function InquiryPage() {
  const account = mockAuthApi.getCurrentAccount();
  const [name, setName] = useState(account?.name ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) {
      setError("모든 항목을 입력해주세요");
      return;
    }
    setError(null);
    mockInquiryApi.addInquiry({ name: name.trim(), email: email.trim(), content: content.trim() });
    setContent("");
    setSubmitted(true);
  }

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)" }}>
      <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 20, marginBottom: 6 }}>✉️ 문의하기</h2>
      <p style={{ fontFamily: ff, color: "#9aaa80", fontSize: 12, marginBottom: 24 }}>궁금한 점이나 불편한 점을 남겨주시면 확인 후 답변드릴게요</p>

      <Card style={{ maxWidth: 480 }}>
        {submitted && (
          <div style={{ fontSize: 12, color: "#245020", background: "rgba(58,96,48,0.14)", border: "1px solid #245020", padding: "8px 10px", marginBottom: 14, fontFamily: ff }}>
            ✅ 문의가 접수되었습니다. 입력하신 이메일로 답변드릴게요.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>이름</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력하세요" style={{ width: "100%" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>답변 받을 이메일</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일을 입력하세요" style={{ width: "100%" }} />
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

          {error && (
            <div style={{ fontSize: 11, color: C.redB, background: "rgba(192,64,64,0.12)", border: `1px solid ${C.redB}`, padding: "6px 8px" }}>
              {error}
            </div>
          )}

          <Button type="submit" variant="green" block>문의 보내기</Button>
        </form>
      </Card>
    </div>
  );
}
