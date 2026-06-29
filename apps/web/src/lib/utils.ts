import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert a hex color string to a Discord integer */
export function hexToDiscordColor(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

/** Convert a Discord integer color to hex string */
export function discordColorToHex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

/** Format ISO timestamp in Discord's style */
export function formatDiscordTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Today's ISO timestamp */
export function todayIso(): string {
  return new Date().toISOString();
}

/** Byte size to readable string */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Deep clone via JSON */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Generate a webhook payload ready for Discord API (strip client-only IDs) */
export function stripClientIds(message: Record<string, unknown>): Record<string, unknown> {
  const obj = deepClone(message);

  function strip(o: unknown): unknown {
    if (Array.isArray(o)) return o.map(strip);
    if (o && typeof o === 'object') {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
        if (k === 'id') continue; // strip client-only id
        if (k === 'dataUrl') continue; // strip attachment preview
        result[k] = strip(v);
      }
      return result;
    }
    return o;
  }

  return strip(obj) as Record<string, unknown>;
}

/** Parse a discord webhook URL and return its parts */
export function parseWebhookUrl(url: string): { id: string; token: string } | null {
  const match = url.match(/discord\.com\/api\/webhooks\/(\d+)\/([^?]+)/);
  if (!match) return null;
  return { id: match[1], token: match[2] };
}
