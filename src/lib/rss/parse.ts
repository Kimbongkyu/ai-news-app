import { XMLParser } from "fast-xml-parser";

export type FeedItem = {
  title: string;
  url: string;
  publishedAt: Date | null;
  // 태그를 제거한 본문 발췌. 없으면 빈 문자열.
  excerpt: string;
};

const EXCERPT_MAX = 1500;

function toExcerpt(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, EXCERPT_MAX);
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // 항목이 하나뿐이어도 배열로 받는다.
  isArray: (name) => name === "item" || name === "entry" || name === "link",
});

type XmlNode = Record<string, unknown>;

function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "#text" in value) {
    return text((value as XmlNode)["#text"]);
  }
  return "";
}

function toDate(value: unknown): Date | null {
  const s = text(value);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

// 같은 글이 추적 파라미터만 달라 중복 저장되는 것을 막는다.
export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    for (const key of [...u.searchParams.keys()]) {
      if (key.startsWith("utm_")) u.searchParams.delete(key);
    }
    u.hash = "";
    return u.toString();
  } catch {
    return raw;
  }
}

function atomLink(links: unknown): string {
  const list = Array.isArray(links) ? (links as XmlNode[]) : [];
  const alternate =
    list.find((l) => l["@_rel"] === undefined || l["@_rel"] === "alternate") ??
    list[0];
  return alternate ? text(alternate["@_href"]) : "";
}

// RSS 2.0(<item>)과 Atom(<entry>)을 모두 처리한다.
export function parseFeed(xml: string): FeedItem[] {
  const doc = parser.parse(xml) as XmlNode;
  const items: FeedItem[] = [];

  const rssItems = ((doc.rss as XmlNode | undefined)?.channel as XmlNode | undefined)
    ?.item as XmlNode[] | undefined;
  for (const item of rssItems ?? []) {
    const url = text((item.link as unknown[] | undefined)?.[0]);
    const title = text(item.title);
    if (!url || !title) continue;
    items.push({
      title,
      url: normalizeUrl(url),
      publishedAt: toDate(item.pubDate),
      excerpt: toExcerpt(text(item["content:encoded"]) || text(item.description)),
    });
  }

  const atomEntries = (doc.feed as XmlNode | undefined)?.entry as
    | XmlNode[]
    | undefined;
  for (const entry of atomEntries ?? []) {
    const url = atomLink(entry.link);
    const title = text(entry.title);
    if (!url || !title) continue;
    items.push({
      title,
      url: normalizeUrl(url),
      publishedAt: toDate(entry.published ?? entry.updated),
      excerpt: toExcerpt(text(entry.content) || text(entry.summary)),
    });
  }

  return items;
}
