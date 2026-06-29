'use client';

import { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Copy, Trash2 } from 'lucide-react';
import { useMessageStore } from '@/store/message.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CharCounter } from '@/components/ui/CharCounter';
import type { EmbedField } from '@hookcraft/shared';

interface FieldRowProps {
  embedId: string;
  field: EmbedField;
}

function SortableFieldRow({ embedId, field }: FieldRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });
  const { updateField, removeField, duplicateField } = useMessageStore();
  const update = useCallback(
    (patch: Partial<EmbedField>) => updateField(embedId, field.id, patch),
    [embedId, field.id, updateField],
  );

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-lg border border-border bg-card/60 p-3 space-y-2 ${isDragging ? 'opacity-50 ring-2 ring-primary' : ''}`}
    >
      {/* Row header */}
      <div className="flex items-center gap-2">
        <button
          className="text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="flex-1 text-xs text-muted-foreground font-medium truncate">
          {field.name || 'Unnamed field'}
        </span>

        {/* Inline toggle */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Inline</span>
          <Switch
            checked={field.inline ?? false}
            onCheckedChange={(v) => update({ inline: v })}
            className="scale-75"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => duplicateField(embedId, field.id)}
        >
          <Copy className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={() => removeField(embedId, field.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Field name */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="field-label text-[10px]">Name</span>
          <CharCounter current={field.name.length} max={256} className="text-[10px]" />
        </div>
        <Input
          value={field.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Field name..."
          className="h-7 text-xs bg-input border-border"
          maxLength={256}
        />
      </div>

      {/* Field value */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="field-label text-[10px]">Value</span>
          <CharCounter current={field.value.length} max={1024} className="text-[10px]" />
        </div>
        <Textarea
          value={field.value}
          onChange={(e) => update({ value: e.target.value })}
          placeholder="Field value... (supports markdown)"
          className="min-h-[56px] resize-none text-xs bg-input border-border"
          maxLength={1024}
        />
      </div>
    </motion.div>
  );
}

interface EmbedFieldsEditorProps {
  embedId: string;
  fields: EmbedField[];
}

export function EmbedFieldsEditor({ embedId, fields }: EmbedFieldsEditorProps) {
  const { addField, reorderFields } = useMessageStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = fields.findIndex((f) => f.id === active.id);
    const newIdx = fields.findIndex((f) => f.id === over.id);
    reorderFields(embedId, oldIdx, newIdx);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{fields.length}/25 fields</span>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
          onClick={() => addField(embedId)}
          disabled={fields.length >= 25}
        >
          <Plus className="w-3 h-3" />
          Add Field
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            <AnimatePresence>
              {fields.map((field) => (
                <SortableFieldRow key={field.id} embedId={embedId} field={field} />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground/60 text-center py-4">
          No fields. Click "Add Field" to start.
        </p>
      )}
    </div>
  );
}
