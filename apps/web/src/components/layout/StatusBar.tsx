'use client';

import { useMessageStore } from '@/store/message.store';
import { useWebhookStore } from '@/store/webhook.store';
import { useUIStore } from '@/store/ui.store';
import { Layers, FileText, Hash, Keyboard, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatusBar() {
  const message       = useMessageStore((s) => s.message);
  const isSending     = useWebhookStore((s) => s.isSending);
  const lastError     = useWebhookStore((s) => s.lastError);
  const lastSentAt    = useWebhookStore((s) => s.lastSentAt);
  const activeWebhook = useWebhookStore((s) => s.webhooks.find((w) => w.id === s.activeWebhookId));
  const activeSection = useUIStore((s) => s.activeSection);

  const embedCount   = message.embeds?.length ?? 0;
  const fieldCount   = message.embeds?.reduce((a, e) => a + (e.fields?.length ?? 0), 0) ?? 0;
  const charCount    = message.content?.length ?? 0;
  const hasWebhook   = Boolean(activeWebhook);

  const lastSentFormatted = lastSentAt
    ? new Date(lastSentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div
      className="flex items-center gap-4 px-4 h-7 flex-shrink-0 text-[10px] font-medium"
      style={{
        background: 'hsl(var(--card) / 0.8)',
        borderTop: '1px solid hsl(var(--border) / 0.4)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Webhook status */}
      <div className={cn('flex items-center gap-1.5', hasWebhook ? 'text-emerald-400' : 'text-muted-foreground/50')}>
        {hasWebhook ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span>{hasWebhook ? activeWebhook!.name : 'No webhook'}</span>
      </div>

      <div className="w-px h-3.5" style={{ background: 'hsl(var(--border) / 0.6)' }} />

      {/* Stats */}
      {charCount > 0 && (
        <div className="flex items-center gap-1 text-muted-foreground/70">
          <FileText className="w-3 h-3" />
          <span>{charCount} chars</span>
        </div>
      )}

      {embedCount > 0 && (
        <div className="flex items-center gap-1 text-muted-foreground/70">
          <Layers className="w-3 h-3" />
          <span>{embedCount} embed{embedCount !== 1 ? 's' : ''}{fieldCount > 0 ? ` · ${fieldCount} field${fieldCount !== 1 ? 's' : ''}` : ''}</span>
        </div>
      )}

      {/* Sending indicator */}
      {isSending && (
        <div className="flex items-center gap-1.5 text-primary">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>Sending…</span>
        </div>
      )}

      {/* Last sent */}
      {lastSentFormatted && !isSending && !lastError && (
        <div className="text-emerald-400/80">
          ✓ Sent at {lastSentFormatted}
        </div>
      )}

      {/* Error */}
      {lastError && !isSending && (
        <div className="text-red-400/80 truncate max-w-[200px]" title={lastError}>
          ✕ {lastError}
        </div>
      )}

      <div className="flex-1" />

      {/* Section indicator */}
      <div className="flex items-center gap-1 text-muted-foreground/40">
        <Hash className="w-3 h-3" />
        <span className="capitalize">{activeSection}</span>
      </div>

      <div className="w-px h-3.5" style={{ background: 'hsl(var(--border) / 0.6)' }} />

      {/* Keyboard hint */}
      <div className="flex items-center gap-1 text-muted-foreground/30">
        <Keyboard className="w-3 h-3" />
        <span>Ctrl+S to save draft</span>
      </div>
    </div>
  );
}
