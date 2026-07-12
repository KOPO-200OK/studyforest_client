import {
  useEffect,
  useState,
} from "react";

import {
  jangwonApi,
  type JangwonApplicationResponse,
  type JangwonApplicationStatus,
} from "@/api/jangwonApi";
import ProfileAvatar from "@/components/ProfileAvatar";
import {
  Button,
  Card,
} from "@/components/ui";
import {
  DEFAULT_CHARACTER_ID,
} from "@/data/characters";
import {
  refreshJangwonWinners,
} from "@/hooks/useJangwonWinners";
import {
  C,
  ff,
  fs,
} from "@/styles/tokens";

const STATUS_LABEL: Record<
  JangwonApplicationStatus,
  {
    text: string;
    color: string;
  }
> = {
  PENDING: {
    text: "검토 대기",
    color: "#8a6a20",
  },

  APPROVED: {
    text: "수락됨",
    color: "#245020",
  },

  REJECTED: {
    text: "반려됨",
    color: "#9a2020",
  },
};

function getCharacterId(
  characterName: string,
): number {
  const characterId =
    Number(characterName);

  return (
    Number.isInteger(
      characterId,
    ) &&
    characterId > 0
  )
    ? characterId
    : DEFAULT_CHARACTER_ID;
}

function formatDateTime(
  value: string,
): string {
  return new Date(
    value,
  ).toLocaleString(
    "ko-KR",
  );
}

