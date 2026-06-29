'use client';

import { useState } from 'react';
import {
  Webhook, Plus, ChevronDown, Check, Trash2,
  Wifi, WifiOff, Loader2, Copy, CheckCircle2,
} from 'lucide-react';
import { useWebhookStore } from '@/store/webhook.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { testWebhook } from '@/lib/webhook-client';
import { WebhookUrlSchema } from '@hookcraft/shared';
import { cn } from '@/lib/utils';

export function WebhookPanel() {
  const { webhooks, activeWebhookId, addWebhook, removeWebhook, setActiveWebhook } = useWebhookStore();
  const [showAdd, setShowAdd]       = useState(false);
  const [newName, setNewName]       = useState('');
  const [newUrl, setNewUrl]         = useState('');
  const [urlError, setUrlError]     = useState('');
  const [testing, setTesting]       = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [copied, setCopied]         = useState(false);

  const activeWebhook = webhooks.find((w) => w.id === activeWebhookId);

  async function handleAdd() {
    const parsed = WebhookUrlSchema.safeParse(newUrl.trim());
    if (!parsed.success) {
      setUrlError(parsed.error.errors[0]?.message ?? 'Invalid URL');
      return;
    }
    const id = addWebhook(newName.trim() || 'My Webhook', newUrl.trim());
    setActiveWebhook(id);
    setNewName(''); setNewUrl(''); setUrlError('');
    setShowAdd(false);
  }

  async function handleTest() {
    const url = useWebhookStore.getState().getActiveWebhookUrl();
    if (!url) return;
    setTesting(true);
    const result = await testWebhook(url);
    setTestStatus(result.ok ? 'ok' : 'fail');
    setTesting(false);
    setTimeout(() => setTestStatus('idle'), 3500);
  }

  function handleCopy() {
    const url = useWebhookStore.getState().getActiveWebhookUrl();
    if (url) { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  const statusColor = testStatus === 'ok' ? '#23a55a' : testStatus === 'fail' ? '#ed4245' : undefined;
  const statusLabel = testStatus === 'ok' ? 'Online' : testStatus === 'fail' ? 'Unreachable' : undefined;

  return (
    <>
      <div className="space-y-1.5">
        {/* Selector */}
        {webhooks.length === 0 ? (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed text-xs text-muted-foreground transition-all duration-150 group"
            style={{ borderColor: 'hsl(var(--border) / 0.6)' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--border) / 0.6)')}
          >
            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Plus className="w-3 h-3 text-primary" />
            </div>
            <span className="group-hover:text-primary transition-colors">Add webhook URL</span>
          </button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all text-left group"
                style={{ background: 'hsl(var(--muted) / 0.4)', border: '1px solid hsl(var(--border) / 0.5)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--muted) / 0.7)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--muted) / 0.4)')}
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(var(--primary) / 0.15)' }}
                >
                  <Webhook className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="flex-1 text-xs font-semibold text-foreground truncate">
                  {activeWebhook?.name ?? 'Select webhook'}
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64 rounded-xl shadow-xl" align="start"
              style={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
            >
              <div className="px-2 pt-2 pb-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 px-1">
                  Saved Webhooks
                </p>
              </div>

              {webhooks.map((wh) => (
                <DropdownMenuItem
                  key={wh.id}
                  className="flex items-center gap-2 text-sm cursor-pointer rounded-lg mx-1 mb-0.5"
                  onClick={() => setActiveWebhook(wh.id)}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                    wh.id === activeWebhookId ? 'bg-primary/20' : 'bg-transparent',
                  )}>
                    {wh.id === activeWebhookId && <Check className="w-3 h-3 text-primary" />}
                  </div>
                  <span className="flex-1 truncate">{wh.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeWebhook(wh.id); }}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator style={{ background: 'hsl(var(--border) / 0.5)' }} />

              {/* Test + Copy row */}
              {activeWebhook && (
                <div className="px-2 py-1 flex gap-1.5">
                  <button
                    onClick={handleTest}
                    disabled={testing}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                    style={{
                      background: testStatus === 'ok' ? '#23a55a20' : testStatus === 'fail' ? '#ed424520' : 'hsl(var(--muted) / 0.6)',
                      color: statusColor ?? 'hsl(var(--muted-foreground))',
                    }}
                  >
                    {testing
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : testStatus === 'ok' ? <Wifi className="w-3 h-3" />
                      : testStatus === 'fail' ? <WifiOff className="w-3 h-3" />
                      : <Wifi className="w-3 h-3" />
                    }
                    {testing ? 'Testing…' : statusLabel ?? 'Test'}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-all"
                    style={{ background: 'hsl(var(--muted) / 0.6)', color: 'hsl(var(--muted-foreground))' }}
                  >
                    {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}

              <DropdownMenuItem onClick={() => setShowAdd(true)} className="text-sm gap-2 mx-1 mb-1 rounded-lg">
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary font-medium">Add webhook</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Add webhook dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md rounded-2xl"
          style={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'hsl(var(--primary) / 0.15)', border: '1px solid hsl(var(--primary) / 0.2)' }}
              >
                <Webhook className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Add Webhook</DialogTitle>
                <DialogDescription className="text-xs">Connect a Discord webhook URL to send messages.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="field-group">
              <label className="field-label">Nickname</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. My Server Webhook"
                className="bg-input border-border/60 rounded-xl focus:border-primary/50"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>

            {/* URL */}
            <div className="field-group">
              <label className="field-label">Webhook URL</label>
              <Input
                value={newUrl}
                onChange={(e) => { setNewUrl(e.target.value); setUrlError(''); }}
                placeholder="https://discord.com/api/webhooks/…"
                className={cn(
                  'bg-input border-border/60 font-mono text-xs rounded-xl focus:border-primary/50',
                  urlError && 'border-destructive/60 focus:border-destructive',
                )}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              {urlError
                ? <p className="text-xs text-destructive">{urlError}</p>
                : <p className="text-xs text-muted-foreground/60">Stored locally in your browser. Never sent to our servers.</p>
              }
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="ghost" onClick={() => { setShowAdd(false); setUrlError(''); }}>Cancel</Button>
              <Button onClick={handleAdd} className="gap-1.5">
                <Plus className="w-4 h-4" /> Add Webhook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
