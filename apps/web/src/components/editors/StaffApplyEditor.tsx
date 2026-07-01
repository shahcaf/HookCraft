'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Camera, ChevronRight, Send, CheckCircle2,
  Loader2, AlertCircle, Users, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

// ─── Config ──────────────────────────────────────────────────────────────────

const STAFF_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1521940863373279494/l6taXB3F6HMesMoGJ5yo_fiTn0A2cRXtveZje_x1UxVhAs2ZyI-yAZv_Kz_KDLQWcN50';

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffType = 'discord' | 'media';
type FormStep = 'choose' | 'fill' | 'success';

interface DiscordStaffForm {
  discordTag: string;
  age: string;
  timezone: string;
  experience: string;
  whyJoin: string;
  availability: string;
}

interface MediaStaffForm {
  discordTag: string;
  contentType: string;
  portfolio: string;
  tools: string;
  whyJoin: string;
  experience: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDiscordEmbed(form: DiscordStaffForm, applicant: { name: string; image?: string }) {
  return {
    username: 'HookCraft Staff Applications',
    avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
    embeds: [
      {
        title: '🛡️ Discord Staff Application',
        color: 0x5865f2,
        thumbnail: applicant.image ? { url: applicant.image } : undefined,
        fields: [
          { name: '👤 Applicant', value: applicant.name, inline: true },
          { name: '🏷️ Discord Tag', value: form.discordTag, inline: true },
          { name: '🎂 Age', value: form.age, inline: true },
          { name: '🌍 Timezone', value: form.timezone, inline: true },
          { name: '📅 Availability', value: form.availability, inline: true },
          { name: '⭐ Experience', value: form.experience },
          { name: '💬 Why Join?', value: form.whyJoin },
        ],
        footer: { text: 'HookCraft Staff Applications • React below to approve or reject' },
        timestamp: new Date().toISOString(),
      },
    ],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 3,
            label: '✅ Approve',
            custom_id: `approve_discord_${Date.now()}`,
          },
          {
            type: 2,
            style: 4,
            label: '❌ Reject',
            custom_id: `reject_discord_${Date.now()}`,
          },
        ],
      },
    ],
  };
}

