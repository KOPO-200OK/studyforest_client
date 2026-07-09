// ============================================================
// "AI로 문제지 만들기" 목업 — 실제 AI 서버(studyforest_AI) 준비 전까지 임시 사용.
// 그 자리에서 즉석으로 문제를 만들어 보여주기만 하고 저장하지 않는다(1회성 사용).
// 실제 AI 서버가 준비되면 이 파일을 지우고 fetch로 교체.
// ============================================================

import type { Difficulty, PeriodCode } from "./types";

export interface GeneratedQuestionOption {
  optionNo: number;
  optionContent: string;
  isCorrect: boolean;
}

export interface GeneratedQuestion {
  id: number;
  periodCode: PeriodCode;
  questionContent: string;
  difficulty: Difficulty;
  options: GeneratedQuestionOption[];
  explanation: string;
}

interface BankItem {
  questionContent: string;
  /** options[0]이 정답 */
  options: string[];
  explanation: string;
}

const QUESTION_BANK: Record<PeriodCode, BankItem[]> = {
  PREHISTORY: [
    { questionContent: "청동기 시대 지배층의 무덤으로 알려진 거석 구조물은?", options: ["고인돌", "온돌", "기와집", "초가집"], explanation: "고인돌은 청동기 시대 지배층의 권력을 보여주는 무덤 양식이다." },
    { questionContent: "우리나라 최초의 국가로 알려진 나라는?", options: ["고조선", "부여", "옥저", "동예"], explanation: "고조선은 청동기 문화를 바탕으로 세워진 우리나라 최초의 국가이다." },
    { questionContent: "고조선의 사회 질서를 보여주는 법률은?", options: ["8조법", "균전제", "대동법", "호패법"], explanation: "8조법(범금 8조)은 고조선의 사회상을 보여주는 법률로, 일부 조항이 전해진다." },
    { questionContent: "신석기 시대를 대표하는 도구는?", options: ["빗살무늬 토기", "청동 거울", "철제 농기구", "반달돌칼"], explanation: "빗살무늬 토기는 신석기 시대의 대표적인 토기 유물이다." },
  ],
  THREE_KINGDOMS: [
    { questionContent: "신라 화랑도가 지켜야 했던 다섯 가지 계율은?", options: ["세속오계", "홍익인간", "훈요십조", "사출도"], explanation: "세속오계는 원광법사가 화랑에게 전한 다섯 가지 계율이다." },
    { questionContent: "평양 천도를 단행하고 남진 정책으로 한강 유역을 차지한 고구려의 왕은?", options: ["장수왕", "근초고왕", "온조왕", "무령왕"], explanation: "장수왕은 평양 천도 후 남진 정책을 펼쳐 한강 유역을 차지했다." },
    { questionContent: "마한을 통합하고 고구려를 공격하는 등 백제의 전성기를 이끈 왕은?", options: ["근초고왕", "장수왕", "문무왕", "무열왕"], explanation: "근초고왕 때 백제는 영토를 크게 넓히며 전성기를 맞았다." },
    { questionContent: "통일 신라가 지방 행정을 정비하기 위해 실시한 제도는?", options: ["9주 5소경", "3성 6부", "5도 양계", "8도"], explanation: "통일 신라는 전국을 9주 5소경으로 나누어 지방을 통치했다." },
    { questionContent: "발해를 건국한 인물은?", options: ["대조영", "온조", "주몽", "견훤"], explanation: "대조영은 고구려 유민과 말갈족을 이끌고 발해를 건국했다." },
  ],
  GORYEO: [
    { questionContent: "고려를 건국한 인물은?", options: ["왕건", "궁예", "견훤", "왕규"], explanation: "왕건은 후삼국을 통일하고 고려를 건국했다." },
    { questionContent: "고려 무신정변 이후 최씨 무신 정권의 최고 권력 기구는?", options: ["교정도감", "도병마사", "식목도감", "중추원"], explanation: "교정도감은 최충헌이 설치한 최씨 무신 정권의 최고 권력 기구이다." },
    { questionContent: "고려가 몽골의 침입에 항쟁하며 수도를 옮긴 곳은?", options: ["강화도", "남한산성", "개경", "한양"], explanation: "고려 조정은 몽골에 대항하기 위해 강화도로 천도했다." },
    { questionContent: "세계에서 가장 오래된 금속활자 인쇄본으로 알려진 것은?", options: ["직지심체요절", "팔만대장경", "무구정광대다라니경", "훈민정음"], explanation: "직지심체요절은 현존하는 세계 최고(最古)의 금속활자 인쇄본이다." },
  ],
  JOSEON: [
    { questionContent: "조선을 건국한 인물은?", options: ["이성계", "이방원", "정도전", "이순신"], explanation: "이성계는 위화도 회군 이후 조선을 건국했다." },
    { questionContent: "조선의 통치 체제를 정비한 기본 법전은?", options: ["경국대전", "대전회통", "목민심서", "반계수록"], explanation: "경국대전은 조선의 통치 규범을 담은 기본 법전이다." },
    { questionContent: "세종대왕이 창제한 문자는?", options: ["훈민정음", "이두", "향찰", "구결"], explanation: "훈민정음은 세종대왕이 창제한 우리 고유의 문자이다." },
    { questionContent: "임진왜란 당시 한산도 대첩을 승리로 이끈 인물은?", options: ["이순신", "권율", "곽재우", "김시민"], explanation: "이순신은 한산도 대첩 등에서 왜군을 크게 무찔렀다." },
    { questionContent: "조선 후기 공납을 쌀·베·동전으로 통일해 납부하게 한 제도는?", options: ["대동법", "균역법", "호패법", "영정법"], explanation: "대동법은 공납의 폐단을 개선하기 위해 실시된 제도이다." },
  ],
  MODERN: [
    { questionContent: "1919년 일제강점기에 일어난 전 민족적 만세 운동은?", options: ["3·1 운동", "6·10 만세운동", "물산장려운동", "국채보상운동"], explanation: "3·1 운동은 1919년에 일어난 전 민족적 독립운동이다." },
    { questionContent: "대한민국 임시정부가 수립된 도시는?", options: ["상하이", "도쿄", "베이징", "하얼빈"], explanation: "대한민국 임시정부는 1919년 중국 상하이에서 수립되었다." },
    { questionContent: "1907년 국민들이 성금을 모아 나랏빚을 갚으려 한 운동은?", options: ["국채보상운동", "물산장려운동", "동학농민운동", "애국계몽운동"], explanation: "국채보상운동은 일본에 진 나랏빚을 국민 성금으로 갚으려 한 운동이다." },
    { questionContent: "1960년 이승만 정권의 부정선거에 항의해 일어난 민주화 운동은?", options: ["4·19 혁명", "5·18 민주화운동", "6월 민주항쟁", "부마민주항쟁"], explanation: "4·19 혁명은 3·15 부정선거에 항의하며 일어난 민주화 운동이다." },
  ],
};

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const mockAiQuestionApi = {
  /** AI가 그 자리에서 문제를 생성하는 것처럼 보이도록 약간의 지연 후 결과를 돌려준다 */
  async generateQuestions(input: { periodCode: PeriodCode; difficulty: Difficulty; count: number }): Promise<GeneratedQuestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const bank = QUESTION_BANK[input.periodCode];
    const picked = shuffle(bank).slice(0, Math.max(1, Math.min(input.count, bank.length)));

    return picked.map((item, i) => {
      const options = shuffle(item.options.map((content, idx) => ({ content, isCorrect: idx === 0 })));
      return {
        id: i + 1,
        periodCode: input.periodCode,
        questionContent: item.questionContent,
        difficulty: input.difficulty,
        explanation: item.explanation,
        options: options.map((o, idx) => ({ optionNo: idx + 1, optionContent: o.content, isCorrect: o.isCorrect })),
      };
    });
  },
};
