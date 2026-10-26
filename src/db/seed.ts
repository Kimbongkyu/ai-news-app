import { config } from "dotenv";

config({ path: ".env.local" });

const categoryNames = [
  "모델/출시",
  "연구",
  "비즈니스/투자",
  "규제/정책",
  "기타",
];

// 가상의 예제 기사. 실제 기사가 아니다.
const sampleArticles = [
  {
    source: "TechCrunch",
    url: "https://techcrunch.com/2026/10/24/nova-labs-atlas-2-multimodal/",
    originalTitle:
      "Nova Labs unveils Atlas-2, a multimodal model that reasons over hour-long video",
    titleKo:
      "노바랩스, 1시간 분량 영상까지 추론하는 멀티모달 모델 '아틀라스-2' 공개",
    summaryKo:
      "노바랩스가 텍스트·이미지·영상을 함께 처리하는 새 모델 아틀라스-2를 공개했다. 최대 한 시간 길이의 영상을 한 번에 입력해 장면 간 인과관계를 추론할 수 있다고 한다. 회사는 영상 이해 벤치마크에서 이전 모델보다 크게 앞섰다고 밝혔다. API는 이번 달부터 단계적으로 제공된다.",
    publishedAt: new Date("2026-10-24T14:30:00Z"),
    category: "모델/출시",
  },
  {
    source: "The Verge",
    url: "https://www.theverge.com/2026/10/23/test-time-search-small-models",
    originalTitle:
      "Researchers show small models can match larger ones with test-time search",
    titleKo: "연구진 \"추론 시 탐색을 쓰면 소형 모델도 대형 모델 수준 성능 가능\"",
    summaryKo:
      "대학 연구진이 소형 언어모델에 추론 단계의 탐색을 결합하면 훨씬 큰 모델에 근접한 수학·코딩 성능을 낼 수 있음을 보였다. 같은 연산량이라면 모델을 키우는 것보다 효율적인 경우가 많았다. 다만 응답 지연이 늘어나는 한계가 있다고 연구진은 설명했다. 코드와 논문은 공개됐다.",
    publishedAt: new Date("2026-10-23T09:10:00Z"),
    category: "연구",
  },
  {
    source: "TechCrunch",
    url: "https://techcrunch.com/2026/10/22/gridwell-series-c/",
    originalTitle:
      "AI infrastructure startup Gridwell raises $400M Series C at $5B valuation",
    titleKo:
      "AI 인프라 스타트업 그리드웰, 시리즈C에서 4억 달러 유치…기업가치 50억 달러",
    summaryKo:
      "AI 추론용 데이터센터 소프트웨어를 만드는 그리드웰이 4억 달러 규모 시리즈C 투자를 유치했다. 평가된 기업가치는 약 50억 달러다. 회사는 조달 자금을 GPU 확보와 해외 리전 확장에 쓸 계획이다. 최근 추론 수요 급증으로 관련 인프라 기업에 투자가 몰리고 있다.",
    publishedAt: new Date("2026-10-22T18:00:00Z"),
    category: "비즈니스/투자",
  },
  {
    source: "The Verge",
    url: "https://www.theverge.com/2026/10/21/eu-ai-content-labeling-guidance",
    originalTitle: "EU finalizes guidance on labeling AI-generated content",
    titleKo: "EU, AI 생성 콘텐츠 표시 의무 지침 확정",
    summaryKo:
      "유럽연합 집행위원회가 AI로 만든 이미지·영상·음성에 표시를 의무화하는 세부 지침을 확정했다. 플랫폼은 생성물에 워터마크나 메타데이터를 넣어야 하며, 위반 시 과징금이 부과될 수 있다. 시행은 내년 상반기로 예정돼 있고 업계는 기술적 이행 부담을 우려하고 있다.",
    publishedAt: new Date("2026-10-21T11:45:00Z"),
    category: "규제/정책",
  },
  {
    source: "The Verge",
    url: "https://www.theverge.com/2026/10/20/offline-ai-smart-speaker",
    originalTitle:
      "Why your next smart speaker might run its AI assistant entirely offline",
    titleKo: "다음 스마트 스피커는 AI 비서를 완전히 오프라인으로 돌릴지도",
    summaryKo:
      "주요 제조사들이 클라우드 연결 없이 기기 안에서 동작하는 AI 비서를 선보이고 있다. 소형 모델과 전용 칩 덕분에 음성 명령 처리가 기기 내에서 가능해졌다. 개인정보 보호와 응답 속도가 장점이지만 복잡한 질문은 여전히 클라우드가 필요하다.",
    publishedAt: new Date("2026-10-20T07:20:00Z"),
    // 미분류 필터 확인용
    category: null,
  },
];

async function main() {
  // env 로드 후에 db 클라이언트를 만들기 위해 동적 import
  const { db } = await import("./index");
  const { articles, categories } = await import("./schema");

  await db
    .insert(categories)
    .values(categoryNames.map((name) => ({ name })))
    .onConflictDoNothing();

  const rows = await db.select().from(categories);
  const idByName = new Map(rows.map((c) => [c.name, c.id]));

  await db
    .insert(articles)
    .values(
      sampleArticles.map(({ category, ...a }) => ({
        ...a,
        categoryId: category ? (idByName.get(category) ?? null) : null,
      })),
    )
    .onConflictDoNothing();

  console.log("seeded");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
