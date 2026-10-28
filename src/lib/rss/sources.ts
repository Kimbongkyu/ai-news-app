export type RssSource = {
  name: string;
  feedUrl: string;
};

// 카드 썸네일로 허용하는 이미지 호스트. next.config.ts의 images.remotePatterns와 맞춰야 한다.
export const IMAGE_HOSTS = ["platform.theverge.com", "techcrunch.com"];

export const RSS_SOURCES: RssSource[] = [
  {
    name: "TechCrunch",
    feedUrl: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge",
    feedUrl: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
];
