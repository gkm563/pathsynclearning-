"use client";

import type { FormEvent, RefObject } from "react";
import { Lock, Send } from "lucide-react";
import { Button, Card, IconButton, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { AlumniChatMessage, AlumniProfile } from "./types";

export function AlumniChat({
  alumnus,
  messages,
  isPremium,
  input,
  chatEndRef,
  onInputChange,
  onSend,
  onClose,
  onUpgrade,
}: {
  alumnus: AlumniProfile;
  messages: AlumniChatMessage[];
  isPremium: boolean;
  input: string;
  chatEndRef: RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onSend: (event: FormEvent) => void;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  return (
    <Card className="flex min-h-[340px] flex-col gap-4">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <p className="type-label m-0 text-ink">Conversation with {alumnus.name}</p>
        <Button variant="secondary" size="sm" className="min-h-11" onClick={onClose}>
          Close chat
        </Button>
      </div>

      {isPremium ? (
        <>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            {messages.map((msg, index) => {
              const isSystem = msg.sender === "system";
              const fromStudent = msg.sender === "student";
              return (
                <div
                  key={`${msg.time}-${index}`}
                  className={cn(
                    "flex max-w-[90%] flex-col gap-1",
                    isSystem
                      ? "self-center"
                      : fromStudent
                        ? "self-end"
                        : "self-start",
                  )}
                >
                  {!isSystem ? (
                    <span className="type-caption text-faint">
                      {fromStudent ? "You" : alumnus.name} · {msg.time}
                    </span>
                  ) : null}
                  <p
                    className={cn(
                      "type-small m-0 rounded-[var(--radius-md)] px-3 py-2",
                      isSystem
                        ? "bg-primary-soft text-primary"
                        : fromStudent
                          ? "bg-primary text-[var(--text-on-primary)]"
                          : "border border-line bg-sunken text-ink",
                    )}
                  >
                    {msg.text}
                  </p>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={onSend} className="flex gap-2 border-t border-line pt-3">
            <Input
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder={`Message ${alumnus.name}...`}
              aria-label="Message"
              className="flex-1"
            />
            <IconButton type="submit" label="Send message" variant="primary" className="min-h-11 min-w-11">
              <Send size={16} aria-hidden />
            </IconButton>
          </form>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Lock size={20} aria-hidden />
          </span>
          <div>
            <h4 className="type-h4 m-0 text-ink">VIP messaging locked</h4>
            <p className="type-small mx-auto mt-1 mb-0 max-w-sm text-muted">
              Upgrade to PathED Premium to unlock private messaging channels, share resumes directly, and sync call schedules.
            </p>
          </div>
          <Button className="min-h-11" onClick={onUpgrade}>
            Unlock Premium
          </Button>
        </div>
      )}
    </Card>
  );
}
