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
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HookCraft. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://discord.gg/PqdZAgzjTs" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
              Support Server
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
