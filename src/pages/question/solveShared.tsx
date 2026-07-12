import type {
  CSSProperties,
  ReactNode,
} from "react";

import { Card } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";

import type {
  PeriodCode,
  QuestionDetailResponse,
  SolveResultResponse,
} from "@/api/types";

export type ViewDensity =
  | 1
  | 2
  | 4;

export const PERIOD_OPTIONS: {
  value: PeriodCode;
  label: string;
}[] = [
  {
    value: "PREHISTORY",
    label: "선사·고조선",
  },
  {
    value: "THREE_KINGDOMS",
    label: "삼국·남북국",
  },
  {
    value: "GORYEO",
    label: "고려",
  },
  {
    value: "JOSEON",
    label: "조선",
  },
  {
    value: "MODERN",
    label: "근현대",
  },
];

export const PERIOD_LABEL: Record<
  PeriodCode,
  string
> = Object.fromEntries(
  PERIOD_OPTIONS.map(
    (period) => [
      period.value,
      period.label,
    ],
  ),
) as Record<
  PeriodCode,
  string
>;

export const selectStyle: CSSProperties = {
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

export function toggleStyle(
  active: boolean,
): CSSProperties {
  return {
    padding: "6px 12px",
    fontFamily: ff,
    fontWeight: 700,
    fontSize: 11,

    background:
      active
        ? "rgba(200,160,48,0.22)"
        : "rgba(139,94,60,0.06)",

    border:
      `1px solid ${
        active
          ? C.active
          : C.inputBr
      }`,

    color:
      active
        ? C.active
        : "#887060",

    cursor: "pointer",
  };
}

export function ViewDensityToggle({
  value,
  onChange,
}: {
  value: ViewDensity;

  onChange: (
    density: ViewDensity,
  ) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
      }}
    >
      {(
        [
          1,
          2,
          4,
        ] as ViewDensity[]
      ).map(
        (density) => (
          <button
            key={density}
            onClick={() =>
              onChange(
                density,
              )
            }
            style={toggleStyle(
              value === density,
            )}
          >
            {density}개씩 보기
          </button>
        ),
      )}
    </div>
  );
}

export function QuestionCard({
  question,
  index,
  chosen,
  result,
  locked,
  onSelect,
}: {
  question:
    QuestionDetailResponse;

  index: number;
  chosen?: number;

  result?:
    SolveResultResponse;

  locked: boolean;

  onSelect: (
    optionId: number,
  ) => void;
}) {
  return (
    <Card>
      <div
        style={{
          fontFamily: ff,
          fontSize: 11,
          color: "#9a7040",
          marginBottom: 6,
        }}
      >
        {index + 1}번
        {" · "}
        {question.era}
        {" · "}
        {question.topicName}
        {" · "}
        {question.point}점
        {" · "}
        {question.difficulty}
      </div>

      {question.passage && (
        <div
          style={{
            fontFamily: ff,
            fontSize: 11,
            lineHeight: 1.7,
            color: C.inkMid,

            background:
              "rgba(139,94,60,0.08)",

            border:
              `1px solid ${C.inputBr}`,

            padding: "10px 12px",
            marginBottom: 10,
            whiteSpace: "pre-wrap",
          }}
        >
          {question.passage}
        </div>
      )}

      <div
        style={{
          fontFamily: fs,
          fontWeight: 700,
          fontSize: 14,
          lineHeight: 1.6,
          color: C.inkDark,
          marginBottom: 12,
          whiteSpace: "pre-wrap",
        }}
      >
        {question.questionContent}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {question.options.map(
          (option) => {
            const isChosen =
              chosen ===
              option.questionOptionId;

            let background =
              "rgba(139,94,60,0.06)";

            let border: string = C.inputBr;

            if (result) {
              if (
                option.questionOptionId ===
                result.correctOptionId
              ) {
                background =
                  "rgba(58,96,48,0.18)";

                border =
                  "#245020";
              } else if (
                isChosen
              ) {
                background =
                  "rgba(192,64,64,0.14)";

                border =
                  "#9a2020";
              }
            } else if (
              isChosen
            ) {
              background =
                "rgba(200,160,48,0.18)";

              border =
                C.active;
            }

            return (
              <button
                key={
                  option.questionOptionId
                }
                disabled={locked}
                onClick={() =>
                  onSelect(
                    option.questionOptionId,
                  )
                }
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  fontFamily: ff,
                  fontSize: 12,
                  lineHeight: 1.5,

                  background,

                  border:
                    `1px solid ${border}`,

                  color:
                    C.inkDark,

                  cursor:
                    locked
                      ? "default"
                      : "pointer",

                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {option.optionNo}.
                {" "}
                {option.optionContent}
              </button>
            );
          },
        )}
      </div>

      {result && (
        <div
          style={{
            marginTop: 10,
            fontFamily: ff,
            fontSize: 11,
            lineHeight: 1.6,
            color: C.inkMid,

            background:
              "rgba(139,94,60,0.08)",

            padding: "8px 10px",
          }}
        >
          {result.isCorrect
            ? "정답입니다."
            : `오답입니다. 정답은 ${result.correctOptionId}번입니다.`}

          {result.explanation
            ? ` ${result.explanation}`
            : ""}
        </div>
      )}
    </Card>
  );
}

/**
 * 문제 목록, 페이지 이동, OMR 답안지를 표시합니다.
 */
