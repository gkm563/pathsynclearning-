/**
 * Topic matching for roadmap lesson videos.
 * Run: npx tsx scripts/test-video-recommend.ts
 */
import assert from "node:assert/strict";
import { curatedResourcesForNode, packsForText } from "../src/lib/roadmap/resource-library";
import {
  isVideoOnTopic,
  videoRelevanceScore,
  youtubeSearchQuery,
} from "../src/lib/roadmap/video-recommend";

const cryptoHay = "Cryptography Essentials hash functions public-key encryption";
assert.equal(packsForText(cryptoHay)[0]?.id, "crypto");
assert.ok(
  curatedResourcesForNode(cryptoHay).some((r) => /cryptography|hashing|cryptohack/i.test(r.title)),
);
assert.equal(
  curatedResourcesForNode(cryptoHay).some((r) => /data structures/i.test(r.title)),
  false,
);

assert.equal(
  isVideoOnTopic(cryptoHay, "Data Structures Easy to Advanced — freeCodeCamp", "freeCodeCamp"),
  false,
);
assert.ok(
  isVideoOnTopic(
    cryptoHay,
    "Cryptography — Crash Course Computer Science #33",
    "CrashCourse",
  ),
);
assert.ok(
  videoRelevanceScore(cryptoHay, "Cryptography Full Course", "freeCodeCamp") >
    videoRelevanceScore(cryptoHay, "Data Structures Easy to Advanced", "freeCodeCamp"),
);

const dsaHay = "Arrays and Hashing LeetCode DSA";
assert.equal(packsForText(dsaHay)[0]?.id, "dsa");
assert.ok(isVideoOnTopic(dsaHay, "Data Structures Easy to Advanced — freeCodeCamp", "freeCodeCamp"));

const q = youtubeSearchQuery({
  title: "Cryptography Essentials",
  skills: ["encryption"],
  topics: ["hash functions"],
});
assert.match(q, /cryptography/i);
assert.doesNotMatch(q, /programming$/i);

console.log("video-recommend tests passed");
