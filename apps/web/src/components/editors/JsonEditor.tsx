'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Code2, Copy, Download, Check, AlertCircle } from 'lucide-react';
import { useMessageStore } from '@/store/message.store';
import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/button';
import { stripClientIds } from '@/lib/utils';
import type { WebhookMessage } from '@hookcraft/shared';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
      <div className="shimmer w-8 h-8 rounded-full" />
    </div>
  ),
});

export function JsonEditor() {
  const { message, setMessage } = useMessageStore();
  const editorFontSize = useUIStore((s) => s.editorFontSize);
  const [localJson, setLocalJson] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
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

  // Sync editor → store
  useEffect(() => {
    if (!debouncedJson) return;
    try {
      const parsed = JSON.parse(debouncedJson) as WebhookMessage;
      isExternalUpdate.current = true;
      setMessage(parsed);
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON');
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card/50 flex-shrink-0">
        <Code2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
          JSON Editor
        </span>
        {parseError && (
          <div className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="max-w-[200px] truncate">{parseError}</span>
          </div>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload}>
          <Download className="w-3.5 h-3.5" />
        </Button>
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
