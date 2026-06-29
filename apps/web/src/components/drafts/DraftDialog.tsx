'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, FileText, Trash2, Copy, Clock, FolderOpen, Plus, Search, Pencil } from 'lucide-react';
import { useWebhookStore } from '@/store/webhook.store';
import { useMessageStore } from '@/store/message.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function DraftDialog() {
  const [open, setOpen]               = useState(false);
  const [newName, setNewName]         = useState('');
  const [search, setSearch]           = useState('');
  const [renamingId, setRenamingId]   = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const { drafts, saveDraft, loadDraft, deleteDraft, renameDraft, duplicateDraft } = useWebhookStore();
  const { message, setMessage } = useMessageStore();

  const filtered = drafts.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSave() {
    saveDraft(newName.trim() || `Draft ${drafts.length + 1}`, message);
    setNewName('');
  }

  function handleLoad(id: string) {
    const draft = loadDraft(id);
    if (draft) { setMessage(draft.message); setOpen(false); }
  }

  function startRename(id: string, current: string) {
    setRenamingId(id); setRenameValue(current);
  }

  function commitRename(id: string) {
    if (renameValue.trim()) renameDraft(id, renameValue.trim());
    setRenamingId(null);
  }

  const embedCount = (msg: typeof message) => msg.embeds?.length ?? 0;
  const charCount  = (msg: typeof message) => msg.content?.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/80 relative">
                <Save className="w-4 h-4" />
                {drafts.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-[8px] font-bold text-white flex items-center justify-center">
                    {drafts.length > 9 ? '9+' : drafts.length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Drafts (Ctrl+S to save)</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col rounded-2xl p-0 gap-0 overflow-hidden"
        style={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid hsl(var(--border) / 0.5)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(var(--primary) / 0.15)', border: '1px solid hsl(var(--primary) / 0.2)' }}
            >
              <FileText className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Drafts</DialogTitle>
              <DialogDescription className="text-xs">{drafts.length} saved draft{drafts.length !== 1 ? 's' : ''}</DialogDescription>
            </div>
          </div>

          {/* Save current */}
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Draft name…"
              className="bg-input border-border/60 rounded-xl focus:border-primary/50 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button onClick={handleSave} className="flex-shrink-0 gap-1.5 rounded-xl">
              <Save className="w-3.5 h-3.5" /> Save
            </Button>
          </div>
        </div>

        {/* Search */}
        {drafts.length > 3 && (
          <div className="px-5 py-2 flex-shrink-0"
            style={{ borderBottom: '1px solid hsl(var(--border) / 0.3)' }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${drafts.length} drafts…`}
                className="pl-8 h-8 text-xs bg-muted/40 border-border/40 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Draft list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'hsl(var(--muted) / 0.5)' }}
              >
                <FileText className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">
                  {search ? 'No matching drafts' : 'No drafts yet'}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {search ? 'Try a different search' : 'Save a draft to access it later'}
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((draft) => (
                <motion.div
                  key={draft.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="group flex items-center gap-3 p-3 rounded-xl border transition-all duration-150"
                  style={{
                    background: 'hsl(var(--card) / 0.5)',
                    border: '1px solid hsl(var(--border) / 0.5)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--border) / 0.5)')}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'hsl(var(--primary) / 0.1)' }}
                  >
                    <FileText className="w-4 h-4 text-primary/70" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleLoad(draft.id)}>
                    {renamingId === draft.id ? (
                      <Input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => commitRename(draft.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitRename(draft.id); if (e.key === 'Escape') setRenamingId(null); }}
                        className="h-6 text-sm px-1 py-0 border-none bg-transparent focus:bg-muted/40 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-sm font-semibold text-foreground truncate">{draft.name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground/60">
                        {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                      </span>
                      {embedCount(draft.message) > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/70 font-semibold">
                          {embedCount(draft.message)} embed{embedCount(draft.message) !== 1 ? 's' : ''}
                        </span>
                      )}
                      {charCount(draft.message) > 0 && (
                        <span className="text-[9px] text-muted-foreground/40">
                          {charCount(draft.message)} chars
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"
                      onClick={() => handleLoad(draft.id)} title="Load draft"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"
                      onClick={() => startRename(draft.id, draft.name)} title="Rename"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"
                      onClick={() => duplicateDraft(draft.id)} title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:text-destructive"
                      onClick={() => deleteDraft(draft.id)} title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
