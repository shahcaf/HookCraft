'use client';

import { Settings, Sliders, Moon, Eye, Type, ShieldAlert } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SettingsDialog() {
  const {
    previewScale, setPreviewScale,
    editorFontSize, setEditorFontSize,
    autosaveInterval, setAutosaveInterval,
    accentColor, setAccentColor,
  } = useUIStore();

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/80">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden"
        style={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom: '1px solid hsl(var(--border) / 0.5)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(var(--primary) / 0.15)', border: '1px solid hsl(var(--primary) / 0.2)' }}
            >
              <Settings className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Settings</DialogTitle>
              <DialogDescription className="text-xs">
                Configure HookCraft interface and editor options
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Preview Scale */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground/75" />
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preview Scale</Label>
              </div>
              <span className="text-xs text-foreground font-semibold font-mono bg-muted px-2 py-0.5 rounded">{previewScale}%</span>
            </div>
            <Slider
              value={[previewScale]}
              onValueChange={(([v]) => setPreviewScale(v))}
              min={50}
              max={150}
              step={5}
              className="py-1 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/60">
              <span>50% (Compact)</span>
              <span>100% (Default)</span>
              <span>150% (Large)</span>
            </div>
          </div>

          {/* Editor Font Size */}
          <div className="space-y-3" style={{ borderTop: '1px solid hsl(var(--border) / 0.4)', paddingTop: '16px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-muted-foreground/75" />
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">JSON Editor Font Size</Label>
              </div>
              <span className="text-xs text-foreground font-semibold font-mono bg-muted px-2 py-0.5 rounded">{editorFontSize}px</span>
            </div>
            <Slider
              value={[editorFontSize]}
              onValueChange={(([v]) => setEditorFontSize(v))}
              min={10}
              max={20}
              step={1}
              className="py-1 cursor-pointer"
            />
          </div>

          {/* Autosave Interval */}
          <div className="space-y-3" style={{ borderTop: '1px solid hsl(var(--border) / 0.4)', paddingTop: '16px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-muted-foreground/75" />
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Autosave Interval</Label>
              </div>
              <span className="text-xs text-foreground font-semibold font-mono bg-muted px-2 py-0.5 rounded">{autosaveInterval}s</span>
            </div>
            <Slider
              value={[autosaveInterval]}
              onValueChange={(([v]) => setAutosaveInterval(v))}
              min={10}
              max={120}
              step={10}
              className="py-1 cursor-pointer"
            />
          </div>

          {/* Accent Color */}
          <div className="space-y-3" style={{ borderTop: '1px solid hsl(var(--border) / 0.4)', paddingTop: '16px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-muted-foreground/75" />
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Accent Color</Label>
              </div>
              <span className="text-xs font-semibold font-mono text-muted-foreground">{accentColor.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-11 h-10 rounded-xl cursor-pointer border border-border/60 bg-transparent hover:border-primary/50 transition-colors"
              />
              <p className="text-[10px] text-muted-foreground/60 leading-normal">
                Customize the builder theme color to match your workspace identity.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
