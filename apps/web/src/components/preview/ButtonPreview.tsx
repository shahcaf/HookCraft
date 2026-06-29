'use client';

import { ExternalLink } from 'lucide-react';
import type { MessageComponent, ButtonComponent, StringSelectComponent } from '@hookcraft/shared';

interface ButtonPreviewProps {
  component: MessageComponent;
}

const BUTTON_STYLES: Record<number, string> = {
  1: 'discord-btn discord-btn-primary',
  2: 'discord-btn discord-btn-secondary',
  3: 'discord-btn discord-btn-success',
  4: 'discord-btn discord-btn-danger',
  5: 'discord-btn discord-btn-link',
};

export function ButtonPreview({ component }: ButtonPreviewProps) {
  if (component.type === 2) {
    const btn = component as ButtonComponent;
    return (
      <button
        className={BUTTON_STYLES[btn.style] ?? BUTTON_STYLES[2]}
        disabled={btn.disabled}
        onClick={(e) => e.preventDefault()}
      >
        {btn.emoji?.name && <span className="mr-1">{btn.emoji.name}</span>}
        {btn.label ?? 'Button'}
        {btn.style === 5 && <ExternalLink className="w-3 h-3 ml-1 opacity-70" />}
      </button>
    );
  }

  if (component.type === 3) {
    const menu = component as StringSelectComponent;
    return (
      <select
        className="w-full max-w-[400px] bg-[#1e1f22] text-[#dbdee1] border border-[#3b3d45] rounded px-3 py-2 text-sm cursor-pointer"
        disabled={menu.disabled}
      >
        <option value="" disabled selected>
          {menu.placeholder ?? 'Select an option...'}
        </option>
        {menu.options.map((opt) => (
          <option key={opt.id} value={opt.value}>
            {opt.emoji?.name ? `${opt.emoji.name} ` : ''}{opt.label}
          </option>
        ))}
      </select>
    );
  }

  return null;
}
