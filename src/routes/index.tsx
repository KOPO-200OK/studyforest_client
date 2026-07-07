import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";

import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import FindIdPage from "@/pages/FindIdPage";
import FindPasswordPage from "@/pages/FindPasswordPage";
import SelectCharacterPage from "@/pages/SelectCharacterPage";
import StudyRoomPage from "@/pages/StudyRoomPage";
import MyStudyPage from "@/pages/MyStudyPage";
import JangwonPage from "@/pages/JangwonPage";
import NotFoundPage from "@/pages/NotFoundPage";

// 관리자
import AdminLayout from "@/layouts/AdminLayout";
import AdminMembersPage from "@/pages/admin/AdminMembersPage";
import AdminQuestionsPage from "@/pages/admin/AdminQuestionsPage";
import AdminAiPage from "@/pages/admin/AdminAiPage";
import AdminJangwonPage from "@/pages/admin/AdminJangwonPage";
import AdminStudyRoomsPage from "@/pages/admin/AdminStudyRoomsPage";

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
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "login", element: <LoginPage /> },
  { path: "signup", element: <SignupPage /> },
  { path: "find-id", element: <FindIdPage /> },
  { path: "find-password", element: <FindPasswordPage /> },
  { path: "select-character", element: <SelectCharacterPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: "study-room", element: <StudyRoomPage /> },
      { path: "my-study", element: <MyStudyPage /> },
      { path: "jangwon", element: <JangwonPage /> },

      // ── 관리자 ──
      { path: "admin", element: <AdminLayout />, children: [
        { index: true, element: <Navigate to="members" replace /> },
        { path: "members", element: <AdminMembersPage /> },
        { path: "questions", element: <AdminQuestionsPage /> },
        { path: "ai", element: <AdminAiPage /> },
        { path: "jangwon", element: <AdminJangwonPage /> },
        { path: "study-rooms", element: <AdminStudyRoomsPage /> },
      ]},

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
