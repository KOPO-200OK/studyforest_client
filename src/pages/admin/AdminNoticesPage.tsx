import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Card,
  Button,
  Input,
} from "@/components/ui";

import {
  fs,
  ff,
  C,
} from "@/styles/tokens";

import {
  noticeApi,
  type NoticeSummaryResponse,
} from "@/api/noticeApi";

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

function today(): string {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

function formatDate(
  value: string,
): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export default function AdminNoticesPage() {
  const [
    notices,
    setNotices,
  ] = useState<
    NoticeSummaryResponse[]
  >([]);

  const [
    editingNoticeId,
    setEditingNoticeId,
  ] = useState<
    number | null
  >(null);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    date,
    setDate,
  ] = useState(
    today(),
  );

  const [
    body,
    setBody,
  ] = useState("");

  const [
    isPinned,
    setIsPinned,
  ] = useState(false);

  const [
    isPublished,
    setIsPublished,
  ] = useState(true);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    deletingNoticeId,
    setDeletingNoticeId,
  ] = useState<
    number | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    void loadNotices();
  }, []);

  async function loadNotices() {
    setLoading(true);
    setError(null);

    try {
      const page =
        await noticeApi.listAdmin({
          page: 0,
          size: 50,
        });

      setNotices(
        page.content,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "공지사항을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingNoticeId(
      null,
    );

    setTitle("");
    setDate(today());
    setBody("");
    setIsPinned(false);
    setIsPublished(true);
  }

  /**
   * 수정 버튼을 누르면 상세 API를 호출하여
   * 전체 내용을 입력 폼에 표시합니다.
   */
  async function handleEdit(
    noticeId: number,
  ) {
    setError(null);

    try {
      const detail =
        await noticeApi
          .getAdminDetail(
            noticeId,
          );

      setEditingNoticeId(
        detail.noticeId,
      );

      setTitle(
        detail.title,
      );

      setDate(
        formatDate(
          detail.createdAt,
        ),
      );

      setBody(
        detail.content,
      );

      setIsPinned(
        detail.isPinned,
      );

      setIsPublished(
        detail.isPublished,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "공지사항 상세 내용을 불러오지 못했습니다.",
      );
    }
  }

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      !title.trim() ||
      !body.trim()
    ) {
      setError(
        "제목과 내용을 입력해주세요.",
      );

      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (
        editingNoticeId ===
        null
      ) {
        await noticeApi.create({
          title:
            title.trim(),

          content:
            body.trim(),

          isPinned,
          isPublished,
        });
      } else {
        await noticeApi.update(
          editingNoticeId,
          {
            title:
              title.trim(),

            content:
              body.trim(),

            isPinned,
            isPublished,
          },
        );
      }

      resetForm();

      await loadNotices();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : editingNoticeId ===
              null
            ? "공지사항 등록에 실패했습니다."
            : "공지사항 수정에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(
    noticeId: number,
  ) {
    const confirmed =
      window.confirm(
        "이 공지사항을 삭제하시겠습니까?",
      );

    if (!confirmed) {
      return;
    }

    setDeletingNoticeId(
      noticeId,
    );

    setError(null);

    try {
      await noticeApi.delete(
        noticeId,
      );

      if (
        editingNoticeId ===
        noticeId
      ) {
        resetForm();
      }

      await loadNotices();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "공지사항 삭제에 실패했습니다.",
      );
    } finally {
      setDeletingNoticeId(
        null,
      );
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 20,

        alignItems:
          "flex-start",
      }}
    >
      <Card
        style={{
          width: 360,
          flexShrink: 0,

          display:
            "flex",

          flexDirection:
            "column",

          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: fs,
            fontWeight: 700,
            fontSize: 14,
            color: "#2a1808",
          }}
        >
          {editingNoticeId ===
          null
            ? "공지사항 추가"
            : "공지사항 수정"}
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          style={{
            display:
              "flex",

            flexDirection:
              "column",

            gap: 10,
          }}
        >
          <label
            style={{
              display:
                "flex",

              flexDirection:
                "column",

              gap: 4,
            }}
          >
            <span
              style={{
                fontSize:
                  11,

                color:
                  C.inkMid,

                fontWeight:
                  700,
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
                  event.target
                    .value,
                )
              }
              placeholder="공지 제목"
              maxLength={200}
              style={{
                width:
                  "100%",
              }}
            />
          </label>

          <label
            style={{
              display:
                "flex",

              flexDirection:
                "column",

              gap: 4,
            }}
          >
            <span
              style={{
                fontSize:
                  11,

                color:
                  C.inkMid,

                fontWeight:
                  700,
              }}
            >
              날짜
            </span>

            <Input
              type="date"
              value={date}
              disabled
              style={{
                width:
                  "100%",
              }}
            />
          </label>

          <label
            style={{
              display:
                "flex",

              flexDirection:
                "column",

              gap: 4,
            }}
          >
            <span
              style={{
                fontSize:
                  11,

                color:
                  C.inkMid,

                fontWeight:
                  700,
              }}
            >
              내용
            </span>

            <textarea
              value={body}
              onChange={(
                event,
              ) =>
                setBody(
                  event.target
                    .value,
                )
              }
              placeholder="공지 내용을 입력하세요"
              rows={7}
              style={{
                ...inputStyle,

                resize:
                  "vertical",
              }}
            />
          </label>

          <label
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap: 8,

              fontFamily:
                ff,

              fontSize:
                11,

              color:
                C.inkDark,

              cursor:
                "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={
                isPinned
              }
              onChange={(
                event,
              ) =>
                setIsPinned(
                  event.target
                    .checked,
                )
              }
            />

            상단 고정
          </label>

          <label
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap: 8,

              fontFamily:
                ff,

              fontSize:
                11,

              color:
                C.inkDark,

              cursor:
                "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={
                isPublished
              }
              onChange={(
                event,
              ) =>
                setIsPublished(
                  event.target
                    .checked,
                )
              }
            />

            사용자에게 공개
          </label>

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
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="green"
            block
            disabled={
              submitting
            }
          >
            {submitting
              ? "저장 중..."
              : editingNoticeId ===
                  null
                ? "공지사항 추가"
                : "공지사항 수정"}
          </Button>

          {editingNoticeId !==
            null && (
            <Button
              type="button"
              block
              onClick={
                resetForm
              }
              disabled={
                submitting
              }
            >
              수정 취소
            </Button>
          )}
        </form>
      </Card>

      <Card
        style={{
          flex: 1,
          padding: 0,
          overflow:
            "hidden",
        }}
      >
        <div
          style={{
            padding:
              "12px 14px",

            fontFamily:
              fs,

            fontWeight:
              700,

            fontSize:
              14,

            color:
              "#2a1808",

            borderBottom:
              `1px solid ${C.hanjiB}`,
          }}
        >
          등록된 공지사항 ({notices.length})
        </div>

        <div
          style={{
            display:
              "flex",

            flexDirection:
              "column",
          }}
        >
          {loading && (
            <div
              style={{
                padding:
                  24,

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
              공지사항을 불러오는 중입니다.
            </div>
          )}

          {!loading &&
            notices.map(
              (notice) => (
                <div
                  key={
                    notice.noticeId
                  }
                  style={{
                    padding:
                      "12px 14px",

                    borderBottom:
                      `1px solid ${C.hanjiB}`,

                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    gap: 10,

                    alignItems:
                      "flex-start",

                    background:
                      editingNoticeId ===
                      notice.noticeId
                        ? "rgba(200,160,48,0.12)"
                        : undefined,
                  }}
                >
                  <div
                    style={{
                      minWidth:
                        0,

                      fontFamily:
                        ff,

                      fontSize:
                        12,
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",

                        gap: 6,

                        alignItems:
                          "baseline",

                        flexWrap:
                          "wrap",

                        marginBottom:
                          4,
                      }}
                    >
                      <span
                        style={{
                          fontWeight:
                            700,

                          color:
                            "#2a1808",
                        }}
                      >
                        {notice.isPinned
                          ? "[고정] "
                          : ""}

                        {notice.title}
                      </span>

                      <span
                        style={{
                          fontSize:
                            10,

                          color:
                            "#9a7040",
                        }}
                      >
                        {formatDate(
                          notice.createdAt,
                        )}
                      </span>

                      <span
                        style={{
                          fontSize:
                            10,

                          color:
                            notice.isPublished
                              ? "#245020"
                              : "#9a2020",
                        }}
                      >
                        {notice.isPublished
                          ? "공개"
                          : "비공개"}
                      </span>
                    </div>

                    <div
                      style={{
                        color:
                          "#5a3010",

                        lineHeight:
                          1.5,

                        whiteSpace:
                          "pre-wrap",

                        wordBreak:
                          "break-word",
                      }}
                    >
                      {notice.contentPreview}
                    </div>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",

                      gap: 6,

                      flexShrink:
                        0,
                    }}
                  >
                    <Button
                      onClick={() =>
                        void handleEdit(
                          notice.noticeId,
                        )
                      }
                      style={{
                        padding:
                          "4px 10px",

                        fontSize:
                          10,
                      }}
                    >
                      수정
                    </Button>

                    <Button
                      variant="red"
                      disabled={
                        deletingNoticeId ===
                        notice.noticeId
                      }
                      onClick={() =>
                        void handleDelete(
                          notice.noticeId,
                        )
                      }
                      style={{
                        padding:
                          "4px 10px",

                        fontSize:
                          10,
                      }}
                    >
                      {deletingNoticeId ===
                      notice.noticeId
                        ? "삭제 중"
                        : "삭제"}
                    </Button>
                  </div>
                </div>
              ),
            )}

          {!loading &&
            notices.length ===
              0 && (
              <div
                style={{
                  padding:
                    24,

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
                등록된 공지사항이 없습니다.
              </div>
            )}
        </div>
      </Card>
    </div>
  );
}