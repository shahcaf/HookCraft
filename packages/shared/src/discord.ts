import { z } from 'zod';

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
}

export interface DiscordEmbedImage {
  url: string;
}

export interface DiscordEmbedThumbnail {
  url: string;
}

export interface DiscordEmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
}

export interface EmbedField {
  id: string;
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  id: string;
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: DiscordEmbedFooter;
  image?: DiscordEmbedImage;
  thumbnail?: DiscordEmbedThumbnail;
  author?: DiscordEmbedAuthor;
  fields?: EmbedField[];
}

export interface PollAnswer {
  id: string;
  poll_media: { text: string; emoji?: { name: string; id?: string } };
}

export interface DiscordPoll {
  question: { text: string };
  answers: PollAnswer[];
  duration: number;
  allow_multiselect: boolean;
  layout_type?: number;
}

export interface MessageAttachment {
  id: string;
  dataUrl?: string;
  filename: string;
  description?: string;
  content_type?: string;
  size?: number;
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
  ephemeral?: boolean;
}

export interface SelectOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  emoji?: { name: string; id?: string };
  default?: boolean;
}

export interface ButtonComponent {
  id: string;
  type: 2;
  style: number;
  label?: string;
  emoji?: { name: string; id?: string };
  custom_id?: string;
  url?: string;
  disabled?: boolean;
}

export interface StringSelectComponent {
  id: string;
  type: 3;
  custom_id: string;
  options: SelectOption[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export type MessageComponent = ButtonComponent | StringSelectComponent;

export interface ActionRow {
  id: string;
  type: 1;
  components: MessageComponent[];
}

export interface WebhookMessage {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  thread_id?: string;
  embeds?: DiscordEmbed[];
  components?: ActionRow[];
  attachments?: MessageAttachment[];
  poll?: DiscordPoll;
  allowed_mentions?: {
    parse?: string[];
    roles?: string[];
    users?: string[];
    replied_user?: boolean;
  };
  thread_name?: string;
  flags?: number;
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
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const WebhookUrlSchema = z.string().url().regex(/^https:\/\/(canary\.|ptb\.)?discord\.com\/api\/webhooks\//, 'Must be a valid Discord Webhook URL');
