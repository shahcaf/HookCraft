'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/store/ui.store';
import { useMessageStore } from '@/store/message.store';
import { ContentEditor }    from '@/components/editors/ContentEditor';
import { ProfileEditor }    from '@/components/editors/ProfileEditor';
import { EmbedListEditor }  from '@/components/editors/EmbedListEditor';
import { ComponentsEditor } from '@/components/editors/ComponentsEditor';
import { AttachmentEditor } from '@/components/editors/AttachmentEditor';
import { PollEditor }       from '@/components/editors/PollEditor';
import { JsonEditor }       from '@/components/editors/JsonEditor';
import { TemplatesEditor }  from '@/components/editors/TemplatesEditor';
import { AiGeneratorEditor } from '@/components/editors/AiGeneratorEditor';
import { StaffApplyEditor } from '@/components/editors/StaffApplyEditor';
import { SchedulerEditor }  from '@/components/editors/SchedulerEditor';
import { AnalyticsEditor }  from '@/components/editors/AnalyticsEditor';
import { HistoryEditor }    from '@/components/editors/HistoryEditor';
import { Button } from '@/components/ui/button';
import {
  MessageSquare, User, Layers, MousePointer2, Paperclip,
  BarChart2, Code2, LayoutTemplate, RotateCcw, Trash2, Wand2,
  Users, Calendar, BarChart3, History,
} from 'lucide-react';

import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const SECTION_META: Record<string, { label: string; icon: React.ElementType; description: string; color: string }> = {
  content:     { label: 'Content',     icon: MessageSquare, description: 'Message text & options',   color: '#5865f2' },
  profile:     { label: 'Profile',     icon: User,          description: 'Bot name & avatar',        color: '#57f287' },
  embeds:      { label: 'Embeds',      icon: Layers,        description: 'Rich embed cards',         color: '#f0b232' },
  components:  { label: 'Components',  icon: MousePointer2, description: 'Buttons & select menus',   color: '#00b0f4' },
  attachments: { label: 'Attachments', icon: Paperclip,     description: 'Files, images & videos',   color: '#eb459e' },
  poll:        { label: 'Poll',        icon: BarChart2,     description: 'Interactive poll',          color: '#fee75c' },
  json:        { label: 'JSON Editor', icon: Code2,         description: 'Raw payload & import/export', color: '#9b59b6' },
  'ai-generator': { label: 'AI Generator', icon: Wand2,         description: 'AI-powered message creation', color: '#10b981' },
  'staff-apply':  { label: 'Staff Apply',  icon: Users,         description: 'Apply for Discord or Media staff', color: '#eb459e' },
  templates:   { label: 'Templates',   icon: LayoutTemplate, description: 'Starter presets & personas', color: '#a78bfa' },
  scheduler:   { label: 'Scheduler',   icon: Calendar,       description: 'Schedule webhook delivery', color: '#f0b232' },
  analytics:   { label: 'Analytics',   icon: BarChart3,      description: 'Delivery statistics', color: '#57f287' },
  history:     { label: 'History',     icon: History,        description: 'Webhook delivery log', color: '#9b59b6' },
};


const EDITOR_MAP = {
  content:       ContentEditor,
  profile:       ProfileEditor,
  embeds:        EmbedListEditor,
  components:    ComponentsEditor,
  attachments:   AttachmentEditor,
  poll:          PollEditor,
  json:          JsonEditor,
  'ai-generator': AiGeneratorEditor,
  'staff-apply': StaffApplyEditor,
  templates:     TemplatesEditor,
  scheduler:     SchedulerEditor,
  analytics:     AnalyticsEditor,
  history:       HistoryEditor,
} as const;

export function CenterEditor() {
  const activeSection = useUIStore((s) => s.activeSection);
  const compactMode = useUIStore((s) => s.compactMode);
  const animationsEnabled = useUIStore((s) => s.animationsEnabled);
  const { undo, canUndo, redo, canRedo } = useMessageStore();
  const ActiveEditor  = EDITOR_MAP[activeSection];
  const meta          = SECTION_META[activeSection];
  const Icon          = meta.icon;

  function handleClear() {
    if (confirm('Clear the entire message payload? This cannot be undone.')) {
      useMessageStore.getState().setMessage({});
    }
  }

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", compactMode && "compact-mode")}>
      {/* ── Panel header ── */}
      <TooltipProvider delayDuration={400}>
        <div className="panel-header justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-none">{meta.label}</p>
              <p className="text-[10px] text-muted-foreground/60 leading-none mt-0.5 hidden sm:block">{meta.description}</p>
            </div>
          </div>

          {/* Quick actions — only for content editors */}
          {activeSection !== 'json' && activeSection !== 'templates' && (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"
                    disabled={!canUndo} onClick={undo}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo last change</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:text-destructive"
                    onClick={handleClear}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear all content</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </TooltipProvider>

      {/* ── Editor content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={animationsEnabled ? { opacity: 0, x: 10 } : undefined}
          animate={{ opacity: 1, x: 0 }}
          exit={animationsEnabled ? { opacity: 0, x: -10 } : undefined}
          transition={animationsEnabled ? { duration: 0.16, ease: [0.4, 0, 0.2, 1] } : { duration: 0 }}
          className="flex-1 overflow-y-auto"
        >
          <ActiveEditor />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
