'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layers, Sparkles } from 'lucide-react';
import { useMessageStore } from '@/store/message.store';
import { EmbedCard } from '@/components/embed/EmbedCard';
import { Button } from '@/components/ui/button';

const MAX_EMBEDS = 10;

export function EmbedListEditor() {
  const { message, addEmbed } = useMessageStore();
  const embeds = message.embeds ?? [];
  const pct = (embeds.length / MAX_EMBEDS) * 100;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">Embeds</h2>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {embeds.length}/{MAX_EMBEDS}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Rich cards displayed under your message</p>
        </div>
        <Button
          size="sm"
          onClick={addEmbed}
          disabled={embeds.length >= MAX_EMBEDS}
          className="gap-1.5 h-8 rounded-lg bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-all"
          variant="outline"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Embed
        </Button>
      </div>

      {/* Limit bar */}
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted) / 0.6)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct >= 80
              ? 'linear-gradient(90deg, #f0b232, #ed4245)'
              : 'linear-gradient(90deg, hsl(var(--primary)), hsl(270 80% 65%))',
          }}
        />
      </div>

      {/* Empty state */}
      {embeds.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-14 gap-4 text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'hsl(var(--muted) / 0.6)', border: '1px solid hsl(var(--border) / 0.5)' }}
            >
              <Layers className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">No embeds yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px] leading-relaxed">
              Embeds let you display rich cards with titles, descriptions, images, and fields.
            </p>
          </div>
          <Button size="sm" onClick={addEmbed}
            className="gap-1.5 bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25"
            variant="outline"
          >
            <Plus className="w-3.5 h-3.5" />
            Add your first embed
          </Button>
        </motion.div>
      )}

      {/* Embed cards */}
      <AnimatePresence>
        {embeds.map((embed, index) => (
          <motion.div
            key={embed.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            <EmbedCard embed={embed} index={index} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
