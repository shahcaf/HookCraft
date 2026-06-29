import { Metadata } from 'next';
import { BookOpen, Code, Image as ImageIcon, Send } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Guides | HookCraft',
  description: 'Learn how to master Discord webhooks and HookCraft.',
};

const guides = [
  {
    title: 'Getting Started with HookCraft',
    description: 'Learn the basics of creating and sending your first Discord webhook using our visual builder.',
    icon: <BookOpen className="w-6 h-6 text-primary" />,
    href: '#'
  },
  {
    title: 'Mastering Embeds',
    description: 'A deep dive into Discord embeds: titles, descriptions, fields, and colors.',
    icon: <Code className="w-6 h-6 text-blue-500" />,
    href: '#'
  },
  {
    title: 'Images and Thumbnails',
    description: 'How to properly host and attach images to make your webhooks pop.',
    icon: <ImageIcon className="w-6 h-6 text-purple-500" />,
    href: '#'
  },
  {
    title: 'Automating Webhooks',
    description: 'Using the HookCraft API to schedule and automate your server announcements.',
    icon: <Send className="w-6 h-6 text-green-500" />,
    href: '#'
  }
];

export default function GuidesPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background">
      <div className="w-full bg-muted/30 border-b border-border/50 py-16">
        <div className="container max-w-5xl px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Guides & Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know to build stunning, interactive Discord webhooks.
          </p>
        </div>
      </div>
      
      <div className="container max-w-5xl px-4 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {guides.map((guide, idx) => (
            <Link key={idx} href={guide.href} className="group block p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                  {guide.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{guide.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {guide.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
          <h2 className="text-2xl font-bold mb-4">Need more help?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our community is always ready to help.
          </p>
          <Link href="https://discord.gg/vC8jJAREre" target="_blank" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Visit our Support Server
          </Link>
        </div>
      </div>
    </div>
  );
}
