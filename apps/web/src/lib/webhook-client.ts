import type { WebhookMessage } from '@hookcraft/shared';
import { stripClientIds, parseWebhookUrl } from './utils';

export interface SendOptions {
  webhookUrl: string;
  message: WebhookMessage;
  threadId?: string;
  wait?: boolean;
}

export interface EditOptions {
  webhookUrl: string;
  messageId: string;
  message: WebhookMessage;
  threadId?: string;
}

export interface DeleteOptions {
  webhookUrl: string;
  messageId: string;
  threadId?: string;
}

export interface WebhookResult {
  ok: boolean;
  messageId?: string;
  error?: string;
  status?: number;
}

function buildUrl(base: string, threadId?: string, wait = true): string {
  const url = new URL(base);
  if (wait) url.searchParams.set('wait', 'true');
  if (threadId) url.searchParams.set('thread_id', threadId);
  return url.toString();
}

export async function sendWebhookMessage(opts: SendOptions): Promise<WebhookResult> {
  const { webhookUrl, message, threadId } = opts;
  const parsed = parseWebhookUrl(webhookUrl);
  if (!parsed) return { ok: false, error: 'Invalid webhook URL format' };

  const payload = stripClientIds(message as unknown as Record<string, unknown>);

  try {
    const res = await fetch(buildUrl(webhookUrl, threadId, true), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: true, messageId: data?.id };
    }

    // Read body as text first, then try to parse as JSON for proper Discord error messages
    const text = await res.text().catch(() => '');
    let errMsg = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text);
      errMsg = json.message ?? json.error ?? errMsg;
    } catch {
      if (text) errMsg = text.slice(0, 200);
    }
    return { ok: false, error: errMsg, status: res.status };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')) {
      return { ok: false, error: 'Network error — check your webhook URL is valid and Discord is reachable.' };
    }
    return { ok: false, error: msg };
  }
}

export async function editWebhookMessage(opts: EditOptions): Promise<WebhookResult> {
  const { webhookUrl, messageId, message, threadId } = opts;
  const parsed = parseWebhookUrl(webhookUrl);
  if (!parsed) return { ok: false, error: 'Invalid webhook URL' };

  const payload = stripClientIds(message as unknown as Record<string, unknown>);
  const url = `${webhookUrl}/messages/${messageId}${threadId ? `?thread_id=${threadId}` : ''}`;

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: true, messageId: data?.id };
    }

    const err = await res.json().catch(() => ({ message: res.statusText }));
    return { ok: false, error: err.message ?? 'Unknown error', status: res.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export async function deleteWebhookMessage(opts: DeleteOptions): Promise<WebhookResult> {
  const { webhookUrl, messageId, threadId } = opts;
  const url = `${webhookUrl}/messages/${messageId}${threadId ? `?thread_id=${threadId}` : ''}`;

  try {
    const res = await fetch(url, { method: 'DELETE' });
    if (res.ok || res.status === 204) return { ok: true };
    const err = await res.json().catch(() => ({ message: res.statusText }));
    return { ok: false, error: err.message ?? 'Unknown error', status: res.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export async function testWebhook(webhookUrl: string): Promise<WebhookResult> {
  const parsed = parseWebhookUrl(webhookUrl);
  if (!parsed) return { ok: false, error: 'Invalid webhook URL format' };

  try {
    const res = await fetch(webhookUrl);
    if (res.ok) return { ok: true };
    return { ok: false, error: `HTTP ${res.status}`, status: res.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}
