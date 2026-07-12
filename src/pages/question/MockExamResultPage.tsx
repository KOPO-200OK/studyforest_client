import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

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
  getMockExamResult,
} from "@/api/questionApi";

import type {
  MockExamResultResponse,
} from "@/api/types";

interface MockExamResultLocationState {
  result?: MockExamResultResponse;
}

/**
 * 정수 점수는 소수점 없이 표시하고,
 * 소수점이 있으면 한 자리까지 표시합니다.
 */
function formatScore(
  score: number,
): string {
  return Number.isInteger(score)
    ? String(score)
    : score.toFixed(1);
}

export default function MockExamResultPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const { mockExamId } =
    useParams();

  const numericMockExamId =
    Number(mockExamId);

  const initialResult =
    (
      location.state as
        | MockExamResultLocationState
        | null
    )?.result ?? null;

  const [
    result,
    setResult,
  ] = useState<
    MockExamResultResponse | null
  >(
    initialResult,
  );

  const [
    loading,
    setLoading,
  ] = useState(
    initialResult === null,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /**
   * location.state가 없으면 URL의 mockExamId로
   * 서버에서 제출 결과를 다시 조회합니다.
   */
  useEffect(() => {
    let cancelled = false;

    if (
      !Number.isInteger(
        numericMockExamId,
      ) ||
      numericMockExamId <= 0
    ) {
      setResult(null);
      setLoading(false);

      setError(
        "모의고사 번호가 올바르지 않습니다.",
      );

      return () => {
        cancelled = true;
      };
    }

    if (
      initialResult !== null &&
      initialResult.mockExamId ===
        numericMockExamId
    ) {
      setResult(
        initialResult,
      );

      setLoading(false);

      return () => {
        cancelled = true;
      };
    }

    async function loadResult() {
      setLoading(true);
      setError(null);

      try {
        const loadedResult =
          await getMockExamResult(
            numericMockExamId,
          );

        if (cancelled) {
          return;
        }

        setResult(
          loadedResult,
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setResult(null);

        setError(
          requestError instanceof Error
            ? requestError.message
            : "모의고사 결과를 불러오지 못했습니다.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadResult();

    return () => {
      cancelled = true;
    };
  }, [
    initialResult,
    numericMockExamId,
  ]);

  if (loading) {
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
        <Card
          style={{
            maxWidth: 420,
          }}
        >
          <div
            style={{
              fontFamily: ff,
              fontSize: 13,
              color: C.inkDark,
            }}
          >
            모의고사 결과를 불러오는 중입니다.
          </div>
        </Card>
      </div>
    );
  }

  if (result === null) {
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
        <button
          onClick={() =>
            navigate(
              "/question-bank/mock-exams",
            )
          }
          style={{
            background: "none",
            border: "none",
            color: "#c8a060",
            cursor: "pointer",
            fontFamily: ff,
            fontSize: 12,
            marginBottom: 16,
          }}
        >
          ← 모의고사 시작하기
        </button>

        <Card
          style={{
            maxWidth: 420,
          }}
        >
          <div
            style={{
              fontFamily: ff,
              fontSize: 13,
              color: C.inkDark,
            }}
          >
            {error ??
              "모의고사 결과를 찾을 수 없습니다."}
          </div>
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
      <button
        onClick={() =>
          navigate(
            "/question-bank",
          )
        }
        style={{
          background: "none",
          border: "none",
          color: "#c8a060",
          cursor: "pointer",
          fontFamily: ff,
          fontSize: 12,
          marginBottom: 16,
        }}
      >
        ← 문제은행 홈
      </button>

      <h2
        style={{
          fontFamily: fs,
          color: "#f5e6c8",
          fontSize: 18,
          marginBottom: 6,
        }}
      >
        📝 {result.title} 결과
      </h2>

      <p
        style={{
          fontFamily: ff,
          color: "#9aaa80",
          fontSize: 12,
          marginBottom: 16,
        }}
      >
        모의고사 번호{" "}
        {result.mockExamId}
      </p>

      <Card
        style={{
          maxWidth: 420,
        }}
      >
        <div
          style={{
            fontFamily: fs,
            fontWeight: 700,
            fontSize: 22,
            color: C.inkDark,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {result.correctCount}
          {" / "}
          {result.totalCount}
          {" 정답"}
        </div>

        <div
          style={{
            fontFamily: ff,
            fontSize: 14,
            color: C.inkMid,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          점수{" "}
          {formatScore(
            result.score,
          )}
          점
        </div>

        <Button
          variant="green"
          block
          onClick={() =>
            navigate(
              "/question-bank/mock-exams",
            )
          }
        >
          다시 응시하기
        </Button>
      </Card>
    </div>
  );
}