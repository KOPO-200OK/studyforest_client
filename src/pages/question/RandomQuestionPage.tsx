import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  getAiQuestionExplanation,
  getRandomQuestions,
  solveQuestion,
} from "@/api/questionApi";

import type {
  QuestionDetailResponse,
  SolveResultResponse,
} from "@/api/types";

import {
  QuestionSolveView,
  type ViewDensity,
} from "./solveShared";

const COUNT_OPTIONS = [
  5,
  10,
  15,
  20,
  30,
];

export default function RandomQuestionPage() {
  const nav =
    useNavigate();

  const [
    count,
    setCount,
  ] = useState(10);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    questions,
    setQuestions,
  ] = useState<
    QuestionDetailResponse[] | null
  >(null);

  const [
    viewDensity,
    setViewDensity,
  ] = useState<ViewDensity>(1);

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    selected,
    setSelected,
  ] = useState<
    Record<number, number>
  >({});

  const [
    results,
    setResults,
  ] = useState<
    Record<
      number,
      SolveResultResponse
    >
  >({});

  async function handleStart() {
    setLoading(true);
    setError(null);

    try {
      const loadedQuestions =
        await getRandomQuestions({
          count,
        });

      setQuestions(
        loadedQuestions,
      );

      setPage(0);
      setSelected({});
      setResults({});
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "문제를 불러오지 못했습니다",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * 문제 채점 후 AI 해설을 별도로 요청합니다.
   */
  async function handleSelect(
    question:
      QuestionDetailResponse,

    optionId:
      number,
  ) {
    if (
      results[question.questionId] !==
      undefined
    ) {
      return;
    }

    setSelected(
      (previous) => ({
        ...previous,

        [question.questionId]:
          optionId,
      }),
    );

    try {
      const result =
        await solveQuestion(
          question.questionId,
          optionId,
          "RANDOM",
        );

      /*
       * 일반 채점 결과를 즉시 표시합니다.
       */
      setResults(
        (previous) => ({
          ...previous,

          [question.questionId]:
            result,
        }),
      );

      /*
       * AI 해설은 비동기로 불러옵니다.
       */
      void getAiQuestionExplanation(
        question.questionId,
        optionId,
      )
        .then(
          (
            explanationResponse,
          ) => {
            setResults(
              (previous) => {
                const current =
                  previous[
                    question
                      .questionId
                  ];

                if (!current) {
                  return previous;
                }

                return {
                  ...previous,

                  [question.questionId]:
                    {
                      ...current,

                      explanation:
                        explanationResponse
                          .answer,
                    },
                };
              },
            );
          },
        )
        .catch(() => {
          /*
           * 해설 요청 실패 시 기존 채점 결과를 유지합니다.
           */
        });
    } catch (
      requestError
    ) {
      setSelected(
        (previous) => {
          const next = {
            ...previous,
          };

          delete next[
            question.questionId
          ];

          return next;
        },
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "채점에 실패했습니다. 서버 연결을 확인해주세요.",
      );
    }
  }

  function handleReset() {
    setQuestions(null);
    setPage(0);
    setSelected({});
    setResults({});
    setError(null);
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
          nav(
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
          marginBottom: 16,
        }}
      >
        🎲 랜덤 문제
      </h2>

      {!questions && (
        <Card
          style={{
            maxWidth: 360,
          }}
        >
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: C.inkMid,
                fontWeight: 700,
              }}
            >
              개수
            </span>

            <select
              value={count}
              onChange={(
                event,
              ) =>
                setCount(
                  Number(
                    event.target
                      .value,
                  ),
                )
              }
              style={{
                fontSize: 12,
                padding: "8px 12px",
                background: C.inputBg,

                border:
                  `1px solid ${C.inputBr}`,

                outline: "none",
                color: C.inkDark,
                fontFamily: ff,
                width: "100%",
              }}
            >
              {COUNT_OPTIONS.map(
                (
                  optionCount,
                ) => (
                  <option
                    key={
                      optionCount
                    }
                    value={
                      optionCount
                    }
                  >
                    {optionCount}
                    문제
                  </option>
                ),
              )}
            </select>
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
                marginBottom: 12,
              }}
            >
              {error}
            </div>
          )}

          <Button
            variant="green"
            block
            disabled={loading}
            onClick={() =>
              void handleStart()
            }
          >
            {loading
              ? "불러오는 중..."
              : "랜덤 문제 가져오기"}
          </Button>
        </Card>
      )}

      {questions && (
        <>
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
              questions
            }
            selected={
              selected
            }
            results={
              results
            }
            isLocked={(
              questionId,
            ) =>
              results[
                questionId
              ] !== undefined
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
            page={page}
            onPageChange={
              setPage
            }
            statusText={
              `${
                Object.keys(
                  results,
                ).length
              }/${questions.length} 채점 완료`
            }
            footer={
              <button
                onClick={
                  handleReset
                }
                style={{
                  marginTop: 10,
                  width: "100%",
                  background: "none",
                  border: "none",
                  color: "#9a7040",
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: ff,
                }}
              >
                ← 설정으로 돌아가기
              </button>
            }
          />
        </>
      )}
    </div>
  );
}