import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ActiveSection =
  | 'content'
  | 'profile'
  | 'embeds'
  | 'components'
  | 'attachments'
  | 'poll'
  | 'json'
  | 'templates';

interface UIState {
  activeSection: ActiveSection;
  activeEmbedId: string | null;
  activeRowId: string | null;
  sidebarCollapsed: boolean;
  previewScale: number;
  editorFontSize: number;
  accentColor: string;
  autosaveInterval: number; // seconds

  setActiveSection: (section: ActiveSection) => void;
  setActiveEmbedId: (id: string | null) => void;
  setActiveRowId: (id: string | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setPreviewScale: (scale: number) => void;
  setEditorFontSize: (size: number) => void;
  setAccentColor: (color: string) => void;
  setAutosaveInterval: (interval: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeSection: 'content',
      activeEmbedId: null,
      activeRowId: null,
      sidebarCollapsed: false,
      previewScale: 100,
      editorFontSize: 14,
      accentColor: '#5865f2',
      autosaveInterval: 30,

      setActiveSection: (section) => set({ activeSection: section }),
      setActiveEmbedId: (id) => set({ activeEmbedId: id }),
      setActiveRowId: (id) => set({ activeRowId: id }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setPreviewScale: (scale) => set({ previewScale: scale }),
      setEditorFontSize: (size) => set({ editorFontSize: size }),
      setAccentColor: (color) => set({ accentColor: color }),
      setAutosaveInterval: (interval) => set({ autosaveInterval: interval }),
    }),
    {
      name: 'hookcraft-ui',
      partialize: (state) => ({
        previewScale: state.previewScale,
        editorFontSize: state.editorFontSize,
        accentColor: state.accentColor,
        autosaveInterval: state.autosaveInterval,
      }),
    },
  ),
);
