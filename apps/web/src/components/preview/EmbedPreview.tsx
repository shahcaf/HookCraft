'use client';

import { renderMarkdown } from './MarkdownRenderer';
import { discordColorToHex } from '@/lib/utils';
import type { DiscordEmbed } from '@hookcraft/shared';

interface EmbedPreviewProps {
  embed: DiscordEmbed;
}

export function EmbedPreview({ embed }: EmbedPreviewProps) {
  const colorHex = embed.color !== undefined ? discordColorToHex(embed.color) : 'transparent';

  const hasContent =
    embed.title ||
    embed.description ||
    embed.author?.name ||
    embed.footer?.text ||
    (embed.fields?.length ?? 0) > 0 ||
    embed.image?.url ||
    embed.thumbnail?.url;

  if (!hasContent) return null;

  return (
    <div
      className="mt-2 rounded overflow-hidden max-w-[520px] inline-grid w-full"
      style={{ backgroundColor: '#2b2d31' }}
    >
      <div style={{ borderLeft: colorHex !== 'transparent' ? `4px solid ${colorHex}` : '4px solid #1e1f22' }} className="p-3 grid gap-2">
        {/* Grid layout: content | thumbnail */}
        <div className="flex gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Author */}
            {embed.author?.name && (
              <div className="flex items-center gap-1.5">
                {embed.author.icon_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={embed.author.icon_url}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                  />
                )}
                <span
                  className="text-xs font-semibold text-[#dbdee1] leading-none"
                  style={embed.author.url ? { color: '#00b0f4', cursor: 'pointer' } : {}}
                >
                  {embed.author.name}
                </span>
              </div>
            )}

            {/* Title */}
            {embed.title && (
              <div
                className="text-sm font-bold leading-snug"
                style={embed.url ? { color: '#00b0f4', cursor: 'pointer' } : { color: '#f2f3f5' }}
              >
                {embed.title}
              </div>
            )}

            {/* Description */}
            {embed.description && (
              <div className="text-xs text-[#dbdee1] leading-[1.375rem] whitespace-pre-wrap break-words">
                {renderMarkdown(embed.description)}
              </div>
            )}

            {/* Fields */}
            {embed.fields && embed.fields.length > 0 && (
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
                {embed.fields.map((field) => (
                  <div
                    key={field.id}
                    className={field.inline ? 'col-span-1' : 'col-span-full'}
                  >
                    <div className="text-xs font-bold text-[#f2f3f5] mb-0.5">{field.name}</div>
                    <div className="text-xs text-[#dbdee1] leading-[1.375rem] whitespace-pre-wrap break-words">
                      {renderMarkdown(field.value)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail */}
          {embed.thumbnail?.url && (
            <div className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={embed.thumbnail.url}
                alt="thumbnail"
                className="w-16 h-16 rounded object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
              />
            </div>
          )}
        </div>

        {/* Main image */}
        {embed.image?.url && (
          <div className="mt-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={embed.image.url}
              alt="embed image"
              className="rounded max-w-full max-h-[300px] object-contain"
              onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
            />
          </div>
        )}

        {/* Footer + Timestamp */}
        {(embed.footer?.text || embed.timestamp) && (
          <div className="flex items-center gap-1.5 mt-1">
            {embed.footer?.icon_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={embed.footer.icon_url}
                alt=""
                className="w-4 h-4 rounded-full object-cover"
              />
            )}
            <span className="text-[11px] text-[#949ba4]">
              {[
                embed.footer?.text,
                embed.timestamp ? new Date(embed.timestamp).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                }) : null,
              ].filter(Boolean).join(' • ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
