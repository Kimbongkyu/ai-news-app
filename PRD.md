# PRD: AI 뉴스 수집기

## 1. 개요
해외 AI 뉴스를 RSS로 수집하고, Claude API로 한국어 번역·요약·카테고리 분류를 한 뒤 카드 형태로 보여주는 다중 사용자 웹앱. 마음에 드는 뉴스는 Notion에 저장할 수 있다.

## 2. 목표
- 영어 AI 뉴스를 한국어 요약 카드로 빠르게 훑어본다.
- 자동 분류된 카테고리로 원하는 뉴스만 골라 본다.
- 선택한 뉴스를 클릭 한 번으로 Notion에 보관한다.

## 3. 사용자
- 여러 명이 사용. 누구나 이메일/비밀번호로 회원가입 가능.
- 역할: `admin`, `user`. 최초 가입자 또는 환경변수(`ADMIN_EMAIL`)로 지정한 이메일이 admin.

## 4. 뉴스 소스
| 소스 | RSS |
|---|---|
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |

## 5. 기능 요구사항

### 5.1 인증
- 앱 실행 시 로그인 필수. 미로그인 접근은 `/login`으로 리다이렉트.
- 이메일/비밀번호 회원가입·로그인. 비밀번호는 해시로 저장, 세션 쿠키 사용.

### 5.2 뉴스 가져오기
- '뉴스 가져오기' 버튼 클릭 시 두 RSS 피드의 최신 글을 모두 읽는다.
- URL 기준으로 DB에 없는 신규 기사만 Claude API로 처리한다(한국어 제목 번역, 3~5문장 요약, 카테고리 선택).
- 최소 재실행 간격 10분: 마지막 수집 후 10분 이내에는 Claude를 호출하지 않고 기존 데이터만 표시하며, 안내 메시지를 보여준다.
- 뉴스와 카테고리는 모든 사용자가 공유한다.

### 5.3 뉴스 카드
- 한국어 제목 + 3~5문장 요약, 카테고리 배지.
- 'Notion 저장' 버튼.
- (선택, 추후 결정) 원문 링크·출처·발행일 표시.

### 5.4 카테고리
- 기본 카테고리 시드: 모델/출시, 연구, 비즈니스/투자, 규제/정책, 기타 (초안, 변경 가능).
- Claude는 현재 카테고리 목록 중에서만 선택해 분류한다.
- 사용자는 카테고리를 선택해 해당 뉴스만 필터링해 볼 수 있다(전체 / 각 카테고리 / 미분류).
- 카테고리 추가·수정·삭제는 admin만 가능.
- 카테고리를 삭제하면 해당 뉴스는 '미분류'로 이동. '재분류' 버튼으로 Claude가 현재 목록 기준으로 다시 분류한다.

### 5.5 Notion 저장
- 공식 Notion MCP 서버(원격, OAuth)를 사용. 앱 서버가 MCP 클라이언트로 동작한다.
- 사용자는 최초 1회 Notion을 연결하고 저장 위치(상위 페이지)를 지정한다.
- 'Notion 저장' 클릭 시 지정 페이지 하위에 새 페이지 생성: 제목, 요약, 카테고리, 원문 링크, 출처, 발행일.
- 저장된 뉴스는 카드에 저장 완료 상태를 표시하고 중복 저장을 막는다.

## 6. 기술 스택
- 프레임워크: Next.js (App Router, TypeScript), Node.js
- DB: Neon(Postgres) + Drizzle ORM
- AI: Claude API (번역·요약·카테고리 분류, 구조화 JSON 출력)
- Notion: Notion MCP 서버
- 배포: Vercel

## 7. 데이터 모델
- `users`: id, email(unique), password_hash, role, created_at
- `categories`: id, name(unique), created_at
- `articles`: id, source, url(unique), original_title, title_ko, summary_ko, published_at, category_id(nullable = 미분류), created_at
- `fetch_state`: last_fetched_at
- `notion_connections`: user_id, 암호화된 OAuth 토큰, 저장 대상 page_id
- `notion_saves`: user_id, article_id, notion_page_url

## 8. 화면
- `/login`, `/signup`
- `/` : 카드 목록, 카테고리 필터, '뉴스 가져오기' 버튼
- `/categories` : 카테고리 관리 (admin)

## 9. API (예정)
`/api/auth/*`, `/api/news/fetch`, `/api/articles`, `/api/categories`, `/api/articles/[id]/notion`, `/api/notion/oauth/*`

## 10. 환경변수
`DATABASE_URL`, `ANTHROPIC_API_KEY`, `SESSION_SECRET`, `ADMIN_EMAIL`, 토큰 암호화 키

## 11. 리스크 및 대응
- **Claude 비용 노출**(공개 가입 + 누구나 수집): 10분 재실행 간격으로 1차 대응. 필요 시 배치·건수 제한 추가.
- **Vercel 실행 시간 제한**: 신규 기사가 많으면 Claude 호출이 길어짐 → 병렬 호출 또는 분할 처리 검토.
- **Notion MCP OAuth 복잡도**(클라이언트 등록, 토큰 갱신): 구현 초기에 먼저 검증.

## 12. 검증 기준
- 비로그인 접근 차단, 가입/로그인, admin/일반 권한 차이
- 수집 실행 시 카드 생성, 10분 내 재실행은 Claude 미호출, 이후 재실행 시 중복 없음
- 카테고리 필터, 카테고리 CRUD(admin만), 삭제 후 '미분류' 이동 및 재분류
- Notion 연결 후 저장 시 지정 페이지 하위에 페이지 생성

## 13. 미결정 사항
- 카드에 원문 링크·출처·발행일·썸네일을 포함할지
- 사용할 Claude 모델과 1회 처리 건수 상한
- 기본 카테고리 최종 목록
