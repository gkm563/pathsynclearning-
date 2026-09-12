import "server-only";
import { AccessToken, AgentDispatchClient, RoomServiceClient } from "livekit-server-sdk";
import { env } from "@/lib/env";

export function isLiveKitConfigured(): boolean {
  return Boolean(env.livekitUrl && env.livekitApiKey && env.livekitApiSecret);
}

export function livekitWsUrl(): string | null {
  return env.livekitUrl ?? null;
}

function livekitHttpUrl(): string {
  const url = env.livekitUrl;
  if (!url) throw new Error("LIVEKIT_URL is not set");
  return url.replace(/^wss:/i, "https:").replace(/^ws:/i, "http:");
}

export async function createInterviewRoom(input: {
  roomName: string;
  metadata: string;
  emptyTimeoutSec: number;
}): Promise<{ dispatched: boolean }> {
  if (!isLiveKitConfigured()) return { dispatched: false };
  const http = livekitHttpUrl();
  const rooms = new RoomServiceClient(http, env.livekitApiKey!, env.livekitApiSecret!);
  await rooms.createRoom({
    name: input.roomName,
    emptyTimeout: input.emptyTimeoutSec,
    maxParticipants: 6,
    metadata: input.metadata,
  });

  let dispatched = false;
  try {
    const dispatch = new AgentDispatchClient(http, env.livekitApiKey!, env.livekitApiSecret!);
    await dispatch.createDispatch(input.roomName, env.livekitAgentName);
    dispatched = true;
  } catch (err) {
    console.warn(
      "[interview] LiveKit agent dispatch skipped:",
      err instanceof Error ? err.message : err,
    );
  }
  return { dispatched };
}

export async function issueInterviewToken(input: {
  identity: string;
  name: string;
  roomName: string;
}): Promise<string> {
  if (!isLiveKitConfigured()) {
    throw new Error("LiveKit is not configured");
  }
  const token = new AccessToken(env.livekitApiKey!, env.livekitApiSecret!, {
    identity: input.identity,
    name: input.name,
    ttl: "2h",
  });
  token.addGrant({
    roomJoin: true,
    room: input.roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
  return token.toJwt();
}
