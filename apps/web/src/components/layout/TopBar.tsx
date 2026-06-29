'use client';

import { motion } from 'framer-motion';
import {
  PanelLeftClose, PanelLeftOpen, RotateCcw, RotateCw,
  Download, Upload, Save, Settings, Webhook, Sparkles, Zap,
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useMessageStore } from '@/store/message.store';
import { useWebhookStore } from '@/store/webhook.store';
import { Button } from '@/components/ui/button';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { SendButton } from '@/components/webhook/SendButton';
import { DraftDialog } from '@/components/drafts/DraftDialog';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import { LogOut, LogIn } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TopBar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { canUndo, canRedo, undo, redo, message } = useMessageStore();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  function handleExport() {
    const payload = JSON.stringify(message, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'hookcraft-message.json'; a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try { useMessageStore.getState().setMessage(JSON.parse(ev.target?.result as string)); }
        catch { alert('Invalid JSON file'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleDiscordLogin() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/auth/discord`;
  }

  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : undefined;

  const navLinks = [
    { name: 'Templates', href: '/templates' },
    { name: 'Guides', href: '/guides' },
    { name: 'Changelog', href: '/changelog' },
    { name: 'About', href: '/about' },
  ];

  return (
    <TooltipProvider delayDuration={400}>
      <header className="flex items-center gap-1.5 px-3 h-12 flex-shrink-0 relative z-50"
        style={{
          background: 'hsl(var(--card) / 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid hsl(var(--border) / 0.6)',
          boxShadow: '0 1px 0 hsl(var(--border) / 0.3), 0 4px 24px hsl(0 0% 0% / 0.15)',
        }}
      >
        {/* Subtle top glow line */}
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.4) 40%, hsl(var(--glow-violet) / 0.3) 60%, transparent 100%)' }}
        />

        {/* Logo */}
        <Link href="/">
          <motion.div
            className="flex items-center gap-2 mr-4 pr-3"
            style={{ borderRight: '1px solid hsl(var(--border) / 0.4)' }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, hsl(252 87% 62%) 0%, hsl(270 80% 58%) 100%)',
                boxShadow: '0 0 14px hsl(252 87% 67% / 0.5), inset 0 1px 0 hsl(255 100% 85% / 0.2)',
              }}
            >
              <Webhook className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-bold text-sm gradient-text tracking-tight">HookCraft</span>
              <span className="text-[9px] text-muted-foreground/60 font-medium tracking-widest uppercase">Builder</span>
            </div>
          </motion.div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 mr-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-muted/80 hover:text-foreground",
                pathname === link.href ? "text-foreground bg-muted/50" : "text-muted-foreground"
              )}>
                {link.name}
              </span>
            </Link>
          ))}
        </nav>


        {/* Sidebar toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/80"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed
                ? <PanelLeftOpen className="w-4 h-4" />
                : <PanelLeftClose className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}</TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="w-px h-5 mx-0.5" style={{ background: 'hsl(var(--border) / 0.5)' }} />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/80"
                disabled={!canUndo} onClick={undo}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/80"
                disabled={!canRedo} onClick={redo}
              >
                <RotateCw className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>

        {/* Divider */}
        <div className="w-px h-5 mx-0.5" style={{ background: 'hsl(var(--border) / 0.5)' }} />

        {/* Import / Export */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/80" onClick={handleImport}>
              <Upload className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Import JSON</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/80" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export JSON</TooltipContent>
        </Tooltip>

        {/* Drafts */}
        <DraftDialog />

        <div className="flex-1" />

        {/* Settings */}
        <SettingsDialog />

        {/* Auth status / Login Button */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-all select-none">
                <Avatar className="w-6 h-6 ring-1 ring-primary/20">
                  <AvatarImage src={avatarUrl} alt={user.username} />
                  <AvatarFallback className="text-[10px] font-bold text-white bg-primary">
                    {user.username ? user.username[0].toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold text-foreground max-w-[100px] truncate">{user.username}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border border-border">
              <div className="px-2 py-1.5 text-xs text-muted-foreground/80">
                Logged in as <strong className="text-foreground">{user.username}</strong>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-xs text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer">
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={handleDiscordLogin}
            variant="outline"
            size="sm"
            className="gap-2 h-8 text-xs font-semibold rounded-xl bg-[#5865f2]/10 hover:bg-[#5865f2]/20 text-[#5865f2] border-[#5865f2]/25"
          >
            <svg className="w-3.5 h-3.5 fill-[#5865f2]" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.95,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,71.43,71.43,0,0,1-10.5-5A54.34,54.34,0,0,0,31,78,76.81,76.81,0,0,0,96.18,78a54.34,54.34,0,0,0,2.83,2.5,71.43,71.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.87,50.22,123.6,27.39,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
            </svg>
            <span>Login with Discord</span>
          </Button>
        )}

        {/* Send */}
        <SendButton />
      </header>
    </TooltipProvider>
  );
}
