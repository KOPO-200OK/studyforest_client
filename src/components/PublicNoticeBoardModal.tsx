import {
  useEffect,
  useState,
} from "react";

import {
  noticeApi,
  type NoticeDetailResponse,
  type NoticeSummaryResponse,
} from "@/api/noticeApi";

import {
  ff,
  fs,
} from "@/styles/tokens";

interface PublicNoticeBoardModalProps {
  onClose: () => void;
}

function formatNoticeDate(
  value: string,
): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export default function PublicNoticeBoardModal({
  onClose,
}: PublicNoticeBoardModalProps) {
  const [
    notices,
    setNotices,
  ] = useState<
    NoticeSummaryResponse[]
  >([]);

  const [
    details,
    setDetails,
  ] = useState<
    Record<
      number,
      NoticeDetailResponse
    >
  >({});

  const [
    expandedNoticeId,
    setExpandedNoticeId,
  ] = useState<
    number | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    detailLoadingId,
    setDetailLoadingId,
  ] = useState<
    number | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  /**
   * 공지 모달을 열면 공개된 공지사항을 서버에서 조회합니다.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadNotices() {
      setLoading(true);
      setError(null);

      try {
        const page =
          await noticeApi.listPublic({
            page: 0,
            size: 50,
          });

        if (!cancelled) {
          setNotices(
            page.content,
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "공지사항을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadNotices();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * 공지를 선택하면 상세 API를 호출합니다.
   *
   * 이미 불러온 공지는 details에 저장하여
   * 다시 서버를 호출하지 않습니다.
   */
  async function handleNoticeClick(
    noticeId: number,
  ) {
    if (
      expandedNoticeId ===
      noticeId
    ) {
      setExpandedNoticeId(
        null,
      );

      return;
    }

    setExpandedNoticeId(
      noticeId,
    );

    if (details[noticeId]) {
      return;
    }

    setDetailLoadingId(
      noticeId,
    );

    setError(null);

    try {
      const detail =
        await noticeApi
          .getPublicDetail(
            noticeId,
          );

      setDetails(
        (previous) => ({
          ...previous,

          [noticeId]:
            detail,
        }),
      );
    } catch (requestError) {
      setExpandedNoticeId(
        null,
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "공지사항 상세 내용을 불러오지 못했습니다.",
      );
    } finally {
      setDetailLoadingId(
        null,
      );
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 40,
          background:
            "rgba(0,0,0,0.62)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",

          transform:
            "translate(-50%,-50%)",

          zIndex: 50,

          background:
            "linear-gradient(160deg,#fdf4db,#eedda0)",

          border:
            "3px solid #9a6a30",

          boxShadow:
            "4px 5px 0 #5a3a08, 0 16px 48px rgba(0,0,0,0.75)",

          padding:
            "22px 24px",

          width: 400,

          maxHeight:
            "72vh",

          overflowY:
            "auto",
        }}
      >
        <div
          style={{
            fontFamily: fs,
            fontWeight: 700,
            fontSize: 15,
            color: "#2a1808",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          공지사항
        </div>

        {error && (
          <div
            style={{
              marginBottom: 12,

              padding:
                "8px 10px",

              fontFamily: ff,
              fontSize: 11,

              color:
                "#8a2020",

              background:
                "rgba(192,64,64,0.12)",

              border:
                "1px solid #9a2020",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: 12,
          }}
        >
          {loading && (
            <div
              style={{
                textAlign:
                  "center",

                fontSize:
                  12,

                color:
                  "#9a7040",

                fontFamily:
                  ff,

                padding:
                  "16px 0",
              }}
            >
              공지사항을 불러오는 중입니다.
            </div>
          )}

          {!loading &&
            notices.length ===
              0 && (
              <div
                style={{
                  textAlign:
                    "center",

                  fontSize:
                    12,

                  color:
                    "#9a7040",

                  fontFamily:
                    ff,

                  padding:
                    "16px 0",
                }}
              >
                등록된 공지사항이 없습니다.
              </div>
            )}

          {notices.map(
            (notice) => {
              const expanded =
                expandedNoticeId ===
                notice.noticeId;

              const detail =
                details[
                  notice.noticeId
                ];

              const detailLoading =
                detailLoadingId ===
                notice.noticeId;

              return (
                <button
                  key={
                    notice.noticeId
                  }
                  type="button"
                  onClick={() =>
                    void handleNoticeClick(
                      notice.noticeId,
                    )
                  }
                  style={{
                    width:
                      "100%",

                    padding:
                      "10px 12px",

                    background:
                      "rgba(139,94,60,0.08)",

                    border:
                      notice.isPinned
                        ? "2px solid #9a6a30"
                        : "1px solid #c4a060",

                    textAlign:
                      "left",

                    cursor:
                      "pointer",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",

                      justifyContent:
                        "space-between",

                      alignItems:
                        "baseline",

                      gap: 8,

                      marginBottom:
                        4,
                    }}
                  >
                    <span
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
                      {notice.isPinned
                        ? "[고정] "
                        : ""}

                      {notice.title}
                    </span>

                    <span
                      style={{
                        flexShrink:
                          0,

                        fontFamily:
                          ff,

                        fontSize:
                          10,

                        color:
                          "#9a7040",
                      }}
                    >
                      {formatNoticeDate(
                        notice.createdAt,
                      )}
                    </span>
                  </div>

                  <div
                    style={{
                      fontFamily:
                        ff,

                      fontSize:
                        12,

                      color:
                        "#5a3010",

                      lineHeight:
                        1.5,

                      whiteSpace:
                        "pre-wrap",
                    }}
                  >
                    {detailLoading
                      ? "상세 내용을 불러오는 중입니다."
                      : expanded &&
                          detail
                        ? detail.content
                        : notice.contentPreview}
                  </div>

                  <div
                    style={{
                      marginTop:
                        6,

                      fontFamily:
                        ff,

                      fontSize:
                        10,

                      color:
                        "#9a7040",

                      textAlign:
                        "right",
                    }}
                  >
                    {expanded
                      ? "접기"
                      : "전체 내용 보기"}
                  </div>
                </button>
              );
            },
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "8px",

            fontSize: 11,
            fontWeight: 700,

            background:
              "rgba(139,94,60,0.1)",

            border:
              "1px solid #c4a060",

            color:
              "#5a3010",

            cursor:
              "pointer",

            fontFamily:
              ff,
          }}
        >
          닫기
        </button>
      </div>
    </>
  );
}