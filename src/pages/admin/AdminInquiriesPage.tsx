import {
  useEffect,
  useState,
  type MouseEvent,
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
  adminInquiryApi,
  type InquiryCommentResponse,
  type InquiryDetailResponse,
  type InquirySummaryResponse,
} from "@/api/inquiryApi";

const PAGE_SIZE = 50;

export default function AdminInquiriesPage() {
  const [
    inquiries,
    setInquiries,
  ] = useState<
    InquirySummaryResponse[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

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
    replyDraft,
    setReplyDraft,
  ] = useState("");

  const [
    editingCommentId,
    setEditingCommentId,
  ] = useState<
    number | null
  >(null);

  const [
    editingCommentDraft,
    setEditingCommentDraft,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    processingCommentId,
    setProcessingCommentId,
  ] = useState<
    number | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const page =
        await adminInquiryApi
          .list({
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
          : "문의 목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  /**
   * 관리자 문의 상세를 열거나 닫습니다.
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
      setEditingCommentId(null);
      setEditingCommentDraft("");

      return;
    }

    setOpenId(
      inquiryId,
    );

    setDetail(null);
    setReplyDraft("");
    setEditingCommentId(null);
    setEditingCommentDraft("");
    setError(null);

    try {
      const loadedDetail =
        await adminInquiryApi
          .getDetail(
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
    }
  }

  /**
   * 관리자 답변을 등록합니다.
   */
  async function handleReply(
    inquiryId: number,
  ) {
    const content =
      replyDraft.trim();

    if (!content) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await adminInquiryApi
        .addComment(
          inquiryId,
          content,
        );

      const loadedDetail =
        await adminInquiryApi
          .getDetail(
            inquiryId,
          );

      setDetail(
        loadedDetail,
      );

      setReplyDraft("");

      setInquiries(
        (previous) =>
          previous.map(
            (inquiry) =>
              inquiry.inquiryId ===
              inquiryId
                ? {
                    ...inquiry,
                    hasComment:
                      true,
                  }
                : inquiry,
          ),
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "답변 등록에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * 답변 수정 상태를 시작합니다.
   */
  function startEditComment(
    event:
      MouseEvent<HTMLButtonElement>,

    comment:
      InquiryCommentResponse,
  ) {
    event.stopPropagation();

    setEditingCommentId(
      comment.commentId,
    );

    setEditingCommentDraft(
      comment.content,
    );

    setError(null);
  }

  /**
   * 답변 수정을 취소합니다.
   */
  function cancelEditComment(
    event:
      MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation();

    setEditingCommentId(null);
    setEditingCommentDraft("");
  }

  /**
   * 관리자 답변을 수정합니다.
   */
  async function handleUpdateComment(
    event:
      MouseEvent<HTMLButtonElement>,

    inquiryId: number,
    commentId: number,
  ) {
    event.stopPropagation();

    const content =
      editingCommentDraft.trim();

    if (!content) {
      setError(
        "답변 내용을 입력해주세요.",
      );

      return;
    }

    setProcessingCommentId(
      commentId,
    );

    setError(null);

    try {
      const updated =
        await adminInquiryApi
          .updateComment(
            inquiryId,
            commentId,
            content,
          );

      setDetail(
        (previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,

            comments:
              previous.comments.map(
                (comment) =>
                  comment.commentId ===
                  commentId
                    ? updated
                    : comment,
              ),
          };
        },
      );

      setEditingCommentId(null);
      setEditingCommentDraft("");
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "답변 수정에 실패했습니다.",
      );
    } finally {
      setProcessingCommentId(
        null,
      );
    }
  }

  /**
   * 관리자 답변을 삭제합니다.
   */
  async function handleDeleteComment(
    event:
      MouseEvent<HTMLButtonElement>,

    inquiryId: number,
    commentId: number,
  ) {
    event.stopPropagation();

    if (
      !window.confirm(
        "이 답변을 삭제할까요?",
      )
    ) {
      return;
    }

    setProcessingCommentId(
      commentId,
    );

    setError(null);

    try {
      await adminInquiryApi
        .deleteComment(
          inquiryId,
          commentId,
        );

      const loadedDetail =
        await adminInquiryApi
          .getDetail(
            inquiryId,
          );

      setDetail(
        loadedDetail,
      );

      setInquiries(
        (previous) =>
          previous.map(
            (inquiry) =>
              inquiry.inquiryId ===
              inquiryId
                ? {
                    ...inquiry,

                    hasComment:
                      loadedDetail
                        .comments
                        .length >
                      0,
                  }
                : inquiry,
          ),
      );

      if (
        editingCommentId ===
        commentId
      ) {
        setEditingCommentId(
          null,
        );

        setEditingCommentDraft(
          "",
        );
      }
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "답변 삭제에 실패했습니다.",
      );
    } finally {
      setProcessingCommentId(
        null,
      );
    }
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
        접수된 문의{" "}
        {inquiries.length}건
      </p>

      {error && (
        <div
          style={{
            maxWidth: 640,
            marginBottom: 12,
            fontSize: 11,
            color: C.redB,

            background:
              "rgba(192,64,64,0.12)",

            border:
              `1px solid ${C.redB}`,

            padding: "6px 8px",
            fontFamily: ff,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 640,
        }}
      >
        {loading && (
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

        {inquiries.map(
          (inquiry) => (
            <Card
              key={
                inquiry.inquiryId
              }
            >
              <div
                onClick={() =>
                  void toggleDetail(
                    inquiry.inquiryId,
                  )
                }
                style={{
                  cursor: "pointer",
                  display: "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "flex-start",

                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: fs,
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#2a1808",
                    }}
                  >
                    {inquiry.isSecret &&
                      "🔒 "}

                    {inquiry.title}
                  </div>

                  <div
                    style={{
                      fontFamily: ff,
                      fontSize: 11,
                      color: "#9a7040",
                    }}
                  >
                    {inquiry.authorName}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",

                    alignItems:
                      "flex-end",

                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: ff,
                      fontWeight: 700,
                      padding: "2px 8px",

                      color:
                        inquiry.hasComment
                          ? "#245020"
                          : "#9a2020",

                      background:
                        inquiry.hasComment
                          ? "rgba(58,96,48,0.14)"
                          : "rgba(192,64,64,0.1)",
                    }}
                  >
                    {inquiry.hasComment
                      ? "답변완료"
                      : "미답변"}
                  </span>

                  <span
                    style={{
                      fontFamily: ff,
                      fontSize: 10,
                      color: "#9a7040",
                    }}
                  >
                    {new Date(
                      inquiry.createdAt,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {openId ===
                inquiry.inquiryId &&
                detail && (
                <div
                  style={{
                    paddingTop: 10,

                    borderTop:
                      `1px solid ${C.inputBr}`,
                  }}
                >
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
                    .length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",

                        gap: 6,
                        marginBottom: 10,
                      }}
                    >
                      {detail.comments.map(
                        (comment) => (
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
                            }}
                          >
                            {editingCommentId ===
                            comment.commentId ? (
                              <>
                                <textarea
                                  value={
                                    editingCommentDraft
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    setEditingCommentDraft(
                                      event.target.value,
                                    )
                                  }
                                  rows={3}
                                  style={{
                                    width: "100%",
                                    fontSize: 11,
                                    padding:
                                      "6px 8px",

                                    background:
                                      C.inputBg,

                                    border:
                                      `1px solid ${C.inputBr}`,

                                    outline:
                                      "none",

                                    color:
                                      C.inkDark,

                                    fontFamily:
                                      ff,

                                    resize:
                                      "vertical",
                                  }}
                                />

                                <div
                                  style={{
                                    display: "flex",
                                    gap: 6,
                                    marginTop: 6,
                                  }}
                                >
                                  <Button
                                    variant="green"
                                    disabled={
                                      processingCommentId ===
                                        comment.commentId ||
                                      !editingCommentDraft.trim()
                                    }
                                    onClick={(
                                      event,
                                    ) =>
                                      void handleUpdateComment(
                                        event,
                                        inquiry.inquiryId,
                                        comment.commentId,
                                      )
                                    }
                                    style={{
                                      padding:
                                        "4px 10px",

                                      fontSize: 10,
                                    }}
                                  >
                                    저장
                                  </Button>

                                  <Button
                                    disabled={
                                      processingCommentId ===
                                      comment.commentId
                                    }
                                    onClick={
                                      cancelEditComment
                                    }
                                    style={{
                                      padding:
                                        "4px 10px",

                                      fontSize: 10,
                                    }}
                                  >
                                    취소
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div
                                style={{
                                  display: "flex",

                                  justifyContent:
                                    "space-between",

                                  alignItems:
                                    "flex-start",

                                  gap: 8,
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: ff,
                                    fontSize: 11,
                                    color: "#245020",
                                    whiteSpace:
                                      "pre-wrap",
                                  }}
                                >
                                  💬{" "}
                                  {
                                    comment.content
                                  }
                                </span>

                                <div
                                  style={{
                                    display: "flex",
                                    gap: 4,
                                    flexShrink: 0,
                                  }}
                                >
                                  <button
                                    onClick={(
                                      event,
                                    ) =>
                                      startEditComment(
                                        event,
                                        comment,
                                      )
                                    }
                                    style={{
                                      fontSize: 10,
                                      color: "#7a5828",
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                    }}
                                  >
                                    수정
                                  </button>

                                  <button
                                    disabled={
                                      processingCommentId ===
                                      comment.commentId
                                    }
                                    onClick={(
                                      event,
                                    ) =>
                                      void handleDeleteComment(
                                        event,
                                        inquiry.inquiryId,
                                        comment.commentId,
                                      )
                                    }
                                    style={{
                                      fontSize: 10,
                                      color: "#9a2020",
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                    }}
                                  >
                                    삭제
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  <textarea
                    value={replyDraft}
                    onChange={(
                      event,
                    ) =>
                      setReplyDraft(
                        event.target.value,
                      )
                    }
                    placeholder="답변을 입력하세요"
                    rows={3}
                    style={{
                      width: "100%",
                      fontSize: 12,
                      padding: "8px 10px",
                      background: C.inputBg,

                      border:
                        `1px solid ${C.inputBr}`,

                      outline: "none",
                      color: C.inkDark,
                      fontFamily: ff,
                      resize: "vertical",
                    }}
                  />

                  <Button
                    variant="green"
                    onClick={() =>
                      void handleReply(
                        inquiry.inquiryId,
                      )
                    }
                    disabled={
                      submitting ||
                      !replyDraft.trim()
                    }
                    style={{
                      marginTop: 8,
                      padding: "6px 14px",
                      fontSize: 11,
                    }}
                  >
                    {submitting
                      ? "등록 중..."
                      : "답변 등록"}
                  </Button>
                </div>
              )}
            </Card>
          ),
        )}

        {!loading &&
          inquiries.length ===
            0 && (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                color: "#7a5828",
                fontFamily: fs,
                fontSize: 13,
              }}
            >
              아직 문의 내역이 없습니다
            </div>
          )}
      </div>
    </div>
  );
}