import { useState } from "react";
import { Card, Button } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import { mockInquiryApi } from "@/api/mockInquiryApi";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState(() => mockInquiryApi.listInquiries());

  function handleDelete(id: number) {
    if (!confirm("이 문의를 삭제할까요?")) return;
    mockInquiryApi.deleteInquiry(id);
    setInquiries(mockInquiryApi.listInquiries());
  }

  return (
    <div>
      <p style={{ fontFamily: ff, color: "#9aaa80", fontSize: 12, marginBottom: 16 }}>
        접수된 문의 {inquiries.length}건
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
        {inquiries.map((i) => (
          <Card key={i.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 14, color: "#2a1808" }}>{i.name}</div>
                <div style={{ fontFamily: ff, fontSize: 11, color: "#9a7040" }}>{i.email}</div>
              </div>
              <div style={{ fontFamily: ff, fontSize: 10, color: "#9a7040", flexShrink: 0 }}>{new Date(i.submittedAt).toLocaleString()}</div>
            </div>
            <div style={{ fontFamily: ff, fontSize: 12, color: "#5a3010", whiteSpace: "pre-wrap", marginBottom: 10 }}>{i.content}</div>
            <Button variant="red" onClick={() => handleDelete(i.id)} style={{ padding: "4px 10px", fontSize: 10 }}>삭제</Button>
          </Card>
        ))}
        {inquiries.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "#7a5828", fontFamily: fs, fontSize: 13 }}>
            아직 문의 내역이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
