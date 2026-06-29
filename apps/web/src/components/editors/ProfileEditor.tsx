'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useMessageStore } from '@/store/message.store';
import { useUIStore } from '@/store/ui.store';
import { EditorSection } from '@/components/ui/EditorSection';
import { CharCounter } from '@/components/ui/CharCounter';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Link, Shuffle, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Curated quick-pick avatar list for fast prototyping
const QUICK_AVATARS = [
  { label: 'Blurple', url: 'https://cdn.discordapp.com/embed/avatars/0.png', bg: '#5865f2' },
  { label: 'Gray',    url: 'https://cdn.discordapp.com/embed/avatars/1.png', bg: '#747f8d' },
  { label: 'Green',   url: 'https://cdn.discordapp.com/embed/avatars/2.png', bg: '#3ba55c' },
  { label: 'Yellow',  url: 'https://cdn.discordapp.com/embed/avatars/3.png', bg: '#faa81a' },
  { label: 'Red',     url: 'https://cdn.discordapp.com/embed/avatars/4.png', bg: '#ed4245' },
  { label: 'Pink',    url: 'https://cdn.discordapp.com/embed/avatars/5.png', bg: '#eb459e' },
];

const BOT_NAMES = [
  'Notify Bot', 'AlertBot', 'System', 'Announcer', 'InfoBot',
  'Dispatch', 'HookBot', 'EventBot', 'Reporter', 'Messenger',
];

export function ProfileEditor() {
  const { message, setUsername, setAvatarUrl } = useMessageStore();
  const { setActiveSection } = useUIStore();
  const [localUsername, setLocalUsername] = useState(message.username ?? '');
  const [localAvatar,   setLocalAvatar]   = useState(message.avatar_url ?? '');
  const [avatarError,   setAvatarError]   = useState(false);

  const [debouncedUsername] = useDebounce(localUsername, 200);
  const [debouncedAvatar]   = useDebounce(localAvatar, 400);

  useEffect(() => { setUsername(debouncedUsername); }, [debouncedUsername, setUsername]);
  useEffect(() => {
    setAvatarUrl(debouncedAvatar);
    setAvatarError(false);
  }, [debouncedAvatar, setAvatarUrl]);

  function randomName() {
    setLocalUsername(BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]);
  }

  return (
    <div className="p-4 space-y-4">
      <EditorSection
        title="Webhook Profile"
        icon={<User className="w-4 h-4" />}
        description="Override the display name and avatar for this message"
      >
        <div className="space-y-5">
          {/* Live Preview Card */}
          <div className="relative overflow-hidden rounded-xl p-4"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--muted) / 0.6), hsl(var(--muted) / 0.3))',
              border: '1px solid hsl(var(--border) / 0.6)',
            }}
          >
            {/* Bg glow behind avatar */}
            <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full blur-2xl opacity-30"
              style={{ background: '#5865f2' }}
            />
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                  <AvatarImage
                    src={localAvatar || undefined}
                    alt={localUsername}
                    onError={() => setAvatarError(true)}
                    onLoad={() => setAvatarError(false)}
                  />
                  <AvatarFallback
                    className="text-white text-lg font-bold"
                    style={{ background: 'linear-gradient(135deg, #5865f2, #7c83f0)' }}
                  >
                    {localUsername ? localUsername[0].toUpperCase() : 'W'}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#23a55a] border-2 border-[#1a1b1e]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-foreground leading-none">
                    {localUsername || 'HookCraft'}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#5865f2]/20 text-[#a5b4fc] leading-none">
                    BOT
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Webhook</p>
                {localAvatar && avatarError && (
                  <p className="text-[10px] text-destructive mt-1">⚠ Avatar URL failed to load</p>
                )}
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="field-group">
            <div className="flex items-center justify-between">
              <Label className="field-label">Username Override</Label>
              <div className="flex items-center gap-1">
                <CharCounter current={localUsername.length} max={80} />
                <Button variant="ghost" size="icon" className="h-5 w-5 rounded"
                  onClick={randomName} title="Random name"
                >
                  <Shuffle className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Input
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              placeholder="Webhook username…"
              maxLength={80}
              className="bg-input border-border/60 rounded-xl focus:border-primary/50"
            />
          </div>

          {/* Avatar URL */}
          <div className="field-group">
            <Label className="field-label">Avatar URL</Label>
            <Input
              value={localAvatar}
              onChange={(e) => setLocalAvatar(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className={cn(
                'bg-input border-border/60 font-mono text-xs rounded-xl focus:border-primary/50',
                avatarError && localAvatar && 'border-destructive/60',
              )}
            />
            {localAvatar && !localAvatar.startsWith('http') && (
              <p className="text-xs text-destructive">Must be a valid HTTPS URL</p>
            )}
          </div>

          {/* Quick-pick avatars */}
          <div className="space-y-2">
            <Label className="field-label">Quick-Pick Avatars</Label>
            <div className="grid grid-cols-6 gap-1.5">
              {QUICK_AVATARS.map((av) => (
                <button
                  key={av.url}
                  onClick={() => setLocalAvatar(av.url)}
                  title={av.label}
                  className={cn(
                    'relative rounded-xl overflow-hidden transition-all duration-150 group',
                    localAvatar === av.url
                      ? 'ring-2 ring-primary scale-105'
                      : 'hover:scale-105 hover:ring-2 hover:ring-primary/40',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={av.url} alt={av.label} className="w-full aspect-square object-cover" />
                  {localAvatar === av.url && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(88,101,242,0.4)' }}
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Or use the{' '}
              <button className="text-primary underline underline-offset-2"
                onClick={() => setActiveSection('templates')}
              >
                Templates → Bot Personas
              </button>
              {' '}for more options
            </p>
          </div>
        </div>
      </EditorSection>
    </div>
  );
}
