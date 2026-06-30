import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Draft, Template, WebhookMessage } from '@hookcraft/shared';

interface SavedWebhookLocal {
  id: string;
  name: string;
  url: string;
}

interface WebhookState {
  // ── Active webhook
  activeWebhookId: string | null;
  webhooks: SavedWebhookLocal[];
  targetMessageId: string; // for editing existing message

  // ── Drafts
  drafts: Draft[];
  activeDraftId: string | null;

  // ── Templates
  templates: Template[];

  // ── Send state
  isSending: boolean;
  lastSentAt: string | null;
  lastError: string | null;

  // ── Webhook actions
  addWebhook: (name: string, url: string) => string;
  removeWebhook: (id: string) => void;
  renameWebhook: (id: string, name: string) => void;
  setActiveWebhook: (id: string | null) => void;
  setTargetMessageId: (id: string) => void;
  getActiveWebhookUrl: () => string | null;

  // ── Draft actions
  saveDraft: (name: string, message: WebhookMessage, webhookId?: string) => string;
  loadDraft: (id: string) => Draft | null;
  deleteDraft: (id: string) => void;
  renameDraft: (id: string, name: string) => void;
  duplicateDraft: (id: string) => string;
  setActiveDraftId: (id: string | null) => void;

  // ── Template actions
  saveTemplate: (name: string, description: string, message: WebhookMessage) => string;
  deleteTemplate: (id: string) => void;
  renameTemplate: (id: string, name: string) => void;
  duplicateTemplate: (id: string) => string;

  // ── Send actions
  setSending: (sending: boolean) => void;
  setLastError: (error: string | null) => void;
  recordSent: () => void;
}

export const useWebhookStore = create<WebhookState>()(
  persist(
    (set, get) => ({
      activeWebhookId: null,
      webhooks: [],
      targetMessageId: '',
      drafts: [],
      activeDraftId: null,
      templates: [],
      isSending: false,
      lastSentAt: null,
      lastError: null,

      // ── Webhooks
      addWebhook: (name, url) => {
        const id = uuidv4();
        set((s) => ({ webhooks: [...s.webhooks, { id, name, url }] }));
        
        fetch('/api/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, name, url })
        }).catch(() => {});

        return id;
      },
      removeWebhook: (id) => {
        set((s) => ({
          webhooks: s.webhooks.filter((w) => w.id !== id),
          activeWebhookId: s.activeWebhookId === id ? null : s.activeWebhookId,
        }));
        
        fetch(`/api/webhooks?id=${id}`, { method: 'DELETE' }).catch(() => {});
      },
      renameWebhook: (id, name) => {
        const state = get();
        const url = state.webhooks.find(w => w.id === id)?.url || '';
        set((s) => ({
          webhooks: s.webhooks.map((w) => (w.id === id ? { ...w, name } : w)),
        }));

        fetch('/api/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, name, url })
        }).catch(() => {});
      },
      setActiveWebhook: (id) => set({ activeWebhookId: id }),
      setTargetMessageId: (id) => set({ targetMessageId: id }),
      getActiveWebhookUrl: () => {
        const { webhooks, activeWebhookId } = get();
        return webhooks.find((w) => w.id === activeWebhookId)?.url ?? null;
      },

      // ── Drafts
      saveDraft: (name, message, webhookId) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const draft: Draft = {
          id,
          name,
          message,
          webhookId,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ drafts: [draft, ...s.drafts], activeDraftId: id }));
        
        fetch('/api/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, name, payload: message })
        }).catch(() => {});

        return id;
      },
      loadDraft: (id) => get().drafts.find((d) => d.id === id) ?? null,
      deleteDraft: (id) => {
        set((s) => ({
          drafts: s.drafts.filter((d) => d.id !== id),
          activeDraftId: s.activeDraftId === id ? null : s.activeDraftId,
        }));
        
        fetch(`/api/drafts?id=${id}`, { method: 'DELETE' }).catch(() => {});
      },
      renameDraft: (id, name) => {
        set((s) => ({
          drafts: s.drafts.map((d) =>
            d.id === id ? { ...d, name, updatedAt: new Date().toISOString() } : d,
          ),
        }));

        const draft = get().drafts.find(d => d.id === id);
        if (draft) {
          fetch('/api/drafts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name, payload: draft.message })
          }).catch(() => {});
        }
      },
      duplicateDraft: (id) => {
        const draft = get().drafts.find((d) => d.id === id);
        if (!draft) return '';
        const newId = uuidv4();
        const now = new Date().toISOString();
        const copy: Draft = { ...draft, id: newId, name: `${draft.name} (copy)`, createdAt: now, updatedAt: now };
        set((s) => ({ drafts: [copy, ...s.drafts] }));
        return newId;
      },
      setActiveDraftId: (id) => set({ activeDraftId: id }),

      // ── Templates
      saveTemplate: (name, description, message) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const template: Template = { id, name, description, message, isPublic: false, createdAt: now, updatedAt: now };
        set((s) => ({ templates: [template, ...s.templates] }));
        return id;
      },
      deleteTemplate: (id) => set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),
      renameTemplate: (id, name) =>
        set((s) => ({
          templates: s.templates.map((t) =>
            t.id === id ? { ...t, name, updatedAt: new Date().toISOString() } : t,
          ),
        })),
      duplicateTemplate: (id) => {
        const t = get().templates.find((t) => t.id === id);
        if (!t) return '';
        const newId = uuidv4();
        const now = new Date().toISOString();
        const copy: Template = { ...t, id: newId, name: `${t.name} (copy)`, createdAt: now, updatedAt: now };
        set((s) => ({ templates: [copy, ...s.templates] }));
        return newId;
      },

      // ── Send
      setSending: (isSending) => set({ isSending }),
      setLastError: (lastError) => set({ lastError }),
      recordSent: () => set({ lastSentAt: new Date().toISOString(), lastError: null }),
    }),
    {
      name: 'hookcraft-webhooks',
      partialize: (state) => ({
        webhooks: state.webhooks,
        activeWebhookId: state.activeWebhookId,
        drafts: state.drafts,
        templates: state.templates,
        activeDraftId: state.activeDraftId,
      }),
    },
  ),
);
