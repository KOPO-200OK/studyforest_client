import { useEffect, useState } from "react";
import { Card, Button } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import { adminApi, type AdminMemberSummaryResponse } from "@/api/adminApi";
import { CHARACTERS } from "@/data/characters";

type AccountRow = {
  memberId: number;
  email: string;
  name: string;
  birthDate: string;
  nickname?: string;
  characterId?: number;
  isDeleted: boolean;
};

function toAccountRow(member: AdminMemberSummaryResponse): AccountRow {
  return {
    memberId: member.memberId,
    email: member.email,
    name: member.name,
    birthDate: member.birthdate,
    nickname: member.userRole,
    characterId: undefined,
    isDeleted: member.isDeleted,
  };
}

export default function AdminMembersPage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);

  async function loadAccounts() {
    const page = await adminApi.listMembers({ page: 0, size: 50 });
    setAccounts(page.content.map(toAccountRow));
  }

  useEffect(() => {
    void loadAccounts();
  }, []);

  async function handleDelete(memberId: number, email: string, isDeleted: boolean) {
    if (!confirm(`${email} 계정을 ${isDeleted ? "복구" : "탈퇴 처리"}할까요?`)) return;
    await adminApi.updateMemberDeleteStatus(memberId, !isDeleted);
    await loadAccounts();
  }

  return (
    <div>
      <p style={{ fontFamily: ff, color: "#9aaa80", fontSize: 12, marginBottom: 16 }}>
        가입된 회원 {accounts.length}명
      </p>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: ff, fontSize: 12 }}>
          <thead>
            <tr style={{ background: "rgba(139,94,60,0.15)", textAlign: "left" }}>
              {["이메일", "이름", "생년월일", "닉네임", "캐릭터", ""].map((h) => (
                <th key={h} style={{ padding: "10px 14px", color: "#7a5828", fontWeight: 700, borderBottom: `1px solid ${C.hanjiB}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => {
              const character = CHARACTERS.find((c) => c.id === a.characterId);
              return (
                <tr key={a.email}>
                  <td style={{ padding: "10px 14px", color: "#2a1808", borderBottom: `1px solid ${C.hanjiB}` }}>{a.email}</td>
                  <td style={{ padding: "10px 14px", color: "#2a1808", borderBottom: `1px solid ${C.hanjiB}` }}>{a.name}</td>
                  <td style={{ padding: "10px 14px", color: "#2a1808", borderBottom: `1px solid ${C.hanjiB}` }}>{a.birthDate}</td>
                  <td style={{ padding: "10px 14px", color: "#2a1808", borderBottom: `1px solid ${C.hanjiB}` }}>{a.nickname ?? "-"}</td>
                  <td style={{ padding: "10px 14px", color: "#2a1808", borderBottom: `1px solid ${C.hanjiB}` }}>{character?.label ?? (a.isDeleted ? "탈퇴" : "-")}</td>
                  <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.hanjiB}`, textAlign: "right" }}>
                    <Button variant={a.isDeleted ? "green" : "red"} onClick={() => void handleDelete(a.memberId, a.email, a.isDeleted)} style={{ padding: "4px 10px", fontSize: 10 }}>
                      {a.isDeleted ? "복구" : "삭제"}
                    </Button>
                  </td>
                </tr>
              );
            })}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#7a5828", fontFamily: fs }}>
                  가입된 회원이 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}