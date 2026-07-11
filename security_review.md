# studyforest_client 보안 검토 결과 (2026-07-11)

대상: 전체 프론트엔드 소스(`src/`), 클린 워킹트리(diff 없음) 기준 전체 코드베이스 검토
방법: 소스 코드 수동 검토(XSS 싱크, 시크릿 하드코딩, 인증 토큰 처리, 소켓 인증, ICE 서버 설정 등) + `npm audit` 의존성 스캔

## 1. 애플리케이션 코드 수동 검토 결과

**HIGH/MEDIUM 등급의 고신뢰(>80%) 취약점 없음.**

검토 후 실제 취약점이 아니라고 판단해 제외한 항목:

| 위치 | 패턴 | 판단 |
|---|---|---|
| `src/api/client.ts:10,13-15` | JWT를 `localStorage`에 저장 | 코드베이스 전체에 `dangerouslySetInnerHTML`, `eval`, `innerHTML` 대입 등 XSS 싱크가 전혀 없어(grep 전수 조사, 0건) 이 토큰을 탈취할 실제 공격 경로가 없음. React는 기본적으로 auto-escape하므로 저위험 |
| `src/api/studySpaceSocket.ts:44` | STOMP `connectHeaders`에 `Authorization: Bearer <token>` | URL 쿼리스트링이 아닌 STOMP CONNECT 프레임 헤더로 전달 — 로그/리퍼러 유출 경로 없음. 정상 패턴 |
| `src/voice/OfficeVoiceMeshClient.ts:32` | `ws://localhost:8080` 하드코딩 | `VITE_WS_BASE_URL` 환경변수가 없을 때만 쓰이는 로컬 개발 fallback. 프로덕션 빌드는 env로 override됨 |
| `src/voice/OfficeVoiceMeshClient.ts:235` | `stun:stun.l.google.com:19302` | 인증정보 없는 공개 STUN 서버. 정상 |
| `src/legacy/GongsupScreens.tsx:2136` | `Math.random()` | UI 프로그레스바 애니메이션 용도, 보안과 무관 |
| `src/api/mockAuthApi.ts:142-143` | `isCurrentUserAdmin()`이 `localStorage`값으로 admin 여부 판단 | 클라이언트 측 권한판단은 UI 노출 제어용일 뿐이며, 실제 권한 강제는 백엔드 책임(클라이언트 코드는 신뢰되지 않는 입력으로 취급) — 클라이언트 단 권한체크 부재는 그 자체로 취약점 아님 |

grep 전수조사 대상(미발견): `dangerouslySetInnerHTML`, `eval(`, `new Function(`, `innerHTML =`, `document.write`, `document.cookie`, `atob(`, 하드코딩된 `password=`/`apiKey=`/`secret=` 값, `console.log`로 토큰/비밀번호 출력.

## 2. 의존성(서드파티 라이브러리) 취약점 — `npm audit`

이 항목은 애플리케이션 코드 결함이 아니라 **의존 패키지 버전 문제**이며, 업그레이드로 해결됩니다.

| 패키지 | 심각도 | 내용 | 조치 |
|---|---|---|---|
| `react-router-dom` (현재 6.28.0, `@remix-run/router` ≤1.23.1) | High | Open Redirect를 통한 XSS 취약점 (GHSA-2w69-qvjg-hvjx) | `react-router-dom@6.30.4` 이상으로 업그레이드 |
| `vite` (현재 6.3.5) | High | 개발 서버 한정 취약점 5건 — 경로 우회로 `public/` 밖 임의 파일 읽기(GHSA-93m4/4w7w/p9ff 등), Windows 백슬래시 우회, `launch-editor` NTLMv2 해시 노출(GHSA-v6wh) | `vite@6.4.3` 이상으로 업그레이드. **개발 서버(`npm run dev`)에만 해당하며 빌드된 프로덕션 산출물에는 영향 없음** — 단, 사내망에 dev 서버를 노출한 상태로 두면 실제 공격 표면이 됨 |

```
npm audit fix --force
```
로 두 건 모두 해결 가능하나, `--force`는 semver 범위를 벗어난 메이저 업그레이드를 강제할 수 있으므로 실행 전 라우팅/빌드 동작 회귀 테스트 권장.

## 3. "SpotBugs 같은 거" 관련 참고

SpotBugs는 Java 바이트코드 정적분석 도구라 이 저장소(TypeScript/React, Java 코드 없음)에는 적용되지 않습니다. JS/TS 프로젝트에서 대응되는 도구:

- **의존성 CVE 스캔**: `npm audit` (위에서 이미 실행함) — Snyk, GitHub Dependabot도 동일 목적
- **정적 보안 린트**: `eslint-plugin-security`, 또는 `semgrep --config p/javascript`
- 현재 저장소에는 ESLint 설정 자체가 없어(`package.json`에 lint 스크립트 없음) 정적 린트 기반 검사는 별도 설정이 필요함

## 결론

애플리케이션 코드 자체에서는 실제로 악용 가능한(exploitable) 취약점을 찾지 못했습니다. 유일한 실질적 리스크는 구버전 `react-router-dom`/`vite` 의존성이며, 업그레이드로 해소됩니다.
