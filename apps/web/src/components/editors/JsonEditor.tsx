'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Code2, Copy, Download, Check, AlertCircle, ChevronDown, Wand2 } from 'lucide-react';
import { useMessageStore } from '@/store/message.store';
import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/button';
import { stripClientIds } from '@/lib/utils';
import type { WebhookMessage } from '@hookcraft/shared';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
      <div className="shimmer w-8 h-8 rounded-full" />
    </div>
  ),
});

// ── Format converters ────────────────────────────────────────────────────────

/**
 * Attempts to detect and convert any of the supported formats to a Discord webhook payload.
 * Supported: native Discord, OpenAI ChatGPT response, Slack incoming webhook, plain text.
 */
function detectAndConvert(raw: unknown): { payload: WebhookMessage; format: string } | { error: string } {
  if (typeof raw !== 'object' || raw === null) {
    return { error: 'JSON must be an object.' };
  }

  const obj = raw as Record<string, unknown>;

  // ── 1. Native Discord webhook ─────────────────────────────────────────────
  const DISCORD_KEYS = new Set(['content', 'username', 'avatar_url', 'tts', 'embeds', 'components', 'attachments', 'poll', 'flags', 'thread_name']);
  const keys = Object.keys(obj);
  if (keys.some((k) => DISCORD_KEYS.has(k))) {
    return { payload: obj as WebhookMessage, format: 'Discord Webhook' };
  }

  // ── 2. OpenAI ChatGPT response format ─────────────────────────────────────
  // { choices: [{ message: { role, content } }], model, ... }
  if (obj.choices && Array.isArray(obj.choices) && obj.choices.length > 0) {
    const firstChoice = obj.choices[0] as Record<string, unknown>;
    const msg = firstChoice.message as Record<string, unknown> | undefined;
    const text = (msg?.content as string) || (firstChoice.text as string) || '';
    const model = (obj.model as string) || 'ChatGPT';
    return {
      format: 'OpenAI ChatGPT',
      payload: {
        username: 'ChatGPT',
        avatar_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png',
        embeds: [{
          title: `Response from ${model}`,
          description: text,
          color: 0x10a37f,
          footer: { text: `Model: ${model}` },
          timestamp: new Date().toISOString(),
        }],
      } as unknown as WebhookMessage,
    };
  }

  // ── 3. OpenAI Assistants API message format ───────────────────────────────
  // { role: "assistant", content: [{ type: "text", text: { value } }] }
  if (obj.role && Array.isArray(obj.content)) {
    const textBlock = (obj.content as Record<string, unknown>[]).find((b) => b.type === 'text');
    const textValue = textBlock ? ((textBlock.text as Record<string, unknown>)?.value as string) : '';
    return {
      format: 'OpenAI Assistants API',
      payload: {
        username: `AI ${String(obj.role)}`,
        avatar_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png',
        embeds: [{
          description: textValue,
          color: 0x10a37f,
          footer: { text: `Role: ${obj.role}` },
        }],
      } as unknown as WebhookMessage,
    };
  }

  // ── 4. Slack incoming webhook format ──────────────────────────────────────
  // { text, attachments: [{ fallback, color, pretext, title, text, fields }] }
  if ((obj.text || obj.attachments || obj.blocks) && !obj.content) {
    const slackText = (obj.text as string) || '';
    const slackAttachments = (obj.attachments as Record<string, unknown>[]) || [];

    const embeds = slackAttachments.map((att) => ({
      title: (att.title as string) || (att.fallback as string) || undefined,
      description: (att.text as string) || (att.pretext as string) || undefined,
      color: att.color ? parseInt((att.color as string).replace('#', ''), 16) : 0x5865f2,
      fields: (att.fields as { title: string; value: string; short?: boolean }[] || []).map((f) => ({
        name: f.title,
        value: f.value,
        inline: f.short ?? false,
      })),
    }));

    return {
      format: 'Slack Webhook',
      payload: {
        content: slackText || undefined,
        username: 'Slack Bot',
        embeds: embeds.length > 0 ? embeds : undefined,
      } as unknown as WebhookMessage,
    };
  }

  // ── 5. Generic message object  { role, content } ──────────────────────────
  if (obj.role && typeof obj.content === 'string') {
    return {
      format: 'Chat Message',
      payload: {
        content: obj.content,
        username: String(obj.role),
      } as unknown as WebhookMessage,
    };
  }

  return { error: 'Unrecognised format. Paste a Discord, OpenAI, or Slack JSON payload.' };
}

// ── Example payloads ─────────────────────────────────────────────────────────

