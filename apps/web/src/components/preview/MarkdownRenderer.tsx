/**
 * Discord Markdown Renderer
 * Parses Discord-flavored markdown into React elements.
 * Supports: bold, italic, underline, strikethrough, code, code blocks,
 *           blockquotes, spoilers, mentions, emojis, timestamps
 */

import React from 'react';

interface ParseOptions {
  allowMentions?: boolean;
  allowTimestamps?: boolean;
}

type Token =
  | { type: 'text'; content: string }
  | { type: 'bold'; content: string }
  | { type: 'italic'; content: string }
  | { type: 'underline'; content: string }
  | { type: 'strikethrough'; content: string }
  | { type: 'code'; content: string }
  | { type: 'codeblock'; language: string; content: string }
  | { type: 'spoiler'; content: string }
  | { type: 'blockquote'; content: string }
  | { type: 'mention'; kind: 'user' | 'channel' | 'role' | 'everyone' | 'here'; id: string; display: string }
  | { type: 'url'; href: string }
  | { type: 'timestamp'; unix: number; format: string }
  | { type: 'emoji'; name: string; id?: string; animated?: boolean }
  | { type: 'br' };

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseTimestamp(unix: number, format: string): string {
  const d = new Date(unix * 1000);
  switch (format) {
    case 'D': return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    case 'd': return d.toLocaleDateString('en-US');
    case 't': return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    case 'T': return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    case 'F': return d.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    case 'R': {
      const diff = Math.floor((unix * 1000 - Date.now()) / 1000);
      if (Math.abs(diff) < 60) return 'just now';
      if (Math.abs(diff) < 3600) return `${Math.floor(Math.abs(diff) / 60)} minutes ${diff < 0 ? 'ago' : 'from now'}`;
      if (Math.abs(diff) < 86400) return `${Math.floor(Math.abs(diff) / 3600)} hours ${diff < 0 ? 'ago' : 'from now'}`;
      return `${Math.floor(Math.abs(diff) / 86400)} days ${diff < 0 ? 'ago' : 'from now'}`;
    }
    default: return d.toLocaleString('en-US');
  }
}

export function renderMarkdown(text: string, opts: ParseOptions = {}): React.ReactNode {
  if (!text) return null;

  const nodes: React.ReactNode[] = [];
  let key = 0;
  const lines = text.split('\n');

  for (let li = 0; li < lines.length; li++) {
    if (li > 0) nodes.push(<br key={`br-${li}`} />);
    const line = lines[li];

    // Blockquote
    if (line.startsWith('> ')) {
      nodes.push(
        <span key={key++} className="discord-blockquote">
          {renderInline(line.slice(2), key++, opts)}
        </span>,
      );
      continue;
    }

    nodes.push(...renderInlineNodes(line, key, opts));
    key += 1000;
  }

  return <>{nodes}</>;
}

function renderInline(text: string, baseKey: number, opts: ParseOptions): React.ReactNode {
  const nodes = renderInlineNodes(text, baseKey, opts);
  return <>{nodes}</>;
}

function renderInlineNodes(text: string, baseKey: number, opts: ParseOptions): React.ReactNode[] {
  let remaining = text;
  const nodes: React.ReactNode[] = [];
  let key = baseKey;

  const patterns: [RegExp, (match: RegExpMatchArray) => React.ReactNode][] = [
    // Code block (must be before code)
    [/^```(\w*)\n?([\s\S]*?)```/, (m) => (
      <code key={key++} className="discord-code-block">
        {m[2]}
      </code>
    )],
    // Inline code
    [/^`([^`]+)`/, (m) => (
      <code key={key++} className="discord-code-inline">{m[1]}</code>
    )],
    // Bold-italic
    [/^\*\*\*(.+?)\*\*\*/, (m) => (
      <strong key={key++}><em>{renderInline(m[1], key++, opts)}</em></strong>
    )],
    // Bold
    [/^\*\*(.+?)\*\*/, (m) => (
      <strong key={key++}>{renderInline(m[1], key++, opts)}</strong>
    )],
    // Italic (*)
    [/^\*(.+?)\*/, (m) => (
      <em key={key++}>{renderInline(m[1], key++, opts)}</em>
    )],
    // Italic (_)
    [/^_(.+?)_/, (m) => (
      <em key={key++}>{renderInline(m[1], key++, opts)}</em>
    )],
    // Underline
    [/^__(.+?)__/, (m) => (
      <span key={key++} className="underline">{renderInline(m[1], key++, opts)}</span>
    )],
    // Strikethrough
    [/^~~(.+?)~~/, (m) => (
      <span key={key++} className="line-through">{renderInline(m[1], key++, opts)}</span>
    )],
    // Spoiler
    [/^\|\|(.+?)\|\|/, (m) => (
      <SpoilerSpan key={key++}>{renderInline(m[1], key++, opts)}</SpoilerSpan>
    )],
    // @everyone / @here
    [/^@(everyone|here)/, (m) => (
      <span key={key++} className="discord-mention">@{m[1]}</span>
    )],
    // User mention
    [/^<@!?(\d+)>/, (m) => (
      <span key={key++} className="discord-mention">@User</span>
    )],
    // Channel mention
    [/^<#(\d+)>/, (m) => (
      <span key={key++} className="discord-mention">#channel</span>
    )],
    // Role mention
    [/^<@&(\d+)>/, (m) => (
      <span key={key++} className="discord-mention">@Role</span>
    )],
    // Custom emoji
    [/^<(a?):(\w+):(\d+)>/, (m) => (
      <span key={key++} title={`:${m[2]}:`}>:{m[2]}:</span>
    )],
    // Timestamp
    ...(opts.allowTimestamps !== false ? [[
      /^<t:(\d+)(?::([DdtTFRf]))?>/,
      (m: RegExpMatchArray) => (
        <span key={key++} className="discord-timestamp">
          {parseTimestamp(parseInt(m[1]), m[2] ?? 'f')}
        </span>
      ),
    ] as [RegExp, (m: RegExpMatchArray) => React.ReactNode]] : []),
    // URL
    [/^(https?:\/\/[^\s<>]+)/, (m) => (
      <a key={key++} href={m[1]} target="_blank" rel="noopener noreferrer" className="discord-link">
        {m[1]}
      </a>
    )],
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const [pattern, render] of patterns) {
      const m = remaining.match(pattern);
      if (m) {
        nodes.push(render(m));
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // consume one char as plain text
      const lastNode = nodes[nodes.length - 1];
      if (typeof lastNode === 'string') {
        nodes[nodes.length - 1] = lastNode + remaining[0];
      } else {
        nodes.push(remaining[0]);
      }
      remaining = remaining.slice(1);
    }
  }

  // Merge adjacent strings
  return nodes;
}

function SpoilerSpan({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <span
      onClick={() => setRevealed(!revealed)}
      className={`cursor-pointer rounded px-0.5 ${revealed ? '' : 'bg-[#202225] text-[#202225] select-none'}`}
      title="Click to reveal spoiler"
    >
      {children}
    </span>
  );
}
