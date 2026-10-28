# UI 가이드 — AI 뉴스 수집기

앱 이름은 **AI 뉴스 수집기**다. 메인 화면(`/`)은 뉴스를 카드로 보여 주는 대시보드이며, 스타일은 Tailwind CSS 4 유틸리티 클래스로만 작성한다. 방향은 "깔끔하고 읽기 편한" 화면이다. 기능 범위는 [PRD.md](PRD.md)가 기준이고, 이 문서는 시각·레이아웃 규칙만 다룬다.

## 1. 디자인 원칙

- **읽기 우선**: 카드의 주인공은 한국어 제목과 요약이다. 장식(그림자, 색)은 최소로 쓴다.
- **여백으로 구분**: 선·배경색 대신 간격으로 영역을 나눈다. 구분이 필요하면 1px 테두리 한 겹만 쓴다.
- **강조색은 하나**: 선택된 카테고리, 주요 버튼에만 쓴다. 나머지는 회색 계열.
- **라이트/다크 모두 지원**: 기존 `prefers-color-scheme` 방식을 유지한다 (§2).

## 2. 색상 · 타이포그래피

기존 [globals.css](src/app/globals.css)의 `--background`, `--foreground` 토큰을 그대로 쓰고, Tailwind 팔레트 중 `zinc`(중립)과 `indigo`(강조)를 사용한다. 다크 모드는 `dark:` 변형으로 처리한다 (OS 설정 기준).

| 용도 | 라이트 | 다크 |
| --- | --- | --- |
| 페이지 배경 | `bg-background` | `bg-background` |
| 카드 배경 | `bg-white` | `dark:bg-zinc-900` |
| 카드 테두리 | `border-zinc-200` | `dark:border-zinc-800` |
| 본문 텍스트 | `text-zinc-700` | `dark:text-zinc-300` |
| 제목 텍스트 | `text-zinc-900` | `dark:text-zinc-100` |
| 보조 텍스트 | `text-zinc-500` | `dark:text-zinc-400` |
| 강조(선택·주요 버튼) | `bg-indigo-600 text-white` | `dark:bg-indigo-500` |

타이포그래피:

- 폰트는 Geist(`font-sans`). 현재 `body`에 `font-family: Arial`이 지정돼 있어 `--font-sans`가 적용되지 않는다. 대시보드 작업 시 `body`의 `font-family`를 `var(--font-sans)`로 바꾸거나 `font-sans` 클래스를 쓸 것.
- 앱 제목: `text-xl font-semibold tracking-tight`
- 카드 제목: `text-base font-semibold leading-snug`
- 요약: `text-sm leading-relaxed` (한국어 가독성을 위해 줄 간격을 넉넉히)
- 메타 정보·배지: `text-xs`

## 3. 페이지 레이아웃 (`/`)

```
┌──────────────────────────────────────────────────────┐
│ AI 뉴스 수집기                 [뉴스 가져오기]  (사용자) │  ← 헤더
├──────────────────────────────────────────────────────┤
│ (전체) 모델/출시  연구  비즈니스/투자  미분류  [+ 추가] │  ← 카테고리 바
├──────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐                     │
│ │ 카드   │ │ 카드   │ │ 카드   │                     │  ← 카드 그리드
│ └────────┘ └────────┘ └────────┘                     │
└──────────────────────────────────────────────────────┘
```

- 컨테이너: `mx-auto w-full max-w-6xl px-4 sm:px-6`
- 영역 간 간격: `space-y-6`, 페이지 상하 패딩 `py-6`
- 헤더는 현재 루트 레이아웃의 `UserButton` 헤더를 확장해 앱 이름(좌)과 '뉴스 가져오기' 버튼 + `UserButton`(우)을 한 줄에 둔다: `flex items-center justify-between`

## 4. 카테고리 바

뉴스 카드 목록 **바로 위**에 가로로 나열하고, **맨 끝에 카테고리 추가 버튼**을 둔다.

- 순서: `전체` → 각 카테고리 → `미분류` → `+ 카테고리 추가`
- 컨테이너: `flex flex-wrap items-center gap-2`. 모바일에서 줄바꿈 대신 한 줄 스크롤을 원하면 `flex-nowrap overflow-x-auto`로 바꾸고 칩에 `shrink-0`을 준다.
- 칩(알약 모양) 공통: `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors`
  - 선택 안 됨: `border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800`
  - 선택됨: `bg-indigo-600 text-white dark:bg-indigo-500`
  - 접근성: 선택 칩에 `aria-pressed="true"`.
- **카테고리 추가 버튼**: 칩과 같은 크기, 점선 테두리로 "필터가 아닌 액션"임을 구분한다.
  - `inline-flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-3.5 py-1.5 text-sm text-zinc-500 hover:border-indigo-500 hover:text-indigo-600 dark:border-zinc-700`
  - 라벨은 `+ 카테고리 추가`.
  - 카테고리 추가·수정·삭제는 **admin 전용**([PRD.md](PRD.md) §5.4)이므로 admin에게만 렌더링한다. 일반 사용자에게는 바 끝에 아무것도 표시하지 않는다.
  - 클릭 동작(인라인 입력, 모달, `/categories`로 이동 중 무엇인지)은 구현 시 결정한다. 이 가이드는 위치와 모양만 정한다.

