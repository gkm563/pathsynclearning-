"use client";

import { FormEvent, useMemo, useState } from "react";
import { MessageSquare, PlusCircle } from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  ListSkeleton,
  PageHeader,
  SearchInput,
  Segmented,
  Skeleton,
  TabPanel,
  Tabs,
  useToast,
} from "@/components/ui";
import { useMockResource } from "@/views/Platform/shared/useMockResource";
import { ChannelSidebar } from "./community/ChannelSidebar";
import { channelIcon } from "./community/channelIcons";
import { CommunityAside } from "./community/CommunityAside";
import { CreatePostDialog } from "./community/CreatePostDialog";
import { CHANNELS_POOL, CURRENT_USER_AVATAR, INITIAL_POSTS } from "./community/data";
import { PostCard } from "./community/PostCard";
import type { CommunityPost, FeedFilter } from "./community/types";

/** Developer forum — `/dashboard/student-community` */
export default function PlatformCommunity() {
  const toast = useToast();
  const resource = useMockResource();

  const [selectedChannel, setSelectedChannel] = useState("general-sde");
  const [posts, setPosts] = useState<CommunityPost[]>(() =>
    INITIAL_POSTS.map((post) => ({ ...post, comments: [...post.comments] })),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("trending");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [newPostChannel, setNewPostChannel] = useState("general-sde");
  const [newPostCode, setNewPostCode] = useState("");
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>(
    {},
  );
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>(
    {},
  );
  const [remindedEvents, setRemindedEvents] = useState<string[]>([]);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        if (post.channel !== selectedChannel) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const contentMatch = post.content.toLowerCase().includes(q);
          const authorMatch = post.authorName.toLowerCase().includes(q);
          const tagMatch = post.tags.some((tag) => tag.toLowerCase().includes(q));
          if (!contentMatch && !authorMatch && !tagMatch) return false;
        }
        if (feedFilter === "bookmarked" && !post.userHasBookmarked) return false;
        return true;
      })
      .sort((a, b) => {
        if (feedFilter === "trending") return b.upvotes - a.upvotes;
        return b.id.localeCompare(a.id);
      });
  }, [posts, selectedChannel, searchQuery, feedFilter]);

  const handleUpvote = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const increment = post.userHasUpvoted ? -1 : 1;
        return {
          ...post,
          upvotes: post.upvotes + increment,
          userHasUpvoted: !post.userHasUpvoted,
        };
      }),
    );
  };

  const handleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, userHasBookmarked: !post.userHasBookmarked }
          : post,
      ),
    );
  };

  const handleAddComment = (event: FormEvent, postId: string) => {
    event.preventDefault();
    const commentText = newCommentTexts[postId];
    if (!commentText || !commentText.trim()) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `c_${postId}_${post.comments.length + 1}`,
              author: "Rahul Kushwaha",
              text: commentText.trim(),
            },
          ],
        };
      }),
    );
    setNewCommentTexts((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleCreatePostSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!newPostContent.trim()) {
      toast.error("Post content cannot be empty.");
      return;
    }

    const tagsArray = newPostTags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);

    const newPost: CommunityPost = {
      id: `p_user_${Date.now()}`,
      channel: newPostChannel,
      authorName: "Rahul Kushwaha",
      authorTitle: "IIT Kanpur · CRI 62%",
      authorAvatar: CURRENT_USER_AVATAR,
      isMentor: false,
      time: "Just now",
      content: newPostContent.trim(),
      codeSnippet: newPostCode.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : ["general"],
      upvotes: 1,
      userHasUpvoted: true,
      userHasBookmarked: false,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setShowCreateModal(false);
    setSelectedChannel(newPostChannel);
    setNewPostContent("");
    setNewPostTags("");
    setNewPostCode("");
    toast.success("Thread published.");
  };

  const toggleReminder = (eventId: string, eventTitle: string) => {
    if (remindedEvents.includes(eventId)) {
      setRemindedEvents((prev) => prev.filter((id) => id !== eventId));
      toast.info(`Reminder removed for "${eventTitle}".`);
    } else {
      setRemindedEvents((prev) => [...prev, eventId]);
      toast.success({
        title: "Reminder scheduled",
        description: `We'll alert you 10 minutes before "${eventTitle}" starts.`,
      });
    }
  };

  const openCreate = () => {
    setNewPostChannel(selectedChannel);
    setShowCreateModal(true);
  };

  const activeChannel = CHANNELS_POOL.find((channel) => channel.id === selectedChannel);
  const ChannelIcon = channelIcon(selectedChannel);

  return (
    <>
      <PageHeader
        eyebrow="Collaboration & communities"
        title="Developer forum"
        description="Discuss system designs, debug codeblocks, and ask career questions to verified tech mentors."
        actions={
          <Button onClick={openCreate} className="min-h-11">
            <PlusCircle size={16} aria-hidden />
            Create new post
          </Button>
        }
      />

      <Tabs
        items={CHANNELS_POOL.map((channel) => ({
          id: channel.id,
          label: channel.label,
        }))}
        value={selectedChannel}
        onChange={(id) => {
          setSelectedChannel(id);
          setFeedFilter("trending");
        }}
        ariaLabel="Community channels"
        className="mb-6 lg:hidden"
      />

      {resource.state === "error" ? (
        <ErrorState
          title="Couldn't load the forum"
          description="The community feed didn't come back. Retry, and if it keeps failing the forum is temporarily unavailable."
          action={
            <Button variant="secondary" onClick={resource.reload}>
              Try again
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
          <div className="hidden lg:block">
            <ChannelSidebar
              channels={CHANNELS_POOL}
              selectedId={selectedChannel}
              onSelect={(id) => {
                setSelectedChannel(id);
                setFeedFilter("trending");
              }}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            {resource.state === "loading" ? (
              <div className="flex flex-col gap-4" aria-hidden>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
                <ListSkeleton count={3} />
              </div>
            ) : (
              <>
                {activeChannel ? (
                  <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary">
                        <ChannelIcon size={18} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <h2 className="type-h3 m-0 text-ink">#{activeChannel.label}</h2>
                        <p className="type-small m-0 text-muted">{activeChannel.desc}</p>
                      </div>
                    </div>
                    <p className="type-caption m-0 shrink-0 text-success">142 online</p>
                  </Card>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <SearchInput
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    placeholder={`Search threads inside #${selectedChannel}...`}
                    aria-label="Search threads"
                    className="flex-1"
                  />
                  <Segmented<FeedFilter>
                    ariaLabel="Feed sort"
                    value={feedFilter}
                    onChange={setFeedFilter}
                    items={[
                      { id: "trending", label: "Trending" },
                      { id: "latest", label: "Latest" },
                      { id: "bookmarked", label: "Bookmarks" },
                    ]}
                    className="[&_button]:min-h-11"
                  />
                </div>

                <button
                  type="button"
                  onClick={openCreate}
                  className="flex min-h-11 items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-line bg-surface px-4 py-3 text-left hover:border-line-strong"
                >
                  <Avatar src={CURRENT_USER_AVATAR} name="Rahul Kushwaha" size="sm" />
                  <span className="type-small flex-1 text-muted">
                    What technical insights or questions do you want to share inside #
                    {selectedChannel}?
                  </span>
                  <PlusCircle size={18} className="shrink-0 text-primary" aria-hidden />
                </button>

                <TabPanel active>
                  {filteredPosts.length === 0 ? (
                    <EmptyState
                      icon={<MessageSquare size={20} aria-hidden />}
                      title="Empty space"
                      description="No posts matched the filters inside this channel. Create a new thread to start discussions!"
                      action={
                        <Button onClick={openCreate}>
                          <PlusCircle size={16} aria-hidden />
                          Create thread
                        </Button>
                      }
                    />
                  ) : (
                    <ul className="m-0 flex list-none flex-col gap-4 p-0">
                      {filteredPosts.map((post) => (
                        <li key={post.id} className="min-w-0">
                          <PostCard
                            post={post}
                            commentsOpen={!!expandedComments[post.id]}
                            commentText={newCommentTexts[post.id] ?? ""}
                            onToggleComments={() =>
                              setExpandedComments((prev) => ({
                                ...prev,
                                [post.id]: !prev[post.id],
                              }))
                            }
                            onCommentChange={(value) =>
                              setNewCommentTexts((prev) => ({
                                ...prev,
                                [post.id]: value,
                              }))
                            }
                            onAddComment={(event) => handleAddComment(event, post.id)}
                            onUpvote={() => handleUpvote(post.id)}
                            onBookmark={() => handleBookmark(post.id)}
                            onShare={() => {
                              void navigator.clipboard.writeText(
                                `pathed.ai/community/post/${post.id}`,
                              );
                              toast.success("Direct link copied to clipboard.");
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </TabPanel>
              </>
            )}
          </div>

          <div className="min-w-0">
            {resource.state === "loading" ? (
              <div className="flex flex-col gap-4" aria-hidden>
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <CommunityAside
                remindedEvents={remindedEvents}
                onToggleReminder={toggleReminder}
              />
            )}
          </div>
        </div>
      )}

      <CreatePostDialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        channel={newPostChannel}
        content={newPostContent}
        tags={newPostTags}
        code={newPostCode}
        onChannelChange={setNewPostChannel}
        onContentChange={setNewPostContent}
        onTagsChange={setNewPostTags}
        onCodeChange={setNewPostCode}
        onSubmit={handleCreatePostSubmit}
      />
    </>
  );
}
