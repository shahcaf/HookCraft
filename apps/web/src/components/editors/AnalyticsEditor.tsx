'use client';

import { BarChart3, TrendingUp, Activity } from 'lucide-react';
import { useWebhookStore } from '@/store/webhook.store';

export function AnalyticsEditor() {
  const history = useWebhookStore((s) => (s as any).history ?? []);

  const total = history.length;
  const successes = history.filter((h: any) => h.status >= 200 && h.status < 300).length;
  const failures = total - successes;
  const avgLatency =
    total > 0
      ? Math.round(history.reduce((acc: number, h: any) => acc + (h.latency ?? 0), 0) / total)
      : 0;

  const stats = [
    { label: 'Total Sent', value: total, color: '#5865f2', icon: Activity },
    { label: 'Successful', value: successes, color: '#57f287', icon: TrendingUp },
    { label: 'Failed', value: failures, color: '#ed4245', icon: BarChart3 },
    { label: 'Avg Latency', value: `${avgLatency}ms`, color: '#f0b232', icon: Activity },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* Header */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-[#57f287]/20 bg-[#57f287]/5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #57f287 0%, #3bc970 100%)', boxShadow: '0 0 20px #57f28740' }}>
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Analytics</p>
            <p className="text-xs text-muted-foreground mt-0.5">Webhook delivery statistics from your session.</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="p-3.5 rounded-xl border border-border/60 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
              </div>
              <p className="text-2xl font-bold text-foreground" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {total === 0 && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <p className="text-sm text-muted-foreground">No webhook data yet.</p>
            <p className="text-xs text-muted-foreground/60">Send your first webhook to see analytics here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
