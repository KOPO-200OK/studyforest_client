import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";

import {
  jangwonApi,
  type JangwonApplicationResponse,
  type JangwonWinnerResponse,
} from "@/api/jangwonApi";
import { mockAuthApi } from "@/api/mockAuthApi";
import { Button } from "@/components/ui";
import ProfileAvatar from "@/components/ProfileAvatar";
import {
  DEFAULT_CHARACTER_ID,
} from "@/data/characters";
import {
  loadJangwonWinners,
} from "@/hooks/useJangwonWinners";
import {
  C,
  ff,
  fs,
} from "@/styles/tokens";

const MAX_IMAGE_SIZE_BYTES =
  3 * 1024 * 1024;

interface WinnerGroup {
  year: number;
  winners:
    JangwonWinnerResponse[];
}

function ScrollRoller() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 22,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius:
            "50%",

          background:
            "radial-gradient(circle at 35% 35%, #a9773f, #5a3a18)",

          border:
            "2px solid #3a2008",

          flexShrink: 0,
          marginLeft: -11,
          zIndex: 1,
        }}
      />

      <div
        style={{
          flex: 1,
          height: 16,

          background:
            "linear-gradient(180deg, #a9773f, #7a5030 50%, #5a3a18)",

          border:
            "2px solid #3a2008",

          borderLeft:
            "none",

          borderRight:
            "none",
        }}
      />

      <div
        style={{
          width: 22,
          height: 22,
          borderRadius:
            "50%",

          background:
            "radial-gradient(circle at 35% 35%, #a9773f, #5a3a18)",

          border:
            "2px solid #3a2008",

          flexShrink: 0,
          marginRight: -11,
          zIndex: 1,
        }}
      />
    </div>
  );
}

