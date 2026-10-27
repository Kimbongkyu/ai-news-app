import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "user"]);

export const users = pgTable("users", {
  // Clerk user ID
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  role: userRole("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    source: text("source").notNull(),
    url: text("url").notNull().unique(),
    originalTitle: text("original_title").notNull(),
    // RSS 본문 발췌. OpenAI 번역·요약 입력이자, 실패 시 재처리용.
    excerpt: text("excerpt"),
    titleKo: text("title_ko"),
    summaryKo: text("summary_ko"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    // null = 미분류. 카테고리 삭제 시 자동으로 null이 된다.
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("articles_category_id_idx").on(t.categoryId)],
);

// 단일 행(id = 1)만 사용한다.
export const fetchState = pgTable("fetch_state", {
  id: integer("id").primaryKey().default(1),
  lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
});

export const notionConnections = pgTable("notion_connections", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  // 암호화된 OAuth 토큰
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  // 저장 대상 상위 페이지. OAuth 이후 지정하므로 nullable.
  pageId: text("page_id"),
});

export const notionSaves = pgTable(
  "notion_saves",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    notionPageUrl: text("notion_page_url").notNull(),
  },
  // 사용자당 기사 한 번만 저장
  (t) => [primaryKey({ columns: [t.userId, t.articleId] })],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type FetchState = typeof fetchState.$inferSelect;
export type NotionConnection = typeof notionConnections.$inferSelect;
export type NewNotionConnection = typeof notionConnections.$inferInsert;
export type NotionSave = typeof notionSaves.$inferSelect;
export type NewNotionSave = typeof notionSaves.$inferInsert;
