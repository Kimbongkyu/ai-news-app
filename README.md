# AI 뉴스 수집기

해외 AI 뉴스를 RSS로 수집하고, OpenAI로 한국어 제목·요약·카테고리를 만들어 카드로 보여 주는 다중 사용자 웹앱입니다. 마음에 드는 뉴스는 버튼 한 번으로 Notion 데이터베이스에 저장할 수 있습니다.

## 주요 기능

- **뉴스 수집**: TechCrunch AI, The Verge AI의 RSS를 읽어 DB에 없는 기사만 저장합니다.
- **번역·요약·분류**: OpenAI(구조화 JSON)로 한국어 제목, 3~5문장 요약, 카테고리를 생성합니다. 카테고리는 현재 목록 중에서만 고릅니다.
- **10분 재실행 제한**: 전역 10분 간격 안에서는 RSS와 OpenAI를 호출하지 않아 비용을 줄입니다.
- **카드 대시보드**: 카테고리 필터(전체 / 각 카테고리 / 미분류)와 페이지네이션을 제공합니다.
- **Notion 저장**: 카드의 '뉴스 저장' 버튼으로 Notion 데이터베이스에 페이지를 만들고, 저장 후에는 '저장됨'으로 바뀝니다. 같은 기사는 중복 저장되지 않습니다.
- **인증**: Clerk로 로그인하며, 비로그인 사용자에게는 로그인 모달을 띄우고 `/api/*`를 보호합니다.

## 기술 스택

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Clerk · Neon Postgres + Drizzle ORM · OpenAI API · Notion API · Vercel

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다.

| 변수 | 설명 |
| --- | --- |
| `DATABASE_URL` | Neon Postgres 연결 문자열 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 공개 키 (`pk_`) |
| `CLERK_SECRET_KEY` | Clerk 비밀 키 (`sk_`) |
| `ADMIN_EMAIL` | 이 이메일로 가입하면 admin 역할 부여 (비워 두면 최초 가입자가 admin) |
| `OPENAI_API_KEY` | OpenAI API 키 |
| `OPENAI_MODEL` | (선택) 사용할 모델. 기본값 `gpt-5-mini` |
| `NOTION_API_TOKEN` | Notion 연동(integration) 토큰 |
| `NOTION_DATABASE_ID` | 뉴스를 저장할 Notion 데이터베이스 ID |
| `TOKEN_ENCRYPTION_KEY` | 토큰 암호화 키 (32바이트, base64) |

### 3. Notion 데이터베이스 준비

저장 대상 데이터베이스에는 아래 속성이 있어야 하고, 위 연동(integration)에 데이터베이스가 공유되어 있어야 합니다.

| 속성 | 타입 |
| --- | --- |
| 제목 | 제목(title) |
| 요약 | 텍스트 |
| 카테고리 | 선택 |
| 출처 | 선택 |
| 원문 링크 | URL |
| 발행일 | 날짜 |

### 4. 데이터베이스 준비

```bash
npx drizzle-kit push        # 스키마 반영
npx tsx src/db/seed.ts      # 기본 카테고리 시드 (모델/출시, 연구, 비즈니스/투자, 규제/정책, 기타)
```

### 5. 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인합니다. 로그인 후 `/dashboard`에서 '뉴스 가져오기'를 누르면 수집이 시작됩니다.

## 명령어

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` / `npm start` | 프로덕션 빌드 / 실행 |
| `npm run lint` | ESLint |

## 프로젝트 구조

```
src/
├── app/
│   ├── api/news/fetch/          # POST: 뉴스 수집 + OpenAI 처리
│   ├── api/articles/[id]/notion/ # POST: Notion 저장
│   └── dashboard/               # 카드 목록 페이지
├── components/                  # 뉴스 카드, 카테고리 바, 저장 버튼 등
├── db/                          # Drizzle 스키마, Neon 연결, 시드
├── lib/
│   ├── ai/                      # OpenAI 번역·요약·분류
│   ├── rss/                     # RSS 수집·파싱
│   ├── notion.ts                # Notion 페이지 생성
│   └── users.ts                 # 최초 요청 시 users 행 생성
└── proxy.ts                     # Clerk 미들웨어 (/api/* 보호)
```

## 사용할 플러그인

- Frontend Design: UI 디자인 품질 향상
- commit-commands: 깃 워크플로 자동화

## 문서

- [PRD.md](PRD.md) — 요구사항, 데이터 모델, 화면, API
- [ui.md](ui.md) — UI·스타일 가이드
- [CLAUDE.md](CLAUDE.md) — Claude Code 작업 가이드

## 참고

- Next.js 16에는 기존 지식과 다른 변경점이 있습니다. 코드를 쓰기 전에 `node_modules/next/dist/docs/`를 참고하세요.
- 공개 가입 + 누구나 수집 가능한 구조라 OpenAI 비용에 주의해야 합니다. 현재는 10분 재실행 간격이 1차 방어입니다.
