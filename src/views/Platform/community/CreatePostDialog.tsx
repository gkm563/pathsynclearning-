"use client";

import { FormEvent } from "react";
import {
  Button,
  Dialog,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { CHANNELS_POOL } from "./data";

export function CreatePostDialog({
  open,
  onClose,
  channel,
  content,
  tags,
  code,
  onChannelChange,
  onContentChange,
  onTagsChange,
  onCodeChange,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  channel: string;
  content: string;
  tags: string;
  code: string;
  onChannelChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create community thread"
      description="Share a technical explanation, bug report, or career question."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-community-post">
            Publish thread
          </Button>
        </>
      }
    >
      <form
        id="create-community-post"
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
      >
        <Field label="Target space" htmlFor="new-post-channel">
          <Select
            id="new-post-channel"
            value={channel}
            onChange={(event) => onChannelChange(event.target.value)}
          >
            {CHANNELS_POOL.map((item) => (
              <option key={item.id} value={item.id}>
                #{item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Thread content" htmlFor="new-post-content">
          <Textarea
            id="new-post-content"
            required
            rows={5}
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder="Write your technical explanation, bug report, or career advice queries here..."
          />
        </Field>
        <Field label="Code block (optional)" htmlFor="new-post-code">
          <Textarea
            id="new-post-code"
            rows={3}
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            placeholder="Paste code blocks or execution outputs..."
            className="font-mono"
          />
        </Field>
        <Field label="Topic tags (comma separated)" htmlFor="new-post-tags">
          <Input
            id="new-post-tags"
            value={tags}
            onChange={(event) => onTagsChange(event.target.value)}
            placeholder="e.g. systemdesign, redis, caching"
          />
        </Field>
      </form>
    </Dialog>
  );
}
