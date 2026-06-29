'use client';

import { useState } from 'react';
import { BarChart2, CheckSquare } from 'lucide-react';
import type { DiscordPoll } from '@hookcraft/shared';

interface PollPreviewProps {
  poll: DiscordPoll;
}

export function PollPreview({ poll }: PollPreviewProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (!poll.allow_multiselect) next.clear();
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const durationLabel = poll.duration >= 24
    ? `${poll.duration / 24} day${poll.duration / 24 !== 1 ? 's' : ''}`
    : `${poll.duration} hour${poll.duration !== 1 ? 's' : ''}`;

  return (
    <div className="mt-2 p-3 rounded-lg border border-[#3b3d45] bg-[#2b2d31] max-w-[400px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-4 h-4 text-[#5865f2]" />
        <span className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">Poll</span>
        <span className="ml-auto text-[10px] text-[#72767d]">{durationLabel}</span>
      </div>

      {/* Question */}
      <p className="text-sm font-semibold text-[#f2f3f5] mb-3">{poll.question.text}</p>

      {/* Answers */}
      <div className="space-y-2">
        {poll.answers.map((answer) => {
          const isSelected = selected.has(answer.id);
          return (
            <button
              key={answer.id}
              onClick={() => toggle(answer.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm text-left
                ${isSelected
                  ? 'border-[#5865f2] bg-[#5865f2]/20 text-[#f2f3f5]'
                  : 'border-[#3b3d45] bg-[#1e1f22] text-[#dbdee1] hover:border-[#5865f2]/50 hover:bg-[#5865f2]/10'
                }`}
            >
              {poll.allow_multiselect
                ? <CheckSquare className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#5865f2]' : 'text-[#72767d]'}`} />
                : <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${isSelected ? 'border-[#5865f2] bg-[#5865f2]' : 'border-[#72767d]'}`} />
              }
              <span>{answer.poll_media.text}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-[10px] text-[#72767d] mt-3">
        {poll.allow_multiselect ? 'Select all that apply' : 'Select one option'} • 0 votes
      </p>
    </div>
  );
}
