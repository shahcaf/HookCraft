'use client';

import { useState } from 'react';
import { Monitor, Hash, ZoomIn, ZoomOut } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { DiscordPreview } from '@/components/preview/DiscordPreview';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export function RightPanel() {
  const { previewScale, setPreviewScale } = useUIStore();

  function zoom(delta: number) {
    setPreviewScale(Math.min(150, Math.max(50, previewScale + delta)));
  }

  return (
    <div className="flex flex-col h-full overflow-hidden"
      style={{ background: 'hsl(var(--background) / 0.4)' }}
    >
      {/* Panel header */}
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5 text-muted-foreground/70" />
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
            Preview
          </span>
        </div>

        {/* Zoom controls */}
        <TooltipProvider delayDuration={400}>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md"
                  onClick={() => zoom(-10)} disabled={previewScale <= 50}
                >
                  <ZoomOut className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom out</TooltipContent>
            </Tooltip>
            <span className="text-[10px] font-mono text-muted-foreground/60 w-9 text-center tabular-nums">
              {previewScale}%
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md"
                  onClick={() => zoom(10)} disabled={previewScale >= 150}
                >
                  <ZoomIn className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom in</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Discord channel header bar */}
      <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
        style={{ background: '#313338', borderBottom: '1px solid #1e1f22' }}
      >
        <Hash className="w-4 h-4 text-[#80848e] flex-shrink-0" />
        <span className="text-[#f2f3f5] font-semibold text-sm">preview</span>
        <div className="w-px h-4 bg-[#4e5058]/60 mx-1" />
        <span className="text-[#80848e] text-xs truncate">This is where your webhook message will appear</span>
      </div>

      {/* Discord preview area */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden discord-preview"
        style={{ fontSize: `${(previewScale / 100) * 16}px` }}
      >
        <DiscordPreview />
      </div>
    </div>
  );
}
