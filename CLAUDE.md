# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 현재 상태

`create-next-app` 스캐폴드만 있다 (Next.js 16.4.2, React 19.3, TypeScript, Tailwind 4, App Router, `src/` 디렉터리, alias `@/*` → `src/*`). 앱 코드, DB, 테스트는 아직 없다. 무엇을 만들지는 [PRD.md](PRD.md)(한국어)가 기준이다: 데이터 모델, 화면, API 라우트, 환경변수, 미결정 사항(§13). 구현 전에 반드시 읽을 것.

## 명령어

- `npm run dev` — 개발 서버 (http://localhost:3000)
- `npm run build` / `npm start` — 프로덕션 빌드 / 실행
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- 테스트 러너는 아직 설정되어 있지 않다.

## Next.js 버전 주의

[AGENTS.md](AGENTS.md)는 이 Next.js 버전에 기존 학습 지식과 다른 breaking change가 있다고 경고한다. Next.js 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 읽고, deprecation 안내를 따를 것.

## 계획된 아키텍처 (PRD 기준)

- 다중 사용자 앱 (이메일/비밀번호 인증, 세션 쿠키, 역할 `admin`/`user`). `/login`, `/signup`을 제외한 모든 경로는 로그인 필수. admin은 최초 가입자 또는 `ADMIN_EMAIL`로 지정한 이메일.
- 뉴스 파이프라인: `POST /api/news/fetch`가 RSS 두 개(TechCrunch AI, The Verge AI)를 읽고, DB에 없는 URL만 저장한 뒤 Claude(구조화 JSON)로 한국어 제목, 3~5문장 요약, 카테고리(현재 카테고리 목록 중에서만 선택)를 생성한다. 전역 10분 재실행 간격(`fetch_state.last_fetched_at`) 안에서는 Claude를 전혀 호출하지 않는다. 기사와 카테고리는 모든 사용자가 공유한다.
- 카테고리 추가·수정·삭제는 admin만 가능(`/categories`). 시드 초안: 모델/출시, 연구, 비즈니스/투자, 규제/정책, 기타. 사용자는 전체 / 각 카테고리 / 미분류로 필터링한다.
- 카테고리를 삭제하면 해당 기사의 `category_id`가 null('미분류')이 된다. '재분류' 버튼은 Claude로 현재 목록 기준 재분류한다.
- Notion 저장: 앱 서버가 공식 원격 Notion MCP 서버의 MCP 클라이언트로 동작한다 (사용자별 OAuth, 암호화된 토큰은 `notion_connections`에 저장). 사용자가 지정한 상위 페이지 하위에 페이지를 만들고, `notion_saves`로 중복 저장을 막는다.
- 스택: Neon Postgres + Drizzle ORM, Claude API, Vercel 배포 (신규 기사가 많을 때 함수 실행 시간 제한 주의).
- 환경변수: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `SESSION_SECRET`, `ADMIN_EMAIL`, 토큰 암호화 키.

### 데이터 모델

- `users`: id, email(unique), password_hash, role, created_at
- `categories`: id, name(unique), created_at
- `articles`: id, source, url(unique), original_title, title_ko, summary_ko, published_at, category_id(nullable = 미분류), created_at
- `fetch_state`: last_fetched_at
- `notion_connections`: user_id, 암호화된 OAuth 토큰, 저장 대상 page_id
- `notion_saves`: user_id, article_id, notion_page_url

### 화면 / API (예정)

- 화면: `/login`, `/signup`, `/`(카드 목록 + 카테고리 필터 + '뉴스 가져오기'), `/categories`(admin).
- API: `/api/auth/*`, `/api/news/fetch`, `/api/articles`, `/api/categories`, `/api/articles/[id]/notion`, `/api/notion/oauth/*`.
- RSS: TechCrunch `https://techcrunch.com/category/artificial-intelligence/feed/`, The Verge `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml`.

### 리스크 / 구현 시 유의

- 공개 가입 + 누구나 수집 가능하므로 Claude 비용 노출 위험이 있다. 10분 간격이 1차 방어이며, 필요하면 배치·건수 제한을 추가한다.
- Vercel 실행 시간 제한: 신규 기사가 많으면 병렬 호출 또는 분할 처리를 검토한다.
- Notion MCP OAuth(클라이언트 등록, 토큰 갱신)는 복잡하므로 구현 초기에 먼저 검증한다.

### 미결정 사항 (PRD §13)

- 카드에 원문 링크·출처·발행일·썸네일 포함 여부
- 사용할 Claude 모델과 1회 처리 건수 상한
- 기본 카테고리 최종 목록

이 항목이 확정되기 전에는 임의로 정하지 말고 사용자에게 확인할 것.
