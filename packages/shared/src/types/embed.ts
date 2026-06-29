// ─────────────────────────────────────────────
// Discord Embed Types
// ─────────────────────────────────────────────

export interface EmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
}

export interface EmbedFooter {
  text: string;
  icon_url?: string;
}

export interface EmbedImage {
  url: string;
  height?: number;
  width?: number;
}

export interface EmbedThumbnail {
  url: string;
  height?: number;
  width?: number;
}

export interface EmbedField {
  id: string; // client-side only, not sent to Discord
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  id: string; // client-side only
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  author?: EmbedAuthor;
  footer?: EmbedFooter;
  image?: EmbedImage;
  thumbnail?: EmbedThumbnail;
  fields?: EmbedField[];
  timestamp?: string;
}

// Discord API payload embed (without client-only IDs)
export type EmbedPayload = Omit<DiscordEmbed, 'id'> & {
  fields?: Omit<EmbedField, 'id'>[];
};
