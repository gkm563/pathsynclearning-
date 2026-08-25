import type { NodeAssessment, RoadmapNode } from "@/types/roadmap";
import { ASSESSABLE_NODE_TYPES } from "@/lib/roadmap/assessment";

const YT = {
  arrays: {
    title: "Arrays in JavaScript — freeCodeCamp",
    url: "https://www.youtube.com/watch?v=R8rmfD9Y5-c",
  },
  dsa: {
    title: "Data Structures Easy to Advanced — freeCodeCamp",
    url: "https://www.youtube.com/watch?v=RBSGKlAvoiM",
  },
  js: {
    title: "JavaScript Full Course — freeCodeCamp",
    url: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
  },
  web: {
    title: "HTML CSS JS Crash Course — Traversy Media",
    url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
  },
  sql: {
    title: "SQL Tutorial — freeCodeCamp",
    url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
  },
};

function pickYt(topics: string[], skills: string[]) {
  const hay = `${topics.join(" ")} ${skills.join(" ")}`.toLowerCase();
  if (/sql|database|dbms/.test(hay)) return YT.sql;
  if (/array|dsa|algorithm|tree|graph|sort/.test(hay)) return YT.dsa;
  if (/html|css|dom|web|frontend/.test(hay)) return YT.web;
  if (/javascript|js|node|typescript/.test(hay)) return YT.js;
  return YT.arrays;
}

function mcqBank(node: RoadmapNode): NodeAssessment {
  const label = node.title || "this topic";
  return {
    type: "mcq",
    passScore: 70,
    timeLimitMinutes: 20,
    mcq: {
      questions: [
        {
          id: `${node.id}-q1`,
          prompt: `What is the primary goal when studying ${label}?`,
          options: [
            "Memorize syntax without practice",
            "Build understanding you can apply to problems",
            "Skip fundamentals",
            "Only watch videos without exercises",
          ],
          correctIndex: 1,
        },
        {
          id: `${node.id}-q2`,
          prompt: `Which practice habit best reinforces ${label}?`,
          options: [
            "Passive reading only",
            "Copying solutions without thinking",
            "Active problem solving and spaced review",
            "Avoiding mistakes entirely",
          ],
          correctIndex: 2,
        },
        {
          id: `${node.id}-q3`,
          prompt: `Before moving to advanced ${label} topics you should…`,
          options: [
            "Ignore prerequisites",
            "Confirm core concepts with small exercises",
            "Jump straight to interviews",
            "Delete old notes",
          ],
          correctIndex: 1,
        },
        {
          id: `${node.id}-q4`,
          prompt: `When stuck on a ${label} problem, the best next step is…`,
          options: [
            "Give up immediately",
            "Re-read the prompt, try a smaller example, then seek a hint",
            "Paste a random answer",
            "Change careers",
          ],
          correctIndex: 1,
        },
      ],
    },
  };
}

function codingBank(node: RoadmapNode): NodeAssessment {
  return {
    type: "coding",
    passScore: 100,
    timeLimitMinutes: 45,
    coding: {
      prompt: `Implement \`twoSum(nums, target)\` that returns indices of two numbers in \`nums\` that add up to \`target\`. Assume exactly one solution. Related module: ${node.title}.`,
      starterCode: `function twoSum(nums, target) {\n  // return [i, j]\n  \n}\n`,
      functionName: "twoSum",
      examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      ],
      publicTests: [
        { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { args: [[3, 2, 4], 6], expected: [1, 2] },
      ],
      hiddenTests: [
        { args: [[3, 3], 6], expected: [0, 1] },
        { args: [[1, 5, 3, 7], 8], expected: [1, 2] },
      ],
    },
  };
}

/** Attach assessment + YouTube resource when AI omitted them. */
export function ensureNodeAssessments(nodes: RoadmapNode[]): RoadmapNode[] {
  return nodes.map((node) => {
    if (!ASSESSABLE_NODE_TYPES.includes(node.type)) return node;

    const yt = pickYt(node.topics || [], node.skills || []);
    const resources = [...(node.resources || [])];
    const hasYt = resources.some(
      (r) =>
        r.type === "video" &&
        /youtube\.com|youtu\.be/i.test(r.url || ""),
    );
    if (!hasYt) {
      resources.unshift({
        title: yt.title,
        url: yt.url,
        type: "video",
      });
    }

    let assessment = node.assessment;
    if (!assessment) {
      const preferCoding =
        node.type === "project" ||
        /code|algorithm|dsa|javascript|js|leet/i.test(
          `${node.title} ${(node.skills || []).join(" ")}`,
        );
      assessment = preferCoding ? codingBank(node) : mcqBank(node);
    }

    return { ...node, resources, assessment };
  });
}
