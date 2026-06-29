'use client';

import { useEffect } from 'react';
import { useMessageStore } from '@/store/message.store';
import { useUIStore } from '@/store/ui.store';
import { useWebhookStore } from '@/store/webhook.store';

/**
 * Registers global keyboard shortcuts:
 * Ctrl+Z         → undo
 * Ctrl+Y         → redo
 * Ctrl+S         → save draft
 * Ctrl+Shift+1-8 → switch section
 * Ctrl+`         → toggle JSON editor
 */
export function KeyboardShortcuts() {
  const { undo, canUndo, redo, canRedo } = useMessageStore();
  const { setActiveSection } = useUIStore();
  const { saveDraft } = useWebhookStore();

  const sectionMap: Record<string, Parameters<typeof setActiveSection>[0]> = {
    '1': 'content',
    '2': 'profile',
    '3': 'embeds',
    '4': 'components',
    '5': 'attachments',
    '6': 'poll',
    '7': 'json',
    '8': 'templates',
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Skip when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }
      if (ctrl && e.key === 's') {
        e.preventDefault();
        const msg = useMessageStore.getState().message;
        saveDraft('Autosave', msg);
        return;
      }
      if (ctrl && e.key === '`') {
        e.preventDefault();
        setActiveSection('json');
        return;
      }
      if (!isInput && ctrl && e.shiftKey && sectionMap[e.key]) {
        e.preventDefault();
        setActiveSection(sectionMap[e.key]);
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canUndo, canRedo, undo, redo, setActiveSection, saveDraft]); // eslint-disable-line

  return null;
}