function buildMediaEmbed(form: MediaStaffForm, applicant: { name: string; image?: string }) {
  return {
    username: 'HookCraft Staff Applications',
    avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
    embeds: [
      {
        title: '🎬 Media Staff Application',
        color: 0xeb459e,
        thumbnail: applicant.image ? { url: applicant.image } : undefined,
        fields: [
          { name: '👤 Applicant', value: applicant.name, inline: true },
          { name: '🏷️ Discord Tag', value: form.discordTag, inline: true },
          { name: '🎨 Content Type', value: form.contentType, inline: true },
          { name: '🛠️ Tools Used', value: form.tools, inline: true },
          { name: '🔗 Portfolio', value: form.portfolio || 'N/A' },
          { name: '⭐ Experience', value: form.experience },
          { name: '💬 Why Join?', value: form.whyJoin },
        ],
        footer: { text: 'HookCraft Staff Applications • React below to approve or reject' },
        timestamp: new Date().toISOString(),
      },
    ],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 3,
            label: '✅ Approve',
            custom_id: `approve_media_${Date.now()}`,
          },
          {
            type: 2,
            style: 4,
            label: '❌ Reject',
            custom_id: `reject_media_${Date.now()}`,
          },
        ],
      },
    ],
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({
  label, placeholder, value, onChange, multiline = false, required = true,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; multiline?: boolean; required?: boolean;
}) {
  const cls =
    'w-full rounded-xl border border-border bg-input/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all';
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </p>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(cls, 'resize-none')}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function StaffApplyEditor() {
  const { data: session } = useSession();
  const [step, setStep] = useState<FormStep>('choose');
  const [staffType, setStaffType] = useState<StaffType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Discord Staff form fields
  const [ds, setDs] = useState<DiscordStaffForm>({
    discordTag: session?.user?.name || '',
    age: '', timezone: '', experience: '', whyJoin: '', availability: '',
  });

  // Media Staff form fields
  const [ms, setMs] = useState<MediaStaffForm>({
    discordTag: session?.user?.name || '',
    contentType: '', portfolio: '', tools: '', whyJoin: '', experience: '',
  });

  const applicant = {
    name: session?.user?.name || 'Anonymous',
    image: session?.user?.image || undefined,
  };

  async function handleSubmit() {
    setIsLoading(true);
    setError(null);

    const payload =
      staffType === 'discord'
        ? buildDiscordEmbed(ds, applicant)
        : buildMediaEmbed(ms!, applicant);

    try {
      const res = await fetch(STAFF_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Webhook error ${res.status}: ${text}`);
      }

      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setStep('choose');
    setStaffType(null);
    setError(null);
    setDs({ discordTag: session?.user?.name || '', age: '', timezone: '', experience: '', whyJoin: '', availability: '' });
    setMs({ discordTag: session?.user?.name || '', contentType: '', portfolio: '', tools: '', whyJoin: '', experience: '' });
  }

  const isDiscordFormValid =
    ds.discordTag && ds.age && ds.timezone && ds.experience && ds.whyJoin && ds.availability;
  const isMediaFormValid =
    ms.discordTag && ms.contentType && ms.tools && ms.whyJoin && ms.experience;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* Header */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(252 90% 68%) 0%, hsl(330 80% 58%) 100%)', boxShadow: '0 0 20px hsl(252 90% 68% / 0.3)' }}
          >
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Staff Applications</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Apply to join the HookCraft team. Applications go directly to our review channel.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Choose type */}
          {step === 'choose' && (
            <motion.div key="choose" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Choose Position</p>

              {/* Discord Staff */}
              <button
                onClick={() => { setStaffType('discord'); setStep('fill'); }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-[#5865f2]/40 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#5865f2]/15 border border-[#5865f2]/25 group-hover:bg-[#5865f2]/25 transition-colors">
                  <Shield className="w-5 h-5 text-[#5865f2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Discord Staff</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Moderators, helpers, and community managers</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
              </button>

              {/* Media Staff */}
              <button
                onClick={() => { setStaffType('media'); setStep('fill'); }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-[#eb459e]/40 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#eb459e]/15 border border-[#eb459e]/25 group-hover:bg-[#eb459e]/25 transition-colors">
                  <Camera className="w-5 h-5 text-[#eb459e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Media Staff</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Designers, video creators, and content makers</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
              </button>

              {/* Info notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/80">
                  Your application will be sent to staff for review. A staff member will respond to you via Discord DM.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Fill form */}
          {step === 'fill' && staffType === 'discord' && (
            <motion.div key="discord-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#5865f2]" />
                <p className="text-sm font-semibold">Discord Staff Application</p>
              </div>

              <InputField label="Your Discord Tag" placeholder="e.g. username#0000 or @username" value={ds.discordTag} onChange={(v) => setDs({ ...ds, discordTag: v })} />
              <InputField label="Age" placeholder="e.g. 18" value={ds.age} onChange={(v) => setDs({ ...ds, age: v })} />
              <InputField label="Timezone" placeholder="e.g. UTC+3, EST, PST" value={ds.timezone} onChange={(v) => setDs({ ...ds, timezone: v })} />
              <InputField label="Availability (hours/week)" placeholder="e.g. 10 hours/week, Mon-Fri evenings" value={ds.availability} onChange={(v) => setDs({ ...ds, availability: v })} />
              <InputField label="Moderation Experience" placeholder="Describe any previous mod/staff experience..." value={ds.experience} onChange={(v) => setDs({ ...ds, experience: v })} multiline />
              <InputField label="Why do you want to join?" placeholder="Tell us why you'd make a great staff member..." value={ds.whyJoin} onChange={(v) => setDs({ ...ds, whyJoin: v })} multiline />

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => setStep('choose')}>
                  Back
                </Button>
                <Button
                  size="sm"
                  className="flex-1 rounded-xl gap-2"
                  disabled={!isDiscordFormValid || isLoading}
                  onClick={handleSubmit}
                  style={{ background: 'linear-gradient(135deg, #5865f2 0%, #7b6cf7 100%)' }}
                >
                  {isLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending...</> : <><Send className="w-3.5 h-3.5" />Submit Application</>}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'fill' && staffType === 'media' && (
            <motion.div key="media-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#eb459e]" />
                <p className="text-sm font-semibold">Media Staff Application</p>
              </div>

              <InputField label="Your Discord Tag" placeholder="e.g. username#0000 or @username" value={ms.discordTag} onChange={(v) => setMs({ ...ms, discordTag: v })} />
              <InputField label="Content Type" placeholder="e.g. Graphic Design, Video Editing, Photography" value={ms.contentType} onChange={(v) => setMs({ ...ms, contentType: v })} />
              <InputField label="Tools / Software Used" placeholder="e.g. Photoshop, Premiere Pro, Figma, DaVinci" value={ms.tools} onChange={(v) => setMs({ ...ms, tools: v })} />
              <InputField label="Portfolio / Previous Work" placeholder="Link to portfolio, Behance, YouTube, etc. (optional)" value={ms.portfolio} onChange={(v) => setMs({ ...ms, portfolio: v })} required={false} />
              <InputField label="Media Experience" placeholder="Describe your content creation experience..." value={ms.experience} onChange={(v) => setMs({ ...ms, experience: v })} multiline />
              <InputField label="Why do you want to join?" placeholder="Tell us why you'd be a great media team member..." value={ms.whyJoin} onChange={(v) => setMs({ ...ms, whyJoin: v })} multiline />

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => setStep('choose')}>
                  Back
                </Button>
                <Button
                  size="sm"
                  className="flex-1 rounded-xl gap-2"
                  disabled={!isMediaFormValid || isLoading}
                  onClick={handleSubmit}
                  style={{ background: 'linear-gradient(135deg, #eb459e 0%, #c03f88 100%)' }}
                >
                  {isLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending...</> : <><Send className="w-3.5 h-3.5" />Submit Application</>}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-500/15 border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="space-y-1.5">
                <p className="text-base font-bold text-foreground">Application Submitted!</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Your {staffType === 'discord' ? 'Discord Staff' : 'Media Staff'} application has been sent to our team. We'll reach out via Discord DM soon.
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl mt-2" onClick={handleReset}>
                Submit Another Application
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
