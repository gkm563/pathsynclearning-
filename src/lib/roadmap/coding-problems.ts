import type { CodingAssessment } from "@/types/roadmap";

type ProblemSpec = Omit<CodingAssessment, "prompt"> & {
  prompt?: string;
};

function problem(spec: ProblemSpec): CodingAssessment {
  const statement = spec.statement || spec.prompt || "";
  return {
    ...spec,
    prompt: spec.prompt || statement,
    statement,
    title: spec.title || spec.functionName,
    difficulty: spec.difficulty || "easy",
    constraints: spec.constraints || [],
  };
}

/** Two Sum — arrays / hashing */
export const TWO_SUM = problem({
  title: "Two Sum",
  difficulty: "easy",
  functionName: "twoSum",
  statement: `Given an array of integers \`nums\` and an integer \`target\`, return **the indices of the two numbers** such that they add up to \`target\`.

You may assume that each input has **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

Think of this as the classic interview warm-up: a nested loop is O(n²). A hash map of value → index lets you check the complement \`target - nums[i]\` in O(1) and finish in one pass.`,
  starterCode: `function twoSum(nums, target) {\n  // return [i, j]\n  \n}\n`,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation:
        "nums[0] + nums[1] = 2 + 7 = 9. So we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "nums[1] + nums[2] = 2 + 4 = 6.",
    },
    {
      input: "nums = [3,3], target = 6",
      output: "[0,1]",
      explanation: "The two 3s at indices 0 and 1 are the pair.",
    },
  ],
  constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "-10⁹ ≤ nums[i] ≤ 10⁹",
    "-10⁹ ≤ target ≤ 10⁹",
    "Only one valid answer exists",
  ],
  hints: [
    "For each number x, you need target − x. Where have you seen that before?",
    "Store numbers you have already scanned in a hash map: value → index.",
  ],
  followUp: "Can you come up with an algorithm that is less than O(n²) time complexity?",
  publicTests: [
    { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
    { args: [[3, 2, 4], 6], expected: [1, 2] },
  ],
  hiddenTests: [
    { args: [[3, 3], 6], expected: [0, 1] },
    { args: [[1, 5, 3, 7], 8], expected: [1, 2] },
  ],
});

