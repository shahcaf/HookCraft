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

export type SendConfirmMode = 'always' | 'never' | 'delete-only';
export type PreviewTheme = 'dark' | 'light';

interface UIState {
  activeSection: ActiveSection;
  activeEmbedId: string | null;
  activeRowId: string | null;
  sidebarCollapsed: boolean;
  previewScale: number;
  editorFontSize: number;
  accentColor: string;
  autosaveInterval: number;
  compactMode: boolean;
  showCharCounters: boolean;
  sendConfirmMode: SendConfirmMode;
  previewTheme: PreviewTheme;
  showTimestamps: boolean;
  animationsEnabled: boolean;

  setActiveSection: (section: ActiveSection) => void;
  setActiveEmbedId: (id: string | null) => void;
  setActiveRowId: (id: string | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setPreviewScale: (scale: number) => void;
  setEditorFontSize: (size: number) => void;
  setAccentColor: (color: string) => void;
  setAutosaveInterval: (interval: number) => void;
  setCompactMode: (v: boolean) => void;
  setShowCharCounters: (v: boolean) => void;
  setSendConfirmMode: (v: SendConfirmMode) => void;
  setPreviewTheme: (v: PreviewTheme) => void;
  setShowTimestamps: (v: boolean) => void;
  setAnimationsEnabled: (v: boolean) => void;
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
      compactMode: false,
      showCharCounters: true,
      sendConfirmMode: 'delete-only',
      previewTheme: 'dark',
      showTimestamps: true,
      animationsEnabled: true,

      setActiveSection: (section) => set({ activeSection: section }),
      setActiveEmbedId: (id) => set({ activeEmbedId: id }),
      setActiveRowId: (id) => set({ activeRowId: id }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setPreviewScale: (scale) => set({ previewScale: scale }),
      setEditorFontSize: (size) => set({ editorFontSize: size }),
      setAccentColor: (color) => set({ accentColor: color }),
      setAutosaveInterval: (interval) => set({ autosaveInterval: interval }),
      setCompactMode: (v) => set({ compactMode: v }),
      setShowCharCounters: (v) => set({ showCharCounters: v }),
      setSendConfirmMode: (v) => set({ sendConfirmMode: v }),
      setPreviewTheme: (v) => set({ previewTheme: v }),
      setShowTimestamps: (v) => set({ showTimestamps: v }),
      setAnimationsEnabled: (v) => set({ animationsEnabled: v }),
    }),
    {
      name: 'hookcraft-ui',
      partialize: (state) => ({
        previewScale: state.previewScale,
        editorFontSize: state.editorFontSize,
        accentColor: state.accentColor,
        autosaveInterval: state.autosaveInterval,
        compactMode: state.compactMode,
        showCharCounters: state.showCharCounters,
        sendConfirmMode: state.sendConfirmMode,
        previewTheme: state.previewTheme,
        showTimestamps: state.showTimestamps,
        animationsEnabled: state.animationsEnabled,
      }),
    },
  ),
);
