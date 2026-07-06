# 공숲 (StudyForest) — 팀 프로젝트 스켈레톤

한국사능력검정시험 대비 학습 플랫폼. React + Vite + TypeScript.
피그마 베이스에서 추출한 디자인 시스템 위에 각자 모듈을 얹는 구조입니다.

## 실행
```bash
npm install
npm run dev
```

## 팀 문서
- `docs/화면설계_최소양식.md` — 화면 설계할 때 복사해서 채우는 양식
- `docs/UI_규칙.md` — 색·버튼·입력창 규칙 (반드시 숙지)

## 폴더 구조
```
src/
├── main.tsx                # 엔트리
├── App.tsx                 # RouterProvider
├── routes/index.tsx        # ★ 라우팅 한 곳에서 관리 (새 화면은 여기 등록)
├── layouts/
│   └── AppLayout.tsx       # 공통 레이아웃 (Nav + Outlet + 전역 상태)
├── components/
│   ├── Nav.tsx             # 상단 네비 (라우팅 연동)
│   └── ui/                 # ★ 공통 UI 킷 (Button/Input/Panel/Card/Badge/ProgressBar)
├── styles/
│   ├── tokens.ts           # ★ 디자인 토큰 (색·폰트·간격)
│   ├── index.css / fonts.css / tailwind.css
├── context/
│   └── TodosContext.tsx    # 스터디룸·나의공부 공유 상태 예시
├── pages/                  # 모듈별 페이지
│   ├── StudyRoomPage.tsx   # 스터디룸 (완성 화면 마운트)
│   ├── MyStudyPage.tsx     # 나의 공부 (완성 화면 마운트)
│   ├── JangwonPage.tsx     # 장원급제 (스텁)
│   ├── AdminPage.tsx       # 관리자 (스텁)
│   └── question/           # 문제은행 모듈 (담당: 주미) — ERD 라우터 기준
│       ├── QuestionBankHome.tsx
│       ├── PeriodQuestionPage.tsx
│       ├── RandomQuestionPage.tsx
│       ├── QuestionSolvePage.tsx
│       ├── MockExamStartPage.tsx / SolvePage / ResultPage
│       ├── WrongAnswerPage.tsx
│       └── AiQuestionPage.tsx
├── legacy/
│   └── GongsupScreens.tsx  # 피그마에서 뽑은 원본 화면 (스터디룸·나의공부·문제은행 풀버전)
└── imports/                # 맵 이미지 4장
```

## 라우팅
| 경로 | 모듈 | 담당 |
|------|------|------|
| `/study-room` | 스터디룸 | (공통/배정) |
| `/question-bank/*` | 문제은행 | 주미 |
| `/my-study` | 나의 공부 | (배정) |
| `/jangwon` | 장원급제 | (배정) |
| `/admin` | 관리자 | (배정) |

`/` 진입 시 `/study-room`으로 리다이렉트.

## 새 화면 추가하는 법
1. `src/pages/<모듈>/` 에 페이지 컴포넌트 생성
2. `src/routes/index.tsx` 에 route 등록
3. UI는 `src/components/ui` + `src/styles/tokens.ts` 사용 (하드코딩 금지)
4. 설계는 `docs/화면설계_최소양식.md` 채워서 공유

## 메모
- 스터디룸/나의공부 완성 화면은 `legacy/GongsupScreens.tsx`에서 마운트됨. 리팩터링해서 `pages/`로 쪼개도 됨.
- 문제은행 세부 화면은 현재 **스텁**. ERD·화면설계서(v1.1) 기준으로 채우면 됨.
- 전역 상태는 `TodosContext` 패턴 참고. 필요 시 모듈별 Context 추가.