export default function AdminJangwonPage() {
  const [
    applications,
    setApplications,
  ] = useState<
    JangwonApplicationResponse[]
  >([]);

  const [
    preview,
    setPreview,
  ] = useState<
    string | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionApplicationId,
    setActionApplicationId,
  ] = useState<
    number | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  async function loadApplications() {
    setLoading(true);
    setError(null);

    try {
      const page =
        await jangwonApi
          .listAdminApplications({
            page: 0,
            size: 50,
          });

      setApplications(
        page.content,
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError
              .message
          : "장원급제 신청 목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  useEffect(() => {
    void loadApplications();
  }, []);

  async function handleDelete(
    applicationId: number,
  ) {
    if (
      !window.confirm(
        "이 신청을 삭제하시겠습니까?",
      )
    ) {
      return;
    }

    setActionApplicationId(
      applicationId,
    );

    setError(null);

    try {
      const deletingApplication =
        applications.find(
          (
            application,
          ) =>
            application
              .jangwonApplicationId ===
            applicationId,
        );

      await jangwonApi.delete(
        applicationId,
      );

      if (
        deletingApplication
          ?.status ===
        "APPROVED"
      ) {
        await refreshJangwonWinners();
      }

      setApplications(
        (previous) =>
          previous.filter(
            (
              application,
            ) =>
              application
                .jangwonApplicationId !==
              applicationId,
          ),
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError
              .message
          : "장원급제 신청 삭제에 실패했습니다.",
      );
    } finally {
      setActionApplicationId(
        null,
      );
    }
  }

  async function handleApprove(
    applicationId: number,
  ) {
    if (
      !window.confirm(
        "이 신청을 승인하시겠습니까?",
      )
    ) {
      return;
    }

    setActionApplicationId(
      applicationId,
    );

    setError(null);

    try {
      const approved =
        await jangwonApi.approve(
          applicationId,
        );

      setApplications(
        (previous) =>
          previous.map(
            (
              application,
            ) =>
              application
                .jangwonApplicationId ===
              applicationId
                ? approved
                : application,
          ),
      );

      await refreshJangwonWinners();
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError
              .message
          : "장원급제 신청 승인에 실패했습니다.",
      );
    } finally {
      setActionApplicationId(
        null,
      );
    }
  }

  async function handleReject(
    applicationId: number,
  ) {
    const adminMemo =
      window.prompt(
        "반려 사유를 입력해주세요.",
      );

    if (
      !adminMemo?.trim()
    ) {
      return;
    }

    setActionApplicationId(
      applicationId,
    );

    setError(null);

    try {
      const rejected =
        await jangwonApi.reject(
          applicationId,
          adminMemo.trim(),
        );

      setApplications(
        (previous) =>
          previous.map(
            (
              application,
            ) =>
              application
                .jangwonApplicationId ===
              applicationId
                ? rejected
                : application,
          ),
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError
              .message
          : "장원급제 신청 반려에 실패했습니다.",
      );
    } finally {
      setActionApplicationId(
        null,
      );
    }
  }

  return (
    <div>
      <p
        style={{
          fontFamily: ff,
          color:
            "#9aaa80",

          fontSize: 12,
          marginBottom: 16,
        }}
      >
        장원급제 신청{" "}
        {applications.length}
        건
      </p>

      {error && (
        <div
          style={{
            fontSize: 11,
            color: C.redB,

            background:
              "rgba(192,64,64,0.12)",

            border:
              `1px solid ${C.redB}`,

            padding:
              "6px 8px",

            marginBottom:
              14,

            fontFamily:
              ff,
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <Card>
          <div
            style={{
              padding: 18,

              textAlign:
                "center",

              color:
                "#7a5828",

              fontFamily:
                fs,

              fontSize:
                13,
            }}
          >
            신청 목록을 불러오는 중입니다.
          </div>
        </Card>
      )}

      {!loading && (
        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "repeat(auto-fill, minmax(220px, 1fr))",

            gap: 14,
          }}
        >
          {applications.map(
            (
              application,
            ) => {
              const actionLoading =
                actionApplicationId ===
                application
                  .jangwonApplicationId;

              const status =
                STATUS_LABEL[
                  application.status
                ];

              return (
                <Card
                  key={
                    application
                      .jangwonApplicationId
                  }
                  style={{
                    padding: 0,
                    overflow:
                      "hidden",

                    display:
                      "flex",

                    flexDirection:
                      "column",
                  }}
                >
                  <img
                    src={
                      application
                        .certificateImageUrl
                    }
                    alt={`${application.displayNickname}의 인증 이미지`}
                    onClick={() =>
                      setPreview(
                        application
                          .certificateImageUrl,
                      )
                    }
                    style={{
                      width:
                        "100%",

                      height:
                        160,

                      objectFit:
                        "cover",

                      cursor:
                        "pointer",

                      borderBottom:
                        `1px solid ${C.hanjiB}`,
                    }}
                  />

                  <div
                    style={{
                      padding:
                        "10px 12px",

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",

                        alignItems:
                          "center",

                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width:
                            24,

                          height:
                            24,

                          flexShrink:
                            0,

                          overflow:
                            "hidden",

                          borderRadius:
                            "50%",
                        }}
                      >
                        {application.characterImageUrl ? (
                          <img
                            src={
                              application
                                .characterImageUrl
                            }
                            alt=""
                            style={{
                              width:
                                24,

                              height:
                                24,

                              objectFit:
                                "cover",
                            }}
                          />
                        ) : (
                          <ProfileAvatar
                            id={getCharacterId(
                              application.characterName,
                            )}
                            size={
                              24
                            }
                          />
                        )}
                      </div>

                      <div
                        style={{
                          fontFamily:
                            ff,

                          fontWeight:
                            700,

                          fontSize:
                            13,

                          color:
                            "#2a1808",
                        }}
                      >
                        {
                          application.displayNickname
                        }
                      </div>
                    </div>

                    <div
                      style={{
                        fontFamily:
                          ff,

                        fontSize:
                          11,

                        color:
                          "#9a7040",
                      }}
                    >
                      이름:{" "}
                      {
                        application.displayName
                      }
                    </div>

                    <div
                      style={{
                        fontFamily:
                          ff,

                        fontSize:
                          10,

                        color:
                          "#9a7040",
                      }}
                    >
                      {formatDateTime(
                        application.appliedAt,
                      )}
                    </div>

                    <div
                      style={{
                        fontFamily:
                          ff,

                        fontWeight:
                          700,

                        fontSize:
                          11,

                        color:
                          status.color,
                      }}
                    >
                      {
                        status.text
                      }
                    </div>

                    {application.status ===
                      "REJECTED" &&
                      application.adminMemo && (
                        <div
                          style={{
                            fontFamily:
                              ff,

                            fontSize:
                              10,

                            color:
                              "#7a1010",

                            background:
                              "rgba(192,64,64,0.08)",

                            padding:
                              "4px 6px",
                          }}
                        >
                          사유:{" "}
                          {
                            application.adminMemo
                          }
                        </div>
                      )}

                    <div
                      style={{
                        display:
                          "flex",

                        gap: 6,

                        marginTop:
                          4,
                      }}
                    >
                      {application.status ===
                        "PENDING" && (
                        <>
                          <Button
                            variant="green"
                            disabled={
                              actionLoading
                            }
                            onClick={() =>
                              void handleApprove(
                                application
                                  .jangwonApplicationId,
                              )
                            }
                            style={{
                              padding:
                                "4px 10px",

                              fontSize:
                                10,
                            }}
                          >
                            수락
                          </Button>

                          <Button
                            variant="red"
                            disabled={
                              actionLoading
                            }
                            onClick={() =>
                              void handleReject(
                                application
                                  .jangwonApplicationId,
                              )
                            }
                            style={{
                              padding:
                                "4px 10px",

                              fontSize:
                                10,
                            }}
                          >
                            반려
                          </Button>
                        </>
                      )}

                      <Button
                        variant="red"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          void handleDelete(
                            application
                              .jangwonApplicationId,
                          )
                        }
                        style={{
                          padding:
                            "4px 10px",

                          fontSize:
                            10,
                        }}
                      >
                        {actionLoading
                          ? "처리 중"
                          : "삭제"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            },
          )}

          {applications.length ===
            0 && (
            <div
              style={{
                gridColumn:
                  "1 / -1",

                padding: 24,

                textAlign:
                  "center",

                color:
                  "#7a5828",

                fontFamily:
                  fs,

                fontSize:
                  13,
              }}
            >
              아직 신청 내역이 없습니다.
            </div>
          )}
        </div>
      )}

      {preview && (
        <div
          onClick={() =>
            setPreview(null)
          }
          style={{
            position:
              "fixed",

            inset: 0,
            zIndex: 90,

            background:
              "rgba(0,0,0,0.8)",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            cursor:
              "pointer",

            padding: 32,
          }}
        >
          <img
            src={
              preview
            }
            alt="인증 이미지 원본"
            style={{
              maxWidth:
                "100%",

              maxHeight:
                "100%",

              boxShadow:
                "0 8px 32px rgba(0,0,0,0.6)",
            }}
          />
        </div>
      )}
    </div>
  );
}