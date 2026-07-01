'use client';

import { Calendar, Clock, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SchedulerEditor() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* Header */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-[#f0b232]/20 bg-[#f0b232]/5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f0b232 0%, #e09000 100%)', boxShadow: '0 0 20px #f0b23240' }}>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Webhook Scheduler</p>
            <p className="text-xs text-muted-foreground mt-0.5">Schedule webhooks to fire at specific times or intervals.</p>
          </div>
        </div>

        {/* Coming soon */}
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-muted/50 border border-border/60">
            <Clock className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Scheduler Coming Soon</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Set up recurring webhooks, cron-style jobs, and one-shot delayed sends directly from HookCraft.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {['⏰ One-shot delay', '🔁 Recurring (cron)', '📅 Calendar view', '⚡ Instant retry'].map((f) => (
              <span key={f} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-muted/60 border border-border/50 text-muted-foreground">{f}</span>
            ))}
          </div>
          <Button disabled variant="outline" size="sm" className="rounded-xl gap-2 mt-2 opacity-50">
            <Plus className="w-3.5 h-3.5" /> New Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}
