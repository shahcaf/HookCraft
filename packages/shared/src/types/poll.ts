// ─────────────────────────────────────────────
// Discord Poll Types
// ─────────────────────────────────────────────

export interface PollAnswer {
  id: string; // client-side only
  answer_id?: number;
  poll_media: {
    text?: string;
    emoji?: {
      id?: string;
      name?: string;
    };
  };
}

export interface PollMedia {
  text: string;
  emoji?: {
    id?: string;
    name?: string;
  };
}

export interface DiscordPoll {
  question: PollMedia;
  answers: PollAnswer[];
  duration: number; // hours (1-168)
  allow_multiselect: boolean;
  layout_type?: 1;
}
