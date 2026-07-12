import {
  useEffect,
  useState,
} from "react";

import {
  Card,
  Button,
} from "@/components/ui";

import {
  fs,
  ff,
  C,
} from "@/styles/tokens";

import {
  adminApi,
  type AdminMemberSummaryResponse,
} from "@/api/adminApi";

import {
  CHARACTERS,
} from "@/data/characters";

type AccountRow = {
  memberId: number;
  email: string;
  name: string;
  birthDate: string;
  nickname?: string;
  characterId?: number;
  isDeleted: boolean;
};

function toAccountRow(
  member:
    AdminMemberSummaryResponse,
): AccountRow {
  return {
    memberId:
      member.memberId,

    email:
      member.email,

    name:
      member.name,

    birthDate:
      member.birthdate,

    /**
     * 현재 닉네임은 브라우저 localStorage에만 저장되고
     * SF_USER 테이블에는 저장되지 않습니다.
     *
     * USER/ADMIN을 닉네임으로 잘못 표시하지 않고
     * 서버 닉네임 연동 전까지 "-"로 표시합니다.
     */
    nickname:
      member.nickname,

    characterId:
      member.characterId,

    isDeleted:
      member.isDeleted,
  };
}

export default function AdminMembersPage() {
  const [
    accounts,
    setAccounts,
  ] = useState<
    AccountRow[]
  >([]);

  async function loadAccounts() {
    const page =
      await adminApi.listMembers({
        page: 0,
        size: 50,
      });

    setAccounts(
      page.content.map(
        toAccountRow,
      ),
    );
  }

  useEffect(() => {
    void loadAccounts();
  }, []);

  async function handleDelete(
    memberId: number,
    email: string,
    isDeleted: boolean,
  ) {
    if (
      !confirm(
        `${email} 계정을 ${
          isDeleted
            ? "복구"
            : "탈퇴 처리"
        }할까요?`,
      )
    ) {
      return;
    }

    await adminApi
      .updateMemberDeleteStatus(
        memberId,
        !isDeleted,
      );

    await loadAccounts();
  }

  return (
    <div>
      <p
        style={{
          fontFamily: ff,
          color: "#9aaa80",
          fontSize: 12,
          marginBottom: 16,
        }}
      >
        가입된 회원{" "}
        {accounts.length}명
      </p>

      <Card
        style={{
          padding: 0,
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",

            fontFamily: ff,
            fontSize: 12,
          }}
        >
          <thead>
            <tr
              style={{
                background:
                  "rgba(139,94,60,0.15)",

                textAlign:
                  "left",
              }}
            >
              {[
                "이메일",
                "이름",
                "생년월일",
                "닉네임",
                "캐릭터",
                "",
              ].map(
                (header) => (
                  <th
                    key={header}
                    style={{
                      padding:
                        "10px 14px",

                      color:
                        "#7a5828",

                      fontWeight:
                        700,

                      borderBottom:
                        `1px solid ${C.hanjiB}`,
                    }}
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {accounts.map(
              (account) => {
                const character =
                  CHARACTERS.find(
                    (
                      item,
                    ) =>
                      item.id ===
                      account.characterId,
                  );

                return (
                  <tr
                    key={
                      account.email
                    }
                  >
                    <td
                      style={{
                        padding:
                          "10px 14px",

                        color:
                          "#2a1808",

                        borderBottom:
                          `1px solid ${C.hanjiB}`,
                      }}
                    >
                      {
                        account.email
                      }
                    </td>

                    <td
                      style={{
                        padding:
                          "10px 14px",

                        color:
                          "#2a1808",

                        borderBottom:
                          `1px solid ${C.hanjiB}`,
                      }}
                    >
                      {
                        account.name
                      }
                    </td>

                    <td
                      style={{
                        padding:
                          "10px 14px",

                        color:
                          "#2a1808",

                        borderBottom:
                          `1px solid ${C.hanjiB}`,
                      }}
                    >
                      {
                        account.birthDate
                      }
                    </td>

                    <td
                      style={{
                        padding:
                          "10px 14px",

                        color:
                          "#2a1808",

                        borderBottom:
                          `1px solid ${C.hanjiB}`,
                      }}
                    >
                      {account.nickname ??
                        "-"}
                    </td>

                    <td
                      style={{
                        padding:
                          "10px 14px",

                        color:
                          "#2a1808",

                        borderBottom:
                          `1px solid ${C.hanjiB}`,
                      }}
                    >
                      {character?.label ??
                        (account.isDeleted
                          ? "탈퇴"
                          : "-")}
                    </td>

                    <td
                      style={{
                        padding:
                          "10px 14px",

                        borderBottom:
                          `1px solid ${C.hanjiB}`,

                        textAlign:
                          "right",
                      }}
                    >
                      <Button
                        variant={
                          account.isDeleted
                            ? "green"
                            : "red"
                        }
                        onClick={() =>
                          void handleDelete(
                            account.memberId,
                            account.email,
                            account.isDeleted,
                          )
                        }
                        style={{
                          padding:
                            "4px 10px",

                          fontSize:
                            10,
                        }}
                      >
                        {account.isDeleted
                          ? "복구"
                          : "삭제"}
                      </Button>
                    </td>
                  </tr>
                );
              },
            )}

            {accounts.length ===
              0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 24,
                    textAlign:
                      "center",

                    color:
                      "#7a5828",

                    fontFamily:
                      fs,
                  }}
                >
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