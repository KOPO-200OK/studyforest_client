import {
  useEffect,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  C,
  ff,
  fs,
} from "@/styles/tokens";

import {
  Button,
  Card,
  Input,
} from "@/components/ui";

import {
  mockAuthApi,
} from "@/api/mockAuthApi";

import {
  inquiryApi,
  type InquiryDetailResponse,
  type InquirySummaryResponse,
} from "@/api/inquiryApi";

const PAGE_SIZE = 50;

const inputStyle = {
  fontSize: 12,
  padding: "8px 12px",
  background: C.inputBg,

  border:
    `1px solid ${C.inputBr}`,

  outline: "none",
  color: C.inkDark,
  fontFamily: ff,
  width: "100%",
};

export default function InquiryPage() {
  const account =
    mockAuthApi
      .getCurrentAccount();

  const [
    editingInquiryId,
    setEditingInquiryId,
  ] = useState<
    number | null
  >(null);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    content,
    setContent,
  ] = useState("");

  const [
    isSecret,
    setIsSecret,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    inquiries,
    setInquiries,
  ] = useState<
    InquirySummaryResponse[]
  >([]);

  const [
    loadingList,
    setLoadingList,
  ] = useState(false);

  const [
    openId,
    setOpenId,
  ] = useState<
    number | null
  >(null);

  const [
    detail,
    setDetail,
  ] = useState<
    InquiryDetailResponse | null
  >(null);

  const [
    detailLoadingId,
    setDetailLoadingId,
  ] = useState<
    number | null
  >(null);

  const [
    deletingInquiryId,
    setDeletingInquiryId,
  ] = useState<
    number | null
  >(null);

  /**
   * 내 문의 목록을 서버에서 조회합니다.
   */
  async function loadInquiries() {
    setLoadingList(true);

    try {
      const page =
        await inquiryApi
          .listMine({
            page: 0,
            size: PAGE_SIZE,
          });

      setInquiries(
        page.content,
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "문의 내역을 불러오지 못했습니다.",
      );
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    if (account) {
      void loadInquiries();
    }
  }, [
    account?.email,
  ]);

  /**
   * 문의 작성·수정 폼을 초기화합니다.
   */
  function resetForm() {
    setEditingInquiryId(
      null,
    );

    setTitle("");
    setContent("");
    setIsSecret(false);
  }

  /**
   * 새 문의를 등록하거나 기존 문의를 수정합니다.
   */
  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      !title.trim() ||
      !content.trim()
    ) {
      setError(
        "제목과 내용을 모두 입력해주세요",
      );

      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      if (
        editingInquiryId ===
        null
      ) {
        await inquiryApi
          .create({
            title:
              title.trim(),

            content:
              content.trim(),

            isSecret,
          });
      } else {
        const updated =
          await inquiryApi
            .update(
              editingInquiryId,
              {
                title:
                  title.trim(),

                content:
                  content.trim(),

                isSecret,
              },
            );

        /**
         * 수정 중이던 문의가 펼쳐진 상태라면
         * 상세 내용도 최신 응답으로 변경합니다.
         */
        if (
          openId ===
          editingInquiryId
        ) {
          setDetail(
            updated,
          );
        }
      }

      resetForm();

      await loadInquiries();
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : editingInquiryId ===
              null
            ? "문의 등록에 실패했습니다"
            : "문의 수정에 실패했습니다",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * 문의 상세를 열거나 닫습니다.
   */
  async function toggleDetail(
    inquiryId: number,
  ) {
    if (
      openId ===
      inquiryId
    ) {
      setOpenId(null);
      setDetail(null);

      return;
    }

    setOpenId(
      inquiryId,
    );

    setDetail(null);

    setDetailLoadingId(
      inquiryId,
    );

    setError(null);

    try {
      const loadedDetail =
        await inquiryApi
          .getMine(
            inquiryId,
          );

      setDetail(
        loadedDetail,
      );
    } catch (
      requestError
    ) {
      setOpenId(null);

      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "문의 상세 내용을 불러오지 못했습니다.",
      );
    } finally {
      setDetailLoadingId(
        null,
      );
    }
  }

  /**
   * 기존 문의를 작성 폼으로 불러옵니다.
   *
   * 답변이 있는 문의는 백엔드에서 수정할 수 없으므로
   * 수정 버튼을 표시하지 않습니다.
   */
  async function handleEdit(
    event:
      MouseEvent<HTMLButtonElement>,

    inquiry:
      InquirySummaryResponse,
  ) {
    event.stopPropagation();

    setError(null);

    try {
      const loadedDetail =
        await inquiryApi
          .getMine(
            inquiry.inquiryId,
          );

      if (
        loadedDetail.comments
          .length > 0
      ) {
        setError(
          "답변이 달린 문의는 수정할 수 없습니다.",
        );

        return;
      }

      setEditingInquiryId(
        loadedDetail.inquiryId,
      );

      setTitle(
        loadedDetail.title,
      );

      setContent(
        loadedDetail.content,
      );

      setIsSecret(
        loadedDetail.isSecret,
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "문의 정보를 불러오지 못했습니다.",
      );
    }
  }

  /**
   * 답변이 없는 문의를 삭제합니다.
   */
  async function handleDelete(
    event:
      MouseEvent<HTMLButtonElement>,

    inquiry:
      InquirySummaryResponse,
  ) {
    event.stopPropagation();

    if (
      inquiry.hasComment
    ) {
      setError(
        "답변이 달린 문의는 삭제할 수 없습니다.",
      );

      return;
    }

    if (
      !window.confirm(
        "이 문의를 삭제하시겠습니까?",
      )
    ) {
      return;
    }

    setDeletingInquiryId(
      inquiry.inquiryId,
    );

    setError(null);

    try {
      await inquiryApi
        .delete(
          inquiry.inquiryId,
        );

      setInquiries(
        (previous) =>
          previous.filter(
            (item) =>
              item.inquiryId !==
              inquiry.inquiryId,
          ),
      );

      if (
        openId ===
        inquiry.inquiryId
      ) {
        setOpenId(null);
        setDetail(null);
      }

      if (
        editingInquiryId ===
        inquiry.inquiryId
      ) {
        resetForm();
      }
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "문의 삭제에 실패했습니다.",
      );
    } finally {
      setDeletingInquiryId(
        null,
      );
    }
  }

  if (!account) {
    return (
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: 28,

          background:
            "linear-gradient(160deg,#1a2a14,#0e1a0a)",
        }}
      >
        <h2
          style={{
            fontFamily: fs,
            color: "#f5e6c8",
            fontSize: 20,
            marginBottom: 6,
          }}
        >
          ✉️ 문의하기
        </h2>

        <Card
          style={{
            maxWidth: 480,
          }}
        >
          <div
            style={{
              fontFamily: ff,
              fontSize: 13,
              color: C.inkDark,
              marginBottom: 12,
            }}
          >
            문의를 남기려면 로그인이 필요합니다.
          </div>

          <Link to="/login">
            <Button variant="green">
              로그인하러 가기
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: 28,

        background:
          "linear-gradient(160deg,#1a2a14,#0e1a0a)",
      }}
    >
      <h2
        style={{
          fontFamily: fs,
          color: "#f5e6c8",
          fontSize: 20,
          marginBottom: 6,
        }}
      >
        ✉️ 문의하기
      </h2>

      <p
        style={{
          fontFamily: ff,
          color: "#9aaa80",
          fontSize: 12,
          marginBottom: 24,
        }}
      >
        궁금한 점이나 불편한 점을 남겨주시면 확인 후 답변드릴게요
      </p>

      <Card
        style={{
          maxWidth: 480,
          marginBottom: 24,
        }}
      >
        <form
          onSubmit={
            handleSubmit
          }
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: C.inkMid,
                fontWeight: 700,
              }}
            >
              제목
            </span>

            <Input
              value={title}
              onChange={(
                event,
              ) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="문의 제목을 입력하세요"
              maxLength={200}
              style={{
                width: "100%",
              }}
            />
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: C.inkMid,
                fontWeight: 700,
              }}
            >
              문의 내용
            </span>

            <textarea
              value={content}
              onChange={(
                event,
              ) =>
                setContent(
                  event.target.value,
                )
              }
              placeholder="문의하실 내용을 입력하세요"
              rows={6}
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: C.inkMid,
              fontFamily: ff,
            }}
          >
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(
                event,
              ) =>
                setIsSecret(
                  event.target.checked,
                )
              }
            />

            비밀글로 문의하기 (관리자만 열람)
          </label>

          {error && (
            <div
              style={{
                fontSize: 11,
                color: C.redB,

                background:
                  "rgba(192,64,64,0.12)",

                border:
                  `1px solid ${C.redB}`,

                padding: "6px 8px",
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="green"
            block
            disabled={submitting}
          >
            {submitting
              ? "저장 중..."
              : editingInquiryId ===
                  null
                ? "문의 보내기"
                : "문의 수정"}
          </Button>

          {editingInquiryId !==
            null && (
            <Button
              type="button"
              block
              disabled={submitting}
              onClick={
                resetForm
              }
            >
              수정 취소
            </Button>
          )}
        </form>
      </Card>

      <div
        style={{
          maxWidth: 480,
        }}
      >
        <div
          style={{
            fontFamily: fs,
            fontWeight: 700,
            fontSize: 14,
            color: "#f5e6c8",
            marginBottom: 10,
          }}
        >
          내 문의 내역
        </div>

        {loadingList && (
          <div
            style={{
              fontFamily: ff,
              fontSize: 12,
              color: "#9aaa80",
            }}
          >
            불러오는 중...
          </div>
        )}

        {!loadingList &&
          inquiries.length ===
            0 && (
            <div
              style={{
                fontFamily: ff,
                fontSize: 12,
                color: "#9aaa80",
              }}
            >
              아직 등록한 문의가 없습니다
            </div>
          )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {inquiries.map(
            (inquiry) => (
              <Card
                key={
                  inquiry.inquiryId
                }
                onClick={() =>
                  void toggleDetail(
                    inquiry.inquiryId,
                  )
                }
                style={{
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",

                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontFamily: fs,
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#2a1808",
                    }}
                  >
                    {inquiry.isSecret &&
                      "🔒 "}

                    {inquiry.title}
                  </div>

                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: ff,
                      fontWeight: 700,
                      padding: "2px 8px",
                      flexShrink: 0,

                      color:
                        inquiry.hasComment
                          ? "#245020"
                          : "#9a7040",

                      background:
                        inquiry.hasComment
                          ? "rgba(58,96,48,0.14)"
                          : "rgba(139,94,60,0.1)",
                    }}
                  >
                    {inquiry.hasComment
                      ? "답변완료"
                      : "답변대기"}
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: ff,
                    fontSize: 10,
                    color: "#9a7040",
                    marginTop: 4,
                  }}
                >
                  {new Date(
                    inquiry.createdAt,
                  ).toLocaleString()}
                </div>

                {!inquiry.hasComment && (
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginTop: 8,
                    }}
                  >
                    <Button
                      variant="wood"
                      onClick={(
                        event,
                      ) =>
                        void handleEdit(
                          event,
                          inquiry,
                        )
                      }
                      style={{
                        padding:
                          "4px 10px",

                        fontSize: 10,
                      }}
                    >
                      수정
                    </Button>

                    <Button
                      variant="red"
                      disabled={
                        deletingInquiryId ===
                        inquiry.inquiryId
                      }
                      onClick={(
                        event,
                      ) =>
                        void handleDelete(
                          event,
                          inquiry,
                        )
                      }
                      style={{
                        padding:
                          "4px 10px",

                        fontSize: 10,
                      }}
                    >
                      {deletingInquiryId ===
                      inquiry.inquiryId
                        ? "삭제 중"
                        : "삭제"}
                    </Button>
                  </div>
                )}

                {openId ===
                  inquiry.inquiryId && (
                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 10,

                      borderTop:
                        `1px solid ${C.inputBr}`,
                    }}
                  >
                    {detailLoadingId ===
                    inquiry.inquiryId ? (
                      <div
                        style={{
                          fontFamily: ff,
                          fontSize: 11,
                          color: "#9a7040",
                        }}
                      >
                        상세 내용을 불러오는 중입니다.
                      </div>
                    ) : detail ? (
                      <>
                        <div
                          style={{
                            fontFamily: ff,
                            fontSize: 12,
                            color: "#5a3010",
                            whiteSpace:
                              "pre-wrap",

                            marginBottom: 10,
                          }}
                        >
                          {detail.content}
                        </div>

                        {detail.comments
                          .length === 0 ? (
                          <div
                            style={{
                              fontFamily: ff,
                              fontSize: 11,
                              color: "#9a7040",
                            }}
                          >
                            아직 답변이 등록되지 않았습니다
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection:
                                "column",

                              gap: 6,
                            }}
                          >
                            {detail.comments.map(
                              (
                                comment,
                              ) => (
                                <div
                                  key={
                                    comment.commentId
                                  }
                                  style={{
                                    background:
                                      "rgba(58,96,48,0.1)",

                                    border:
                                      "1px solid #245020",

                                    padding:
                                      "8px 10px",

                                    fontFamily: ff,
                                    fontSize: 11,
                                    color: "#245020",
                                  }}
                                >
                                  💬{" "}
                                  {
                                    comment.content
                                  }
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </Card>
            ),
          )}
        </div>
      </div>
    </div>
  );
}