import type {
  Channel,
  CommunityEvent,
  CommunityPost,
  Contributor,
} from "./types";

export const CHANNELS_POOL: readonly Channel[] = [
  {
    id: "general-sde",
    label: "general-sde",
    icon: "💬",
    desc: "General software engineering, industry trends, and SDE advice.",
  },
  {
    id: "dsa-questions",
    label: "dsa-questions",
    icon: "⚔️",
    desc: "Solving algorithms, optimization hacks, and LeetCode discussions.",
  },
  {
    id: "system-design",
    label: "system-design",
    icon: "🏗️",
    desc: "Scalability, microservices architecture, caching, and DB partitioning.",
  },
  {
    id: "referral-board",
    label: "referral-board",
    icon: "💼",
    desc: "Active hiring opportunities, referrals, and candidate profile lists.",
  },
  {
    id: "project-partners",
    label: "project-partners",
    icon: "🤝",
    desc: "Find co-founders, team up for hackathons, and review repositories.",
  },
  {
    id: "announcements",
    label: "announcements",
    icon: "📢",
    desc: "Official updates, leaderboard prizes, and weekly summits announcements.",
  },
];

export const INITIAL_POSTS: readonly CommunityPost[] = [
  {
    id: "p1",
    channel: "general-sde",
    authorName: "Amit Shah",
    authorTitle: "Staff Engineer @ Uber",
    authorAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    isMentor: true,
    time: "2 hours ago",
    content:
      "For SDE-2 interviews, companies are looking for deep concurrency knowledge. If you're designing a rate limiter, don't just say Token Bucket—explain race conditions in Redis Lua scripts and how to resolve them using sorted sets to prevent concurrency locks.",
    tags: ["concurrency", "redis", "ratelimiting"],
    upvotes: 245,
    userHasUpvoted: false,
    userHasBookmarked: false,
    comments: [
      {
        id: "c1_1",
        author: "Rahul Kushwaha",
        text: "This is gold! I struggled with Lua script transaction bounds in my last interview at Razorpay.",
      },
      {
        id: "c1_2",
        author: "Priya S.",
        text: "Do you recommend reading the Redis official documentation or any specific SDE blog for this?",
      },
    ],
  },
  {
    id: "p2",
    channel: "dsa-questions",
    authorName: "Meera Nair",
    authorTitle: "LeetCode Elite (2100+)",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    isMentor: false,
    time: "4 hours ago",
    content:
      "Fascinating optimization on LeetCode 42 (Trapping Rain Water). You can solve it in O(N) time and O(1) space using the two-pointer approach, avoiding the prefix/suffix array allocations entirely! Here's a brief breakdown:",
    codeSnippet: `int trap(vector<int>& height) {
    int left = 0, right = height.size() - 1;
    int leftMax = 0, rightMax = 0, ans = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            height[left] >= leftMax ? leftMax = height[left] : ans += leftMax - height[left];
            left++;
        } else {
            height[right] >= rightMax ? rightMax = height[right] : ans += rightMax - height[right];
            right--;
        }
    }
    return ans;
}`,
    tags: ["dsa", "leetcode", "vectors", "pointers"],
    upvotes: 188,
    userHasUpvoted: false,
    userHasBookmarked: true,
    comments: [],
  },
  {
    id: "p3",
    channel: "referral-board",
    authorName: "Sarah Connor",
    authorTitle: "Recruiter @ Razorpay",
    authorAvatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
    isMentor: true,
    time: "6 hours ago",
    content:
      "We are hiring SDE-1 backend interns! Core requirements are strong database transaction knowledge and proficiency in Node.js or Go. Drop your PathEd Public Profile link below, prioritizing those with a CRI score of 70%+!",
    tags: ["hiring", "backend", "internship", "referrals"],
    upvotes: 312,
    userHasUpvoted: false,
    userHasBookmarked: false,
    comments: [
      {
        id: "c3_1",
        author: "Rahul Kushwaha",
        text: "Just applied! My profile: pathed.ai/p/rahul-kushwaha. CRI score is currently 62% but upgrading to 75% tonight.",
      },
    ],
  },
  {
    id: "p4",
    channel: "system-design",
    authorName: "David Vance",
    authorTitle: "Principal Architect @ Stripe",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    isMentor: true,
    time: "1 day ago",
    content:
      "Stripe's idempotency key pattern is a must-know. When client retries occur, we log responses in a fast DB index using hash keys. This guarantees that double charges never happen under unstable client network links.",
    tags: ["systemdesign", "idempotency", "payments", "microservices"],
    upvotes: 402,
    userHasUpvoted: true,
    userHasBookmarked: false,
    comments: [],
  },
];

export const CONTRIBUTORS: readonly Contributor[] = [
  {
    rank: 1,
    name: "Dr. Arpan Mukherjee",
    title: "Professor @ IIT Kanpur",
    points: "2,450",
    color: "#D97706",
  },
  {
    rank: 2,
    name: "David Vance",
    title: "Principal @ Stripe",
    points: "1,980",
    color: "#066BD3",
  },
  {
    rank: 3,
    name: "Meera Nair",
    title: "Leetcode Elite",
    points: "1,540",
    color: "#14B8A6",
  },
  {
    rank: 4,
    name: "Rohan Verma",
    title: "SDE @ Google",
    points: "1,220",
    color: "#22D3A7",
  },
];

export const UPCOMING_EVENTS: readonly CommunityEvent[] = [
  {
    id: "e1",
    title: "Google SDE Concurrency Q&A",
    time: "Tonight at 8:00 PM",
    host: "Aarav Mehta (Google)",
  },
  {
    id: "e2",
    title: "System Design: Scaling Redis Caches",
    time: "Saturday @ 3:00 PM",
    host: "Dr. Mukherjee",
  },
];

export const CURRENT_USER_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150";