export const CONTAINS_DUPLICATE = problem({
  title: "Contains Duplicate",
  difficulty: "easy",
  functionName: "containsDuplicate",
  statement: `Given an integer array \`nums\`, return \`true\` if **any value appears at least twice** in the array, and return \`false\` if every element is distinct.

Interviewers use this to check whether you reach for a hash set (O(n) time, O(n) space) instead of sorting (O(n log n)) or nested loops.`,
  starterCode: `function containsDuplicate(nums) {\n  // return true/false\n  \n}\n`,
  examples: [
    {
      input: "nums = [1,2,3,1]",
      output: "true",
      explanation: "The value 1 appears twice.",
    },
    {
      input: "nums = [1,2,3,4]",
      output: "false",
      explanation: "All values are unique.",
    },
    {
      input: "nums = [1,1,1,3,3,4,3,2,4,2]",
      output: "true",
      explanation: "Several values repeat.",
    },
  ],
  constraints: [
    "1 ≤ nums.length ≤ 10⁵",
    "-10⁹ ≤ nums[i] ≤ 10⁹",
  ],
  hints: [
    "Insert into a set as you scan. If an insert is a no-op, you found a duplicate.",
  ],
  followUp: "How would memory usage change if you sorted first instead of using a set?",
  publicTests: [
    { args: [[1, 2, 3, 1]], expected: true },
    { args: [[1, 2, 3, 4]], expected: false },
  ],
  hiddenTests: [
    { args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
    { args: [[0]], expected: false },
  ],
});

export const IS_PALINDROME = problem({
  title: "Valid Palindrome",
  difficulty: "easy",
  functionName: "isPalindrome",
  statement: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.

Use two pointers from both ends. Skip characters that are not letters or digits. Compare the remaining pair case-insensitively.`,
  starterCode: `function isPalindrome(s) {\n  // return true/false\n  \n}\n`,
  examples: [
    {
      input: 's = "A man, a plan, a canal: Panama"',
      output: "true",
      explanation: 'After cleaning: "amanaplanacanalpanama", which is a palindrome.',
    },
    {
      input: 's = "race a car"',
      output: "false",
      explanation: 'After cleaning: "raceacar", which is not a palindrome.',
    },
    {
      input: 's = " "',
      output: "true",
      explanation: "After removing non-alphanumeric characters, s is empty, which is a palindrome.",
    },
  ],
  constraints: [
    "1 ≤ s.length ≤ 2 × 10⁵",
    "s consists only of printable ASCII characters",
  ],
  hints: [
    "Two pointers: left starts at 0, right at s.length − 1.",
    "Advance a pointer when the current character is not alphanumeric.",
  ],
  followUp: "Could you solve it with O(1) extra space (no extra cleaned string)?",
  publicTests: [
    { args: ["A man, a plan, a canal: Panama"], expected: true },
    { args: ["race a car"], expected: false },
  ],
  hiddenTests: [
    { args: [" "], expected: true },
    { args: ["0P"], expected: false },
  ],
});

export const IS_ANAGRAM = problem({
  title: "Valid Anagram",
  difficulty: "easy",
  functionName: "isAnagram",
  statement: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an **anagram** of \`s\`, and \`false\` otherwise.

An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters **exactly once**.

Count character frequencies (a map or a 26-slot array if inputs are lowercase English). The counts must match.`,
  starterCode: `function isAnagram(s, t) {\n  // return true/false\n  \n}\n`,
  examples: [
    {
      input: 's = "anagram", t = "nagaram"',
      output: "true",
      explanation: "Both strings use the same letters the same number of times.",
    },
    {
      input: 's = "rat", t = "car"',
      output: "false",
      explanation: "Letter frequencies do not match.",
    },
  ],
  constraints: [
    "1 ≤ s.length, t.length ≤ 5 × 10⁴",
    "s and t consist of lowercase English letters",
  ],
  hints: [
    "If the lengths differ, it cannot be an anagram.",
    "A frequency map of s minus a scan of t should end at all zeros.",
  ],
  followUp: "What if the inputs contained Unicode characters?",
  publicTests: [
    { args: ["anagram", "nagaram"], expected: true },
    { args: ["rat", "car"], expected: false },
  ],
  hiddenTests: [
    { args: ["a", "a"], expected: true },
    { args: ["ab", "a"], expected: false },
  ],
});

export const BINARY_SEARCH = problem({
  title: "Binary Search",
  difficulty: "easy",
  functionName: "binarySearch",
  statement: `Given an array of integers \`nums\` which is sorted in **ascending** order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its **index**. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.

Keep a search window \`[lo, hi]\`. Compare \`nums[mid]\` with \`target\` and discard half the range each step. Watch off-by-one errors when the window shrinks.`,
  starterCode: `function binarySearch(nums, target) {\n  // return index or -1\n  \n}\n`,
  examples: [
    {
      input: "nums = [-1,0,3,5,9,12], target = 9",
      output: "4",
      explanation: "9 exists in nums and its index is 4.",
    },
    {
      input: "nums = [-1,0,3,5,9,12], target = 2",
      output: "-1",
      explanation: "2 does not exist in nums so return -1.",
    },
  ],
  constraints: [
    "1 ≤ nums.length ≤ 10⁴",
    "-10⁴ < nums[i], target < 10⁴",
    "All integers in nums are unique",
    "nums is sorted in ascending order",
  ],
  hints: [
    "mid = lo + Math.floor((hi − lo) / 2) avoids overflow in other languages.",
    "If nums[mid] < target, search the right half; otherwise the left.",
  ],
  followUp: "How does the loop condition change if the array may contain duplicates?",
  publicTests: [
    { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
    { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
  ],
  hiddenTests: [
    { args: [[5], 5], expected: 0 },
    { args: [[1, 2, 3], 1], expected: 0 },
  ],
});

export const SUM_UNIQUE = problem({
  title: "Sum of Unique Elements",
  difficulty: "easy",
  functionName: "sumUnique",
  statement: `You are given an integer array \`nums\`. The unique elements of an array are the elements that appear **exactly once** in the array.

Return the **sum** of all the unique elements of \`nums\`.

Build a frequency map, then add values whose count is 1. This checks that you can combine hashing with a simple aggregation.`,
  starterCode: `function sumUnique(nums) {\n  // return number\n  \n}\n`,
  examples: [
    {
      input: "nums = [1,2,3,2]",
      output: "4",
      explanation: "The unique elements are 1 and 3, and 1 + 3 = 4.",
    },
    {
      input: "nums = [1,1,1,1]",
      output: "0",
      explanation: "There are no unique elements.",
    },
    {
      input: "nums = [1,2,3,4,5]",
      output: "15",
      explanation: "Every element is unique.",
    },
  ],
  constraints: [
    "1 ≤ nums.length ≤ 100",
    "1 ≤ nums[i] ≤ 100",
  ],
  hints: [
    "Count occurrences, then sum keys whose count is exactly 1.",
  ],
  publicTests: [
    { args: [[1, 2, 3, 2]], expected: 4 },
    { args: [[1, 1, 1, 1]], expected: 0 },
  ],
  hiddenTests: [
    { args: [[1, 2, 3, 4]], expected: 10 },
    { args: [[5, 5, 6]], expected: 6 },
  ],
});

export const MAX_SUB_ARRAY = problem({
  title: "Maximum Subarray",
  difficulty: "medium",
  functionName: "maxSubArray",
  statement: `Given an integer array \`nums\`, find the **subarray** with the largest sum, and return **its sum**.

A subarray is a contiguous non-empty sequence of elements within an array.

Kadane's algorithm keeps a running sum. If the running sum becomes negative, drop it and start a new subarray at the next index. Track the best sum seen. Empty subarrays are **not** allowed, so if every number is negative the answer is the largest (least negative) element.`,
  starterCode: `function maxSubArray(nums) {\n  // return max sum\n  \n}\n`,
  examples: [
    {
      input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
      output: "6",
      explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
    },
    {
      input: "nums = [1]",
      output: "1",
      explanation: "A single-element array is the only subarray.",
    },
    {
      input: "nums = [5,4,-1,7,8]",
      output: "23",
      explanation: "The whole array is the maximum subarray.",
    },
  ],
  constraints: [
    "1 ≤ nums.length ≤ 10⁵",
    "-10⁴ ≤ nums[i] ≤ 10⁴",
  ],
  hints: [
    "Let cur = max(nums[i], cur + nums[i]) at each step.",
    "best = max(best, cur) after updating cur.",
  ],
  followUp: "If you also had to return the start and end indices of the subarray, what extra state would you keep?",
  publicTests: [
    { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
    { args: [[1]], expected: 1 },
  ],
  hiddenTests: [
    { args: [[5, 4, -1, 7, 8]], expected: 23 },
    { args: [[-1]], expected: -1 },
  ],
});

export const CLIMB_STAIRS = problem({
  title: "Climbing Stairs",
  difficulty: "easy",
  functionName: "climbStairs",
  statement: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb **1 or 2** steps. In how many distinct ways can you climb to the top?

This is the Fibonacci recurrence: ways(n) = ways(n − 1) + ways(n − 2), with ways(1) = 1 and ways(2) = 2. You can compute it bottom-up in O(n) time and O(1) extra space.`,
  starterCode: `function climbStairs(n) {\n  // return number of ways\n  \n}\n`,
  examples: [
    {
      input: "n = 2",
      output: "2",
      explanation: "1+1 and 2.",
    },
    {
      input: "n = 3",
      output: "3",
      explanation: "1+1+1, 1+2, and 2+1.",
    },
  ],
  constraints: ["1 ≤ n ≤ 45"],
  hints: [
    "The last step is either a 1-step from n−1 or a 2-step from n−2.",
    "Avoid naive recursion without memo — it is exponential.",
  ],
  followUp: "Can you do it with constant extra memory?",
  publicTests: [
    { args: [2], expected: 2 },
    { args: [3], expected: 3 },
  ],
  hiddenTests: [
    { args: [1], expected: 1 },
    { args: [5], expected: 8 },
  ],
});

export const MAX_DEPTH = problem({
  title: "Maximum Depth of Binary Tree",
  difficulty: "easy",
  functionName: "maxDepth",
  statement: `Given the \`root\` of a binary tree, return its **maximum depth**.

A binary tree's maximum depth is the number of nodes along the **longest path** from the root node down to the farthest leaf node.

Each node is an object \`{ val, left, right }\` (or \`null\`). Depth of an empty tree is 0. Depth of a leaf is 1.

Recurse: \`1 + max(depth(left), depth(right))\`. You can also BFS and count levels.`,
  starterCode: `function maxDepth(root) {\n  // root: { val, left, right } | null\n  \n}\n`,
  examples: [
    {
      input: "root = [3,9,20,null,null,15,7]",
      output: "3",
      explanation: "The longest path is 3 → 20 → 15 (or 7), which has 3 nodes.",
    },
    {
      input: "root = [1,null,2]",
      output: "2",
      explanation: "Root plus the right child.",
    },
  ],
  constraints: [
    "The number of nodes is in the range [0, 10⁴]",
    "-100 ≤ Node.val ≤ 100",
  ],
  hints: [
    "If root is null, return 0.",
    "Otherwise return 1 plus the larger of the two child depths.",
  ],
  publicTests: [
    {
      args: [
        {
          val: 3,
          left: { val: 9, left: null, right: null },
          right: {
            val: 20,
            left: { val: 15, left: null, right: null },
            right: { val: 7, left: null, right: null },
          },
        },
      ],
      expected: 3,
    },
    {
      args: [{ val: 1, left: null, right: { val: 2, left: null, right: null } }],
      expected: 2,
    },
  ],
  hiddenTests: [
    { args: [null], expected: 0 },
    { args: [{ val: 0, left: null, right: null }], expected: 1 },
  ],
});

const BY_FUNCTION: Record<string, CodingAssessment> = {
  twoSum: TWO_SUM,
  containsDuplicate: CONTAINS_DUPLICATE,
  isPalindrome: IS_PALINDROME,
  isAnagram: IS_ANAGRAM,
  binarySearch: BINARY_SEARCH,
  sumUnique: SUM_UNIQUE,
  maxSubArray: MAX_SUB_ARRAY,
  climbStairs: CLIMB_STAIRS,
  maxDepth: MAX_DEPTH,
};

/** Fill LeetCode-style fields on stored/legacy coding assessments. */
export function hydrateCodingAssessment(coding: CodingAssessment): CodingAssessment {
  const canned = BY_FUNCTION[coding.functionName];
  const tooShort = !coding.statement && (coding.prompt || "").length < 280;
  if (canned && tooShort) {
    return {
      ...canned,
      starterCode: coding.starterCode || canned.starterCode,
      publicTests: coding.publicTests?.length ? coding.publicTests : canned.publicTests,
      hiddenTests: coding.hiddenTests?.length ? coding.hiddenTests : canned.hiddenTests,
    };
  }
  return {
    ...coding,
    title: coding.title || coding.functionName,
    difficulty: coding.difficulty || "easy",
    statement: coding.statement || coding.prompt,
    constraints:
      coding.constraints && coding.constraints.length
        ? coding.constraints
        : [
            "Pass all public test cases before submit",
            "Hidden tests are graded on submit",
            "Do not mutate unexpected global state",
          ],
  };
}
