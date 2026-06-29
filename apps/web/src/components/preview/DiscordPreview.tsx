'use client';

import { useMessageStore } from '@/store/message.store';
import { MessagePreview } from './MessagePreview';
import { Webhook } from 'lucide-react';

export function DiscordPreview() {
  const message = useMessageStore((s) => s.message);

  const hasContent =
    message.content ||
    (message.embeds?.length ?? 0) > 0 ||
    (message.attachments?.length ?? 0) > 0 ||
    message.poll;

  return (
    <div className="min-h-full discord-preview relative">
      {/* Messages area */}
      <div className="py-4">
        <MessagePreview message={message} />
      </div>

      {/* Empty state */}
      {!hasContent && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-8 select-none">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: 'rgba(88,101,242,0.12)', border: '1px solid rgba(88,101,242,0.2)' }}
            >
              <Webhook className="w-9 h-9" style={{ color: 'rgba(88,101,242,0.6)' }} />
            </div>
            {/* Floating bubble */}
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-sm"
              style={{ background: '#2b2d31', border: '2px solid #313338' }}
            >
              💬
            </div>
          </div>
          <p style={{ color: '#b5bac1' }} className="text-sm font-semibold">Nothing to preview yet</p>
          <p style={{ color: '#72767d' }} className="text-xs mt-1.5 max-w-[200px] leading-relaxed">
            Start editing in the Content or Templates section to see your message here.
          </p>

          {/* Discord-like placeholder messages */}
          <div className="mt-8 w-full max-w-[300px] space-y-3 opacity-10 pointer-events-none">
            {[['80%', '60%'], ['90%', '45%'], ['70%', '55%']].map(([w1, w2], i) => (
              <div key={i} className="flex items-start gap-2.5 text-left">
                <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: '#404249' }} />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 rounded" style={{ background: '#404249', width: w1 }} />
                  <div className="h-2 rounded" style={{ background: '#383a40', width: w2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
