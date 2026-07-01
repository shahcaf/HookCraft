'use client';

import { History, CheckCircle2, XCircle, Trash2, Clock } from 'lucide-react';
import { useWebhookStore } from '@/store/webhook.store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function HistoryEditor() {
  const history: any[] = useWebhookStore((s) => (s as any).history ?? []);
  const clearHistory = useWebhookStore((s) => (s as any).clearHistory);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-[#9b59b6]/20 bg-[#9b59b6]/5 flex-1 mr-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #9b59b6 0%, #7d3c98 100%)', boxShadow: '0 0 20px #9b59b640' }}>
              <History className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Delivery History</p>
              <p className="text-xs text-muted-foreground mt-0.5">{history.length} webhook{history.length !== 1 ? 's' : ''} sent this session.</p>
            </div>
          </div>
          {history.length > 0 && clearHistory && (
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive rounded-lg flex-shrink-0" onClick={clearHistory} title="Clear history">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-muted/50 border border-border/60">
              <Clock className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">No webhooks sent yet.</p>
            <p className="text-xs text-muted-foreground/60">Your delivery log will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...history].reverse().map((entry: any, i: number) => {
              const ok = entry.status >= 200 && entry.status < 300;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-3 p-3.5 rounded-xl border transition-colors',
                    ok
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-red-500/5 border-red-500/20',
                  )}
                >
                  {ok
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('text-xs font-semibold', ok ? 'text-emerald-400' : 'text-red-400')}>
                        HTTP {entry.status}
                      </p>
                      {entry.latency != null && (
                        <span className="text-[10px] text-muted-foreground/60 font-mono">{entry.latency}ms</span>
                      )}
                    </div>
                    {entry.url && (
                      <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{entry.url}</p>
                    )}
                    {entry.timestamp && (
                      <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
