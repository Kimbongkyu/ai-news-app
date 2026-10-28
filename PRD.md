# PRD: AI 뉴스 수집기

## 1. 개요
해외 AI 뉴스를 RSS로 수집하고, OpenAI API로 한국어 번역·요약·카테고리 분류를 한 뒤 카드 형태로 보여주는 다중 사용자 웹앱. 마음에 드는 뉴스는 Notion에 저장할 수 있다.

## 2. 목표
- 영어 AI 뉴스를 한국어 요약 카드로 빠르게 훑어본다.
- 자동 분류된 카테고리로 원하는 뉴스만 골라 본다.
- 선택한 뉴스를 클릭 한 번으로 Notion에 보관한다.

## 3. 사용자
- 여러 명이 사용. 누구나 회원가입 가능(인증은 Clerk 사용).
- 역할: `admin`, `user`. 역할은 앱 DB의 `users.role`로 관리하며, 최초 가입자 또는 환경변수(`ADMIN_EMAIL`)로 지정한 이메일이 admin.

## 4. 뉴스 소스
| 소스 | RSS |
|---|---|
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |

## 5. 기능 요구사항

### 5.1 인증
- 앱 접속 시 로그인 필수. 미로그인 사용자에게는 콘텐츠 대신 로그인 모달(Clerk)을 자동으로 띄운다.
- 인증은 외부 서비스 Clerk(`@clerk/nextjs`)에 위임한다(회원가입·로그인·세션 관리). 비밀번호는 앱이 저장하지 않는다.
- 로그인·가입은 별도 페이지 없이 Clerk 모달(`openSignIn`)에서 처리한다. 루트 레이아웃이 `<Show when="signed-out">`로 로그인 게이트를, `signed-in`일 때만 페이지를 렌더링한다. 로그인 후 헤더에 `UserButton`(프로필·로그아웃)을 표시한다.
- Next.js 16의 `src/proxy.ts`(Clerk 미들웨어)가 `/api/*`를 인증 필수로 보호한다.
- 로그인한 사용자의 최초 요청 시 앱 DB `users`에 Clerk user ID로 행을 만들고(없을 때만), 이때 역할을 정한다(최초 사용자 또는 `ADMIN_EMAIL` 일치 시 admin). 권한 검사는 `users.role` 기준.

### 5.2 뉴스 가져오기
- '뉴스 가져오기' 버튼 클릭 시 두 RSS 피드의 최신 글을 모두 읽는다.
- URL 기준으로 DB에 없는 신규 기사만 OpenAI API로 처리한다(한국어 제목 번역, 3~5문장 요약, 카테고리 선택).
- OpenAI 모델은 `gpt-5-mini`(환경변수 `OPENAI_MODEL`로 변경 가능). 1회 처리 상한은 30건(호출당 5건씩 배치, 동시 3개)이며, 초과분은 다음 수집에서 최신순으로 이어서 처리한다.
- 최소 재실행 간격 10분: 마지막 수집 후 10분 이내에는 OpenAI를 호출하지 않고 기존 데이터만 표시하며, 안내 메시지를 보여준다.
- 뉴스와 카테고리는 모든 사용자가 공유한다.

### 5.3 뉴스 카드
- 썸네일(있을 때만), 카테고리 배지, 한국어 제목 + 3~5문장 요약.
- 출처·발행일, 원문 링크.
- 'Notion 저장' 버튼.
- 썸네일은 원본 사이트 이미지를 참조한다. RSS에 이미지가 없으면 기사 페이지의 og:image를 가져오고, 그래도 없으면 이미지 없이 표시한다.

### 5.4 카테고리
- 기본 카테고리 시드(확정): 모델/출시, 연구, 비즈니스/투자, 규제/정책, 기타. 이후 admin이 변경할 수 있다.
- OpenAI 모델은 현재 카테고리 목록 중에서만 선택해 분류한다.
- 사용자는 카테고리를 선택해 해당 뉴스만 필터링해 볼 수 있다(전체 / 각 카테고리 / 미분류).
- 카테고리 추가·수정·삭제는 admin만 가능.
- 카테고리를 삭제하면 해당 뉴스는 '미분류'로 이동. '재분류' 버튼으로 OpenAI 모델이 현재 목록 기준으로 다시 분류한다.

### 5.5 Notion 저장
- 공식 Notion MCP 서버(원격, OAuth)를 사용. 앱 서버가 MCP 클라이언트로 동작한다.
- 사용자는 최초 1회 Notion을 연결하고 저장 위치(상위 페이지)를 지정한다.
- 'Notion 저장' 클릭 시 지정 페이지 하위에 새 페이지 생성: 제목, 요약, 카테고리, 원문 링크, 출처, 발행일.
- 저장된 뉴스는 카드에 저장 완료 상태를 표시하고 중복 저장을 막는다.

## 6. 기술 스택
- 프레임워크: Next.js (App Router, TypeScript), Node.js
- 인증: Clerk (`@clerk/nextjs`)
- DB: Neon(Postgres) + Drizzle ORM
- AI: OpenAI API (번역·요약·카테고리 분류, 구조화 JSON 출력)
- Notion: Notion MCP 서버
- 배포: Vercel

## 7. 데이터 모델
- `users`: id(Clerk user ID, text PK), email, role, created_at
- `categories`: id, name(unique), created_at
- `articles`: id, source, url(unique), original_title, title_ko, summary_ko, published_at, image_url(nullable), category_id(nullable = 미분류), created_at
- `fetch_state`: last_fetched_at
- `notion_connections`: user_id, 암호화된 OAuth 토큰, 저장 대상 page_id
- `notion_saves`: user_id, article_id, notion_page_url

## 8. 화면
- 로그인/가입: 모달 (별도 경로 없음)
- `/` : 카드 목록, 카테고리 필터, '뉴스 가져오기' 버튼
- `/categories` : 카테고리 관리 (admin)

## 9. API (예정)
`/api/news/fetch`, `/api/articles`, `/api/categories`, `/api/articles/[id]/notion`, `/api/notion/oauth/*`

## 10. 환경변수
`DATABASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL`(선택, 기본 `gpt-5-mini`), `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`(`pk_`), `CLERK_SECRET_KEY`(`sk_`), `ADMIN_EMAIL`, 토큰 암호화 키

## 11. 리스크 및 대응
- **OpenAI 비용 노출**(공개 가입 + 누구나 수집): 10분 재실행 간격으로 1차 대응. 필요 시 배치·건수 제한 추가.
- **Vercel 실행 시간 제한**: 신규 기사가 많으면 OpenAI 호출이 길어짐 → 병렬 호출 또는 분할 처리 검토.
- **Notion MCP OAuth 복잡도**(클라이언트 등록, 토큰 갱신): 구현 초기에 먼저 검증.

## 12. 검증 기준
- 비로그인 접근 차단, Clerk 가입/로그인, 최초 요청 시 `users` 행 생성, admin/일반 권한 차이
- 수집 실행 시 카드 생성, 10분 내 재실행은 OpenAI 미호출, 이후 재실행 시 중복 없음
- 카테고리 필터, 카테고리 CRUD(admin만), 삭제 후 '미분류' 이동 및 재분류
- Notion 연결 후 저장 시 지정 페이지 하위에 페이지 생성

## 13. 미결정 사항
현재 없음.
