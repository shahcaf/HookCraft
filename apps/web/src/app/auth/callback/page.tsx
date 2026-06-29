'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Loader2, Webhook } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token = searchParams.get('token');
    const id = searchParams.get('id');
    const username = searchParams.get('username');
    const avatar = searchParams.get('avatar') || undefined;

    if (token && id && username) {
      setAuth(token, { id, username, avatar });
      router.replace('/');
    } else {
      // If error or missing params, redirect home
      router.replace('/');
    }
  }, [searchParams, setAuth, router]);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground select-none">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse"
          style={{
            background: 'linear-gradient(135deg, hsl(252 87% 62%) 0%, hsl(270 80% 58%) 100%)',
            boxShadow: '0 0 30px hsl(252 87% 67% / 0.4)',
          }}
        >
          <Webhook className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="absolute -bottom-1 -right-1 w-5 h-5 text-primary animate-spin" />
      </div>
      <h1 className="text-base font-bold tracking-tight">Authenticating with Discord…</h1>
      <p className="text-xs text-muted-foreground/60 mt-1">Please wait while we set up your workspace session.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
