import { Metadata } from 'next';
import { CheckCircle2, Star, Bug } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Changelog | HookCraft',
  description: 'Track the latest updates, features, and fixes for HookCraft.',
};

const updates = [
  {
    version: '1.2.0',
    date: 'October 24, 2026',
    title: 'SQLite Support & Auto-Join',
    type: 'feature',
    changes: [
      'Switched default database to SQLite for easier local setup.',
      'Added Discord Auto-Join feature to automatically add users to the official support server upon login.',
      'Resolved React hydration mismatches caused by the Dark Reader browser extension.',
      'Added Changelog, About Us, Guides, and Templates pages.'
    ]
  },
  {
    version: '1.1.0',
    date: 'October 15, 2026',
    title: 'The Visual Builder Release',
    type: 'feature',
    changes: [
      'Introduced a full WYSIWYG editor for Discord Webhook payloads.',
      'Added support for custom embeds, fields, footers, and authors.',
      'Implemented local state persistence so you don\'t lose work on refresh.',
    ]
  },
  {
    version: '1.0.0',
    date: 'October 1, 2026',
    title: 'Initial Release',
    type: 'launch',
    changes: [
      'First public release of HookCraft.',
      'Basic webhook sending functionality.',
      'Discord OAuth integration for user accounts.'
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="container max-w-3xl px-4 py-24 relative z-10">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Changelog</h1>
          <p className="text-xl text-muted-foreground">
            New updates and improvements to HookCraft.
          </p>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/60 before:to-transparent">
          {updates.map((update, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shadow-sm absolute left-0 md:left-1/2 -translate-x-1/2 text-primary group-hover:scale-110 transition-transform duration-300">
                {update.type === 'feature' && <Star className="w-4 h-4 fill-primary/20" />}
                {update.type === 'launch' && <CheckCircle2 className="w-4 h-4" />}
                {update.type === 'fix' && <Bug className="w-4 h-4" />}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-card border border-border/50 shadow-lg hover:shadow-xl transition-shadow ml-auto md:ml-0 md:group-even:mr-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">v{update.version}</span>
                  <span className="text-sm font-medium text-muted-foreground">{update.date}</span>
                </div>
                <h3 className="text-xl font-bold mb-4">{update.title}</h3>
                <ul className="space-y-2">
                  {update.changes.map((change, cIdx) => (
                    <li key={cIdx} className="text-muted-foreground text-sm flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
