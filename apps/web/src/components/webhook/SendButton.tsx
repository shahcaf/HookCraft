'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Check, X, ChevronDown, Edit2, Trash2, Zap } from 'lucide-react';
import { useMessageStore } from '@/store/message.store';
import { useWebhookStore } from '@/store/webhook.store';
import { sendWebhookMessage, editWebhookMessage, deleteWebhookMessage } from '@/lib/webhook-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

type SendMode = 'send' | 'edit' | 'delete';

const MODE_CONFIG = {
  send:   { label: 'Send',   icon: Send,    color: 'from-violet-600 to-indigo-600', hoverColor: 'from-violet-500 to-indigo-500' },
  edit:   { label: 'Edit',   icon: Edit2,   color: 'from-amber-600 to-orange-600',  hoverColor: 'from-amber-500 to-orange-500' },
  delete: { label: 'Delete', icon: Trash2,  color: 'from-red-600 to-rose-600',      hoverColor: 'from-red-500 to-rose-500' },
};

export function SendButton() {
  const { message } = useMessageStore();
  const { activeWebhookId, getActiveWebhookUrl, targetMessageId, setTargetMessageId, setSending, setLastError, recordSent, isSending } = useWebhookStore();
  const { toast } = useToast();
  const [status, setStatus]               = useState<'idle' | 'success' | 'error'>('idle');
  const [mode, setMode]                   = useState<SendMode>('send');
  const [showDialog, setShowDialog]       = useState(false);
  const [editMessageId, setEditMessageId] = useState('');

  const webhookUrl = getActiveWebhookUrl();
  const cfg = MODE_CONFIG[mode];
  const ModeIcon = isSending ? Loader2 : status === 'success' ? Check : status === 'error' ? X : cfg.icon;

  const bgClass = status === 'success'
    ? 'from-emerald-600 to-green-600'
    : status === 'error'
    ? 'from-red-600 to-rose-600'
    : cfg.color;

  async function execute(selectedMode: SendMode = mode) {
    if (!webhookUrl) {
      toast({ title: '⚠ No webhook selected', description: 'Add and select a webhook URL first.', variant: 'destructive' });
      return;
    }
    if ((selectedMode === 'edit' || selectedMode === 'delete') && !targetMessageId) {
      setMode(selectedMode);
      setShowDialog(true);
      return;
    }

    setSending(true);
    setLastError(null);

    let result;
    if (selectedMode === 'send') {
      result = await sendWebhookMessage({ webhookUrl, message });
    } else if (selectedMode === 'edit') {
      result = await editWebhookMessage({ webhookUrl, messageId: targetMessageId, message });
    } else {
      result = await deleteWebhookMessage({ webhookUrl, messageId: targetMessageId });
    }

    setSending(false);

    if (result.ok) {
      setStatus('success');
      recordSent();
      toast({
        title: selectedMode === 'send' ? '✓ Message sent!' : selectedMode === 'edit' ? '✓ Message updated!' : '✓ Message deleted!',
        description: result.messageId ? `Message ID: ${result.messageId}` : undefined,
      });
    } else {
      setStatus('error');
      setLastError(result.error ?? 'Unknown error');
      toast({ title: '✕ Failed to send', description: result.error ?? 'Unknown error', variant: 'destructive' });
    }

    setTimeout(() => setStatus('idle'), 3000);
  }

  return (
    <>
      <div className="flex items-center shadow-lg"
        style={{ boxShadow: '0 0 20px hsl(252 87% 67% / 0.2)' }}
      >
        {/* Main button */}
        <motion.button
          onClick={() => execute()}
          disabled={isSending || !activeWebhookId}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'relative flex items-center gap-2 pl-3.5 pr-3 py-2 rounded-l-xl text-sm font-semibold text-white overflow-hidden',
            'disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200',
          )}
          style={{
            background: `linear-gradient(135deg, ${bgClass.includes('violet') ? '#7c3aed' : bgClass.includes('emerald') ? '#059669' : bgClass.includes('red') ? '#dc2626' : '#7c3aed'}, ${bgClass.includes('indigo') ? '#4f46e5' : bgClass.includes('green') ? '#16a34a' : bgClass.includes('rose') ? '#e11d48' : '#4f46e5'})`,
          }}
        >
          {/* Shine sweep */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)' }}
          />
          <ModeIcon className={cn('w-4 h-4 relative z-10', isSending && 'animate-spin')} />
          <span className="relative z-10">{isSending ? 'Sending…' : cfg.label}</span>
        </motion.button>

        {/* Divider */}
        <div className="w-px h-8 bg-white/20" style={{ background: 'rgba(255,255,255,0.15)' }} />

        {/* Dropdown chevron */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={isSending}
              className="flex items-center justify-center w-8 h-full rounded-r-xl py-2 text-white transition-all duration-150 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl"
            style={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
          >
            <div className="px-2 pt-2 pb-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 px-1">Send Mode</p>
            </div>
            {(['send', 'edit', 'delete'] as SendMode[]).map((m) => {
              const c = MODE_CONFIG[m];
              const Icon = c.icon;
              return (
                <DropdownMenuItem key={m}
                  onClick={() => { setMode(m); execute(m); }}
                  className={cn(
                    'flex items-center gap-2.5 text-sm rounded-lg mx-1 mb-0.5 cursor-pointer',
                    m === 'delete' && 'text-destructive focus:text-destructive',
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{c.label} {m === 'send' ? 'new message' : m === 'edit' ? 'existing' : 'message'}</span>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator style={{ background: 'hsl(var(--border) / 0.5)' }} />
            <div className="px-3 py-2">
              <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
                Edit/Delete requires a Message ID
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit/Delete ID dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm rounded-2xl"
          style={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: mode === 'delete' ? 'hsl(0 72% 55% / 0.15)' : 'hsl(38 92% 50% / 0.15)' }}
              >
                {mode === 'edit' ? <Edit2 className="w-4 h-4 text-amber-400" /> : <Trash2 className="w-4 h-4 text-red-400" />}
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  {mode === 'edit' ? 'Edit Message' : 'Delete Message'}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Enter the Discord message ID to {mode}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="field-group">
              <label className="field-label">Message ID</label>
              <Input
                value={editMessageId}
                onChange={(e) => setEditMessageId(e.target.value)}
                placeholder="1234567890123456789"
                className="bg-input border-border/60 font-mono text-sm rounded-xl focus:border-primary/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editMessageId) {
                    setTargetMessageId(editMessageId);
                    setShowDialog(false);
                    execute(mode);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground/60">
                Right-click a Discord message → Copy Message Link, then extract the ID at the end.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button
                variant={mode === 'delete' ? 'destructive' : 'default'}
                disabled={!editMessageId.trim()}
                onClick={() => {
                  setTargetMessageId(editMessageId);
                  setShowDialog(false);
                  execute(mode);
                }}
              >
                {mode === 'edit' ? 'Edit Message' : 'Delete Message'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
