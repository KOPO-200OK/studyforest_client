import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Input } from "@/components/ui";
import { fs, ff } from "@/styles/tokens";
import { createChatSession, sendChatMessage } from "@/api/questionApi";

interface ChatMessage {
  id: number;
  sender: "USER" | "AI";
  content: string;
}

export default function AiQuestionPage() {
  const nav = useNavigate();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function ensureSession(): Promise<number> {
    if (sessionId) return sessionId;
    const session = await createChatSession({});
    setSessionId(session.aiChatSessionId);
    return session.aiChatSessionId;
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    setMessages(prev => [...prev, { id: Date.now(), sender: "USER", content: text }]);
    setLoading(true);
    try {
      const sid = await ensureSession();
      const { answer } = await sendChatMessage(sid, text);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: "AI", content: answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 응답을 받아오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 28, background: "linear-gradient(160deg,#1a2a14,#0e1a0a)", display: "flex", flexDirection: "column" }}>
      <button onClick={() => nav("/question-bank")} style={{ background: "none", border: "none", color: "#c8a060", cursor: "pointer", fontFamily: ff, fontSize: 12, marginBottom: 16 }}>← 문제은행 홈</button>
      <h2 style={{ fontFamily: fs, color: "#f5e6c8", fontSize: 18, marginBottom: 16 }}>🤖 AI 질의응답</h2>

      <Card style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 220, maxHeight: "52vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 }}>
          {messages.length === 0 && (
            <div style={{ fontFamily: ff, fontSize: 12, color: "#9a7040" }}>
              한국사 개념이나 방금 푼 문제에 대해 자유롭게 물어보세요.
            </div>
          )}
          {messages.map(m => (
            <div key={m.id} style={{ alignSelf: m.sender === "USER" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
              <div style={{
                fontFamily: ff, fontSize: 12, lineHeight: 1.6, padding: "8px 12px", whiteSpace: "pre-wrap",
                background: m.sender === "USER" ? "linear-gradient(135deg,#3a6030,#1e4018)" : "#fdf4db",
                color: m.sender === "USER" ? "#c0f0a0" : "#2a1808",
                border: `1px solid ${m.sender === "USER" ? "#1a3010" : "#c4a060"}`,
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div style={{ fontFamily: ff, fontSize: 11, color: "#9a7040" }}>AI가 답변을 작성 중…</div>}
          <div ref={bottomRef} />
        </div>

        {error && <div style={{ fontFamily: ff, fontSize: 11, color: "#c04040", marginTop: 8 }}>{error}</div>}

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") void handleSend(); }}
            placeholder="궁금한 점을 입력하세요"
            style={{ flex: 1 }}
            disabled={loading}
          />
          <Button variant="green" onClick={handleSend} disabled={loading || !input.trim()}>보내기</Button>
        </div>
      </Card>
    </div>
  );
}