function getCharacterId(
  characterName:
    string | null | undefined,
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

function getReviewedYear(
  reviewedAt: string,
): number {
  const year = Number(
    reviewedAt.slice(
      0,
      4,
    ),
  );

  return (
    Number.isInteger(year) &&
    year > 0
  )
    ? year
    : new Date()
        .getFullYear();
}

function groupWinnersByYear(
  winners:
    JangwonWinnerResponse[],
): WinnerGroup[] {
  const grouped =
    new Map<
      number,
      JangwonWinnerResponse[]
    >();

  winners.forEach(
    (winner) => {
      const year =
        getReviewedYear(
          winner.reviewedAt,
        );

      const current =
        grouped.get(year) ??
        [];

      current.push(
        winner,
      );

      grouped.set(
        year,
        current,
      );
    },
  );

  return Array.from(
    grouped.entries(),
  )
    .sort(
      (
        [leftYear],
        [rightYear],
      ) =>
        rightYear -
        leftYear,
    )
    .map(
      (
        [
          year,
          yearWinners,
        ],
      ) => ({
        year,
        winners:
          yearWinners,
      }),
    );
}

export default function JangwonPage() {
  const account =
    mockAuthApi
      .getCurrentAccount();

  const email =
    mockAuthApi
      .getCurrentEmail();

  const [
    winners,
    setWinners,
  ] = useState<
    JangwonWinnerResponse[]
  >([]);

  const [
    winnersLoading,
    setWinnersLoading,
  ] = useState(true);

  const [
    application,
    setApplication,
  ] = useState<
    JangwonApplicationResponse | null
  >(null);

  const [
    applicationLoading,
    setApplicationLoading,
  ] = useState(true);

  const [
    imagePreview,
    setImagePreview,
  ] = useState<
    string | null
  >(null);

  const [
    dragOver,
    setDragOver,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const fileInputRef =
    useRef<
      HTMLInputElement
    >(null);

  const winnersByYear =
    groupWinnersByYear(
      winners,
    );

  const pending =
    application?.status ===
    "PENDING";

  useEffect(() => {
    let cancelled =
      false;

    async function loadPageData() {
      setWinnersLoading(
        true,
      );

      setApplicationLoading(
        true,
      );

      setError(null);

      try {
        const winnerList =
          await loadJangwonWinners(
            true,
          );

        if (!cancelled) {
          setWinners(
            winnerList,
          );
        }
      } catch (
        requestError
      ) {
        if (!cancelled) {
          setError(
            requestError
              instanceof Error
              ? requestError
                  .message
              : "장원급제 명단을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!cancelled) {
          setWinnersLoading(
            false,
          );
        }
      }

      if (!email) {
        if (!cancelled) {
          setApplication(
            null,
          );

          setApplicationLoading(
            false,
          );
        }

        return;
      }

      try {
        const page =
          await jangwonApi
            .listMyApplications({
              page: 0,
              size: 10,
            });

        if (cancelled) {
          return;
        }

        const latestApplication =
          page.content[0] ??
          null;

        setApplication(
          latestApplication,
        );

        setImagePreview(
          latestApplication
            ?.certificateImageUrl ??
            null,
        );
      } catch (
        requestError
      ) {
        if (!cancelled) {
          setError(
            requestError
              instanceof Error
              ? requestError
                  .message
              : "장원급제 신청 내역을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!cancelled) {
          setApplicationLoading(
            false,
          );
        }
      }
    }

    void loadPageData();

    return () => {
      cancelled = true;
    };
  }, [email]);

  function handleFile(
    file:
      File | undefined,
  ) {
    if (!file) {
      return;
    }

    if (
      !file.type
        .startsWith(
          "image/",
        )
    ) {
      setError(
        "이미지 파일만 첨부할 수 있습니다.",
      );

      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE_BYTES
    ) {
      setError(
        "인증 이미지는 3MB 이하로 첨부해주세요.",
      );

      return;
    }

    setError(null);

    const reader =
      new FileReader();

    reader.onload = () => {
      setImagePreview(
        reader.result as string,
      );
    };

    reader.onerror = () => {
      setError(
        "이미지 파일을 읽지 못했습니다.",
      );
    };

    reader.readAsDataURL(
      file,
    );
  }

  function handleDrop(
    event:
      DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    setDragOver(false);

    handleFile(
      event.dataTransfer
        .files?.[0],
    );
  }

  async function handleSubmit() {
    if (
      !email ||
      !account
    ) {
      setError(
        "로그인이 필요합니다.",
      );

      return;
    }

    if (pending) {
      setError(
        "이미 심사 중인 신청이 있습니다.",
      );

      return;
    }

    if (!imagePreview) {
      setError(
        "인증 이미지를 첨부해주세요.",
      );

      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const created =
        await jangwonApi.apply({
          displayNickname:
            account.nickname
              ?.trim() ||
            account.name,

          characterName:
            String(
              account
                .characterId ??
                DEFAULT_CHARACTER_ID,
            ),

          characterImageUrl:
            null,

          certificateImageUrl:
            imagePreview,
        });

      setApplication(
        created,
      );

      setImagePreview(
        created
          .certificateImageUrl,
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError
              .message
          : "장원급제 신청에 실패했습니다.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY:
          "auto",

        padding: 28,

        background:
          "linear-gradient(160deg,#1a2a14,#0e1a0a)",
      }}
    >
      <h2
        style={{
          fontFamily: fs,
          color:
            "#f5e6c8",

          fontSize: 20,
          marginBottom: 6,
        }}
      >
        🏆 장원급제
      </h2>

      <p
        style={{
          fontFamily: ff,
          color:
            "#9aaa80",

          fontSize: 12,
          marginBottom: 24,
        }}
      >
        합격 인증 명예의 전당
      </p>

      <div
        style={{
          display: "flex",
          gap: 24,

          alignItems:
            "flex-start",

          flexWrap:
            "wrap",
        }}
      >
        <div
          style={{
            width: 380,
            flexShrink: 0,
          }}
        >
          <ScrollRoller />

          <div
            style={{
              background:
                C.hanji,

              borderLeft:
                "2px solid #b8a880",

              borderRight:
                "2px solid #b8a880",

              boxShadow:
                "0 0 20px rgba(0,0,0,0.35) inset",

              padding:
                "20px 22px",
            }}
          >
            <div
              style={{
                textAlign:
                  "center",

                fontFamily:
                  fs,

                fontWeight:
                  700,

                fontSize:
                  16,

                color:
                  C.inkDark,

                marginBottom:
                  20,
              }}
            >
              壯元及第
            </div>

            <div
              style={{
                display:
                  "flex",

                flexDirection:
                  "column",

                gap: 20,
              }}
            >
              {winnersLoading && (
                <div
                  style={{
                    textAlign:
                      "center",

                    fontFamily:
                      ff,

                    fontSize:
                      12,

                    color:
                      C.inkMid,
                  }}
                >
                  장원급제 명단을 불러오는 중입니다.
                </div>
              )}

              {!winnersLoading &&
                winnersByYear.length ===
                  0 && (
                  <div
                    style={{
                      textAlign:
                        "center",

                      fontFamily:
                        ff,

                      fontSize:
                        12,

                      color:
                        C.inkMid,
                    }}
                  >
                    아직 장원급제한 사람이 없습니다.
                  </div>
                )}

              {!winnersLoading &&
                winnersByYear.map(
                  (
                    group,
                    groupIndex,
                  ) => (
                    <div
                      key={
                        group.year
                      }
                      style={{
                        paddingBottom:
                          groupIndex <
                          winnersByYear.length -
                            1
                            ? 20
                            : 0,

                        borderBottom:
                          groupIndex <
                          winnersByYear.length -
                            1
                            ? "1px solid rgba(184,168,128,0.6)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          textAlign:
                            "center",

                          fontFamily:
                            ff,

                          fontSize:
                            11,

                          fontWeight:
                            700,

                          color:
                            C.inkMid,

                          letterSpacing:
                            "0.06em",

                          marginBottom:
                            14,
                        }}
                      >
                        {group.year}
                        년 장원급제
                      </div>

                      <div
                        style={{
                          display:
                            "flex",

                          flexWrap:
                            "wrap",

                          justifyContent:
                            "center",

                          gap:
                            "18px 14px",
                        }}
                      >
                        {group.winners.map(
                          (
                            winner,
                          ) => (
                            <div
                              key={
                                winner
                                  .jangwonApplicationId
                              }
                              style={{
                                display:
                                  "flex",

                                flexDirection:
                                  "column",

                                alignItems:
                                  "center",

                                gap: 6,
                                width: 68,
                              }}
                            >
                              <div
                                style={{
                                  position:
                                    "relative",

                                  width:
                                    56,

                                  height:
                                    56,
                                }}
                              >
                                <div
                                  style={{
                                    position:
                                      "absolute",

                                    top:
                                      -18,

                                    left:
                                      "50%",

                                    transform:
                                      "translateX(-50%)",

                                    fontSize:
                                      22,

                                    filter:
                                      "drop-shadow(0 2px 3px rgba(0,0,0,0.4))",
                                  }}
                                >
                                  👑
                                </div>

                                <div
                                  style={{
                                    width:
                                      56,

                                    height:
                                      56,

                                    borderRadius:
                                      "50%",

                                    overflow:
                                      "hidden",

                                    border:
                                      "3px solid #c8a030",

                                    boxShadow:
                                      "0 2px 8px rgba(0,0,0,0.3)",
                                  }}
                                >
                                  {winner.characterImageUrl ? (
                                    <img
                                      src={
                                        winner.characterImageUrl
                                      }
                                      alt=""
                                      style={{
                                        width:
                                          56,

                                        height:
                                          56,

                                        objectFit:
                                          "cover",
                                      }}
                                    />
                                  ) : (
                                    <ProfileAvatar
                                      id={getCharacterId(
                                        winner.characterName,
                                      )}
                                      size={
                                        56
                                      }
                                    />
                                  )}
                                </div>
                              </div>

                              <div
                                style={{
                                  fontFamily:
                                    fs,

                                  fontWeight:
                                    700,

                                  fontSize:
                                    13,

                                  color:
                                    C.inkDark,

                                  textAlign:
                                    "center",
                                }}
                              >
                                {
                                  winner.displayNickname
                                }
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ),
                )}
            </div>
          </div>

          <ScrollRoller />
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 300,
          }}
        >
          <div
            style={{
              background:
                C.hanji,

              border:
                `2px solid ${C.hanjiB}`,

              boxShadow:
                `0 3px 0 ${C.hanjiSh}`,

              padding: 20,
            }}
          >
            <div
              style={{
                fontFamily:
                  fs,

                fontWeight:
                  700,

                fontSize:
                  15,

                color:
                  C.inkDark,

                marginBottom:
                  6,
              }}
            >
              📜 장원급제 신청
            </div>

            <p
              style={{
                fontFamily:
                  ff,

                fontSize:
                  12,

                color:
                  C.inkMid,

                marginBottom:
                  16,
              }}
            >
              한국사능력검정시험 합격 인증 이미지를 첨부해주세요.
              관리자 승인 후 공개 명단에 반영됩니다.
            </p>

            {applicationLoading && (
              <div
                style={{
                  fontSize:
                    12,

                  color:
                    C.inkMid,

                  background:
                    "rgba(139,94,60,0.08)",

                  border:
                    `1px solid ${C.inputBr}`,

                  padding:
                    "8px 10px",

                  marginBottom:
                    14,

                  fontFamily:
                    ff,
                }}
              >
                신청 내역을 불러오는 중입니다.
              </div>
            )}

            {!applicationLoading &&
              application?.status ===
                "APPROVED" && (
                <div
                  style={{
                    fontSize:
                      12,

                    color:
                      "#245020",

                    background:
                      "rgba(58,96,48,0.14)",

                    border:
                      "1px solid #245020",

                    padding:
                      "8px 10px",

                    marginBottom:
                      14,

                    fontFamily:
                      ff,
                  }}
                >
                  👑 축하드립니다. 장원급제로 선정되었습니다.
                </div>
              )}

            {!applicationLoading &&
              application?.status ===
                "REJECTED" && (
                <div
                  style={{
                    fontSize:
                      12,

                    color:
                      "#7a1010",

                    background:
                      "rgba(192,64,64,0.1)",

                    border:
                      "1px solid #9a2020",

                    padding:
                      "8px 10px",

                    marginBottom:
                      14,

                    fontFamily:
                      ff,
                  }}
                >
                  📩 신청이 반려되었습니다.

                  {application.adminMemo && (
                    <div
                      style={{
                        marginTop:
                          4,
                      }}
                    >
                      사유:{" "}
                      {
                        application.adminMemo
                      }
                    </div>
                  )}
                </div>
              )}

            {!applicationLoading &&
              application?.status ===
                "PENDING" && (
                <div
                  style={{
                    fontSize:
                      12,

                    color:
                      "#245020",

                    background:
                      "rgba(58,96,48,0.14)",

                    border:
                      "1px solid #245020",

                    padding:
                      "8px 10px",

                    marginBottom:
                      14,

                    fontFamily:
                      ff,
                  }}
                >
                  ✅ 신청이 접수되었습니다. 관리자 검토가 끝나기 전에는
                  새로 신청할 수 없습니다.
                </div>
              )}

            <div
              onClick={() => {
                if (
                  !pending &&
                  !submitting
                ) {
                  fileInputRef
                    .current
                    ?.click();
                }
              }}
              onDragOver={(
                event,
              ) => {
                event.preventDefault();

                if (
                  !pending &&
                  !submitting
                ) {
                  setDragOver(
                    true,
                  );
                }
              }}
              onDragLeave={() =>
                setDragOver(
                  false,
                )
              }
              onDrop={(
                event,
              ) => {
                if (
                  !pending &&
                  !submitting
                ) {
                  handleDrop(
                    event,
                  );
                }
              }}
              style={{
                cursor:
                  pending ||
                  submitting
                    ? "default"
                    : "pointer",

                padding:
                  imagePreview
                    ? 10
                    : "36px 16px",

                textAlign:
                  "center",

                background:
                  dragOver
                    ? "rgba(200,160,48,0.14)"
                    : "rgba(139,94,60,0.06)",

                border:
                  `2px dashed ${
                    dragOver
                      ? C.active
                      : C.inputBr
                  }`,

                marginBottom:
                  12,

                opacity:
                  pending
                    ? 0.72
                    : 1,
              }}
            >
              {imagePreview ? (
                <img
                  src={
                    imagePreview
                  }
                  alt="첨부 이미지 미리보기"
                  style={{
                    maxWidth:
                      "100%",

                    maxHeight:
                      220,

                    display:
                      "block",

                    margin:
                      "0 auto",
                  }}
                />
              ) : (
                <div
                  style={{
                    fontFamily:
                      ff,

                    fontSize:
                      12,

                    color:
                      C.inkMid,
                  }}
                >
                  🖼️ 이미지를 끌어다 놓거나 클릭해서 선택하세요.
                </div>
              )}
            </div>

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/*"
              disabled={
                pending ||
                submitting
              }
              onChange={(
                event,
              ) =>
                handleFile(
                  event.target
                    .files?.[0],
                )
              }
              style={{
                display:
                  "none",
              }}
            />

            {error && (
              <div
                style={{
                  fontSize:
                    11,

                  color:
                    C.redB,

                  background:
                    "rgba(192,64,64,0.12)",

                  border:
                    `1px solid ${C.redB}`,

                  padding:
                    "6px 8px",

                  marginBottom:
                    12,

                  fontFamily:
                    ff,
                }}
              >
                {error}
              </div>
            )}

            <Button
              variant="green"
              block
              disabled={
                applicationLoading ||
                pending ||
                submitting
              }
              onClick={() =>
                void handleSubmit()
              }
            >
              {submitting
                ? "신청 중..."
                : pending
                  ? "심사 중"
                  : application
                    ? "다시 신청하기"
                    : "신청하기"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}