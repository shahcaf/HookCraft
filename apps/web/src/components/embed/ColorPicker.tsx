'use client';

import { useState, useRef, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  '#5865f2', '#57f287', '#fee75c', '#eb459e', '#ed4245',
  '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#e91e63', '#00bcd4', '#ff5722',
  '#607d8b', '#795548', '#9e9e9e', '#212121', '#ffffff',
];

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-8 h-8 rounded-md border-2 border-border cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring flex-shrink-0"
          style={{ backgroundColor: value }}
          title={value}
        />
      </PopoverTrigger>
      <PopoverContent className="w-52 p-3 bg-popover border-border" side="bottom" align="start">
        {/* Native color input */}
        <div className="mb-3">
          <label className="field-label block mb-1">Custom Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-xs font-mono text-muted-foreground">{value}</span>
          </div>
        </div>

        {/* Preset grid */}
        <label className="field-label block mb-2">Presets</label>
        <div className="grid grid-cols-5 gap-1.5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => { onChange(color); setOpen(false); }}
              className={cn(
                'w-8 h-8 rounded-md border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring',
                value === color ? 'border-primary' : 'border-border',
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
