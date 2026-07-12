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
  getMockExam,
  saveMockAnswers,
  submitMockExam,
  type MockExamAnswerRequest,
} from "@/api/questionApi";

import type {
  MockExamDetailResponse,
  QuestionDetailResponse,
} from "@/api/types";

import {
  QuestionSolveView,
  type ViewDensity,
} from "./solveShared";

interface MockExamLocationState {
  exam?: MockExamDetailResponse;
}

export default function MockExamSolvePage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const { mockExamId } =
    useParams();

  const numericMockExamId =
    Number(mockExamId);

  const initialExam =
    (
      location.state as
        | MockExamLocationState
        | null
    )?.exam ?? null;

  const [exam, setExam] =
    useState<
      MockExamDetailResponse | null
    >(
      initialExam,
    );

  const [
    viewDensity,
    setViewDensity,
  ] = useState<ViewDensity>(1);

  const [page, setPage] =
    useState(0);

  const [
    selected,
    setSelected,
  ] = useState<
    Record<number, number>
  >(
    initialExam?.selectedAnswers ??
    {},
  );

  const [
    savingQuestionIds,
    setSavingQuestionIds,
  ] = useState<Set<number>>(
    () => new Set(),
  );

  const [
    loading,
    setLoading,
  ] = useState(
    initialExam === null,
  );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /**
   * location.state가 없으면 URL의 mockExamId로
   * 서버에서 응시 정보를 다시 불러옵니다.
   */
  useEffect(() => {
    let cancelled = false;

    if (
      !Number.isInteger(
        numericMockExamId,
      ) ||
      numericMockExamId <= 0
    ) {
      setExam(null);
      setLoading(false);

      setError(
        "모의고사 번호가 올바르지 않습니다.",
      );

      return () => {
        cancelled = true;
      };
    }

    if (
      initialExam !== null &&
      initialExam.mockExamId ===
        numericMockExamId
    ) {
      setExam(initialExam);

      setSelected(
        initialExam.selectedAnswers,
      );

      setLoading(false);

      if (
        initialExam.status ===
        "SUBMITTED"
      ) {
        navigate(
          `/question-bank/mock-exams/${numericMockExamId}/result`,
          {
            replace: true,
          },
        );
      }

      return () => {
        cancelled = true;
      };
    }

    async function loadMockExam() {
      setLoading(true);
      setError(null);

      try {
        const loadedExam =
          await getMockExam(
            numericMockExamId,
          );

        if (cancelled) {
          return;
        }

        if (
          loadedExam.status ===
          "SUBMITTED"
        ) {
          navigate(
            `/question-bank/mock-exams/${numericMockExamId}/result`,
            {
              replace: true,
            },
          );

          return;
        }

        setExam(
          loadedExam,
        );

        setSelected(
          loadedExam.selectedAnswers,
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setExam(null);

        setError(
          requestError instanceof Error
            ? requestError.message
            : "모의고사를 불러오지 못했습니다.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMockExam();

    return () => {
      cancelled = true;
    };
  }, [
    initialExam,
    navigate,
    numericMockExamId,
  ]);

  /**
   * 문제를 선택할 때마다 해당 문제의 답안을
   * 서버에 즉시 저장합니다.
   *
   * 따라서 응시 중 화면을 새로고침해도
   * 기존 답안을 복구할 수 있습니다.
   */
  async function handleSelect(
    question:
      QuestionDetailResponse,

    optionId:
      number,
  ) {
    if (
      exam === null ||
      submitting ||
      savingQuestionIds.has(
        question.questionId,
      )
    ) {
      return;
    }

    const previousOptionId =
      selected[
        question.questionId
      ];

    setSelected(
      (previous) => ({
        ...previous,

        [question.questionId]:
          optionId,
      }),
    );

    setSavingQuestionIds(
      (previous) => {
        const next =
          new Set(previous);

        next.add(
          question.questionId,
        );

        return next;
      },
    );

    setError(null);

    try {
      await saveMockAnswers(
        exam.mockExamId,
        [
          {
            questionId:
              question.questionId,

            selectedOptionId:
              optionId,
          },
        ],
      );
    } catch (requestError) {
      /**
       * 서버 저장이 실패하면 화면 선택 값도
       * 이전 상태로 복구합니다.
       */
      setSelected(
        (previous) => {
          const next = {
            ...previous,
          };

          if (
            previousOptionId ===
            undefined
          ) {
            delete next[
              question.questionId
            ];
          } else {
            next[
              question.questionId
            ] = previousOptionId;
          }

          return next;
        },
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "답안을 저장하지 못했습니다.",
      );
    } finally {
      setSavingQuestionIds(
        (previous) => {
          const next =
            new Set(previous);

          next.delete(
            question.questionId,
          );

          return next;
        },
      );
    }
  }

  /**
   * 모든 문제의 답안을 서버로 전송하고
   * 모의고사를 제출합니다.
   */
  async function handleSubmit() {
    if (exam === null) {
      return;
    }

    if (
      savingQuestionIds.size > 0
    ) {
      setError(
        "답안을 저장하고 있습니다. 잠시 후 다시 제출해주세요.",
      );

      return;
    }

    const answers:
      MockExamAnswerRequest[] =
      exam.questions.flatMap(
        (question) => {
          const selectedOptionId =
            selected[
              question.questionId
            ];

          if (
            selectedOptionId ===
            undefined
          ) {
            return [];
          }

          return [
            {
              questionId:
                question.questionId,

              selectedOptionId,
            },
          ];
        },
      );

    if (
      answers.length !==
      exam.questions.length
    ) {
      setError(
        "모든 문제의 답안을 선택한 후 제출해주세요.",
      );

      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result =
        await submitMockExam(
          exam.mockExamId,
          answers,
        );

      navigate(
        `/question-bank/mock-exams/${exam.mockExamId}/result`,
        {
          replace: true,

          state: {
            result,
          },
        },
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "모의고사 제출에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  }

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
            모의고사 정보를 불러오는 중입니다.
          </div>
        </Card>
      </div>
    );
  }

  if (exam === null) {
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
              "모의고사 정보를 찾을 수 없습니다."}
          </div>
        </Card>
      </div>
    );
  }

  const completedCount =
    exam.questions.filter(
      (question) =>
        selected[
          question.questionId
        ] !== undefined,
    ).length;

  const statusText =
    savingQuestionIds.size > 0
      ? `${completedCount}/${exam.questions.length} 답변 완료 · 답안 저장 중`
      : `${completedCount}/${exam.questions.length} 답변 완료`;

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
        📝 {exam.title}
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
        {exam.mockExamId}
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

            padding: "6px 8px",
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      <QuestionSolveView
        questions={
          exam.questions
        }
        selected={
          selected
        }
        results={{}}
        isLocked={(
          questionId,
        ) =>
          submitting ||
          savingQuestionIds.has(
            questionId,
          )
        }
        onSelect={(
          question,
          optionId,
        ) =>
          void handleSelect(
            question,
            optionId,
          )
        }
        viewDensity={
          viewDensity
        }
        onViewDensityChange={
          setViewDensity
        }
        page={
          page
        }
        onPageChange={
          setPage
        }
        statusText={
          statusText
        }
        footer={
          <Button
            variant="green"
            block
            disabled={
              submitting ||
              savingQuestionIds.size >
                0
            }
            onClick={() =>
              void handleSubmit()
            }
            style={{
              marginTop: 12,
            }}
          >
            {submitting
              ? "제출 중..."
              : "제출하기"}
          </Button>
        }
      />
    </div>
  );
}