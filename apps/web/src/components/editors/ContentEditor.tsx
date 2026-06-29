'use client';

import { useDebounce } from 'use-debounce';
import { useEffect, useState } from 'react';
import { useMessageStore } from '@/store/message.store';
import { EditorSection } from '@/components/ui/EditorSection';
import { CharCounter } from '@/components/ui/CharCounter';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, AtSign, Hash, Bold, Italic, Code, Quote, Strikethrough, Underline } from 'lucide-react';
import { cn } from '@/lib/utils';

const MD_SHORTCUTS = [
  { label: 'B', title: 'Bold', wrap: '**', icon: Bold },
  { label: 'I', title: 'Italic', wrap: '*', icon: Italic },
  { label: 'U', title: 'Underline', wrap: '__', icon: Underline },
  { label: 'S', title: 'Strikethrough', wrap: '~~', icon: Strikethrough },
  { label: '`', title: 'Inline Code', wrap: '`', icon: Code },
  { label: '> ', title: 'Blockquote', prefix: '> ', icon: Quote },
];

function insertMarkdown(
  value: string,
  selStart: number,
  selEnd: number,
  wrap?: string,
  prefix?: string,
): { text: string; cursor: [number, number] } {
  const selected = value.slice(selStart, selEnd);
  if (wrap) {
    const text = value.slice(0, selStart) + wrap + selected + wrap + value.slice(selEnd);
    const start = selStart + wrap.length;
    return { text, cursor: [start, start + selected.length] };
  }
  if (prefix) {
    const text = value.slice(0, selStart) + prefix + selected + value.slice(selEnd);
    return { text, cursor: [selStart + prefix.length, selStart + prefix.length + selected.length] };
  }
  return { text: value, cursor: [selStart, selEnd] };
}

export function ContentEditor() {
  const { message, setContent, setTts, setFlags, setThreadId } = useMessageStore();
  const [localContent, setLocalContent] = useState(message.content ?? '');
  const [debouncedContent] = useDebounce(localContent, 200);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  useEffect(() => { setContent(debouncedContent); }, [debouncedContent, setContent]);
  useEffect(() => { setLocalContent(message.content ?? ''); }, []); // eslint-disable-line

  function applyShortcut(wrap?: string, prefix?: string) {
    if (!textareaRef) return;
    const { selectionStart: s, selectionEnd: e } = textareaRef;
    const { text, cursor } = insertMarkdown(localContent, s, e, wrap, prefix);
    setLocalContent(text);
    // restore selection after state update
    requestAnimationFrame(() => {
      textareaRef.focus();
      textareaRef.setSelectionRange(cursor[0], cursor[1]);
    });
  }

  const charPct = (localContent.length / 2000) * 100;

  return (
    <div className="p-4 space-y-4">
      <EditorSection
        title="Message Content"
        icon={<MessageSquare className="w-4 h-4" />}
        description="The text body of the webhook message"
      >
        <div className="space-y-2">
          {/* Toolbar */}
          <div className="flex items-center gap-0.5 p-1 rounded-lg"
            style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border) / 0.4)' }}
          >
            {MD_SHORTCUTS.map((s) => {
              const Icon = s.icon;
              return (
                <button key={s.label}
                  title={s.title}
                  onMouseDown={(e) => { e.preventDefault(); applyShortcut(s.wrap, s.prefix); }}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
            <div className="flex-1" />
            <span className="text-[10px] text-muted-foreground/50 pr-1 hidden sm:block">
              Markdown supported
            </span>
          </div>

          {/* Textarea */}
          <div className="relative">
            <Textarea
              ref={(el) => setTextareaRef(el)}
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              placeholder="Type your message… (supports Discord markdown)"
              className="min-h-[160px] resize-none font-mono text-sm bg-input border-border/60 focus:border-primary/50 rounded-xl leading-relaxed"
              maxLength={2000}
            />
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${charPct}%`,
                  background: charPct > 90 ? '#ed4245' : charPct > 70 ? '#f0b232' : 'hsl(var(--primary))',
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground/60">
              **bold** · *italic* · `code` · &gt; quote · ||spoiler||
            </p>
            <CharCounter current={localContent.length} max={2000} />
          </div>
        </div>
      </EditorSection>

      {/* Options */}
      <EditorSection
        title="Options"
        icon={<AtSign className="w-4 h-4" />}
        defaultOpen={false}
      >
        <div className="space-y-1">
          {/* TTS */}
          <div className="flex items-center justify-between px-1 py-2.5 rounded-lg hover:bg-muted/30 transition-colors">
            <div>
              <p className="text-sm font-medium text-foreground">Text-to-Speech</p>
              <p className="text-xs text-muted-foreground">Reads the message aloud in voice channels</p>
            </div>
            <Switch checked={message.tts ?? false} onCheckedChange={setTts} />
          </div>

          {/* Suppress Embeds */}
          <div className="flex items-center justify-between px-1 py-2.5 rounded-lg hover:bg-muted/30 transition-colors"
            style={{ borderTop: '1px solid hsl(var(--border) / 0.4)' }}
          >
            <div>
              <p className="text-sm font-medium text-foreground">Suppress Embeds</p>
              <p className="text-xs text-muted-foreground">Hide URL link previews in the message</p>
            </div>
            <Switch
              checked={Boolean(message.flags && message.flags & 4)}
              onCheckedChange={(v) => setFlags(v ? (message.flags ?? 0) | 4 : (message.flags ?? 0) & ~4)}
            />
          </div>
        </div>
      </EditorSection>

      {/* Thread */}
      <EditorSection
        title="Thread / Forum"
        icon={<Hash className="w-4 h-4" />}
        defaultOpen={false}
      >
        <div className="space-y-3">
          <div className="field-group">
            <div className="flex items-center justify-between">
              <Label className="field-label">Thread ID</Label>
              <span className="text-[10px] text-muted-foreground/50">Optional</span>
            </div>
            <Input
              value={message.thread_id ?? ''}
              onChange={(e) => setThreadId(e.target.value)}
              placeholder="1234567890123456789"
              className="bg-input border-border/60 font-mono text-sm rounded-xl focus:border-primary/50"
            />
          </div>
          <div className="field-group">
            <Label className="field-label">Thread / Forum Post Name</Label>
            <Input
              value={message.thread_name ?? ''}
              onChange={(e) => useMessageStore.getState().setMessage({ ...message, thread_name: e.target.value })}
              placeholder="Post title (for forum channels)"
              className="bg-input border-border/60 text-sm rounded-xl focus:border-primary/50"
            />
          </div>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Use Thread ID to send into an existing thread, or Thread Name to create a new forum post.
          </p>
        </div>
      </EditorSection>
    </div>
  );
}
