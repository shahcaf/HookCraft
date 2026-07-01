import { Metadata } from 'next';
import { CheckCircle2, Star, Bug, Rocket, Zap, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Changelog | HookCraft',
  description: 'Track the latest updates, features, and fixes for HookCraft.',
};

const updates = [
  {
    version: '2.4.0',
    date: 'July 1, 2026',
    title: 'AI Message Generator + Groq',
    type: 'feature',
    badge: 'Latest',
    badgeColor: '#a78bfa',
    changes: [
      'Added AI Generator tab powered by Groq (llama-3.3-70b) — describe your message and AI writes the full Discord webhook payload.',
      'Supports tone selection: Professional, Casual, Hype, Minimal, Urgent.',
      '8 quick-prompt suggestions to get started instantly.',
      'AI output is auto-applied to the editor preview in one click.',
      'Removed Bot Hosting tab — replaced with AI Generator.',
    ]
  },
  {
    version: '2.3.0',
    date: 'July 1, 2026',
    title: 'Multi-Format JSON Editor',
    type: 'feature',
    badge: null,
    badgeColor: null,
    changes: [
      'JSON editor now auto-detects and converts 4 different formats: Discord Webhook, OpenAI ChatGPT response, OpenAI Assistants API, and Slack Webhook.',
      'Paste a raw ChatGPT API response and it is automatically converted to a Discord embed.',
      'Format detection badge shows which format was identified.',
      'Examples dropdown with one sample JSON per supported format.',
    ]
  },
  {
    version: '2.2.0',
    date: 'June 30, 2026',
    title: 'Cloud Sync with CockroachDB',
    type: 'feature',
    badge: null,
    badgeColor: null,
    changes: [
      'Webhooks, Drafts, and user accounts now persist to a CockroachDB cloud database.',
      'Log in on any device and your data follows you instantly.',
      'Prisma ORM integration for type-safe database queries.',
      'All data encrypted in transit via SSL.',
    ]
  },
  {
    version: '2.1.0',
    date: 'June 30, 2026',
    title: 'VIP Role Instant Re-Check',
    type: 'feature',
    badge: null,
    badgeColor: null,
    changes: [
      'VIP status is now re-validated every 1 second — no more logging out to get updated role access.',
      'Granting or revoking a VIP role takes effect within seconds.',
      'Discord OAuth session token refreshes silently in the background.',
    ]
  },
  {
    version: '2.0.0',
    date: 'June 29, 2026',
    title: 'Major Builder Overhaul',
    type: 'feature',
    badge: null,
    badgeColor: null,
    changes: [
      'Complete UI redesign with ultra-deep dark theme and vibrant purple glow.',
      'Added Poll Editor, Attachment Editor, and Components (buttons/selects) editor.',
      'Templates library with 50+ presets across every category.',
      'Full undo/redo history for all editor changes.',
      'Keyboard shortcut support (Ctrl+Z, Ctrl+Enter to send, etc.).',
      'Monaco-based JSON editor with syntax highlighting and auto-format.',
    ]
  },
  {
    version: '1.1.0',
    date: 'June 15, 2026',
    title: 'The Visual Builder Release',
    type: 'feature',
    badge: null,
    badgeColor: null,
    changes: [
      'Introduced a full WYSIWYG editor for Discord Webhook payloads.',
      'Added support for custom embeds, fields, footers, and authors.',
      'Implemented local state persistence so you don\'t lose work on refresh.',
      'Discord preview panel renders messages exactly as they appear in Discord.',
    ]
  },
  {
    version: '1.0.0',
    date: 'June 1, 2026',
    title: 'Initial Release',
    type: 'launch',
    badge: null,
    badgeColor: null,
    changes: [
      'First public release of HookCraft.',
      'Basic webhook sending with content and username.',
      'Discord OAuth integration for user accounts.',
      'Save and manage multiple webhooks.',
    ]
  }
];

const typeIcon = {
  feature: Star,
  launch: Rocket,
  fix: Bug,
  perf: Zap,
  security: Shield,
};

const typeColor = {
  feature: 'hsl(252 90% 68%)',
  launch: '#10b981',
  fix: '#f59e0b',
  perf: '#38bdf8',
  security: '#f43f5e',
};

export default function ChangelogPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, hsl(252 90% 68% / 0.07) 0%, transparent 70%)' }} />

      <div className="container max-w-3xl px-4 py-24 relative z-10">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'hsl(252 90% 68% / 0.12)', border: '1px solid hsl(252 90% 68% / 0.25)', color: 'hsl(252 90% 75%)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Live product updates
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 gradient-text">Changelog</h1>
          <p className="text-xl text-muted-foreground">
            Every update, improvement, and fix — documented here.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-10 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5"
          style={{ '--tw-before-bg': 'transparent' } as any}>
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2"
            style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--border) / 0.7) 10%, hsl(var(--border) / 0.7) 90%, transparent)' }} />

          {updates.map((update, idx) => {
            const Icon = typeIcon[update.type as keyof typeof typeIcon] ?? Star;
            const color = typeColor[update.type as keyof typeof typeColor] ?? 'hsl(252 90% 68%)';
            return (
              <div key={idx} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                {/* Node */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-lg absolute left-0 md:left-1/2 -translate-x-1/2 transition-transform duration-300 group-hover:scale-110 z-10 flex-shrink-0"
                  style={{ background: 'hsl(var(--card))', borderColor: color, boxShadow: `0 0 16px ${color}40` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>

                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-200 ml-auto md:ml-0 md:group-even:mr-auto group-hover:-translate-y-0.5"
                  style={{ background: 'hsl(var(--card) / 0.8)', borderColor: 'hsl(var(--border) / 0.6)', backdropFilter: 'blur(12px)' }}>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
                        v{update.version}
                      </span>
                      {update.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: update.badgeColor! }}>
                          {update.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{update.date}</span>
                  </div>
                  <h3 className="text-base font-bold mb-3 text-foreground">{update.title}</h3>
                  <ul className="space-y-1.5">
                    {update.changes.map((change, cIdx) => (
                      <li key={cIdx} className="text-muted-foreground text-sm flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color, opacity: 0.6 }} />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
