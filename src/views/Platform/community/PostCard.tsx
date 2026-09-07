"use client";

import { FormEvent } from "react";
import { Bookmark, Heart, MessageSquare, Send, Share2 } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  IconButton,
  Input,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import type { CommunityPost } from "./types";

export function PostCard({
  post,
  commentsOpen,
  commentText,
  onToggleComments,
  onCommentChange,
  onAddComment,
  onUpvote,
  onBookmark,
  onShare,
}: {
  post: CommunityPost;
  commentsOpen: boolean;
  commentText: string;
  onToggleComments: () => void;
  onCommentChange: (value: string) => void;
  onAddComment: (event: FormEvent) => void;
  onUpvote: () => void;
  onBookmark: () => void;
  onShare: () => void;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={post.authorAvatar} name={post.authorName} size="md" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="type-label m-0 text-ink">{post.authorName}</p>
              {post.isMentor ? <Badge tone="accent">Mentor</Badge> : null}
            </div>
            <p className="type-caption m-0 text-muted">
              {post.authorTitle} · {post.time}
            </p>
          </div>
        </div>
        <IconButton
          label={post.userHasBookmarked ? "Remove bookmark" : "Bookmark post"}
          onClick={onBookmark}
        >
          <Bookmark
            size={18}
            aria-hidden
            className={post.userHasBookmarked ? "text-warning" : "text-faint"}
            fill={post.userHasBookmarked ? "currentColor" : "none"}
          />
        </IconButton>
      </div>

      <p className="type-body m-0 whitespace-pre-line text-ink">{post.content}</p>

      {post.codeSnippet ? (
        <pre className="m-0 overflow-x-auto rounded-[var(--radius-md)] bg-sunken p-3 type-caption text-ink">
          <code>{post.codeSnippet}</code>
        </pre>
      ) : null}

      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {post.tags.map((tag) => (
          <li key={tag}>
            <Badge tone="neutral">#{tag}</Badge>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2 border-t border-line pt-3">
        <Button
          variant="ghost"
          size="sm"
          className="min-h-11"
          onClick={onUpvote}
        >
          <Heart
            size={16}
            aria-hidden
            className={post.userHasUpvoted ? "text-danger" : undefined}
            fill={post.userHasUpvoted ? "currentColor" : "none"}
          />
          {post.upvotes} upvotes
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("min-h-11", commentsOpen && "text-primary")}
          onClick={onToggleComments}
        >
          <MessageSquare size={16} aria-hidden />
          {post.comments.length} comments
        </Button>
        <Button variant="ghost" size="sm" className="min-h-11" onClick={onShare}>
          <Share2 size={16} aria-hidden />
          Share
        </Button>
      </div>

      {commentsOpen ? (
        <div className="flex flex-col gap-3 rounded-[var(--radius-md)] bg-sunken p-3">
          <p className="type-caption m-0 font-semibold text-muted">
            Thread comments
          </p>
          {post.comments.length === 0 ? (
            <p className="type-small m-0 text-faint">
              No comments posted yet. Write one below to join the discussion.
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {post.comments.map((comment) => (
                <li
                  key={comment.id}
                  className="flex gap-2 rounded-[var(--radius-md)] border border-line bg-surface p-3"
                >
                  <Avatar name={comment.author} size="sm" />
                  <div className="min-w-0">
                    <p className="type-caption m-0 font-semibold text-ink">
                      {comment.author}
                    </p>
                    <p className="type-small m-0 text-muted">{comment.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={onAddComment} className="flex gap-2">
            <Input
              value={commentText}
              onChange={(event) => onCommentChange(event.target.value)}
              placeholder="Type your comment reply..."
              aria-label="Comment"
              className="min-h-11 flex-1"
            />
            <IconButton
              type="submit"
              label="Send comment"
              variant="primary"
              className="min-h-11 min-w-11"
            >
              <Send size={16} aria-hidden />
            </IconButton>
          </form>
        </div>
      ) : null}
    </Card>
  );
}