const EXAMPLES: { label: string; format: string; json: object }[] = [
  {
    label: 'Discord Webhook',
    format: 'discord',
    json: {
      content: "Hello from HookCraft! 👋",
      username: "HookCraft Bot",
      avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png",
      embeds: [{ title: "Example Embed", description: "This is what an embed looks like.", color: 5765029, fields: [{ name: "Field 1", value: "Some value", inline: true }], footer: { text: "Sent via HookCraft" } }],
    },
  },
  {
    label: 'ChatGPT Response',
    format: 'openai',
    json: {
      id: "chatcmpl-abc123",
      object: "chat.completion",
      model: "gpt-4o",
      choices: [{
        index: 0,
        message: { role: "assistant", content: "Hello! I'm GPT-4o. How can I assist you today?" },
        finish_reason: "stop",
      }],
      usage: { prompt_tokens: 10, completion_tokens: 15, total_tokens: 25 },
    },
  },
  {
    label: 'OpenAI Assistants',
    format: 'openai-assistants',
    json: {
      id: "msg_abc123",
      object: "thread.message",
      role: "assistant",
      content: [{ type: "text", text: { value: "Here is the answer you requested from the Assistants API!", annotations: [] } }],
    },
  },
  {
    label: 'Slack Webhook',
    format: 'slack',
    json: {
      text: "Notification from Slack!",
      attachments: [{
        fallback: "Deploy successful",
        color: "#36a64f",
        title: "✅ Deploy Successful",
        text: "Your latest build was deployed to production.",
        fields: [{ title: "Environment", value: "Production", short: true }, { title: "Duration", value: "42s", short: true }],
      }],
    },
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function JsonEditor() {
  const { message, setMessage } = useMessageStore();
  const editorFontSize = useUIStore((s) => s.editorFontSize);
  const [localJson, setLocalJson] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const isExternalUpdate = useRef(false);

  // Sync store → editor
  useEffect(() => {
    if (isExternalUpdate.current) { isExternalUpdate.current = false; return; }
    try {
      const payload = stripClientIds(message as unknown as Record<string, unknown>);
      setLocalJson(JSON.stringify(payload, null, 2));
      setParseError(null);
    } catch {}
  }, [message]);

  const [debouncedJson] = useDebounce(localJson, 400);

  // Sync editor → store (with format detection)
  useEffect(() => {
    if (!debouncedJson) return;
    try {
      const parsed = JSON.parse(debouncedJson);
      const result = detectAndConvert(parsed);

      if ('error' in result) {
        setParseError(result.error);
        setDetectedFormat(null);
        return;
      }

      isExternalUpdate.current = true;
      setMessage(result.payload);
      setDetectedFormat(result.format);
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON');
      setDetectedFormat(null);
    }
  }, [debouncedJson]);

  function handleCopy() {
    navigator.clipboard.writeText(localJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([localJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hookcraft-payload.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadExample(example: typeof EXAMPLES[number]) {
    const str = JSON.stringify(example.json, null, 2);
    setLocalJson(str);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card/50 flex-shrink-0">
        <Code2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
          JSON Editor
        </span>

        {/* Detected format badge */}
        {detectedFormat && !parseError && (
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {detectedFormat}
          </span>
        )}

        {parseError && (
          <div className="flex items-center gap-1.5 text-xs text-destructive" title={parseError}>
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="max-w-[220px] truncate">{parseError}</span>
          </div>
        )}

        {/* Examples dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1">
              <Wand2 className="w-3.5 h-3.5" />
              Examples
              <ChevronDown className="w-3 h-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Load Format</div>
            <DropdownMenuSeparator />
            {EXAMPLES.map((ex) => (
              <DropdownMenuItem key={ex.format} onClick={() => loadExample(ex)} className="text-xs cursor-pointer">
                {ex.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload}>
          <Download className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Format hint */}
      <div className="px-4 py-1.5 border-b border-border/50 bg-muted/20 flex-shrink-0">
        <p className="text-[10px] text-muted-foreground/70">
          Supports: <span className="text-muted-foreground">Discord Webhook</span> · <span className="text-muted-foreground">OpenAI ChatGPT</span> · <span className="text-muted-foreground">OpenAI Assistants API</span> · <span className="text-muted-foreground">Slack Webhook</span>
        </p>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language="json"
          value={localJson}
          onChange={(v) => setLocalJson(v ?? '')}
          theme="vs-dark"
          options={{
            fontSize: editorFontSize,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            lineNumbers: 'on',
            folding: true,
            tabSize: 2,
            padding: { top: 12, bottom: 12 },
            scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
          }}
        />
      </div>
    </div>
  );
}
