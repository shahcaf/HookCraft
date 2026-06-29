'use client';

import { renderMarkdown } from './MarkdownRenderer';
import { EmbedPreview } from './EmbedPreview';
import { ButtonPreview } from './ButtonPreview';
import { PollPreview } from './PollPreview';
import type { WebhookMessage } from '@hookcraft/shared';

interface MessagePreviewProps {
  message: WebhookMessage;
}

export function MessagePreview({ message }: MessagePreviewProps) {
  const username = message.username || 'HookCraft';
  const avatarUrl = message.avatar_url;
  const now = new Date();

  function formatTime(d: Date): string {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  const hasContent =
    message.content ||
    (message.embeds?.length ?? 0) > 0 ||
    (message.attachments?.length ?? 0) > 0 ||
    message.poll;

  if (!hasContent) return null;

  return (
    <div className="discord-message-group">
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={username}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: '#5865f2' }}
          >
            {username[0]?.toUpperCase() ?? 'H'}
          </div>
        )}
      </div>

      {/* Message body */}
      <div className="flex-1 min-w-0">
        {/* Username + timestamp */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-white font-semibold text-sm leading-none">{username}</span>
          <span className="text-[10px] font-medium text-[#4e5058] bg-[#3b3d45] px-1.5 py-0.5 rounded text-center leading-none">
            BOT
          </span>
          <span className="text-xs text-[#72767d]">{formatTime(now)}</span>
        </div>

        {/* Content */}
        {message.content && (
          <div className="text-[#dbdee1] text-sm leading-[1.375rem] mb-1 whitespace-pre-wrap break-words discord-message-content">
            {renderMarkdown(message.content)}
          </div>
        )}

        {/* Attachments (images) */}
        {message.attachments?.map((att) => (
          att.content_type?.startsWith('image/') && att.dataUrl ? (
            <div key={att.id} className="mt-2 mb-1 max-w-[400px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={att.dataUrl}
                alt={att.filename}
                className="rounded-lg max-w-full max-h-[350px] object-contain"
              />
            </div>
          ) : (
            <div key={att.id} className="mt-2 flex items-center gap-2 p-3 bg-[#2b2d31] rounded-lg max-w-[300px] border border-[#1e1f22]">
              <span className="text-xs text-[#b5bac1] truncate">{att.filename}</span>
            </div>
          )
        ))}

        {/* Embeds */}
        {message.embeds?.map((embed) => (
          <EmbedPreview key={embed.id} embed={embed} />
        ))}

        {/* Components */}
        {message.components && message.components.length > 0 && (
          <div className="mt-1 space-y-1">
            {message.components.map((row) => (
              <div key={row.id} className="flex flex-wrap gap-2">
                {row.components.map((comp) => (
                  <ButtonPreview key={comp.id} component={comp} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Poll */}
        {message.poll && <PollPreview poll={message.poll} />}
      </div>
    </div>
  );
}
