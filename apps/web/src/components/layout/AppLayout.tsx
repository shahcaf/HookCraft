'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeftSidebar }       from './LeftSidebar';
import { CenterEditor }      from './CenterEditor';
import { RightPanel }        from './RightPanel';
import { TopBar }            from './TopBar';
import { StatusBar }         from './StatusBar';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { useUIStore }        from '@/store/ui.store';

/** Converts a #rrggbb hex to "H S% L%" for CSS HSL variables */
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function AppLayout() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const accentColor      = useUIStore((s) => s.accentColor);

  // Apply accent color to CSS custom properties on every change
  useEffect(() => {
    if (!accentColor || !accentColor.startsWith('#') || accentColor.length < 7) return;
    try {
      const hsl = hexToHsl(accentColor);
      const root = document.documentElement;
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--ring', hsl);
      root.style.setProperty('--glow-primary', hsl);
      root.style.setProperty('--accent', `${hsl.split(' ')[0]} 65% 16%`);
    } catch {}
  }, [accentColor]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Global keyboard shortcuts (invisible) */}
      <KeyboardShortcuts />

      {/* Top bar */}
      <TopBar />

      {/* Main 3-panel body */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="flex-shrink-0 overflow-hidden"
            >
              <LeftSidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Editor */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden"
          style={{ borderRight: '1px solid hsl(var(--border) / 0.5)', borderLeft: '1px solid hsl(var(--border) / 0.5)' }}
        >
          <CenterEditor />
        </div>

        {/* Right Preview Panel */}
        <div className="flex-shrink-0 w-[460px] xl:w-[540px] 2xl:w-[600px] overflow-hidden">
          <RightPanel />
        </div>
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  );
}
