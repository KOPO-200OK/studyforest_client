import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";

import StudyRoomPage from "@/pages/StudyRoomPage";
import MyStudyPage from "@/pages/MyStudyPage";
import JangwonPage from "@/pages/JangwonPage";
import AdminPage from "@/pages/AdminPage";
import NotFoundPage from "@/pages/NotFoundPage";

// 문제은행 모듈 (담당: 주미) — ERD 화면설계서 라우터 기준
import QuestionBankHome from "@/pages/question/QuestionBankHome";
import PeriodQuestionPage from "@/pages/question/PeriodQuestionPage";
import RandomQuestionPage from "@/pages/question/RandomQuestionPage";
import QuestionSolvePage from "@/pages/question/QuestionSolvePage";
import MockExamStartPage from "@/pages/question/MockExamStartPage";
import MockExamSolvePage from "@/pages/question/MockExamSolvePage";
import MockExamResultPage from "@/pages/question/MockExamResultPage";
import WrongAnswerPage from "@/pages/question/WrongAnswerPage";
import AiQuestionPage from "@/pages/question/AiQuestionPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/study-room" replace /> },
      { path: "study-room", element: <StudyRoomPage /> },
      { path: "my-study", element: <MyStudyPage /> },
      { path: "jangwon", element: <JangwonPage /> },
      { path: "admin", element: <AdminPage /> },

      // ── 문제은행 (module 3) ──
      { path: "question-bank", children: [
        { index: true, element: <QuestionBankHome /> },
        { path: "periods", element: <PeriodQuestionPage /> },
        { path: "periods/:periodId", element: <PeriodQuestionPage /> },
        { path: "random", element: <RandomQuestionPage /> },
        { path: "solve", element: <QuestionSolvePage /> },
        { path: "mock-exams", element: <MockExamStartPage /> },
        { path: "mock-exams/:mockExamId", element: <MockExamSolvePage /> },
        { path: "mock-exams/:mockExamId/result", element: <MockExamResultPage /> },
        { path: "wrong-answers", element: <WrongAnswerPage /> },
        { path: "wrong-answers/:wrongAnswerId", element: <WrongAnswerPage /> },
        { path: "ai", element: <AiQuestionPage /> },
        { path: "ai/:chatSessionId", element: <AiQuestionPage /> },
      ]},

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
