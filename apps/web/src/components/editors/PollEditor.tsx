'use client';

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Plus, Trash2, Clock } from 'lucide-react';
import { useMessageStore } from '@/store/message.store';
import { EditorSection } from '@/components/ui/EditorSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { CharCounter } from '@/components/ui/CharCounter';

export function PollEditor() {
  const { message, setPoll, updatePollQuestion, addPollAnswer, removePollAnswer, updatePollAnswer, setPollDuration, setPollMultiselect } = useMessageStore();
  const poll = message.poll;

  function initPoll() {
    setPoll({
      question: { text: 'What is your favorite color?' },
      answers: [
        { id: crypto.randomUUID(), poll_media: { text: 'Red' } },
        { id: crypto.randomUUID(), poll_media: { text: 'Blue' } },
      ],
      duration: 24,
      allow_multiselect: false,
    });
  }

  return (
    <div className="p-4 space-y-4">
      <EditorSection
        title="Poll"
        icon={<BarChart2 className="w-4 h-4" />}
        description="Create an interactive Discord poll"
      >
        {!poll ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">No poll</p>
              <p className="text-xs text-muted-foreground/60">Add a poll to your message</p>
            </div>
            <Button size="sm" onClick={initPoll} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add Poll
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Question */}
            <div className="field-group">
              <div className="flex items-center justify-between">
                <Label className="field-label">Question</Label>
                <CharCounter current={poll.question.text.length} max={300} />
              </div>
              <Input
                value={poll.question.text}
                onChange={(e) => updatePollQuestion(e.target.value)}
                placeholder="Ask your question..."
                className="bg-input border-border"
                maxLength={300}
              />
            </div>

            {/* Answers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="field-label">Options ({poll.answers.length}/10)</Label>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 bg-primary/10 border-primary/30 text-primary"
                  onClick={addPollAnswer}
                  disabled={poll.answers.length >= 10}
                >
                  <Plus className="w-3 h-3" />
                  Option
                </Button>
              </div>
              <AnimatePresence>
                {poll.answers.map((answer, i) => (
                  <motion.div
                    key={answer.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs text-muted-foreground font-mono w-5 text-center">{i + 1}.</span>
                    <div className="flex-1 flex items-center gap-2">
                      <CharCounter current={answer.poll_media.text?.length ?? 0} max={55} className="text-[10px] flex-shrink-0" />
                      <Input
                        value={answer.poll_media.text ?? ''}
                        onChange={(e) => updatePollAnswer(answer.id, e.target.value)}
                        placeholder={`Option ${i + 1}...`}
                        className="h-8 text-sm bg-input border-border"
                        maxLength={55}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={() => removePollAnswer(answer.id)}
                      disabled={poll.answers.length <= 2}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Duration */}
            <div className="field-group">
              <div className="flex items-center justify-between">
                <Label className="field-label">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Duration
                </Label>
                <span className="text-xs font-mono text-muted-foreground">{poll.duration}h</span>
              </div>
              <Slider
                value={[poll.duration]}
                onValueChange={([v]) => setPollDuration(v)}
                min={1}
                max={168}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>1 hour</span>
                <span>7 days</span>
              </div>
            </div>

            {/* Multiselect */}
            <div className="flex items-center justify-between py-2 border-t border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Allow Multiple Selections</p>
                <p className="text-xs text-muted-foreground">Users can vote for multiple options</p>
              </div>
              <Switch
                checked={poll.allow_multiselect}
                onCheckedChange={setPollMultiselect}
              />
            </div>

            {/* Remove poll */}
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
              onClick={() => setPoll(undefined)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Remove Poll
            </Button>
          </div>
        )}
      </EditorSection>
    </div>
  );
}
