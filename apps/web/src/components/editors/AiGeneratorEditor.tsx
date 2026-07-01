'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, RotateCcw, Copy, Check,
  Wand2, ChevronRight, Loader2, Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMessageStore } from '@/store/message.store';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// ── Prompt suggestions ────────────────────────────────────────────────────────

const SUGGESTIONS = [
  { label: '🎉 Server event announcement', prompt: 'Write a Discord webhook message announcing a community gaming event this Saturday at 8PM EST. Make it exciting with an embed.' },
  { label: '🚀 Product launch', prompt: 'Create a Discord webhook message announcing the launch of a new feature called "AI Auto-Responder". Include details about what it does and a button to learn more.' },
  { label: '🚨 Server alert', prompt: 'Write an urgent Discord webhook message warning users about scheduled maintenance starting in 30 minutes.' },
  { label: '✅ Deployment success', prompt: 'Create a Discord webhook message for a successful deployment of version 2.4.1 to production. Include a green embed with build stats.' },
  { label: '👋 Welcome message', prompt: 'Write a warm Discord webhook welcome message for new members joining the server. Include server rules and helpful links in embed fields.' },
  { label: '📊 Weekly stats update', prompt: 'Create a Discord webhook with a weekly stats report embed showing: 1,240 new users, 98% uptime, and 340 bug reports resolved.' },
  { label: '💡 Tip of the day', prompt: 'Write a Discord webhook "Tip of the Day" message about Python list comprehensions with a code example.' },
  { label: '⚠️ Security alert', prompt: 'Write a Discord security alert webhook message warning about a phishing attempt targeting users. Keep it serious and professional.' },
];

// ── Tone options ──────────────────────────────────────────────────────────────

const TONES = ['Professional', 'Casual', 'Hype / Exciting', 'Minimal', 'Urgent'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSystemPrompt(tone: string) {
  return `You are an expert Discord webhook message writer. Generate ONLY a valid Discord webhook JSON payload — nothing else, no explanation, no markdown fences.

Rules:
- Output must be valid JSON starting with { and ending with }
- Use the tone: ${tone}
- Use "embeds" for rich content where appropriate
- Embed colors should be vivid hex integers (e.g. 5765029 for purple, 3066993 for green)
- Include username and avatar_url when relevant
- Do NOT wrap output in \`\`\`json or any markdown
- The JSON must be a valid Discord webhook payload`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AiGeneratorEditor() {
  const { setMessage } = useMessageStore();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Professional');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tone }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Generation failed');

      const json = data.result;
      setResult(json);

      // Auto-apply to the editor
      try {
        const parsed = JSON.parse(json);
        setMessage(parsed);
        toast({ title: '✨ Applied!', description: 'AI-generated message loaded into the editor.' });
      } catch {
        // If it doesn't parse, just show it without applying
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleApply() {
    if (!result) return;
    try {
      const parsed = JSON.parse(result);
      setMessage(parsed);
      toast({ title: '✅ Applied!', description: 'Message loaded into the editor.' });
    } catch {
      toast({ title: 'Invalid JSON', description: 'The AI response could not be parsed.', variant: 'destructive' });
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSuggestion(s: typeof SUGGESTIONS[number]) {
    setPrompt(s.prompt);
    textareaRef.current?.focus();
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* Header */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(252 90% 68%) 0%, hsl(270 85% 65%) 100%)', boxShadow: '0 0 20px hsl(252 90% 68% / 0.3)' }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Message Generator</p>
            <p className="text-xs text-muted-foreground mt-0.5">Describe your message and AI will write the perfect Discord webhook payload.</p>
          </div>
        </div>

        {/* Tone selector */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Tone</p>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 font-medium',
                  tone === t
                    ? 'bg-primary/15 border-primary/40 text-primary'
                    : 'bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt textarea */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Your Prompt</p>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
              placeholder="Describe the message you want to send... (Ctrl+Enter to generate)"
              rows={5}
              className="w-full resize-none rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
            />
            <span className="absolute bottom-2.5 right-3 text-[10px] text-muted-foreground/40 tabular-nums">{prompt.length}</span>
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full h-10 gap-2 font-semibold rounded-xl"
          style={{ background: 'linear-gradient(135deg, hsl(252 90% 65%) 0%, hsl(270 80% 62%) 100%)', boxShadow: '0 0 20px hsl(252 90% 68% / 0.25)' }}
        >
          {isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
            : <><Wand2 className="w-4 h-4" />Generate Message</>
          }
        </Button>

        {/* Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3 text-muted-foreground/60" />
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Quick Prompts</p>
          </div>
          <div className="space-y-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSuggestion(s)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent hover:border-border/50 transition-all"
              >
                <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-50" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-400">Generated Payload</p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setResult(null)}>
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <pre className="p-3 rounded-xl bg-[#1e1e1e] border border-border/50 text-xs text-green-300 overflow-x-auto whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                {result}
              </pre>
              <Button onClick={handleApply} className="w-full h-9 gap-2 text-xs rounded-xl" variant="outline">
                <Send className="w-3.5 h-3.5" />
                Apply to Editor
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