## 4.1 검색창

**카테고리 바와 같은 줄의 오른쪽 끝**에 둔다. 둘을 `flex flex-wrap items-center justify-between gap-3` 컨테이너로 묶어, 카테고리 바는 왼쪽, 검색창은 오른쪽에 놓는다. 폼은 `flex items-center gap-2`. 모바일(`sm` 미만)에서는 검색창이 카테고리 바 아래 줄로 내려가 폭을 꽉 채운다(`w-full sm:w-auto`).

- 입력: 모바일은 폼 폭을 꽉 채우고(`flex-1`), `sm` 이상에서는 고정 폭 `sm:w-56 sm:flex-none`. `min-w-0 flex-1 sm:w-56 sm:flex-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900`, placeholder "키워드로 뉴스 검색".
- '검색' 버튼은 §6의 주요 버튼. Enter 키로도 제출된다(일반 GET 폼, `?q=`).
- 검색어가 있을 때만 보조 버튼 '초기화'를 오른쪽에 표시한다.
- 결과가 없으면 "'키워드'에 해당하는 뉴스가 없어요."를 §7의 빈 목록 스타일로 보여 준다.

## 5. 뉴스 카드

그리드: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`

카드 컨테이너:

`flex h-full flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900`

구성 (위에서 아래):

0. **썸네일** (있을 때만): 아래 "썸네일" 참고.
1. **카테고리 배지**: `w-fit rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300`. 미분류는 `bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400`로 '미분류'라고 표시.
2. **한국어 제목**: 카드 제목 스타일, 최대 3줄 `line-clamp-3`.
3. **메타 줄**: `text-xs text-zinc-500 dark:text-zinc-400`, `출처 · 2026년 10월 27일` 형식. 발행일이 없으면 출처만 표시. 날짜는 `Asia/Seoul` 기준.
4. **요약 (3~5문장)**: 요약 스타일. 잘라 내지 않고 전체를 보여 준다.
5. **하단 액션 영역** (`mt-auto flex items-center justify-between pt-2`): 왼쪽에 `원문 보기 ↗` 링크(`text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400`, 새 탭 `target="_blank" rel="noopener noreferrer"`), 오른쪽에 'Notion 저장' 버튼.

**Notion 저장 버튼 상태**:

- 기본: `rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800`
- 저장 중: 비활성(`disabled:opacity-50`) + 라벨 "저장 중…"
- 저장 완료: 버튼 대신 `text-sm text-emerald-600` 으로 "저장됨" 표시 (중복 저장 방지)

**썸네일(결정됨)**: 이미지가 있는 카드는 컨테이너 맨 위에 카드 가장자리까지 채워 넣는다: `relative -mx-5 -mt-5 aspect-video overflow-hidden rounded-t-xl bg-zinc-100 dark:bg-zinc-800` + `next/image`(`fill`, `object-cover`, `alt=""`). 이미지가 없으면 영역 자체를 두지 않는다. 허용 호스트는 `next.config.ts`의 `images.remotePatterns`에 등록한다.

## 6. 버튼

| 종류 | 클래스 | 사용처 |
| --- | --- | --- |
| 주요 | `rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50` | 뉴스 가져오기 |
| 보조 | `rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800` | Notion 저장, 재분류 |
| 점선 | §4의 카테고리 추가 버튼 | 카테고리 추가 |

모든 버튼에 `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`로 키보드 포커스를 표시한다.

## 7. 상태 화면

- **로딩(가져오는 중)**: '뉴스 가져오기' 버튼을 비활성 + "가져오는 중…". 카드 영역은 같은 크기의 스켈레톤(`animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800 h-48`)을 쓴다.
- **빈 목록**: 가운데 정렬 안내 문구 `py-16 text-center text-sm text-zinc-500` — "아직 뉴스가 없어요. '뉴스 가져오기'를 눌러 보세요." 필터 결과가 비었을 땐 "이 카테고리에 해당하는 뉴스가 없어요."
- **10분 재실행 제한 안내**: 카테고리 바 위에 얇은 안내 줄 `rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300`. 에러는 같은 형태에 `bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300`.

## 8. 반응형

| 화면 | 카드 열 수 | 비고 |
| --- | --- | --- |
| 모바일 (기본) | 1 | 카테고리 바는 줄바꿈 또는 가로 스크롤 |
| `sm` (≥640px) | 2 | |
| `lg` (≥1024px) | 3 | 컨테이너 최대 폭 `max-w-6xl` |

## 9. 구현 메모

- 현재 `page.tsx`는 스캐폴드 상태이므로 대시보드 컴포넌트는 `src/components/`에 둔다 (예: `category-bar.tsx`, `news-card.tsx`). 기존 `sign-in-gate.tsx`와 같은 위치.
- 로그인 여부를 읽는 레이아웃·페이지 제약(`<Suspense>`, `export const instant = false`)은 [CLAUDE.md](CLAUDE.md)를 따른다.
- 색·간격은 이 문서의 클래스 조합을 그대로 쓰고, 임의의 값(`[#123456]` 등)은 피한다. 반복되는 조합이 늘면 컴포넌트로 묶는다.
