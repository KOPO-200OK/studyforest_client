# UI 규칙 (색상 · 버튼 · 입력창)

> 공숲의 픽셀아트 숲 콘셉트를 코드로 고정한 문서입니다.
> **모든 색·버튼·입력창은 여기 정의된 토큰과 공통 컴포넌트를 사용합니다.** 임의 하드코딩 금지.
> 정의 위치: `src/styles/tokens.ts` · 컴포넌트: `src/components/ui/`

---

## 1. 콘셉트
- 동물의 숲 감성의 **픽셀아트 숲**. 종이(한지) 질감 카드 + 우드톤 헤더 + 채도 낮은 자연색.
- 버튼은 **2px 테두리 + 하드 그림자(2px 2px 0)** 로 픽셀 느낌.
- 폰트: 본문 `Noto Sans KR`, 제목/헤더 `Noto Serif KR`.

## 2. 색상 토큰 (`tokens.ts`의 `C`)
| 용도 | 토큰 | 값 |
|------|------|-----|
| 한지 카드 배경 | `C.hanji` | 회베이지 그라데이션 |
| 한지 테두리 | `C.hanjiB` | `#b8a880` |
| 나무 헤더 | `C.wood` | 갈색 그라데이션 |
| 먹색 텍스트 | `C.inkDark` | `#241408` |
| 강조 금색 | `C.active` / `C.gold` | `#c8a030` / `#f5c842` |
| 페이지 배경 | `C.pageBg` | `#0e1a0a` |
| 입력창 배경 | `C.inputBg` | 연노랑 반투명 |

> 새 색이 필요하면 여기 추가하고 팀에 공유. 컴포넌트 안에서 `#xxxxxx` 직접 쓰지 않기.

## 3. 버튼 (`<Button>`)
```tsx
import { Button } from "@/components/ui";

<Button variant="green">착석하기</Button>   // 확인/긍정 액션
<Button variant="blue">질문하기</Button>     // AI/정보 액션
<Button variant="red">시험 시작</Button>      // 강조/주의 액션
<Button variant="wood">퇴장하기</Button>      // 보조 액션
<Button variant="green" block>전체 너비</Button>
```
| variant | 용도 |
|---------|------|
| `green` | 기본 확인·긍정 (착석, 다음, 시작) |
| `blue` | AI·정보 (질문하기, 전송) |
| `red` | 강조·주의 (모의고사 시작, 삭제) |
| `wood` | 보조·취소성 (퇴장, 닫기) |

## 4. 입력창 (`<Input>`)
```tsx
import { Input } from "@/components/ui";
<Input placeholder="할 일 추가..." value={v} onChange={e => setV(e.target.value)} />
```
- 한지 배경 + 골드 테두리. `style` 로 `flex:1` 등만 덧붙여 사용.

## 5. 컨테이너
```tsx
import { Panel, Card } from "@/components/ui";

// 헤더 있는 패널 (사이드바·정보 블록)
<Panel title="오늘 할 일" accent="#3a1e50">...</Panel>

// 헤더 없는 카드 (문제 카드·목록 항목)
<Card onClick={...}>...</Card>
```
- `Panel`의 `accent`로 헤더 색만 바꿔 모듈별 구분 (보라=할일, 빨강=오답, 초록=분석 등).

## 6. 기타 공통 컴포넌트
| 컴포넌트 | 용도 |
|---------|------|
| `<Badge tone="neutral\|red\|blue">` | 시대·급수·오답횟수 라벨 |
| `<ProgressBar pct={75} />` | 진행률·정답률·점수 바 |

## 7. 지켜야 할 것
1. 색·간격·폰트는 **토큰에서** 가져온다 (`import { C, ff, fs } from "@/styles/tokens"`).
2. 버튼·입력창·카드는 **공통 컴포넌트**를 쓴다. 새로 만들기 전에 있는지 확인.
3. 새 스타일 규칙이 생기면 이 문서 + `tokens.ts`에 반영 후 공유한다.
