// ─────────────────────────────────────────────
// Discord Message Types
// ─────────────────────────────────────────────

import type { DiscordEmbed } from './embed';
import type { ActionRow } from './component';
import type { DiscordPoll } from './poll';

export interface AllowedMentions {
  parse?: ('roles' | 'users' | 'everyone')[];
  roles?: string[];
  users?: string[];
  replied_user?: boolean;
}

export interface MessageAttachment {
  id: string; // client-side only
  filename: string;
  description?: string;
  content_type?: string;
  size?: number;
  url?: string;
  dataUrl?: string; // preview
}

export interface WebhookMessage {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds?: DiscordEmbed[];
  components?: ActionRow[];
  allowed_mentions?: AllowedMentions;
  flags?: number;
  thread_id?: string;
  poll?: DiscordPoll;
  attachments?: MessageAttachment[];
}

export interface SavedWebhook {
  id: string;
  name: string;
  url: string; // encrypted in DB, plain in client (memory only)
}

export interface Draft {
  id: string;
  name: string;
  message: WebhookMessage;
  webhookId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  message: WebhookMessage;
  isPublic: boolean;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
}
