// ─────────────────────────────────────────────
// Zod Schemas — Message Validation
// ─────────────────────────────────────────────

import { z } from 'zod';

export const EmbedAuthorSchema = z.object({
  name: z.string().max(256, 'Author name max 256 characters'),
  url: z.string().url().optional().or(z.literal('')),
  icon_url: z.string().url().optional().or(z.literal('')),
});

export const EmbedFooterSchema = z.object({
  text: z.string().max(2048, 'Footer max 2048 characters'),
  icon_url: z.string().url().optional().or(z.literal('')),
});

export const EmbedFieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Field name required').max(256, 'Field name max 256'),
  value: z.string().min(1, 'Field value required').max(1024, 'Field value max 1024'),
  inline: z.boolean().optional(),
});

export const EmbedSchema = z.object({
  id: z.string(),
  title: z.string().max(256, 'Title max 256 characters').optional(),
  description: z.string().max(4096, 'Description max 4096 characters').optional(),
  url: z.string().url().optional().or(z.literal('')),
  color: z.number().int().min(0).max(16777215).optional(),
  author: EmbedAuthorSchema.optional(),
  footer: EmbedFooterSchema.optional(),
  image: z.object({ url: z.string().url() }).optional(),
  thumbnail: z.object({ url: z.string().url() }).optional(),
  fields: z.array(EmbedFieldSchema).max(25, 'Max 25 fields').optional(),
  timestamp: z.string().optional(),
});

export const ButtonSchema = z.object({
  id: z.string(),
  type: z.literal(2),
  style: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  label: z.string().max(80).optional(),
  custom_id: z.string().max(100).optional(),
  url: z.string().url().optional().or(z.literal('')),
  disabled: z.boolean().optional(),
});

export const SelectOptionSchema = z.object({
  id: z.string(),
  label: z.string().max(100),
  value: z.string().max(100),
  description: z.string().max(100).optional(),
  default: z.boolean().optional(),
});

export const SelectMenuSchema = z.object({
  id: z.string(),
  type: z.literal(3),
  custom_id: z.string().max(100),
  options: z.array(SelectOptionSchema).max(25),
  placeholder: z.string().max(150).optional(),
  min_values: z.number().int().min(1).max(25).optional(),
  max_values: z.number().int().min(1).max(25).optional(),
  disabled: z.boolean().optional(),
});

export const ActionRowSchema = z.object({
  id: z.string(),
  type: z.literal(1),
  components: z.array(z.union([ButtonSchema, SelectMenuSchema])).max(5),
});

export const PollAnswerSchema = z.object({
  id: z.string(),
  poll_media: z.object({
    text: z.string().max(55).optional(),
  }),
});

export const PollSchema = z.object({
  question: z.object({
    text: z.string().max(300, 'Poll question max 300 characters'),
  }),
  answers: z.array(PollAnswerSchema).min(2).max(10),
  duration: z.number().int().min(1).max(168),
  allow_multiselect: z.boolean(),
});

export const WebhookMessageSchema = z.object({
  content: z.string().max(2000, 'Content max 2000 characters').optional(),
  username: z.string().max(80, 'Username max 80 characters').optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  tts: z.boolean().optional(),
  embeds: z.array(EmbedSchema).max(10, 'Max 10 embeds').optional(),
  components: z.array(ActionRowSchema).max(5, 'Max 5 action rows').optional(),
  flags: z.number().int().optional(),
  thread_id: z.string().optional(),
  poll: PollSchema.optional(),
});

export const WebhookUrlSchema = z
  .string()
  .regex(
    /^https:\/\/discord\.com\/api\/webhooks\/\d+\/.+$/,
    'Invalid Discord webhook URL',
  );

export type WebhookMessageInput = z.infer<typeof WebhookMessageSchema>;
export type EmbedInput = z.infer<typeof EmbedSchema>;
export type EmbedFieldInput = z.infer<typeof EmbedFieldSchema>;
