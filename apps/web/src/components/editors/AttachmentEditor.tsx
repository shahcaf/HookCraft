'use client';

import { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Upload, Trash2, FileText, Image, Video } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useMessageStore } from '@/store/message.store';
import { EditorSection } from '@/components/ui/EditorSection';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/utils';
import type { MessageAttachment } from '@hookcraft/shared';

function getFileIcon(type?: string) {
  if (!type) return <FileText className="w-5 h-5" />;
  if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-400" />;
  if (type.startsWith('video/')) return <Video className="w-5 h-5 text-purple-400" />;
  return <FileText className="w-5 h-5 text-muted-foreground" />;
}

export function AttachmentEditor() {
  const { message, addAttachment, removeAttachment } = useMessageStore();
  const attachments = message.attachments ?? [];
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList) => {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const attachment: MessageAttachment = {
            id: uuidv4(),
            filename: file.name,
            content_type: file.type,
            size: file.size,
            dataUrl: e.target?.result as string,
          };
          addAttachment(attachment);
        };
        reader.readAsDataURL(file);
      });
    },
    [addAttachment],
  );

  return (
    <div className="p-4 space-y-4">
      <EditorSection
        title="Attachments"
        icon={<Paperclip className="w-4 h-4" />}
        description="Upload files to attach to the message"
      >
        <div className="space-y-3">
          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files.length) handleFiles(files);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
            />
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag & drop or <span className="text-primary font-medium">click to upload</span>
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">Images, videos, files (max 25MB)</p>
          </div>

          {/* Attachment list */}
          <AnimatePresence>
            {attachments.map((att) => (
              <motion.div
                key={att.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card/50"
              >
                {att.content_type?.startsWith('image/') && att.dataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={att.dataUrl} alt={att.filename} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted/50 flex items-center justify-center flex-shrink-0">
                    {getFileIcon(att.content_type)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{att.filename}</p>
                  <p className="text-xs text-muted-foreground">{att.size ? formatBytes(att.size) : ''}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={() => removeAttachment(att.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {attachments.length === 0 && (
            <p className="text-xs text-muted-foreground/50 text-center">No attachments</p>
          )}
        </div>
      </EditorSection>
    </div>
  );
}
