import { useState, type FormEvent } from "react";
import { Card, Button, Input } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import { mockNoticeApi } from "@/api/mockNoticeApi";

const inputStyle = {
  fontSize: 12, padding: "8px 12px", background: C.inputBg, border: `1px solid ${C.inputBr}`,
  outline: "none", color: C.inkDark, fontFamily: ff, width: "100%",
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState(() => mockNoticeApi.listNotices());
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today());
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date || !body.trim()) {
      setError("모든 항목을 입력해주세요");
      return;
    }
    setError(null);
    mockNoticeApi.addNotice({ title: title.trim(), date, body: body.trim() });
    setNotices(mockNoticeApi.listNotices());
    setTitle("");
    setDate(today());
    setBody("");
  }

  function handleDelete(id: number) {
    mockNoticeApi.deleteNotice(id);
    setNotices(mockNoticeApi.listNotices());
  }

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      <Card style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 14, color: "#2a1808" }}>➕ 공지사항 추가</div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>제목</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지 제목" style={{ width: "100%" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>날짜</span>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%" }} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: C.inkMid, fontWeight: 700 }}>내용</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="공지 내용을 입력하세요"
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </label>

          {error && (
            <div style={{ fontSize: 11, color: C.redB, background: "rgba(192,64,64,0.12)", border: `1px solid ${C.redB}`, padding: "6px 8px" }}>
              {error}
            </div>
          )}

          <Button type="submit" variant="green" block>공지사항 추가</Button>
        </form>
      </Card>

      <Card style={{ flex: 1, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", fontFamily: fs, fontWeight: 700, fontSize: 14, color: "#2a1808", borderBottom: `1px solid ${C.hanjiB}` }}>
          등록된 공지사항 ({notices.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {notices.map((n) => (
            <div key={n.id} style={{ padding: "12px 14px", borderBottom: `1px solid ${C.hanjiB}`, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <div style={{ fontFamily: ff, fontSize: 12 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: "#2a1808" }}>{n.title}</span>
                  <span style={{ fontSize: 10, color: "#9a7040" }}>{n.date}</span>
                </div>
                <div style={{ color: "#5a3010" }}>{n.body}</div>
              </div>
              <Button variant="red" onClick={() => handleDelete(n.id)} style={{ padding: "4px 10px", fontSize: 10, flexShrink: 0 }}>
                삭제
              </Button>
            </div>
          ))}
          {notices.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "#7a5828", fontFamily: fs, fontSize: 13 }}>
              등록된 공지사항이 없습니다
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
