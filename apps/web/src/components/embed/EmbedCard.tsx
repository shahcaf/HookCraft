'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Trash2,
  GripVertical,
  Plus,
  Clock,
  Image,
  User,
  AlignLeft,
  LayoutGrid,
  Palette,
} from 'lucide-react';
import { useMessageStore } from '@/store/message.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CharCounter } from '@/components/ui/CharCounter';
import { ColorPicker } from '@/components/embed/ColorPicker';
import { EmbedFieldsEditor } from '@/components/embed/EmbedFieldsEditor';
import { cn, discordColorToHex } from '@/lib/utils';
import type { DiscordEmbed } from '@hookcraft/shared';

interface EmbedCardProps {
  embed: DiscordEmbed;
  index: number;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        {icon}
        <span className="flex-1 text-left">{title}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3 border-t border-border bg-muted/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EmbedCard({ embed, index }: EmbedCardProps) {
  const [expanded, setExpanded] = useState(true);
  const { updateEmbed, removeEmbed, duplicateEmbed } = useMessageStore();

  const update = useCallback(
    (patch: Partial<DiscordEmbed>) => updateEmbed(embed.id, patch),
    [embed.id, updateEmbed],
  );

  const colorHex = embed.color !== undefined ? discordColorToHex(embed.color) : '#5865f2';

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card/50">
      {/* Card header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-muted/20 transition-colors"
        style={{ borderLeft: `3px solid ${colorHex}` }}
        onClick={() => setExpanded(!expanded)}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
        <span className="text-sm font-semibold flex-1 truncate text-foreground">
          {embed.title || `Embed ${index + 1}`}
        </span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => duplicateEmbed(embed.id)}
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => removeEmbed(embed.id)}
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </div>

      {/* Card body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3 border-t border-border">
              {/* ── Author ─────────────────────────────────── */}
              <CollapsibleSection title="Author" icon={<User className="w-3.5 h-3.5" />} defaultOpen={false}>
                <div className="space-y-2">
                  <div className="field-group">
                    <div className="flex items-center justify-between">
                      <Label className="field-label">Name</Label>
                      <CharCounter current={embed.author?.name?.length ?? 0} max={256} />
                    </div>
                    <Input
                      value={embed.author?.name ?? ''}
                      onChange={(e) => update({ author: { ...embed.author, name: e.target.value } })}
                      placeholder="Author name..."
                      className="bg-input border-border text-sm h-8"
                      maxLength={256}
                    />
                  </div>
                  <div className="field-group">
                    <Label className="field-label">URL</Label>
                    <Input
                      value={embed.author?.url ?? ''}
                      onChange={(e) => update({ author: { ...embed.author, name: embed.author?.name ?? '', url: e.target.value } })}
                      placeholder="https://..."
                      className="bg-input border-border text-sm h-8 font-mono"
                    />
                  </div>
                  <div className="field-group">
                    <Label className="field-label">Icon URL</Label>
                    <Input
                      value={embed.author?.icon_url ?? ''}
                      onChange={(e) => update({ author: { ...embed.author, name: embed.author?.name ?? '', icon_url: e.target.value } })}
                      placeholder="https://..."
                      className="bg-input border-border text-sm h-8 font-mono"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* ── Body ─────────────────────────────────────── */}
              <CollapsibleSection title="Body" icon={<AlignLeft className="w-3.5 h-3.5" />} defaultOpen={true}>
                <div className="space-y-3">
                  {/* Color */}
                  <div className="flex items-center gap-3">
                    <div className="field-group flex-1">
                      <Label className="field-label">Color</Label>
                      <div className="flex items-center gap-2">
                        <ColorPicker
                          value={colorHex}
                          onChange={(hex) => update({ color: parseInt(hex.replace('#', ''), 16) })}
                        />
                        <Input
                          value={colorHex}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                              if (v.length === 7) update({ color: parseInt(v.replace('#', ''), 16) });
                            }
                          }}
                          className="bg-input border-border text-sm h-8 font-mono flex-1"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="field-group">
                    <div className="flex items-center justify-between">
                      <Label className="field-label">Title</Label>
                      <CharCounter current={embed.title?.length ?? 0} max={256} />
                    </div>
                    <Input
                      value={embed.title ?? ''}
                      onChange={(e) => update({ title: e.target.value })}
                      placeholder="Embed title..."
                      className="bg-input border-border text-sm h-8"
                      maxLength={256}
                    />
                  </div>

                  {/* Title URL */}
                  <div className="field-group">
                    <Label className="field-label">Title URL</Label>
                    <Input
                      value={embed.url ?? ''}
                      onChange={(e) => update({ url: e.target.value })}
                      placeholder="https://..."
                      className="bg-input border-border text-sm h-8 font-mono"
                    />
                  </div>

                  {/* Description */}
                  <div className="field-group">
                    <div className="flex items-center justify-between">
                      <Label className="field-label">Description</Label>
                      <CharCounter current={embed.description?.length ?? 0} max={4096} />
                    </div>
                    <Textarea
                      value={embed.description ?? ''}
                      onChange={(e) => update({ description: e.target.value })}
                      placeholder="Embed description... (supports markdown)"
                      className="min-h-[100px] resize-none bg-input border-border text-sm font-mono"
                      maxLength={4096}
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* ── Fields ─────────────────────────────────── */}
              <CollapsibleSection title="Fields" icon={<LayoutGrid className="w-3.5 h-3.5" />} defaultOpen={false}>
                <EmbedFieldsEditor embedId={embed.id} fields={embed.fields ?? []} />
              </CollapsibleSection>

              {/* ── Images ─────────────────────────────────── */}
              <CollapsibleSection title="Images" icon={<Image className="w-3.5 h-3.5" />} defaultOpen={false}>
                <div className="space-y-3">
                  <div className="field-group">
                    <Label className="field-label">Main Image URL</Label>
                    <Input
                      value={embed.image?.url ?? ''}
                      onChange={(e) => update({ image: e.target.value ? { url: e.target.value } : undefined })}
                      placeholder="https://..."
                      className="bg-input border-border text-sm h-8 font-mono"
                    />
                  </div>
                  <div className="field-group">
                    <Label className="field-label">Thumbnail URL</Label>
                    <Input
                      value={embed.thumbnail?.url ?? ''}
                      onChange={(e) => update({ thumbnail: e.target.value ? { url: e.target.value } : undefined })}
                      placeholder="https://..."
                      className="bg-input border-border text-sm h-8 font-mono"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* ── Footer ─────────────────────────────────── */}
              <CollapsibleSection title="Footer" icon={<AlignLeft className="w-3.5 h-3.5" />} defaultOpen={false}>
                <div className="space-y-2">
                  <div className="field-group">
                    <div className="flex items-center justify-between">
                      <Label className="field-label">Footer Text</Label>
                      <CharCounter current={embed.footer?.text?.length ?? 0} max={2048} />
                    </div>
                    <Input
                      value={embed.footer?.text ?? ''}
                      onChange={(e) => update({ footer: { ...embed.footer, text: e.target.value } })}
                      placeholder="Footer text..."
                      className="bg-input border-border text-sm h-8"
                      maxLength={2048}
                    />
                  </div>
                  <div className="field-group">
                    <Label className="field-label">Footer Icon URL</Label>
                    <Input
                      value={embed.footer?.icon_url ?? ''}
                      onChange={(e) => update({ footer: { text: embed.footer?.text ?? '', icon_url: e.target.value } })}
                      placeholder="https://..."
                      className="bg-input border-border text-sm h-8 font-mono"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* ── Timestamp ─────────────────────────────── */}
              <CollapsibleSection title="Timestamp" icon={<Clock className="w-3.5 h-3.5" />} defaultOpen={false}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Show Timestamp</p>
                      <p className="text-xs text-muted-foreground">Displays in the footer</p>
                    </div>
                    <Switch
                      checked={Boolean(embed.timestamp)}
                      onCheckedChange={(v) => update({ timestamp: v ? new Date().toISOString() : undefined })}
                    />
                  </div>
                  {embed.timestamp && (
                    <div className="field-group">
                      <Label className="field-label">Timestamp (ISO 8601)</Label>
                      <Input
                        type="datetime-local"
                        value={embed.timestamp ? embed.timestamp.slice(0, 16) : ''}
                        onChange={(e) => update({ timestamp: new Date(e.target.value).toISOString() })}
                        className="bg-input border-border text-sm h-8"
                      />
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
