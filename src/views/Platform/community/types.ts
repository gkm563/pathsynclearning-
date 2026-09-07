export type FeedFilter = "trending" | "latest" | "bookmarked";

export type Channel = {
  id: string;
  label: string;
  icon: string;
  desc: string;
};

export type PostComment = {
  id: string;
  author: string;
  text: string;
};

export type CommunityPost = {
  id: string;
  channel: string;
  authorName: string;
  authorTitle: string;
  authorAvatar: string;
  isMentor: boolean;
  time: string;
  content: string;
  codeSnippet?: string;
  tags: string[];
  upvotes: number;
  userHasUpvoted: boolean;
  userHasBookmarked: boolean;
  comments: PostComment[];
};

export type Contributor = {
  rank: number;
  name: string;
  title: string;
  points: string;
  color: string;
};

export type CommunityEvent = {
  id: string;
  title: string;
  time: string;
  host: string;
};
