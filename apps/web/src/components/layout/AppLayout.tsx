'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LeftSidebar }       from './LeftSidebar';
import { CenterEditor }      from './CenterEditor';
import { RightPanel }        from './RightPanel';
import { TopBar }            from './TopBar';
import { StatusBar }         from './StatusBar';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { useUIStore }        from '@/store/ui.store';

export function AppLayout() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

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
