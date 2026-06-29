import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  WebhookMessage,
  DiscordEmbed,
  EmbedField,
  ActionRow,
  ButtonComponent,
  StringSelectComponent,
  SelectOption,
  DiscordPoll,
  PollAnswer,
  MessageAttachment,
} from '@hookcraft/shared';

// ── Undo/Redo History ─────────────────────────────────────────────
const MAX_HISTORY = 50;

function createDefaultEmbed(): DiscordEmbed {
  return {
    id: uuidv4(),
    title: '',
    description: '',
    color: 0x5865f2,
    fields: [],
  };
}

function createDefaultMessage(): WebhookMessage {
  return {
    content: '',
    username: '',
    avatar_url: '',
    embeds: [],
    components: [],
    attachments: [],
  };
}

// ── Store Types ────────────────────────────────────────────────────
interface MessageState {
  message: WebhookMessage;
  history: WebhookMessage[];
  historyIndex: number;

  // ── Message actions
  setContent: (content: string) => void;
  setUsername: (username: string) => void;
  setAvatarUrl: (url: string) => void;
  setTts: (tts: boolean) => void;
  setFlags: (flags: number) => void;
  setThreadId: (threadId: string) => void;

  // ── Embed actions
  addEmbed: () => void;
  removeEmbed: (id: string) => void;
  duplicateEmbed: (id: string) => void;
  updateEmbed: (id: string, patch: Partial<DiscordEmbed>) => void;
  reorderEmbeds: (from: number, to: number) => void;

  // ── Field actions
  addField: (embedId: string) => void;
  removeField: (embedId: string, fieldId: string) => void;
  duplicateField: (embedId: string, fieldId: string) => void;
  updateField: (embedId: string, fieldId: string, patch: Partial<EmbedField>) => void;
  reorderFields: (embedId: string, from: number, to: number) => void;

  // ── Component (action row) actions
  addActionRow: () => void;
  removeActionRow: (id: string) => void;
  addButton: (rowId: string) => void;
  removeButton: (rowId: string, btnId: string) => void;
  updateButton: (rowId: string, btnId: string, patch: Partial<ButtonComponent>) => void;
  addSelectMenu: (rowId: string) => void;
  updateSelectMenu: (rowId: string, menuId: string, patch: Partial<StringSelectComponent>) => void;
  removeSelectMenu: (rowId: string, menuId: string) => void;
  addSelectOption: (rowId: string, menuId: string) => void;
  updateSelectOption: (rowId: string, menuId: string, optId: string, patch: Partial<SelectOption>) => void;
  removeSelectOption: (rowId: string, menuId: string, optId: string) => void;

  // ── Poll actions
  setPoll: (poll: DiscordPoll | undefined) => void;
  updatePollQuestion: (text: string) => void;
  addPollAnswer: () => void;
  removePollAnswer: (id: string) => void;
  updatePollAnswer: (id: string, text: string) => void;
  setPollDuration: (hours: number) => void;
  setPollMultiselect: (allow: boolean) => void;

  // ── Attachment actions
  addAttachment: (attachment: MessageAttachment) => void;
  removeAttachment: (id: string) => void;

  // ── Bulk actions
  setMessage: (message: WebhookMessage) => void;
  resetMessage: () => void;

  // ── Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const pushHistory = (state: MessageState, newMessage: WebhookMessage) => {
  const trimmed = state.history.slice(0, state.historyIndex + 1);
  if (trimmed.length >= MAX_HISTORY) trimmed.shift();
  state.history = [...trimmed, newMessage];
  state.historyIndex = state.history.length - 1;
  state.canUndo = state.historyIndex > 0;
  state.canRedo = false;
};

const initial = createDefaultMessage();

