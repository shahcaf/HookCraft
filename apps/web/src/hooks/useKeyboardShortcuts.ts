'use client';

import { useEffect } from 'react';
import { useMessageStore } from '@/store/message.store';
import { useUIStore } from '@/store/ui.store';

export function useKeyboardShortcuts() {
  const { undo, redo, canUndo, canRedo } = useMessageStore();
  const { setActiveSection } = useUIStore();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;

      // Undo/Redo — skip if in input/textarea/contenteditable
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isEditing = tag === 'textarea' || (tag === 'input' && (e.target as HTMLInputElement).type !== 'button');

      if (!isEditing) {
        if (ctrl && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          if (canUndo) undo();
        }
        if ((ctrl && e.key === 'y') || (ctrl && e.shiftKey && e.key === 'z')) {
          e.preventDefault();
          if (canRedo) redo();
        }
      }

      // Section shortcuts (Alt + number)
      if (e.altKey) {
        const sections = ['content', 'profile', 'embeds', 'components', 'attachments', 'poll', 'json'] as const;
        const idx = parseInt(e.key) - 1;
        if (idx >= 0 && idx < sections.length) {
          e.preventDefault();
          setActiveSection(sections[idx]);
        }
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, canUndo, canRedo, setActiveSection]);
}