export function QuestionSolveView({
  questions,
  selected,
  results,
  isLocked,
  onSelect,
  viewDensity,
  onViewDensityChange,
  page,
  onPageChange,
  statusText,
  footer,
}: {
  questions:
    QuestionDetailResponse[];

  selected:
    Record<number, number>;

  results:
    Record<
      number,
      SolveResultResponse
    >;

  isLocked: (
    questionId: number,
  ) => boolean;

  onSelect: (
    question:
      QuestionDetailResponse,

    optionId:
      number,
  ) => void;

  viewDensity:
    ViewDensity;

  onViewDensityChange: (
    density:
      ViewDensity,
  ) => void;

  page: number;

  onPageChange: (
    page: number,
  ) => void;

  statusText?: string;
  footer?: ReactNode;
}) {
  const totalPages =
    Math.max(
      1,
      Math.ceil(
        questions.length /
        viewDensity,
      ),
    );

  const currentPage =
    Math.min(
      Math.max(page, 0),
      totalPages - 1,
    );

  const startIndex =
    currentPage *
    viewDensity;

  const pageQuestions =
    questions.slice(
      startIndex,
      startIndex +
      viewDensity,
    );

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div
            style={{
              fontFamily: fs,
              color: "#f5e6c8",
              fontSize: 14,
            }}
          >
            {startIndex + 1}
            ~
            {Math.min(
              startIndex +
              viewDensity,
              questions.length,
            )}
            {" / "}
            {questions.length}
            문제
          </div>

          <ViewDensityToggle
            value={
              viewDensity
            }
            onChange={
              onViewDensityChange
            }
          />
        </div>

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              viewDensity === 1
                ? "1fr"
                : "repeat(2, 1fr)",

            gap: 14,
          }}
        >
          {pageQuestions.map(
            (
              question,
              questionIndex,
            ) => (
              <QuestionCard
                key={
                  question.questionId
                }
                question={
                  question
                }
                index={
                  startIndex +
                  questionIndex
                }
                chosen={
                  selected[
                    question.questionId
                  ]
                }
                result={
                  results[
                    question.questionId
                  ]
                }
                locked={
                  isLocked(
                    question.questionId,
                  )
                }
                onSelect={(
                  optionId,
                ) =>
                  onSelect(
                    question,
                    optionId,
                  )
                }
              />
            ),
          )}
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            <button
              onClick={() =>
                onPageChange(
                  Math.max(
                    0,
                    currentPage - 1,
                  ),
                )
              }
              disabled={
                currentPage === 0
              }
              style={toggleStyle(
                false,
              )}
            >
              ← 이전
            </button>

            <span
              style={{
                fontFamily: ff,
                fontSize: 12,
                color: "#c8a060",
              }}
            >
              {currentPage + 1}
              {" / "}
              {totalPages}
            </span>

            <button
              onClick={() =>
                onPageChange(
                  Math.min(
                    totalPages - 1,
                    currentPage + 1,
                  ),
                )
              }
              disabled={
                currentPage ===
                totalPages - 1
              }
              style={toggleStyle(
                false,
              )}
            >
              다음 →
            </button>
          </div>
        )}
      </div>

      <Card
        style={{
          width: 240,
          flexShrink: 0,
          position: "sticky",
          top: 0,
        }}
      >
        <div
          style={{
            fontFamily: fs,
            fontWeight: 700,
            fontSize: 13,
            color: C.inkDark,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          OMR 답안지
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            maxHeight: 420,
            overflowY: "auto",
          }}
        >
          {questions.map(
            (
              question,
              questionIndex,
            ) => {
              const chosen =
                selected[
                  question.questionId
                ];

              const result =
                results[
                  question.questionId
                ];

              const locked =
                isLocked(
                  question.questionId,
                );

              return (
                <div
                  key={
                    question.questionId
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <button
                    onClick={() =>
                      onPageChange(
                        Math.floor(
                          questionIndex /
                          viewDensity,
                        ),
                      )
                    }
                    style={{
                      width: 20,
                      fontSize: 10,
                      fontFamily: ff,
                      fontWeight: 700,
                      padding: 0,

                      background:
                        questionIndex >=
                          startIndex &&
                        questionIndex <
                          startIndex +
                          viewDensity
                          ? "rgba(200,160,48,0.3)"
                          : "transparent",

                      border: "none",
                      cursor: "pointer",
                      color: C.inkDark,
                    }}
                  >
                    {questionIndex + 1}
                  </button>

                  {question.options.map(
                    (option) => {
                      const isChosen =
                        chosen ===
                        option.questionOptionId;

                      let background =
                        "transparent";

                      let border: string = C.inputBr;

                      if (result) {
                        if (
                          option.questionOptionId ===
                          result.correctOptionId
                        ) {
                          background =
                            "#245020";

                          border =
                            "#245020";
                        } else if (
                          isChosen
                        ) {
                          background =
                            "#9a2020";

                          border =
                            "#9a2020";
                        }
                      } else if (
                        isChosen
                      ) {
                        background =
                          C.active;

                        border =
                          C.active;
                      }

                      return (
                        <button
                          key={
                            option.questionOptionId
                          }
                          onClick={() =>
                            onSelect(
                              question,
                              option.questionOptionId,
                            )
                          }
                          disabled={
                            locked
                          }
                          title={
                            `${option.optionNo}번`
                          }
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius:
                              "50%",

                            border:
                              `1px solid ${border}`,

                            background,

                            cursor:
                              locked
                                ? "default"
                                : "pointer",

                            padding: 0,
                          }}
                        />
                      );
                    },
                  )}
                </div>
              );
            },
          )}
        </div>

        {statusText && (
          <div
            style={{
              marginTop: 12,
              fontFamily: ff,
              fontSize: 11,
              color: "#c8a060",
              textAlign: "center",
            }}
          >
            {statusText}
          </div>
        )}

        {footer}
      </Card>
    </div>
  );
}