export const useMessageStore = create<MessageState>()(
  subscribeWithSelector(
    immer((set) => ({
      message: initial,
      history: [initial],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,

      // ── Content
      setContent: (content) =>
        set((s) => {
          s.message.content = content;
          pushHistory(s, { ...s.message });
        }),

      setUsername: (username) =>
        set((s) => {
          s.message.username = username;
          pushHistory(s, { ...s.message });
        }),

      setAvatarUrl: (url) =>
        set((s) => {
          s.message.avatar_url = url;
          pushHistory(s, { ...s.message });
        }),

      setTts: (tts) =>
        set((s) => {
          s.message.tts = tts;
          pushHistory(s, { ...s.message });
        }),

      setFlags: (flags) =>
        set((s) => {
          s.message.flags = flags;
          pushHistory(s, { ...s.message });
        }),

      setThreadId: (threadId) =>
        set((s) => {
          s.message.thread_id = threadId;
          pushHistory(s, { ...s.message });
        }),

      // ── Embeds
      addEmbed: () =>
        set((s) => {
          s.message.embeds = [...(s.message.embeds ?? []), createDefaultEmbed()];
          pushHistory(s, { ...s.message });
        }),

      removeEmbed: (id) =>
        set((s) => {
          s.message.embeds = s.message.embeds?.filter((e) => e.id !== id);
          pushHistory(s, { ...s.message });
        }),

      duplicateEmbed: (id) =>
        set((s) => {
          const idx = s.message.embeds?.findIndex((e) => e.id === id) ?? -1;
          if (idx < 0) return;
          const copy = { ...s.message.embeds![idx], id: uuidv4() };
          s.message.embeds!.splice(idx + 1, 0, copy);
          pushHistory(s, { ...s.message });
        }),

      updateEmbed: (id, patch) =>
        set((s) => {
          const embed = s.message.embeds?.find((e) => e.id === id);
          if (embed) Object.assign(embed, patch);
          pushHistory(s, { ...s.message });
        }),

      reorderEmbeds: (from, to) =>
        set((s) => {
          const embeds = s.message.embeds ?? [];
          const [moved] = embeds.splice(from, 1);
          embeds.splice(to, 0, moved);
          s.message.embeds = embeds;
          pushHistory(s, { ...s.message });
        }),

      // ── Fields
      addField: (embedId) =>
        set((s) => {
          const embed = s.message.embeds?.find((e) => e.id === embedId);
          if (!embed) return;
          embed.fields = [
            ...(embed.fields ?? []),
            { id: uuidv4(), name: 'Field Name', value: 'Field value', inline: false },
          ];
          pushHistory(s, { ...s.message });
        }),

      removeField: (embedId, fieldId) =>
        set((s) => {
          const embed = s.message.embeds?.find((e) => e.id === embedId);
          if (embed) embed.fields = embed.fields?.filter((f) => f.id !== fieldId);
          pushHistory(s, { ...s.message });
        }),

      duplicateField: (embedId, fieldId) =>
        set((s) => {
          const embed = s.message.embeds?.find((e) => e.id === embedId);
          if (!embed?.fields) return;
          const idx = embed.fields.findIndex((f) => f.id === fieldId);
          if (idx < 0) return;
          const copy = { ...embed.fields[idx], id: uuidv4() };
          embed.fields.splice(idx + 1, 0, copy);
          pushHistory(s, { ...s.message });
        }),

      updateField: (embedId, fieldId, patch) =>
        set((s) => {
          const embed = s.message.embeds?.find((e) => e.id === embedId);
          const field = embed?.fields?.find((f) => f.id === fieldId);
          if (field) Object.assign(field, patch);
          pushHistory(s, { ...s.message });
        }),

      reorderFields: (embedId, from, to) =>
        set((s) => {
          const embed = s.message.embeds?.find((e) => e.id === embedId);
          if (!embed?.fields) return;
          const [moved] = embed.fields.splice(from, 1);
          embed.fields.splice(to, 0, moved);
          pushHistory(s, { ...s.message });
        }),

      // ── Action Rows
      addActionRow: () =>
        set((s) => {
          s.message.components = [
            ...(s.message.components ?? []),
            { id: uuidv4(), type: 1, components: [] },
          ];
          pushHistory(s, { ...s.message });
        }),

      removeActionRow: (id) =>
        set((s) => {
          s.message.components = s.message.components?.filter((r) => r.id !== id);
          pushHistory(s, { ...s.message });
        }),

      addButton: (rowId) =>
        set((s) => {
          const row = s.message.components?.find((r) => r.id === rowId);
          if (!row) return;
          const btn: ButtonComponent = {
            id: uuidv4(),
            type: 2,
            style: 1,
            label: 'Button',
            custom_id: uuidv4(),
          };
          row.components = [...row.components, btn];
          pushHistory(s, { ...s.message });
        }),

      removeButton: (rowId, btnId) =>
        set((s) => {
          const row = s.message.components?.find((r) => r.id === rowId);
          if (row) row.components = row.components.filter((c) => c.id !== btnId);
          pushHistory(s, { ...s.message });
        }),

      updateButton: (rowId, btnId, patch) =>
        set((s) => {
          const row = s.message.components?.find((r) => r.id === rowId);
          const btn = row?.components.find((c) => c.id === btnId) as ButtonComponent | undefined;
          if (btn) Object.assign(btn, patch);
          pushHistory(s, { ...s.message });
        }),

      addSelectMenu: (rowId) =>
        set((s) => {
          const row = s.message.components?.find((r) => r.id === rowId);
          if (!row) return;
          const menu: StringSelectComponent = {
            id: uuidv4(),
            type: 3,
            custom_id: uuidv4(),
            options: [{ id: uuidv4(), label: 'Option 1', value: 'option_1' }],
            placeholder: 'Choose an option...',
          };
          row.components = [...row.components, menu];
          pushHistory(s, { ...s.message });
        }),

      updateSelectMenu: (rowId, menuId, patch) =>
        set((s) => {
          const row = s.message.components?.find((r) => r.id === rowId);
          const menu = row?.components.find((c) => c.id === menuId) as StringSelectComponent | undefined;
          if (menu) Object.assign(menu, patch);
          pushHistory(s, { ...s.message });
        }),

      removeSelectMenu: (rowId, menuId) =>
        set((s) => {
          const row = s.message.components?.find((r) => r.id === rowId);
          if (row) row.components = row.components.filter((c) => c.id !== menuId);
          pushHistory(s, { ...s.message });
        }),

      addSelectOption: (rowId, menuId) =>
        set((s) => {
          const row = s.message.components?.find((r) => r.id === rowId);
          const menu = row?.components.find((c) => c.id === menuId) as StringSelectComponent | undefined;
          if (!menu) return;
          menu.options = [...menu.options, { id: uuidv4(), label: 'New Option', value: `option_${Date.now()}` }];
          pushHistory(s, { ...s.message });
        }),

      updateSelectOption: (rowId, menuId, optId, patch) =>
        set((s) => {
          const row = s.message.components?.find((r) => r.id === rowId);
          const menu = row?.components.find((c) => c.id === menuId) as StringSelectComponent | undefined;
          const opt = menu?.options.find((o) => o.id === optId);
          if (opt) Object.assign(opt, patch);
          pushHistory(s, { ...s.message });
        }),

      removeSelectOption: (rowId, menuId, optId) =>
        set((s) => {
          const row = s.message.components?.find((r) => r.id === rowId);
          const menu = row?.components.find((c) => c.id === menuId) as StringSelectComponent | undefined;
          if (menu) menu.options = menu.options.filter((o) => o.id !== optId);
          pushHistory(s, { ...s.message });
        }),

      // ── Poll
      setPoll: (poll) =>
        set((s) => {
          s.message.poll = poll;
          pushHistory(s, { ...s.message });
        }),

      updatePollQuestion: (text) =>
        set((s) => {
          if (!s.message.poll) return;
          s.message.poll.question.text = text;
          pushHistory(s, { ...s.message });
        }),

      addPollAnswer: () =>
        set((s) => {
          if (!s.message.poll) return;
          s.message.poll.answers = [
            ...s.message.poll.answers,
            { id: uuidv4(), poll_media: { text: `Option ${s.message.poll.answers.length + 1}` } },
          ];
          pushHistory(s, { ...s.message });
        }),

      removePollAnswer: (id) =>
        set((s) => {
          if (!s.message.poll) return;
          s.message.poll.answers = s.message.poll.answers.filter((a) => a.id !== id);
          pushHistory(s, { ...s.message });
        }),

      updatePollAnswer: (id, text) =>
        set((s) => {
          const answer = s.message.poll?.answers.find((a) => a.id === id);
          if (answer) answer.poll_media.text = text;
          pushHistory(s, { ...s.message });
        }),

      setPollDuration: (hours) =>
        set((s) => {
          if (!s.message.poll) return;
          s.message.poll.duration = hours;
          pushHistory(s, { ...s.message });
        }),

      setPollMultiselect: (allow) =>
        set((s) => {
          if (!s.message.poll) return;
          s.message.poll.allow_multiselect = allow;
          pushHistory(s, { ...s.message });
        }),

      // ── Attachments
      addAttachment: (attachment) =>
        set((s) => {
          s.message.attachments = [...(s.message.attachments ?? []), attachment];
          pushHistory(s, { ...s.message });
        }),

      removeAttachment: (id) =>
        set((s) => {
          s.message.attachments = s.message.attachments?.filter((a) => a.id !== id);
          pushHistory(s, { ...s.message });
        }),

      // ── Bulk
      setMessage: (message) =>
        set((s) => {
          s.message = message;
          pushHistory(s, message);
        }),

      resetMessage: () =>
        set((s) => {
          const fresh = createDefaultMessage();
          s.message = fresh;
          pushHistory(s, fresh);
        }),

      // ── Undo/Redo
      undo: () =>
        set((s) => {
          if (s.historyIndex <= 0) return;
          s.historyIndex -= 1;
          s.message = { ...s.history[s.historyIndex] };
          s.canUndo = s.historyIndex > 0;
          s.canRedo = true;
        }),

      redo: () =>
        set((s) => {
          if (s.historyIndex >= s.history.length - 1) return;
          s.historyIndex += 1;
          s.message = { ...s.history[s.historyIndex] };
          s.canUndo = true;
          s.canRedo = s.historyIndex < s.history.length - 1;
        }),
    })),
  ),
);
