/**
 * Unit tests for news normalization / categorization.
 * Run: npm run test:news
 */
import assert from "node:assert/strict";
import {
  canonicalizeUrl,
  categoryFromTags,
  categoryFromText,
  estimateReadingMinutes,
  normalizeDevTo,
  normalizeNewsApi,
  resolveNewsImageUrl,
} from "../src/lib/news/normalize";
import { renderNewsContent } from "../src/lib/news/render-markdown";

assert.equal(
  canonicalizeUrl("https://Example.com/path/?utm_source=x#hash"),
  "https://example.com/path",
);

assert.equal(categoryFromTags(["ai", "python"]), "AI");
assert.equal(categoryFromTags(["webdev"]), "Web Development");
assert.equal(categoryFromText("New ransomware wave", ""), "Cybersecurity");
assert.equal(estimateReadingMinutes("one two three"), 1);

const dev = normalizeDevTo({
  id: 42,
  title: "Hello React 19",
  description: "Server components land",
  url: "https://dev.to/user/hello-react",
  tag_list: ["react", "webdev"],
  public_reactions_count: 12,
  reading_time_minutes: 4,
  published_at: "2026-09-01T10:00:00.000Z",
  user: { name: "Ada" },
});
assert.ok(dev);
assert.equal(dev!.externalId, "devto:42");
assert.equal(dev!.category, "Web Development");
assert.equal(dev!.readingMinutes, 4);
assert.equal(dev!.imageUrl, null);

const withCover = normalizeDevTo({
  id: 43,
  title: "With cover",
  url: "https://dev.to/user/cover",
  cover_image: "https://images.example.com/shot.png",
  social_image: "https://dev.to/social_previews/article/43.png",
  published_at: "2026-09-01T10:00:00.000Z",
});
assert.equal(withCover!.imageUrl, "https://images.example.com/shot.png");
assert.equal(
  resolveNewsImageUrl("https://dev.to/social.png", {
    cover_image: null,
    social_image: "https://dev.to/social.png",
  }),
  null,
);
assert.equal(
  resolveNewsImageUrl(
    "https://media.dev.to/cdn-cgi/image/social_previews/article.png",
    {
      cover_image:
        "https://media.dev.to/cdn-cgi/image/social_previews/article.png",
    },
  ),
  null,
);

const html = renderNewsContent("# Hello\n\nThis is **bold** and `code`.");
assert.match(html, /<h2>Hello<\/h2>/);
assert.match(html, /<strong>bold<\/strong>/);
assert.match(html, /<code>code<\/code>/);

const bad = normalizeDevTo({
  id: 0,
  title: "",
  url: "",
});
assert.equal(bad, null);

const news = normalizeNewsApi(
  {
    title: "Cloud spend rises",
    description: "AWS and Azure pricing",
    url: "https://example.com/cloud",
    publishedAt: "2026-09-02T12:00:00.000Z",
    source: { name: "Example" },
  },
  "Cloud",
);
assert.ok(news);
assert.equal(news!.category, "Cloud");
assert.ok(news!.externalId.startsWith("newsapi:"));

console.log("All news normalize tests passed.");
