'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, User, Layers, MousePointer2,
  Paperclip, BarChart2, Code2, LayoutTemplate, Wand2
} from 'lucide-react';
import { useUIStore, type ActiveSection } from '@/store/ui.store';
import { useMessageStore } from '@/store/message.store';
import { cn } from '@/lib/utils';
import { WebhookPanel } from '@/components/webhook/WebhookPanel';

const SECTIONS: { id: ActiveSection; label: string; icon: React.ElementType; hint?: string }[] = [
  { id: 'content',     label: 'Content',     icon: MessageSquare, hint: 'Text & mentions' },
  { id: 'profile',     label: 'Profile',     icon: User,          hint: 'Name & avatar' },
  { id: 'embeds',      label: 'Embeds',      icon: Layers,        hint: 'Rich cards' },
  { id: 'components',  label: 'Components',  icon: MousePointer2, hint: 'Buttons & selects' },
  { id: 'attachments', label: 'Attachments', icon: Paperclip,     hint: 'Files & images' },
  { id: 'poll',        label: 'Poll',        icon: BarChart2,     hint: 'Interactive poll' },
  { id: 'json',        label: 'JSON',        icon: Code2,         hint: 'Raw payload' },
  { id: 'ai-generator',label: 'AI Generator',icon: Wand2,         hint: 'Generate messages' },
  { id: 'templates',   label: 'Templates',   icon: LayoutTemplate, hint: 'Starter presets' },
];

export function LeftSidebar() {
  const { activeSection, setActiveSection } = useUIStore();
  const embeds      = useMessageStore((s) => s.message.embeds);
  const components  = useMessageStore((s) => s.message.components);
  const poll        = useMessageStore((s) => s.message.poll);
  const attachments = useMessageStore((s) => s.message.attachments);

  function getBadge(id: ActiveSection): number | null {
    if (id === 'embeds')      return (embeds?.length ?? 0) || null;
    if (id === 'components')  return (components?.length ?? 0) || null;
    if (id === 'attachments') return (attachments?.length ?? 0) || null;
    if (id === 'poll')        return poll ? 1 : null;
    return null;
  }

  const mainSections  = SECTIONS.filter((s) => s.id !== 'templates' && s.id !== 'json');
  const bottomSections = SECTIONS.filter((s) => s.id === 'templates' || s.id === 'json');

  return (
    <div className="flex flex-col h-full w-[220px] py-3 overflow-y-auto no-scrollbar"
      style={{ background: 'hsl(var(--card) / 0.6)', borderRight: '1px solid hsl(var(--border) / 0.5)' }}
    >
      {/* Webhook Selector */}
      <div className="px-3 mb-3">
        <WebhookPanel />
      </div>

      {/* Separator */}
      <div className="section-sep mx-3" />

      {/* Message label */}
      <div className="px-4 mb-1.5 mt-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
          Message
        </p>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 px-2">
        {mainSections.map((section) => {
          const Icon    = section.icon;
          const badge   = getBadge(section.id);
          const isActive = activeSection === section.id;

          return (
            <motion.button
              key={section.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveSection(section.id)}
              className={cn('nav-item', isActive && 'active')}
            >
              <Icon className={cn('w-4 h-4 nav-icon flex-shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className="flex-1 text-left text-sm">{section.label}</span>
              {badge !== null && (
                <span className={cn(
                  'text-[10px] font-bold rounded-full px-1.5 min-w-[18px] text-center leading-5',
                  isActive ? 'bg-primary/25 text-primary' : 'bg-muted text-muted-foreground',
                )}>
                  {badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Separator */}
      <div className="section-sep mx-3 my-2" />

      {/* Tools label */}
      <div className="px-4 mb-1.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
          Tools
        </p>
      </div>

      {/* Bottom nav (Templates + JSON) */}
      <nav className="flex flex-col gap-0.5 px-2 pb-2">
        {bottomSections.map((section) => {
          const Icon    = section.icon;
          const isActive = activeSection === section.id;

          return (
            <motion.button
              key={section.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveSection(section.id)}
              className={cn('nav-item', isActive && 'active')}
            >
              <Icon className={cn('w-4 h-4 nav-icon flex-shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className="flex-1 text-left text-sm">{section.label}</span>
              {section.id === 'templates' && (
                <span className="text-[9px] font-bold rounded-full px-1.5 py-0.5 bg-violet-500/20 text-violet-400">
                  NEW
                </span>
              )}
              {section.id === 'ai-generator' && (
                <span className="text-[9px] font-bold rounded-full px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
