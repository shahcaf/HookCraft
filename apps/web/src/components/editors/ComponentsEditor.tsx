'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, MousePointer2 } from 'lucide-react';
import { useMessageStore } from '@/store/message.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditorSection } from '@/components/ui/EditorSection';
import { CharCounter } from '@/components/ui/CharCounter';
import type { ButtonComponent, StringSelectComponent, ActionRow } from '@hookcraft/shared';

const BUTTON_STYLES = [
  { value: '1', label: 'Primary', color: 'bg-[#5865f2] text-white' },
  { value: '2', label: 'Secondary', color: 'bg-[#4e5058] text-white' },
  { value: '3', label: 'Success', color: 'bg-[#248046] text-white' },
  { value: '4', label: 'Danger', color: 'bg-[#da373c] text-white' },
  { value: '5', label: 'Link', color: 'bg-[#4e5058] text-white' },
];

interface ActionRowEditorProps {
  row: ActionRow;
}

function ActionRowEditor({ row }: ActionRowEditorProps) {
  const { removeActionRow, addButton, removeButton, updateButton, addSelectMenu, updateSelectMenu, removeSelectMenu, addSelectOption, updateSelectOption, removeSelectOption } = useMessageStore();

  return (
    <div className="border border-border rounded-xl p-3 space-y-3 bg-card/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Action Row ({row.components.length}/5)
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => removeActionRow(row.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Components in this row */}
      <div className="space-y-2">
        {row.components.map((comp) => {
          if (comp.type === 2) {
            const btn = comp as ButtonComponent;
            return (
              <div key={btn.id} className="border border-border rounded-lg p-2.5 space-y-2 bg-muted/20">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium flex-1">Button</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeButton(row.id, btn.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="field-group">
                    <Label className="field-label text-[10px]">Style</Label>
                    <Select
                      value={String(btn.style)}
                      onValueChange={(v) => updateButton(row.id, btn.id, { style: Number(v) as 1|2|3|4|5 })}
                    >
                      <SelectTrigger className="h-7 text-xs bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {BUTTON_STYLES.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="text-xs">
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="field-group">
                    <div className="flex items-center justify-between">
                      <Label className="field-label text-[10px]">Label</Label>
                      <CharCounter current={btn.label?.length ?? 0} max={80} className="text-[10px]" />
                    </div>
                    <Input
                      value={btn.label ?? ''}
                      onChange={(e) => updateButton(row.id, btn.id, { label: e.target.value })}
                      placeholder="Button label"
                      className="h-7 text-xs bg-input border-border"
                      maxLength={80}
                    />
                  </div>
                </div>

                {btn.style === 5 ? (
                  <div className="field-group">
                    <Label className="field-label text-[10px]">URL</Label>
                    <Input
                      value={btn.url ?? ''}
                      onChange={(e) => updateButton(row.id, btn.id, { url: e.target.value })}
                      placeholder="https://..."
                      className="h-7 text-xs bg-input border-border font-mono"
                    />
                  </div>
                ) : (
                  <div className="field-group">
                    <Label className="field-label text-[10px]">Custom ID</Label>
                    <Input
                      value={btn.custom_id ?? ''}
                      onChange={(e) => updateButton(row.id, btn.id, { custom_id: e.target.value })}
                      placeholder="custom_id..."
                      className="h-7 text-xs bg-input border-border font-mono"
                      maxLength={100}
                    />
                  </div>
                )}
              </div>
            );
          }

          if (comp.type === 3) {
            const menu = comp as StringSelectComponent;
            return (
              <div key={menu.id} className="border border-border rounded-lg p-2.5 space-y-2 bg-muted/20">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium flex-1">Select Menu</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSelectMenu(row.id, menu.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <div className="field-group">
                  <Label className="field-label text-[10px]">Placeholder</Label>
                  <Input
                    value={menu.placeholder ?? ''}
                    onChange={(e) => updateSelectMenu(row.id, menu.id, { placeholder: e.target.value })}
                    placeholder="Choose an option..."
                    className="h-7 text-xs bg-input border-border"
                    maxLength={150}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="field-label text-[10px]">Options ({menu.options.length}/25)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 text-[10px] text-primary gap-0.5"
                      onClick={() => addSelectOption(row.id, menu.id)}
                      disabled={menu.options.length >= 25}
                    >
                      <Plus className="w-2.5 h-2.5" />
                      Add
                    </Button>
                  </div>
                  {menu.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-1.5">
                      <Input
                        value={opt.label}
                        onChange={(e) => updateSelectOption(row.id, menu.id, opt.id, { label: e.target.value })}
                        placeholder="Label"
                        className="h-6 text-xs bg-input border-border flex-1"
                        maxLength={100}
                      />
                      <Input
                        value={opt.value}
                        onChange={(e) => updateSelectOption(row.id, menu.id, opt.id, { value: e.target.value })}
                        placeholder="value"
                        className="h-6 text-xs bg-input border-border flex-1 font-mono"
                        maxLength={100}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => removeSelectOption(row.id, menu.id, opt.id)}
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Add component buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1 border-dashed"
          onClick={() => addButton(row.id)}
          disabled={row.components.length >= 5}
        >
          <Plus className="w-3 h-3" />
          Button
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1 border-dashed"
          onClick={() => addSelectMenu(row.id)}
          disabled={row.components.length >= 1}
        >
          <Plus className="w-3 h-3" />
          Select Menu
        </Button>
      </div>
    </div>
  );
}

export function ComponentsEditor() {
  const { message, addActionRow } = useMessageStore();
  const rows = message.components ?? [];

  return (
    <div className="p-4 space-y-3">
      <EditorSection
        title="Components"
        icon={<MousePointer2 className="w-4 h-4" />}
        description="Add buttons and select menus"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{rows.length}/5 action rows</p>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-7 text-xs bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              onClick={addActionRow}
              disabled={rows.length >= 5}
            >
              <Plus className="w-3 h-3" />
              Add Row
            </Button>
          </div>

          <AnimatePresence>
            {rows.map((row) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ActionRowEditor row={row} />
              </motion.div>
            ))}
          </AnimatePresence>

          {rows.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground/60">
              No action rows yet. Add a row to start adding buttons.
            </div>
          )}
        </div>
      </EditorSection>
    </div>
  );
}
