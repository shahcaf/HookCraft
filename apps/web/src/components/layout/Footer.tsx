'use client';

import Link from 'next/link';
import { Webhook, Github, Twitter } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  
  // Don't show footer on the main builder page or auth callback, since builder is a full-height app
  if (pathname === '/' || pathname === '/auth/callback') {
    return null;
  }

  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, hsl(252 87% 62%) 0%, hsl(270 80% 58%) 100%)',
                  boxShadow: '0 0 14px hsl(252 87% 67% / 0.5)',
                }}
              >
                <Webhook className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg gradient-text tracking-tight">HookCraft</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The ultimate visual builder for Discord webhooks. Create, preview, and manage rich embeds effortlessly.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-foreground">Product</h3>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Builder</Link>
            <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Templates</Link>
            <Link href="/changelog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Changelog</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-foreground">Resources</h3>
            <Link href="/guides" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Guides</Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HookCraft. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
