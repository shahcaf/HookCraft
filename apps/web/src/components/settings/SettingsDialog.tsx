'use client';

import { Settings, Sliders, Moon, Eye, Type, Zap, Layout, Hash, CheckSquare, Clock, Sun } from 'lucide-react';
import { useUIStore, type SendConfirmMode } from '@/store/ui.store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const SECTION_DIVIDER = { borderTop: '1px solid hsl(var(--border) / 0.4)', paddingTop: '16px' };

const SEND_CONFIRM_OPTIONS: { value: SendConfirmMode; label: string; desc: string }[] = [
  { value: 'always', label: 'Always Confirm', desc: 'Ask before every send/edit/delete' },
  { value: 'delete-only', label: 'Delete Only', desc: 'Only confirm destructive actions' },
  { value: 'never', label: 'Never Confirm', desc: 'Send instantly without dialogs' },
];

function SectionHeader({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground/75" />
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onCheckedChange }: { label: string; desc: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground/60 leading-tight mt-0.5">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="flex-shrink-0" />
    </div>
  );
}

export function SettingsDialog() {
  const {
    previewScale, setPreviewScale,
    editorFontSize, setEditorFontSize,
    autosaveInterval, setAutosaveInterval,
    accentColor, setAccentColor,
    compactMode, setCompactMode,
    showCharCounters, setShowCharCounters,
    sendConfirmMode, setSendConfirmMode,
    previewTheme, setPreviewTheme,
    showTimestamps, setShowTimestamps,
    animationsEnabled, setAnimationsEnabled,
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

      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden max-h-[88vh] flex flex-col"
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
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Settings</DialogTitle>
              <DialogDescription className="text-xs">
                Configure HookCraft interface and editor options
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1">

          {/* ── APPEARANCE ─────────────────────────────────── */}
          <div className="space-y-4">
            <SectionHeader icon={Eye} label="Appearance" />

            {/* Preview Scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Preview Scale</p>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-foreground font-semibold">{previewScale}%</span>
              </div>
              <Slider value={[previewScale]} onValueChange={(([v]) => setPreviewScale(v))} min={50} max={150} step={5} className="py-1 cursor-pointer" />
              <div className="flex justify-between text-[10px] text-muted-foreground/60">
                <span>50% Compact</span><span>100% Default</span><span>150% Large</span>
              </div>
            </div>

            {/* Accent Color */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Accent Color</p>
                <p className="text-[11px] text-muted-foreground/60">Theme color for buttons and highlights</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{accentColor.toUpperCase()}</span>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer border border-border/60 bg-transparent"
                />
              </div>
            </div>

            {/* Preview Theme */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Preview Theme</p>
                <p className="text-[11px] text-muted-foreground/60">Discord message preview background</p>
              </div>
              <div className="flex rounded-lg overflow-hidden border border-border/60">
                <button
                  onClick={() => setPreviewTheme('dark')}
                  className={`px-3 py-1.5 text-xs flex items-center gap-1.5 font-medium transition-colors ${previewTheme === 'dark' ? 'bg-primary text-white' : 'hover:bg-muted/60 text-muted-foreground'}`}
                >
                  <Moon className="w-3 h-3" /> Dark
                </button>
                <button
                  onClick={() => setPreviewTheme('light')}
                  className={`px-3 py-1.5 text-xs flex items-center gap-1.5 font-medium transition-colors ${previewTheme === 'light' ? 'bg-primary text-white' : 'hover:bg-muted/60 text-muted-foreground'}`}
                >
                  <Sun className="w-3 h-3" /> Light
                </button>
              </div>
            </div>
          </div>

          {/* ── EDITOR ─────────────────────────────────────── */}
          <div className="space-y-4" style={SECTION_DIVIDER}>
            <SectionHeader icon={Type} label="Editor" />

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">JSON Editor Font Size</p>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-foreground font-semibold">{editorFontSize}px</span>
              </div>
              <Slider value={[editorFontSize]} onValueChange={(([v]) => setEditorFontSize(v))} min={10} max={20} step={1} className="py-1 cursor-pointer" />
            </div>

            <ToggleRow label="Compact Mode" desc="Reduce padding and spacing in the editor panels" checked={compactMode} onCheckedChange={setCompactMode} />
            <ToggleRow label="Character Counters" desc="Show remaining characters below text fields" checked={showCharCounters} onCheckedChange={setShowCharCounters} />
            <ToggleRow label="Show Timestamps in Preview" desc="Display the message timestamp in the preview" checked={showTimestamps} onCheckedChange={setShowTimestamps} />
          </div>

          {/* ── BEHAVIOUR ──────────────────────────────────── */}
          <div className="space-y-4" style={SECTION_DIVIDER}>
            <SectionHeader icon={Sliders} label="Behaviour" />

            {/* Autosave */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Autosave Interval</p>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-foreground font-semibold">{autosaveInterval}s</span>
              </div>
              <Slider value={[autosaveInterval]} onValueChange={(([v]) => setAutosaveInterval(v))} min={10} max={120} step={10} className="py-1 cursor-pointer" />
            </div>

            <ToggleRow label="Animations & Transitions" desc="Enable micro-animations and motion effects" checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />

            {/* Send Confirm Mode */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Send Confirmation</p>
              <p className="text-[11px] text-muted-foreground/60 mb-2">When to prompt before sending actions</p>
              <div className="space-y-1.5">
                {SEND_CONFIRM_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSendConfirmMode(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left border transition-all ${
                      sendConfirmMode === opt.value
                        ? 'border-primary/60 bg-primary/10 text-foreground'
                        : 'border-border/40 bg-muted/30 text-muted-foreground hover:bg-muted/60'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{opt.label}</p>
                      <p className="text-[10px] opacity-70">{opt.desc}</p>
                    </div>
                    {sendConfirmMode === opt.value && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
