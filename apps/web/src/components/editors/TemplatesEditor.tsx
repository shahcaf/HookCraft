'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Megaphone, Bell, Shield, Star, Code2, Users,
  Trophy, Gift, AlertTriangle, Info, Zap, ChevronRight, Search,
  Check, Bot, Gamepad2, Music, Palette, BookOpen, Globe, Lock,
  Heart, Flame, Rocket, Calendar, Hash, TrendingUp, BarChart3,
  Cog, Crown, Swords, Package, Layers,
} from 'lucide-react';
import { useMessageStore } from '@/store/message.store';
import { useUIStore } from '@/store/ui.store';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { WebhookMessage } from '@hookcraft/shared';

// ─── Avatar Presets ───────────────────────────────────────────────────────────
interface AvatarPreset {
  id: string;
  name: string;
  description: string;
  username: string;
  avatar_url: string;
  color: string;
  tag?: string;
  isPro?: boolean;
}

const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'blurple-bot',
    name: 'Blurple Bot',
    description: 'Classic Discord blue-purple bot identity',
    username: 'Blurple Bot',
    avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
    color: '#5865f2',
  },
  {
    id: 'mod-bot',
    name: 'Moderator',
    description: 'Authoritative red-themed mod bot',
    username: 'Moderator',
    avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
    color: '#ed4245',
    tag: 'Staff',
  },
  {
    id: 'news-bot',
    name: 'Newscast',
    description: 'Professional news delivery persona',
    username: 'Newscast',
    avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
    color: '#fee75c',
    tag: 'News',
  },
  {
    id: 'music-bot',
    name: 'Melody',
    description: 'Vibrant music-themed bot',
    username: 'Melody ♪',
    avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
    color: '#57f287',
    tag: 'Music',
  },
  {
    id: 'system-bot',
    name: 'System',
    description: 'Clean system / ops notification bot',
    username: 'System',
    avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
    color: '#00b0f4',
    tag: 'System',
  },
  {
    id: 'events-bot',
    name: 'EventsBot',
    description: 'Festive events coordinator persona',
    username: 'EventsBot 🎉',
    avatar_url: 'https://cdn.discordapp.com/embed/avatars/5.png',
    color: '#eb459e',
    tag: 'Events',
  },
  {
    id: 'dev-bot',
    name: 'Dev Logs',
    description: 'Technical developer logs bot',
    username: 'Dev Logs',
    avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
    color: '#9b59b6',
    tag: 'Dev',
    isPro: true,
  },
  {
    id: 'support-bot',
    name: 'Support',
    description: 'Friendly customer support bot',
    username: 'Support ✦',
    avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
    color: '#f0b232',
    tag: 'Help',
    isPro: true,
  },
];

// ─── Templates ────────────────────────────────────────────────────────────────
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  color: string;
  payload: any;
  isNew?: boolean;
  isPro?: boolean;
}

const ts = () => new Date().toISOString();
const future = (hrs: number) => new Date(Date.now() + hrs * 3600000).toISOString();
const unix = (offsetSec = 0) => Math.floor(Date.now() / 1000) + offsetSec;

const TEMPLATES: Template[] = [
  // ─ Community ─────────────────────────────────────────────────────────────
  {
    id: 'welcome',
    name: 'Welcome Message',
    description: 'Greet new members with a warm, colorful embed.',
    category: 'Community',
    icon: Users,
    color: '#57f287',
    payload: {
      username: 'Welcome Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [{
        title: '👋 Welcome to the Server!',
        description: "We're thrilled to have you here!\n\nPlease read the rules and introduce yourself. Feel free to ask any questions — our community is friendly and helpful!",
        color: 0x57f287,
        fields: [
          { name: '📌 Rules', value: 'Check out <#rules> to keep our server friendly.', inline: true },
          { name: '🎯 Get Roles', value: 'Head to <#roles> to pick your interests.', inline: true },
          { name: '💬 Chat', value: 'Jump into <#general> and say hi!', inline: false },
        ],
        footer: { text: 'Enjoy your stay! 🎉' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'rules',
    name: 'Server Rules',
    description: 'Detailed rules embed with numbered sections.',
    category: 'Community',
    icon: BookOpen,
    color: '#5865f2',
    payload: {
      username: 'Server Rules',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      embeds: [{
        title: '📋 Server Rules',
        description: 'Please read and follow all rules. Violations may result in a warning, mute, kick, or ban.',
        color: 0x5865f2,
        fields: [
          { name: '1️⃣ Be Respectful', value: 'Treat all members with respect. Harassment, hate speech, and discrimination are strictly forbidden.', inline: false },
          { name: '2️⃣ No Spam', value: 'Avoid spamming messages, emojis, or mentions. Keep conversations on-topic in relevant channels.', inline: false },
          { name: '3️⃣ No NSFW Content', value: 'All content must be safe for work unless posted in explicitly designated channels.', inline: false },
          { name: '4️⃣ English Only', value: 'Please communicate in English in public channels to ensure everyone can participate.', inline: false },
          { name: '5️⃣ Follow Discord ToS', value: 'All members must follow [Discord\'s Terms of Service](https://discord.com/terms).', inline: false },
        ],
        footer: { text: 'Last updated • Staff Team' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'farewell',
    name: 'Farewell / Goodbye',
    description: 'Warm send-off when a member leaves the server.',
    category: 'Community',
    icon: Heart,
    color: '#eb459e',
    payload: {
      username: 'Farewell Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/5.png',
      embeds: [{
        title: '👋 See You Around!',
        description: '**Username** has left the server.\n\nThank you for being part of our community. You are always welcome to return! 💙',
        color: 0xeb459e,
        footer: { text: 'We hope to see you again soon!' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'giveaway',
    name: 'Giveaway',
    description: 'Eye-catching giveaway with reaction entry instructions.',
    category: 'Community',
    icon: Gift,
    color: '#f0b232',
    payload: {
      username: 'Giveaway Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/5.png',
      content: '🎉 **GIVEAWAY TIME!** 🎉',
      embeds: [{
        title: '🎁 Win a Discord Nitro Subscription!',
        description: 'React with 🎉 to enter!\n\n**How to enter:**\n• Be a member of this server\n• React below with 🎉\n• Invite a friend for a bonus entry!',
        color: 0xf0b232,
        fields: [
          { name: '🏆 Prize', value: 'Discord Nitro (3 Months)', inline: true },
          { name: '👥 Winners', value: '1 Lucky Winner', inline: true },
          { name: '⏰ Ends', value: `<t:${unix(86400)}:R>`, inline: true },
        ],
        footer: { text: 'Hosted by Staff Team • Good luck! 🍀' },
        timestamp: future(24),
      }],
    },
  },
  {
    id: 'birthday',
    name: 'Birthday Celebration',
    description: 'Colorful birthday shout-out for a member.',
    category: 'Community',
    icon: Star,
    color: '#fee75c',
    isNew: true,
    payload: {
      username: 'Birthday Bot 🎂',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/5.png',
      content: '@here',
      embeds: [{
        title: '🎂 Happy Birthday!',
        description: 'Let\'s all wish **@Username** a very happy birthday! 🥳\n\nThank you for being an amazing part of our community. We hope your day is as special as you are! 🎉🎈',
        color: 0xfee75c,
        fields: [
          { name: '🎁 Server Gift', value: 'Enjoy 7 days of special birthday role!', inline: true },
          { name: '🎂 Age', value: '?? years young!', inline: true },
        ],
        image: { url: 'https://picsum.photos/600/150?random=birthday' },
        footer: { text: 'From the entire community with love ❤️' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'level-up',
    name: 'Level Up Notification',
    description: 'Celebrate a member reaching a new level.',
    category: 'Community',
    icon: TrendingUp,
    color: '#57f287',
    isNew: true,
    payload: {
      username: 'Level Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      embeds: [{
        title: '⬆️ Level Up!',
        description: '**@Username** has leveled up!\n\nKeep engaging with the community to earn more XP and unlock exclusive perks.',
        color: 0x57f287,
        fields: [
          { name: '📊 New Level', value: '**Level 10**', inline: true },
          { name: '🏅 New Role', value: '<@&RoleID>', inline: true },
          { name: '⭐ Total XP', value: '4,200 XP', inline: true },
        ],
        footer: { text: 'Keep it up! • Powered by XP System' },
        timestamp: ts(),
      }],
    },
  },

  // ─ Announcements ──────────────────────────────────────────────────────────
  {
    id: 'announcement',
    name: 'Server Announcement',
    description: 'Official server-wide announcement with bold styling.',
    category: 'Announcements',
    icon: Megaphone,
    color: '#fee75c',
    payload: {
      username: 'Announcements',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      content: '@everyone',
      embeds: [{
        title: '📣 Important Announcement',
        description: 'We have exciting news to share with the community!\n\nReplace this text with your announcement details.',
        color: 0xfee75c,
        fields: [
          { name: 'When?', value: 'Today at 5:00 PM EST', inline: true },
          { name: 'Where?', value: 'Voice Channel: Events', inline: true },
        ],
        footer: { text: 'Server Staff Team' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'event',
    name: 'Community Event',
    description: 'Announce an upcoming event with details.',
    category: 'Announcements',
    icon: Calendar,
    color: '#eb459e',
    isNew: true,
    payload: {
      username: 'EventsBot 🎉',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/5.png',
      content: '📅 **New Event Alert!**',
      embeds: [{
        title: '🎮 Community Game Night',
        description: 'Join us for an epic game night with the community! Everyone is welcome regardless of skill level.\n\n**Games we\'ll play:**\n• Among Us\n• Gartic Phone\n• Jackbox Party Pack',
        color: 0xeb459e,
        fields: [
          { name: '📅 Date', value: `<t:${unix(86400 * 3)}:F>`, inline: true },
          { name: '⏰ Duration', value: '2–3 hours', inline: true },
          { name: '🎤 Voice Channel', value: 'Events VC', inline: true },
          { name: '📝 How to Join', value: 'React with ✅ below to get the @Event ping!', inline: false },
        ],
        footer: { text: 'Organized by Staff • See you there! 🚀' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'maintenance',
    name: 'Maintenance Notice',
    description: 'Scheduled maintenance window notification.',
    category: 'Announcements',
    icon: Cog,
    color: '#f0b232',
    payload: {
      username: 'System',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
      embeds: [{
        title: '🔧 Scheduled Maintenance',
        description: 'Our bot/server will be undergoing scheduled maintenance. During this time, some features may be unavailable.',
        color: 0xf0b232,
        fields: [
          { name: '⏰ Start Time', value: `<t:${unix(3600)}:F>`, inline: true },
          { name: '⏱️ Duration', value: 'Approximately 30 minutes', inline: true },
          { name: '🔍 Affected Services', value: 'Music, Economy, Leveling', inline: false },
        ],
        footer: { text: 'We apologize for any inconvenience.' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'server-boost',
    name: 'Server Boost Thank You',
    description: 'Thank a member for boosting the server.',
    category: 'Announcements',
    icon: Flame,
    color: '#ff73fa',
    isNew: true,
    payload: {
      username: 'Boost Bot 💜',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/5.png',
      content: '💜 **Server Boost!**',
      embeds: [{
        title: '🚀 Thank You for Boosting!',
        description: '**@Username** just boosted the server!\n\nWe\'ve now reached **Level 2** boosting! Thank you so much for your support — it means the world to us! 💜',
        color: 0xff73fa,
        fields: [
          { name: '✨ Perks Unlocked', value: '• 150 emoji slots\n• Better audio quality\n• Animated server icon', inline: false },
          { name: '🎁 Your Reward', value: 'Special Booster role + exclusive channel access!', inline: false },
        ],
        footer: { text: 'Server Boost • ' + new Date().toLocaleDateString() },
        timestamp: ts(),
      }],
    },
  },

  // ─ Operations ─────────────────────────────────────────────────────────────
  {
    id: 'alert',
    name: 'Incident Alert',
    description: 'Critical red alert for outages or issues.',
    category: 'Operations',
    icon: AlertTriangle,
    color: '#ed4245',
    payload: {
      username: 'Status Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      content: '⚠️ **Service Disruption**',
      embeds: [{
        title: '🚨 Incident Report',
        description: 'We are currently experiencing issues. Our team is actively investigating and working on a fix.',
        color: 0xed4245,
        fields: [
          { name: 'Status', value: '🔴 Investigating', inline: true },
          { name: 'Started', value: `<t:${unix()}:R>`, inline: true },
          { name: 'Affected', value: 'API • Dashboard', inline: false },
        ],
        footer: { text: 'Updates will follow. We apologize for the inconvenience.' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'incident-resolved',
    name: 'Incident Resolved',
    description: 'Post-incident resolution update.',
    category: 'Operations',
    icon: Check,
    color: '#57f287',
    isNew: true,
    payload: {
      username: 'Status Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
      embeds: [{
        title: '✅ Incident Resolved',
        description: 'The issue has been fully resolved. All systems are now operating normally.',
        color: 0x57f287,
        fields: [
          { name: 'Status', value: '🟢 Operational', inline: true },
          { name: 'Resolved At', value: `<t:${unix()}:T>`, inline: true },
          { name: 'Root Cause', value: 'Database connection pool exhaustion under high load.', inline: false },
          { name: 'Prevention', value: 'We have increased connection limits and added auto-scaling.', inline: false },
        ],
        footer: { text: 'Thank you for your patience!' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'moderation',
    name: 'Moderation Log',
    description: 'Transparent moderation action record.',
    category: 'Operations',
    icon: Shield,
    color: '#5865f2',
    payload: {
      username: 'Mod Log',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      embeds: [{
        title: '🔨 Moderation Action',
        description: 'A moderation action has been taken against a member.',
        color: 0x5865f2,
        fields: [
          { name: 'Action', value: 'Timeout', inline: true },
          { name: 'Duration', value: '1 hour', inline: true },
          { name: 'Moderator', value: 'Staff#0001', inline: true },
          { name: 'Reason', value: 'Violation of Rule #3 – Spam', inline: false },
        ],
        footer: { text: `Case #42 • ${new Date().toLocaleDateString()}` },
        timestamp: ts(),
      }],
    },
  },

  // ─ Development ────────────────────────────────────────────────────────────
  {
    id: 'release',
    name: 'Version Release',
    description: 'Changelog and version release notes.',
    category: 'Development',
    icon: Rocket,
    color: '#5865f2',
    payload: {
      username: 'Release Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      embeds: [{
        title: '⚡ v2.0.0 Released!',
        description: 'A major new version is out! Here\'s what changed:',
        color: 0x5865f2,
        fields: [
          { name: '✨ New Features', value: '• Feature A added\n• Feature B improved\n• Dashboard redesigned', inline: false },
          { name: '🐛 Bug Fixes', value: '• Fixed crash on startup\n• Resolved API rate limiting', inline: false },
          { name: '⚠️ Breaking Changes', value: '• Config format changed — see docs', inline: false },
        ],
        footer: { text: 'v2.0.0 • Full changelog on GitHub' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'deploy',
    name: 'Deployment Notification',
    description: 'CI/CD pipeline deployment success or failure.',
    category: 'Development',
    icon: Package,
    color: '#57f287',
    isNew: true,
    payload: {
      username: 'Deploy Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      embeds: [{
        title: '🚀 Deployment Successful',
        description: 'A new deployment has been pushed to **production**.',
        color: 0x57f287,
        fields: [
          { name: '📦 Version', value: '`v1.4.2-rc.1`', inline: true },
          { name: '🌿 Branch', value: '`main`', inline: true },
          { name: '⏱️ Deploy Time', value: '1m 42s', inline: true },
          { name: '👤 Triggered by', value: 'devuser', inline: true },
          { name: '🔗 Commit', value: '[`a3f8c2d`](https://github.com)', inline: true },
          { name: '📝 Changes', value: '3 files changed, +240, -18', inline: true },
        ],
        footer: { text: 'CI/CD Pipeline • GitHub Actions' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'embed-showcase',
    name: 'Rich Embed Showcase',
    description: 'Full demo of all Discord embed features.',
    category: 'Development',
    icon: Layers,
    color: '#9b59b6',
    payload: {
      username: 'Demo Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      content: 'Here is a full embed showcase! 🚀',
      embeds: [{
        author: { name: 'Author Name', url: 'https://example.com', icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png' },
        title: '📦 Full Embed Example',
        url: 'https://example.com',
        description: 'This embed shows **all** available Discord embed fields.\n\nYou can use **bold**, *italic*, `code`, ~~strikethrough~~, and [links](https://example.com).',
        color: 0x9b59b6,
        fields: [
          { name: 'Inline 1', value: 'Value here', inline: true },
          { name: 'Inline 2', value: 'Value here', inline: true },
          { name: 'Inline 3', value: 'Value here', inline: true },
          { name: 'Full Width', value: 'This field spans the full width of the embed body.', inline: false },
        ],
        image: { url: 'https://picsum.photos/600/200?random=1' },
        thumbnail: { url: 'https://cdn.discordapp.com/embed/avatars/0.png' },
        footer: { text: 'Footer text • Timestamp →', icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png' },
        timestamp: ts(),
      }],
    },
  },

  // ─ Gaming ────────────────────────────────────────────────────────────────
  {
    id: 'game-update',
    name: 'Game Update',
    description: 'Announce a new patch or game update.',
    category: 'Gaming',
    icon: Gamepad2,
    color: '#57f287',
    isNew: true,
    payload: {
      username: 'Game Bot 🎮',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      content: '🎮 **New Patch Available!**',
      embeds: [{
        title: '🕹️ Patch 3.7.1 — Balance Update',
        description: 'A new game patch has arrived! Here\'s what changed:',
        color: 0x57f287,
        fields: [
          { name: '⚔️ Buffs', value: '• Warrior: +5% damage\n• Mage: +10% spell power', inline: true },
          { name: '🛡️ Nerfs', value: '• Rogue: -8% stealth duration\n• Tank: -3% block chance', inline: true },
          { name: '🐛 Bug Fixes', value: '• Fixed invisible wall in Map 3\n• Resolved crash in PvP mode', inline: false },
          { name: '🗺️ New Content', value: '• New dungeon: Crystal Caverns\n• 3 new cosmetic skins', inline: false },
        ],
        footer: { text: 'Patch 3.7.1 • Full notes on our website' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'tournament',
    name: 'Tournament Announcement',
    description: 'Epic tournament sign-up announcement.',
    category: 'Gaming',
    icon: Trophy,
    color: '#fee75c',
    isNew: true,
    payload: {
      username: 'Tournament Bot 🏆',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      content: '🏆 **TOURNAMENT OPEN!** 🏆',
      embeds: [{
        title: '⚔️ Seasonal Tournament — Season 5',
        description: 'The biggest tournament of the season is here! Prove your skills and compete for glory and prizes!',
        color: 0xfee75c,
        fields: [
          { name: '📅 Date', value: `<t:${unix(86400 * 7)}:F>`, inline: true },
          { name: '🎮 Format', value: 'Single Elimination', inline: true },
          { name: '👥 Team Size', value: '5v5', inline: true },
          { name: '🏆 Prizes', value: '1st: $500\n2nd: $200\n3rd: $100', inline: true },
          { name: '📝 Registration', value: `Closes <t:${unix(86400 * 5)}:R>`, inline: true },
          { name: '🔗 Sign Up', value: '[Click here to register](https://example.com/signup)', inline: false },
        ],
        footer: { text: 'Good luck to all participants! May the best team win! ⚔️' },
        timestamp: ts(),
      }],
    },
  },

  // ─ Polls ─────────────────────────────────────────────────────────────────
  {
    id: 'poll-simple',
    name: 'Simple Poll',
    description: 'Quick yes/no or multi-option poll.',
    category: 'Polls',
    icon: BarChart3,
    color: '#00b0f4',
    payload: {
      username: 'Poll Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      embeds: [{
        title: '📊 Community Poll',
        description: '**What feature would you like to see next?**\n\n🅰️ — Feature A: Dashboard Redesign\n🅱️ — Feature B: New Commands\n🅲 — Feature C: Mobile App\n\n*React to vote! Poll closes in 24 hours.*',
        color: 0x00b0f4,
        footer: { text: 'Your vote matters! • Poll closes in 24h' },
        timestamp: future(24),
      }],
    },
  },
  {
    id: 'feedback',
    name: 'Feedback Request',
    description: 'Ask your community for honest feedback.',
    category: 'Polls',
    icon: Star,
    color: '#f0b232',
    isNew: true,
    payload: {
      username: 'Feedback Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [{
        title: '💬 We Want Your Feedback!',
        description: 'Your opinion matters to us! Please take a moment to rate your experience and share your thoughts.',
        color: 0xf0b232,
        fields: [
          { name: '⭐ Rate Us', value: 'React with ⭐ (1–5) to rate your experience!\n⭐ — Poor\n⭐⭐ — Fair\n⭐⭐⭐ — Good\n⭐⭐⭐⭐ — Great\n⭐⭐⭐⭐⭐ — Excellent', inline: false },
          { name: '💡 Suggestions?', value: 'Share your ideas in <#suggestions>!', inline: false },
        ],
        footer: { text: 'Thank you for helping us improve!' },
        timestamp: ts(),
      }],
    },
  },

  // ─ Premium / VIP ─────────────────────────────────────────────────────────
  {
    id: 'vip-welcome',
    name: 'VIP Member Welcome',
    description: 'Exclusive welcome for premium/VIP members.',
    category: 'Premium',
    icon: Crown,
    color: '#fee75c',
    isPro: true,
    payload: {
      username: 'VIP System ✦',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      embeds: [{
        title: '👑 Welcome to VIP, **@Username**!',
        description: 'You\'ve unlocked exclusive VIP membership! Your support means everything to us.\n\nEnjoy your premium perks and thank you for being a valued member of our community! ✨',
        color: 0xfee75c,
        fields: [
          { name: '✦ VIP Channels', value: '• <#vip-lounge>\n• <#early-access>\n• <#vip-announcements>', inline: true },
          { name: '🎁 Your Perks', value: '• Custom color role\n• Priority support\n• Exclusive emojis', inline: true },
          { name: '📬 Need Help?', value: 'Open a ticket in <#support> anytime!', inline: false },
        ],
        thumbnail: { url: 'https://cdn.discordapp.com/embed/avatars/3.png' },
        footer: { text: '✦ VIP Member • Thank you for your support!' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard',
    description: 'Weekly/monthly top members leaderboard.',
    category: 'Premium',
    icon: TrendingUp,
    color: '#fee75c',
    isPro: true,
    payload: {
      username: 'Leaderboard Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      embeds: [{
        title: '🏆 Weekly Leaderboard',
        description: 'Here are the top members for this week! Keep engaging to climb the ranks.',
        color: 0xfee75c,
        fields: [
          { name: '🥇 1st Place', value: '**@Member1** — 2,450 XP', inline: false },
          { name: '🥈 2nd Place', value: '**@Member2** — 1,980 XP', inline: false },
          { name: '🥉 3rd Place', value: '**@Member3** — 1,740 XP', inline: false },
          { name: '4️⃣ 4th Place', value: '**@Member4** — 1,320 XP', inline: false },
          { name: '5️⃣ 5th Place', value: '**@Member5** — 1,100 XP', inline: false },
        ],
        footer: { text: 'Resets every Monday • Earn XP by chatting!' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'site-contact',
    name: 'Contact Form Submission',
    description: 'Alert for new user contact form submission.',
    category: 'Website',
    icon: Globe,
    color: '#00b0f4',
    isNew: true,
    payload: {
      username: 'Contact Form',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
      embeds: [{
        title: '📥 New Contact Inquiry',
        description: 'A visitor has submitted a message via the contact form on your website.',
        color: 0x00b0f4,
        fields: [
          { name: '👤 Name', value: 'Jane Doe', inline: true },
          { name: '✉️ Email', value: 'jane.doe@example.com', inline: true },
          { name: '💬 Message', value: 'Hello! I am interested in your services and would like to schedule a quick call to discuss pricing and options. Thanks!', inline: false },
          { name: '🌐 Page Source', value: '`/pricing`', inline: true },
          { name: '🖥️ IP Address', value: '`192.168.1.1`', inline: true },
        ],
        footer: { text: 'HookCraft Form Router' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'site-sale',
    name: 'E-Commerce Purchase Success',
    description: 'Stripe or Shopify style sale alert.',
    category: 'Website',
    icon: Star,
    color: '#57f287',
    isNew: true,
    payload: {
      username: 'Merchant Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      content: '💰 **New Sale Received!**',
      embeds: [{
        title: '🛍️ Order #2049 — Shopify Store',
        description: 'A customer has successfully placed a new order.',
        color: 0x57f287,
        fields: [
          { name: '💵 Total Revenue', value: '**$129.50 USD**', inline: true },
          { name: '💳 Payment Method', value: 'Stripe (Visa)', inline: true },
          { name: '📦 Items Purchased', value: '• 1x HookCraft Developer Pro License\n• 1x Custom Branding Package Addon', inline: false },
          { name: '🚚 Customer Name', value: 'John Smith', inline: true },
          { name: '✉️ Customer Email', value: 'john.smith@gmail.com', inline: true },
        ],
        footer: { text: 'Shopify Webhook Processor' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'site-uptime',
    name: 'Uptime Monitor Down Alert',
    description: 'Alert when your website or API server goes offline.',
    category: 'Website',
    icon: AlertTriangle,
    color: '#ed4245',
    isNew: true,
    payload: {
      username: 'Uptime Monitor',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      content: '🚨 **System Down Alert**',
      embeds: [{
        title: '🔴 Website Offline: `https://example.com`',
        description: 'Our automated health checkers detected that the main site is currently unreachable.',
        color: 0xed4245,
        fields: [
          { name: '🔍 Error Code', value: '`HTTP 502 Bad Gateway`', inline: true },
          { name: '⏱️ Latency', value: '`- ms (Connection Timeout)`', inline: true },
          { name: '🌎 Location Checker', value: 'US-East (Virginia)', inline: true },
          { name: '🚨 Action Required', value: 'Check server processes immediately! Staff has been pinged.', inline: false },
        ],
        footer: { text: 'Uptime Checker Daemon' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'site-signup',
    name: 'New User Registration',
    description: 'Uplifting signup notification for site growth metrics.',
    category: 'Website',
    icon: Users,
    color: '#eb459e',
    isNew: true,
    payload: {
      username: 'Auth Service',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/5.png',
      embeds: [{
        title: '✨ New Member Registration',
        description: 'A new user has just created an account on your website!',
        color: 0xeb459e,
        fields: [
          { name: '👤 Username', value: 'dev_hero99', inline: true },
          { name: '✉️ Email', value: 'd***9@gmail.com', inline: true },
          { name: '🔑 Provider', value: 'Google OAuth', inline: true },
          { name: '📈 Total Users', value: '45,821 users', inline: true },
        ],
        footer: { text: 'User Registration Service' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'site-newsletter',
    name: 'Newsletter Subscriber',
    description: 'Grow your list with subscription metrics alerts.',
    category: 'Website',
    icon: Bell,
    color: '#fee75c',
    isNew: true,
    payload: {
      username: 'Newsletter Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      embeds: [{
        title: '📧 New Newsletter Subscriber!',
        description: 'Someone just signed up to receive updates from your blog.',
        color: 0xfee75c,
        fields: [
          { name: '✉️ Email Address', value: 'subscriber@domain.com', inline: true },
          { name: '📅 Joined Date', value: `<t:${unix()}:d>`, inline: true },
          { name: '⚡ Source campaign', value: 'Footer form sign-up', inline: false },
        ],
        footer: { text: 'Mailchimp Integration' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'mod-apply',
    name: 'Moderator Application',
    description: 'Staff review alert for new moderator applications.',
    category: 'Operations',
    icon: Shield,
    color: '#eb459e',
    isNew: true,
    payload: {
      username: 'Staff Recruits',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      content: '📥 **New Staff Application Submitted!**',
      embeds: [{
        title: 'Moderator Application: @ApplicantName',
        description: 'A new user has submitted a staff application form for review.',
        color: 0xeb459e,
        fields: [
          { name: '👤 Applicant', value: '<@ApplicantID> (ApplicantName#0000)', inline: true },
          { name: '⏱️ Member Since', value: '3 months ago', inline: true },
          { name: '❓ Why do you want to join?', value: 'I want to help keep the chat clean and assist new users during active EU hours.', inline: false },
          { name: '❓ Past moderation experience?', value: 'Moderated 2 other servers with 5k+ members. Familiar with Discord moderation tools and bot logs.', inline: false },
          { name: '🌐 Reference links', value: '[Application Form](https://example.com/mod)', inline: false },
        ],
        footer: { text: 'Recruitment Desk' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'ticket-open',
    name: 'Support Ticket Opened',
    description: 'Notification for staff when a new support ticket is created.',
    category: 'Operations',
    icon: Bell,
    color: '#5865f2',
    isNew: true,
    payload: {
      username: 'Ticket Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [{
        title: '🎫 Ticket #0482 Opened',
        description: 'A user has created a new support ticket.',
        color: 0x5865f2,
        fields: [
          { name: '👤 Creator', value: '<@UserID> (Username#0000)', inline: true },
          { name: '📂 Category', value: 'Billing Support', inline: true },
          { name: '📝 Description', value: 'I paid for the premium package but the role has not updated in the server yet.', inline: false },
        ],
        footer: { text: 'Tickets System' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'verify-request',
    name: 'Verification Request',
    description: 'Requires staff review for member entrance verification.',
    category: 'Operations',
    icon: Lock,
    color: '#fee75c',
    isNew: true,
    payload: {
      username: 'Verification',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
      embeds: [{
        title: '🔒 Verification Request',
        description: 'A user is waiting to be verified in the server entrance gate.',
        color: 0xfee75c,
        fields: [
          { name: '👤 Account', value: '<@UserID> (Username#0000)', inline: true },
          { name: '📅 Created', value: 'Just now', inline: true },
          { name: '🔑 Provided Code', value: '`SECRET_CODE_9381`', inline: true },
        ],
        footer: { text: 'Gatekeeper system' },
        timestamp: ts(),
      }],
    },
  },

  // ─ Changelog ─────────────────────────────────────────────────────────────
  {
    id: 'changelog-major',
    name: 'Major Release',
    description: 'Full changelog for a major version with features, fixes and breaking changes.',
    category: 'Changelog',
    icon: Rocket,
    color: '#5865f2',
    isNew: true,
    payload: {
      username: 'Release Notes',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      content: '📣 **v2.0.0 is out now!**',
      embeds: [{
        author: { name: 'Release Bot', icon_url: 'https://cdn.discordapp.com/embed/avatars/1.png' },
        title: '🚀 v2.0.0 — Major Release',
        url: 'https://github.com/example/repo/releases/tag/v2.0.0',
        description: 'This release brings a complete overhaul of the core system with new features, performance improvements, and breaking changes. Please review before upgrading.',
        color: 0x5865f2,
        fields: [
          { name: '✨ New Features', value: '• Complete UI redesign\n• New API v2 with GraphQL support\n• Multi-language support (10 new locales)\n• Real-time collaboration mode', inline: false },
          { name: '⚡ Improvements', value: '• 3x faster build times\n• Reduced memory usage by 40%\n• Better error messages', inline: false },
          { name: '🐛 Bug Fixes', value: '• Fixed auth token expiry edge case\n• Resolved database connection pool leak\n• Fixed dark mode flicker on load', inline: false },
          { name: '⚠️ Breaking Changes', value: '• Config file format changed (`.json` → `.yaml`)\n• Legacy API v1 endpoints removed\n• Node.js 18+ now required', inline: false },
          { name: '📦 How to Upgrade', value: '[Migration Guide →](https://example.com/docs/migrate)', inline: true },
          { name: '📝 Full Changelog', value: '[GitHub Releases →](https://github.com)', inline: true },
        ],
        footer: { text: 'v2.0.0 • Released today' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'changelog-minor',
    name: 'Minor Update',
    description: 'Compact changelog for a minor version update with features and fixes.',
    category: 'Changelog',
    icon: Zap,
    color: '#57f287',
    isNew: true,
    payload: {
      username: 'Release Notes',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      embeds: [{
        title: '⚡ v1.5.0 — Minor Update',
        url: 'https://github.com/example/repo/releases/tag/v1.5.0',
        description: 'A new minor update is available with quality-of-life improvements and bug fixes.',
        color: 0x57f287,
        fields: [
          { name: '✨ What\'s New', value: '• Added export to CSV feature\n• New webhook retry policy settings\n• Improved search with filters', inline: false },
          { name: '🐛 Fixes', value: '• Fixed pagination on large datasets\n• Corrected timezone display in logs', inline: false },
        ],
        thumbnail: { url: 'https://cdn.discordapp.com/embed/avatars/1.png' },
        footer: { text: 'v1.5.0 • Full changelog on GitHub' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'changelog-patch',
    name: 'Hotfix / Patch',
    description: 'Quick patch announcement for a critical bug fix.',
    category: 'Changelog',
    icon: Cog,
    color: '#f0b232',
    isNew: true,
    payload: {
      username: 'Patch Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
      embeds: [{
        title: '🔧 v1.4.3 — Hotfix',
        description: 'A critical hotfix has been deployed to resolve a production issue.',
        color: 0xf0b232,
        fields: [
          { name: '🐛 Fixed', value: '• [CRITICAL] Fixed crash when processing empty webhook payloads\n• Resolved race condition in job queue', inline: false },
          { name: '🎯 Affected Versions', value: 'v1.4.0 → v1.4.2', inline: true },
          { name: '⚡ Deploy Time', value: 'Under 30 seconds', inline: true },
        ],
        footer: { text: 'v1.4.3 • Hotfix deployed' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'changelog-breaking',
    name: 'Breaking Changes Notice',
    description: 'Advance warning before deploying breaking API or config changes.',
    category: 'Changelog',
    icon: AlertTriangle,
    color: '#ed4245',
    isNew: true,
    payload: {
      username: 'Breaking Changes',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      content: '⚠️ **Breaking changes shipping in 7 days — action required!**',
      embeds: [{
        title: '⚠️ Upcoming Breaking Changes — v3.0.0',
        description: 'The following breaking changes will be **deployed on** <t:' + unix(86400 * 7) + ':D>. Please review your integration and upgrade before then to avoid downtime.',
        color: 0xed4245,
        fields: [
          { name: '💥 Breaking Change #1', value: '`/api/v1/*` endpoints will be **removed**. Migrate to `/api/v2/`.', inline: false },
          { name: '💥 Breaking Change #2', value: 'The `token` field in auth responses is renamed to `access_token`.', inline: false },
          { name: '💥 Breaking Change #3', value: 'Webhook payloads now require `Content-Type: application/json` header.', inline: false },
          { name: '📖 Migration Guide', value: '[docs.example.com/v3-migration](https://example.com)', inline: true },
          { name: '💬 Need Help?', value: 'Ask in <#support> or open an issue on GitHub.', inline: true },
        ],
        footer: { text: 'Scheduled for v3.0.0 deployment' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'changelog-security',
    name: 'Security Update',
    description: 'Security advisory and patch announcement.',
    category: 'Changelog',
    icon: Shield,
    color: '#ed4245',
    isNew: true,
    payload: {
      username: 'Security Advisory',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      content: '🔒 **Security Update — Immediate action recommended**',
      embeds: [{
        title: '🔒 Security Advisory: CVE-2025-XXXX',
        description: 'We have identified and patched a **high-severity vulnerability** affecting all versions prior to `v1.8.1`. We strongly recommend all users update immediately.',
        color: 0xed4245,
        fields: [
          { name: '🎯 Severity', value: '🔴 High (CVSS 8.1)', inline: true },
          { name: '📦 Patched In', value: '`v1.8.1`', inline: true },
          { name: '📋 Description', value: 'An authenticated user could escalate privileges via a crafted request to the admin API endpoint.', inline: false },
          { name: '✅ Fix', value: 'Update to `v1.8.1` or later. The endpoint now enforces strict role validation.', inline: false },
          { name: '📢 Disclosure', value: 'Responsibly disclosed by a community researcher. Thank you!', inline: false },
        ],
        footer: { text: 'Security Team • Coordinated Disclosure' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'changelog-deprecation',
    name: 'Deprecation Notice',
    description: 'Notify users about deprecated features with a sunset timeline.',
    category: 'Changelog',
    icon: Bell,
    color: '#f0b232',
    isNew: true,
    payload: {
      username: 'Deprecation Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      embeds: [{
        title: '⏳ Deprecation Notice: Legacy Auth System',
        description: 'We are deprecating the **Legacy Auth System** (`v1` tokens). Please migrate to the new OAuth 2.0 flow before the sunset date.',
        color: 0xf0b232,
        fields: [
          { name: '📅 Sunset Date', value: '<t:' + unix(86400 * 90) + ':D> (90 days from now)', inline: true },
          { name: '🔄 Replacement', value: 'OAuth 2.0 (`/auth/oauth`)', inline: true },
          { name: '📖 Migration Steps', value: '1. Generate a new OAuth token at `/auth/oauth`\n2. Replace `Bearer <legacy_token>` with `Bearer <oauth_token>`\n3. Update your token refresh logic (new TTL: 7 days)', inline: false },
          { name: '📬 Questions?', value: 'Reach out in <#dev-support> or open a GitHub discussion.', inline: false },
        ],
        footer: { text: 'Deprecation Policy • Please migrate before the sunset date' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'premium-giveaway',
    category: 'Premium',
    name: 'Pro Giveaway Alert',
    description: 'High-quality giveaway announcement with gradient styling.',
    icon: Gift,
    color: '#fee75c',
    isNew: true,
    isPro: true,
    payload: {
      username: 'Giveaway Master',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      embeds: [{
        title: '🎉 **HUGE PREMIUM GIVEAWAY!** 🎉',
        description: 'We are giving away **1x Nitro Boost (1 Year)** to one lucky winner! React below to enter. Make sure you read the rules before entering.',
        color: 0xfee75c,
        fields: [
          { name: '🏆 Prize', value: 'Discord Nitro Boost (1 Year)', inline: true },
          { name: '⏱️ Ends In', value: '<t:' + unix(86400 * 7) + ':R>', inline: true },
          { name: '👑 Hosted By', value: '<@1234567890>', inline: true },
        ],
        image: { url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop' },
        footer: { text: 'Premium Giveaways • Good luck!' },
        timestamp: ts(),
      }],
    },
  },
  {
    id: 'premium-ticket',
    category: 'Premium',
    name: 'Pro Ticket Panel',
    description: 'Clean, professional ticket support panel.',
    icon: Shield,
    color: '#5865f2',
    isNew: true,
    isPro: true,
    payload: {
      username: 'Support System',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [{
        title: '🎫 Need Help? Open a Ticket',
        description: 'If you have a question, issue, or want to report a bug, please open a ticket below.\n\n**Response Time:** ~15 minutes\n**Hours:** 24/7',
        color: 0x5865f2,
        thumbnail: { url: 'https://cdn.discordapp.com/embed/avatars/0.png' },
        footer: { text: 'VIP Support System' },
      }],
    },
  },

  {
    id: 'premium-template-welcome-pro',
    category: 'Premium',
    name: 'Pro Welcome Banner',
    description: 'Stunning greeting layout featuring embedded images and server rules.',
    icon: Users,
    color: '#eb459e',
    isPro: true,
    payload: {
      username: 'Welcome Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      embeds: [{
        title: '👋 Welcome to the Server!',
        description: 'We are thrilled to have you here. Please make sure to check out <#rules> and grab some roles in <#roles> to get started!',
        color: 0xeb459e,
        image: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop' },
        fields: [
          { name: '📖 Rules Check', value: 'Read guidelines to avoid moderation action.', inline: true },
          { name: '✨ Customize Profile', value: 'Choose self-roles in the channel.', inline: true }
        ],
        footer: { text: 'HookCraft Community • Member Join' }
      }]
    }
  },
  {
    id: 'premium-template-server-rules',
    category: 'Premium',
    name: 'Pro Rulebook Layout',
    description: 'Clean formatted layout for displaying official community guidelines.',
    icon: Shield,
    color: '#ed4245',
    isPro: true,
    payload: {
      username: 'Guard Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
      embeds: [{
        title: '⚖️ Community Rules & Guidelines',
        description: 'By participating in this Discord, you agree to abide by the following rules. Failure to do so will result in warnings, kicks, or bans.',
        color: 0xed4245,
        fields: [
          { name: '1️⃣ Be Respectful', value: 'Treat everyone with kindness. No harassment, discrimination, or hate speech.', inline: false },
          { name: '2️⃣ No Spam or Self-Promotion', value: 'Keep discussions in their proper channels. Do not DM members with advertisements.', inline: false },
          { name: '3️⃣ Keep Content Appropriate', value: 'Strictly no NSFW or illegal content/links in public chat channels.', inline: false }
        ],
        footer: { text: 'Official Guidelines • Subject to change' }
      }]
    }
  },
  {
    id: 'premium-template-changelog-pro',
    category: 'Premium',
    name: 'Pro Release Logs',
    description: 'A dark-mode optimized release log with detailed version features.',
    icon: Code2,
    color: '#5865f2',
    isPro: true,
    payload: {
      username: 'Dev Ops',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [{
        title: '📦 HookCraft Update v2.5.0',
        description: 'We have deployed major optimization updates to the core editor and styling system!',
        color: 0x5865f2,
        fields: [
          { name: '🚀 New Features', value: '- Full rich Markdown preview support\n- Realtime canvas synchronization\n- Support for custom dynamic variables', inline: false },
          { name: '🔧 Bug Fixes', value: '- Fixed state loss on sidebar collapse\n- Resolved drag-and-drop delay issues', inline: false }
        ],
        footer: { text: 'Engine Release • Dev Team' }
      }]
    }
  },
  {
    id: 'premium-template-live-pro',
    category: 'Premium',
    name: 'Pro Live Stream Alert',
    description: 'Neon styled stream alert embed with custom thumbnail.',
    icon: Zap,
    color: '#eb459e',
    isPro: true,
    payload: {
      username: 'Broadcast Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      embeds: [{
        title: '🔴 STREAM IS LIVE NOW!',
        description: 'Join the stream right now for some live game dev, QA sessions, and community chill!',
        color: 0xeb459e,
        fields: [
          { name: '🎮 Current Game / Topic', value: 'Interactive UI Design in React', inline: true },
          { name: '🔗 Stream Link', value: '[Watch on Twitch](https://twitch.tv)', inline: true }
        ],
        image: { url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop' },
        footer: { text: 'Live Notification • Twitch Alerts' }
      }]
    }
  },
  {
    id: 'premium-template-faq-pro',
    category: 'Premium',
    name: 'Pro FAQ Section',
    description: 'Multi-question FAQ embed layout for support channels.',
    icon: Info,
    color: '#fee75c',
    isPro: true,
    payload: {
      username: 'FAQ Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      embeds: [{
        title: '❓ Frequently Asked Questions',
        description: 'Here are the most common questions regarding VIP membership and roles.',
        color: 0xfee75c,
        fields: [
          { name: 'How do I claim my VIP templates?', value: 'Make sure your Discord account is connected to Vercel/Netlify. The roles are automatically synced.', inline: false },
          { name: 'I updated my roles but it is still locked.', value: 'Try clicking "Switch Account" in the top bar to refresh your session.', inline: false }
        ],
        footer: { text: 'Helpdesk • FAQ Section' }
      }]
    }
  },
  {
    id: 'premium-template-server-status',
    category: 'Premium',
    name: 'Pro Server Status',
    description: 'System resource and network diagnostics layout.',
    icon: BarChart3,
    color: '#57f287',
    isPro: true,
    payload: {
      username: 'SysOps Monitor',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      embeds: [{
        title: '🟢 System Status: Healthy',
        description: 'All nodes and infrastructure services are operating normally.',
        color: 0x57f287,
        fields: [
          { name: '🖥️ API Core', value: 'Online (12ms latency)', inline: true },
          { name: '🗄️ Database Node', value: 'Healthy (0.01% load)', inline: true },
          { name: '🔥 Websockets', value: 'Active (4,231 connections)', inline: false }
        ],
        footer: { text: 'Telemetry Monitor • Auto-updates' }
      }]
    }
  },
  {
    id: 'premium-template-donation-pro',
    category: 'Premium',
    name: 'Pro Donation Link',
    description: 'Supporter and funding announcement embed.',
    icon: Heart,
    color: '#eb459e',
    isPro: true,
    payload: {
      username: 'Donation Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/5.png',
      embeds: [{
        title: '❤️ Support Our Project',
        description: 'We run on donations! If you want to support development and unlock features, consider donating.',
        color: 0xeb459e,
        fields: [
          { name: '☕ Buy Us a Coffee', value: '[Ko-fi Link](https://ko-fi.com)', inline: true },
          { name: '🎖️ Patreon Tiers', value: '[Patreon Link](https://patreon.com)', inline: true }
        ],
        footer: { text: 'Supporter Perks • Tier Levels' }
      }]
    }
  },
  {
    id: 'premium-template-partner-pro',
    category: 'Premium',
    name: 'Pro Partnership embed',
    description: 'A premium layout for displaying official community partners.',
    icon: Users,
    color: '#00b0f4',
    isPro: true,
    payload: {
      username: 'Partner Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [{
        title: '🤝 New Community Partnership!',
        description: 'We are proud to announce our official partnership with **DevGuild**!',
        color: 0x00b0f4,
        fields: [
          { name: '🚀 Who are they?', value: 'A community of 50k+ software engineers sharing resources.', inline: false },
          { name: '🎁 Special Perks for VIPs', value: '- 20% off all dev courses\n- Access to exclusive private channels', inline: false }
        ],
        footer: { text: 'Partnerships • Shared Perks' }
      }]
    }
  },
  {
    id: 'premium-template-rules-agreement',
    category: 'Premium',
    name: 'Pro Rule Agreement Prompt',
    description: 'A layout designed for onboarding channels requiring agreement verification.',
    icon: Shield,
    color: '#eb459e',
    isPro: true,
    payload: {
      username: 'Rule Verifier',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      embeds: [{
        title: '✅ Rules Agreement Check',
        description: 'Please react to this message or click the checkmark below to verify your account and gain access to the rest of the server.',
        color: 0xeb459e,
        footer: { text: 'Verification System • Onboarding' }
      }]
    }
  },
  {
    id: 'premium-template-announcement-gradient',
    category: 'Premium',
    name: 'Pro Modern Gradient Alert',
    description: 'High visibility template with bright accent color.',
    icon: Megaphone,
    color: '#eb459e',
    isPro: true,
    payload: {
      username: 'Alert System',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
      embeds: [{
        title: '🚨 ATTENTION COMMUNITY!',
        description: 'We will be undergoing scheduled server maintenance tomorrow to perform migrations.',
        color: 0xeb459e,
        fields: [
          { name: '⏰ Downtime Window', value: '04:00 - 06:00 UTC (Estimated 2 hours)', inline: false },
          { name: '🔧 Target Tasks', value: 'Database vacuuming & SSD storage expansion.', inline: false }
        ],
        footer: { text: 'Infrastructure Team • Maintenance Schedule' }
      }]
    }
  },
  {
    id: 'premium-template-patch-notes',
    category: 'Premium',
    name: 'Pro Patch Notes',
    description: 'Software release notes with clean bullet points.',
    icon: Code2,
    color: '#5865f2',
    isPro: true,
    payload: {
      username: 'Release Logs',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      embeds: [{
        title: '🛠️ Hotfix Release v2.5.1',
        description: 'Several production bugs have been addressed in this patch.',
        color: 0x5865f2,
        fields: [
          { name: '🐛 Fixed Issues', value: '- Solved crash when pasting large payloads\n- Fixed dynamic variables rendering as raw strings\n- Restored missing avatars', inline: false }
        ],
        footer: { text: 'Developer Hotfix • Code Patch' }
      }]
    }
  },
  {
    id: 'premium-template-event-schedule',
    category: 'Premium',
    name: 'Pro Event Calendar',
    description: 'Embed formatting for listing dates and times.',
    icon: Calendar,
    color: '#fee75c',
    isPro: true,
    payload: {
      username: 'Events Coordinator',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/5.png',
      embeds: [{
        title: '📅 Community Events Schedule',
        description: 'Check out our list of upcoming interactive community events!',
        color: 0xfee75c,
        fields: [
          { name: '🎮 Gaming Night', value: 'Every Friday at 20:00 UTC', inline: true },
          { name: '🎤 Dev AMA', value: 'Every Monday at 18:00 UTC', inline: true },
          { name: '🏆 Coding Hackathon', value: 'Starts on 15th July (Registrations Open!)', inline: false }
        ],
        footer: { text: 'Server Activities • Event Team' }
      }]
    }
  },
  {
    id: 'premium-template-suggest-box',
    category: 'Premium',
    name: 'Pro Suggestion Box',
    description: 'Clean layout for feedback and voting channels.',
    icon: Info,
    color: '#57f287',
    isPro: true,
    payload: {
      username: 'Feedback Hub',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      embeds: [{
        title: '💡 Submit a Suggestion',
        description: 'Help us improve the server! Use the suggestion command to add yours to the queue.',
        color: 0x57f287,
        fields: [
          { name: 'ℹ️ How to Vote', value: 'Use reactions to agree or disagree with community suggestions.', inline: false }
        ],
        footer: { text: 'Suggestions Portal • User Ideas' }
      }]
    }
  },
  {
    id: 'premium-template-audit-logs',
    category: 'Premium',
    name: 'Pro Audit Log Embed',
    description: 'Clean logging layout for moderation history.',
    icon: Shield,
    color: '#ed4245',
    isPro: true,
    payload: {
      username: 'Security Logs',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [{
        title: '🛡️ Moderation Log: Member Banned',
        description: 'A member has been removed from the server for violating the Terms of Service.',
        color: 0xed4245,
        fields: [
          { name: '👤 User', value: 'SpammyUser#9999 (ID: 9876543210)', inline: true },
          { name: '🔨 Moderator', value: 'ModName#1234', inline: true },
          { name: '📝 Reason', value: 'Repetitive advertising DMs to server members.', inline: false }
        ],
        footer: { text: 'Guild Guard • Security Logs' }
      }]
    }
  },
  {
    id: 'premium-template-video-upload',
    category: 'Premium',
    name: 'Pro Video Alert',
    description: 'YouTube upload layout with responsive link formatting.',
    icon: Rocket,
    color: '#ed4245',
    isPro: true,
    payload: {
      username: 'Video Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      embeds: [{
        title: '🎥 NEW YOUTUBE UPLOAD!',
        description: 'Learn how to build Discord Webhooks from scratch using Next.js 14 in this new tutorial video.',
        color: 0xed4245,
        fields: [
          { name: '🍿 Watch Video', value: '[Click Here to Watch](https://youtube.com)', inline: false }
        ],
        image: { url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop' },
        footer: { text: 'Video Upload • Tutorial Series' }
      }]
    }
  },
  {
    id: 'premium-template-faq-vip',
    category: 'Premium',
    name: 'Pro Support Guide',
    description: 'A layout with lists of resources and documentation.',
    icon: Info,
    color: '#5865f2',
    isPro: true,
    payload: {
      username: 'Support Hub',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      embeds: [{
        title: '📚 Useful Links & Resources',
        description: 'Find important links and docs below to help you navigate our workspace.',
        color: 0x5865f2,
        fields: [
          { name: '🌐 Web Dashboard', value: '[Visit HookCraft](https://hookcraft.com)', inline: true },
          { name: '📖 Documentation', value: '[API Docs](https://docs.hookcraft.com)', inline: true },
          { name: '💬 Help Server', value: '[Discord Invite](https://discord.gg)', inline: false }
        ],
        footer: { text: 'Resources • Link Index' }
      }]
    }
  },
  {
    id: 'premium-template-store-pro',
    category: 'Premium',
    name: 'Pro Store Release',
    description: 'A shop or inventory release announcement embed.',
    icon: Trophy,
    color: '#fee75c',
    isPro: true,
    payload: {
      username: 'Shop Release',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [{
        title: '🛍️ NEW MERCHANDISE IS LIVE!',
        description: 'Official HookCraft merch has dropped! Limited quantities available.',
        color: 0xfee75c,
        image: { url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop' },
        footer: { text: 'Shop Drop • Merch Release' }
      }]
    }
  },
  {
    id: 'premium-template-member-milestone',
    category: 'Premium',
    name: 'Pro Milestones layout',
    description: 'An milestone announcement banner for server stats.',
    icon: Users,
    color: '#57f287',
    isPro: true,
    payload: {
      username: 'Milestones Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/5.png',
      embeds: [{
        title: '🎉 10,000 MEMBERS MILESTONE!',
        description: 'Thank you all for building this community with us! We have officially hit 10,000 members.',
        color: 0x57f287,
        footer: { text: 'Milestones • Server Growth' }
      }]
    }
  },
  {
    id: 'premium-template-game-night',
    category: 'Premium',
    name: 'Pro Gaming Event Alert',
    description: 'Highly thematic layout for gaming alerts.',
    icon: Zap,
    color: '#00b0f4',
    isPro: true,
    payload: {
      username: 'Server Host',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      embeds: [{
        title: '🎮 Community Game Night Starting!',
        description: 'Join the party in the voice channel! We are hosting a custom tournament tonight with prizes.',
        color: 0x00b0f4,
        fields: [
          { name: '🔥 Featured Game', value: 'Minecraft Bedwars', inline: true },
          { name: '🎁 Grand Prize', value: 'Custom VIP Role (1 Month)', inline: true }
        ],
        footer: { text: 'Gaming Nights • Event Host' }
      }]
    }
  },
  {
    id: 'premium-template-recruitment-pro',
    category: 'Premium',
    name: 'Pro Recruitment Panel',
    description: 'Professional helper application layout.',
    icon: Code2,
    color: '#eb459e',
    isPro: true,
    payload: {
      username: 'Applications',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
      embeds: [{
        title: '💼 Staff Applications Open!',
        description: 'We are looking for dedicated moderators to join our crew! Apply if you fit the requirements.',
        color: 0xeb459e,
        fields: [
          { name: '⚠️ Basic Requirements', value: '- 16+ years old\n- active on the server for 30+ days\n- clean moderation record', inline: false },
          { name: '📝 Application Form', value: '[Apply here](https://forms.google)', inline: false }
        ],
        footer: { text: 'Server Staff • Recruitment' }
      }]
    }
  },
  {
    id: 'premium-template-level-roles',
    category: 'Premium',
    name: 'Pro Level Rewards Info',
    description: 'Detailed rewards list layout for server activity.',
    icon: Trophy,
    color: '#fee75c',
    isPro: true,
    payload: {
      username: 'Level Rewards',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [{
        title: '🏆 Level Up Rewards Guide',
        description: 'Text in chat to earn XP and unlock special roles and perks!',
        color: 0xfee75c,
        fields: [
          { name: '⭐ Level 5: Active Member', value: 'Access to image attachments in public chat.', inline: false },
          { name: '🌟 Level 10: Veteran Client', value: 'Double voting rights on feature suggestion cards.', inline: false }
        ],
        footer: { text: 'Levels & Rewards • Activity perks' }
      }]
    }
  },
  {
    id: 'premium-template-bug-report',
    category: 'Premium',
    name: 'Pro Bug Tracker',
    description: 'Developer issue format layout for QA logs.',
    icon: Code2,
    color: '#ed4245',
    isPro: true,
    payload: {
      username: 'Bug Reporter',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      embeds: [{
        title: '🪲 Issue Logged: API Router Exception',
        description: 'An exception has been detected in the core router pipeline.',
        color: 0xed4245,
        fields: [
          { name: '📁 Endpoint', value: '`GET /api/v1/users`', inline: true },
          { name: '💣 Crash Reason', value: '`NullPointerException`', inline: true },
          { name: '📋 Stack Trace', value: '```\nError: Connection timed out\n   at DBClient.query (db.js:42)\n   at Route.handle (route.js:12)```', inline: false }
        ],
        footer: { text: 'System Diagnostics • Bug Logs' }
      }]
    }
  },
  {
    id: 'premium-template-warning-notice',
    category: 'Premium',
    name: 'Pro Mod Warn Notice',
    description: 'Authoritative warning notice formatting.',
    icon: Shield,
    color: '#fee75c',
    isPro: true,
    payload: {
      username: 'System Guard',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      embeds: [{
        title: '⚠️ Moderation Alert: Official Warning',
        description: 'Your account has received a warning for violating community guidelines.',
        color: 0xfee75c,
        fields: [
          { name: '📄 Infraction Type', value: 'Excessive spamming / capital letters', inline: true },
          { name: '⏳ Expiry Date', value: '7 days from now', inline: true }
        ],
        footer: { text: 'Server Moderation System' }
      }]
    }
  },
  {
    id: 'premium-template-mute-notice',
    category: 'Premium',
    name: 'Pro Mod Mute Notice',
    description: 'Mute duration notification layout.',
    icon: Shield,
    color: '#e67e22',
    isPro: true,
    payload: {
      username: 'Mute Coordinator',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      embeds: [{
        title: '🔇 Account Muted',
        description: 'You have been temporarily muted in all text and voice channels.',
        color: 0xe67e22,
        fields: [
          { name: '⏰ Duration', value: '24 hours', inline: true },
          { name: '📝 Reason', value: 'Disrespectful language in public channels.', inline: true }
        ],
        footer: { text: 'Automoderator • Guild Guard' }
      }]
    }
  },
  {
    id: 'premium-template-kick-notice',
    category: 'Premium',
    name: 'Pro Mod Kick Notice',
    description: 'Kick action confirmation embed.',
    icon: Shield,
    color: '#e67e22',
    isPro: true,
    payload: {
      username: 'Guild Guard',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
      embeds: [{
        title: '🚪 Member Kicked from Server',
        description: 'An account has been kicked from the community.',
        color: 0xe67e22,
        fields: [
          { name: '👤 Username', value: 'BannedUser#0000', inline: true },
          { name: '📝 Reason', value: 'Refusing to verify or accept server rules.', inline: true }
        ],
        footer: { text: 'Moderator Action Complete' }
      }]
    }
  },
  {
    id: 'premium-template-ban-notice',
    category: 'Premium',
    name: 'Pro Mod Ban Notice',
    description: 'Permanent ban confirmation embed.',
    icon: Shield,
    color: '#ed4245',
    isPro: true,
    payload: {
      username: 'Security Protocol',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      embeds: [{
        title: '🔨 Permanent Ban Issued',
        description: 'An account has been permanently banned from the network.',
        color: 0xed4245,
        fields: [
          { name: '👤 User ID', value: '23456789012345', inline: true },
          { name: '📝 Reason', value: 'Attempted account phishing and unauthorized credential requests.', inline: true }
        ],
        footer: { text: 'Permanent Infraction • Support Desk' }
      }]
    }
  },
  {
    id: 'premium-template-backup-status',
    category: 'Premium',
    name: 'Pro Backup Logs',
    description: 'Daily database backup logs format.',
    icon: Code2,
    color: '#57f287',
    isPro: true,
    payload: {
      username: 'Backup Protocol',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/5.png',
      embeds: [{
        title: '💾 Daily Database Backup Complete',
        description: 'Backups have been compressed and uploaded to secure cold storage.',
        color: 0x57f287,
        fields: [
          { name: '📁 File Size', value: '1.2 GB', inline: true },
          { name: '🔒 Encryption', value: 'AES-256-GCM', inline: true },
          { name: '🌐 Target Server', value: 'AWS S3 (eu-west-1)', inline: false }
        ],
        footer: { text: 'Cron Scheduler • Auto-backup' }
      }]
    }
  },
  {
    id: 'premium-template-database-alert',
    category: 'Premium',
    name: 'Pro DB Incident Alert',
    description: 'Highly visible emergency system alert.',
    icon: Zap,
    color: '#ed4245',
    isPro: true,
    payload: {
      username: 'Incident Reports',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [{
        title: '🔴 EMERGENCY ALERT: DATABASE OFFLINE',
        description: 'Primary replica node has lost connectivity and stopped heartbeats.',
        color: 0xed4245,
        fields: [
          { name: '⚠️ Event ID', value: '#EVT-8765', inline: true },
          { name: '💥 Status', value: 'CRITICAL SEVERITY 1', inline: true }
        ],
        footer: { text: 'Alertmanager Incident Alerts' }
      }]
    }
  },
  {
    id: 'premium-template-interactive-help',
    category: 'Premium',
    name: 'Pro Menu Interactive Help',
    description: 'Support directories embed formatting.',
    icon: Info,
    color: '#5865f2',
    isPro: true,
    payload: {
      username: 'Help Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      embeds: [{
        title: '📖 HookCraft Interactive Command Directory',
        description: 'Here are the commands you can use in our Discord bot.',
        color: 0x5865f2,
        fields: [
          { name: '🛠️ Utility Command', value: '`/help` - View this list\n`/ping` - Check server latency', inline: false },
          { name: '👑 Admin Commands', value: '`/settings` - Edit parameters\n`/configure` - Setup channels', inline: false }
        ],
        footer: { text: 'Command Index • Help Manual' }
      }]
    }
  },
  {
    id: 'premium-template-role-select',
    category: 'Premium',
    name: 'Pro Role Selector Menu',
    description: 'Menu layout for reaction roles.',
    icon: Star,
    color: '#fee75c',
    isPro: true,
    payload: {
      username: 'Role Selector',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
      embeds: [{
        title: '🎭 Server Roles Menu',
        description: 'Select your preferred roles below to get custom pings and access to special channels.',
        color: 0xfee75c,
        fields: [
          { name: '📣 Pings / Alerts', value: 'React with 📢 for Announcement pings\nReact with 🎁 for Giveaway alerts', inline: false }
        ],
        footer: { text: 'Role Portal • Interactive Menu' }
      }]
    }
  },
  {
    id: 'premium-template-partners-list',
    category: 'Premium',
    name: 'Pro Partners Directory',
    description: 'A layout for listing multiple official server partnerships.',
    icon: Users,
    color: '#57f287',
    isPro: true,
    payload: {
      username: 'Partnerships',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      embeds: [{
        title: '📋 Our Official Partners Directory',
        description: 'Explore the amazing communities we partner with!',
        color: 0x57f287,
        fields: [
          { name: '1️⃣ DevGuild', value: '[DevGuild Server](https://discord.gg)', inline: true },
          { name: '2️⃣ DesignHub', value: '[DesignHub Server](https://discord.gg)', inline: true }
        ],
        footer: { text: 'Official Partnerships • Network Directory' }
      }]
    }
  },
  {
    id: 'new-improved-community-announcement',
    category: 'Community',
    name: '🌟 Community Hub Announcement',
    description: 'A beautiful event / server updates newsletter layout for community engagement.',
    icon: Users,
    color: '#57f287',
    isNew: true,
    payload: {
      username: 'Community Highlights',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [{
        title: '🌟 Server Highlights & Weekly News',
        description: 'Hey everyone! Here is a recap of what happened in our community this week, plus upcoming events you won\'t want to miss.',
        color: 5765029,
        thumbnail: { url: 'https://cdn.discordapp.com/embed/avatars/0.png' },
        fields: [
          { name: '🎉 Active Projects', value: 'We started testing our new web app features. Check out <#announcements> for sneak peeks!', inline: false },
          { name: '🔥 Event: Game Night', value: 'Join us on Saturday at 8 PM UTC for some party games in Voice Channels!', inline: true },
          { name: '🏆 Top Contributor', value: 'Shoutout to **@Shachaf** for helping members in general chat this week!', inline: true }
        ],
        footer: { text: 'HookCraft Community Updates' },
        timestamp: ts()
      }]
    }
  },
  {
    id: 'new-improved-announcements-sneakpeek',
    category: 'Announcements',
    name: '🚀 Feature Launch Announcement',
    description: 'Beautiful product launch and feature update card with modern gradients.',
    icon: Megaphone,
    color: '#fee75c',
    isNew: true,
    payload: {
      username: 'Product Announcements',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      embeds: [{
        title: '🚀 Introducing AI Message Generator!',
        description: 'Write custom webhooks in seconds! Powered by Groq Llama 3.3, you can now generate beautiful payloads using natural language prompts.',
        color: 16776960,
        fields: [
          { name: '⚡ Ultra Fast', value: 'Powered by Groq inference engine under 200ms.', inline: true },
          { name: '🎭 Custom Tones', value: 'Choose from Professional, Casual, Urgent, and Hype.', inline: true },
          { name: '📖 How to start', value: 'Go to the **AI Generator** tab in the sidebar, choose a prompt, and hit generate!', inline: false }
        ],
        image: { url: 'https://picsum.photos/600/200?random=ai' },
        footer: { text: 'New feature rollout • HookCraft v2.4' },
        timestamp: ts()
      }]
    }
  },
  {
    id: 'new-improved-operations-security',
    category: 'Operations',
    name: '⚙️ Security Audit & Health Log',
    description: 'Clean logs template for server administrators and security audit systems.',
    icon: Shield,
    color: '#ed4245',
    isNew: true,
    payload: {
      username: 'Security Services',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
      embeds: [{
        title: '🛡️ Automated Server Security Report',
        description: 'The weekly automated security analysis has finished with clean marks.',
        color: 3066993,
        fields: [
          { name: '🔍 Scan Target', value: 'Production Database cluster (CockroachDB)', inline: true },
          { name: '🟢 Health Status', value: '100% Secure (0 vulnerabilities)', inline: true },
          { name: '🔑 SSL Certificate', value: 'Validated & Auto-renewed (Expires in 89 days)', inline: false }
        ],
        footer: { text: 'HookCraft Ops • Security Daemon' },
        timestamp: ts()
      }]
    }
  },
  {
    id: 'new-improved-development-github',
    category: 'Development',
    name: '💻 GitHub Release & Build Status',
    description: 'Professional release note card for software updates and dev logs.',
    icon: Code2,
    color: '#5865f2',
    isNew: true,
    payload: {
      username: 'GitHub Integrations',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
      embeds: [{
        title: '📦 New Release: v2.4.0-prod',
        description: 'New production build deployed successfully to Netlify Cloud.',
        color: 5814783,
        fields: [
          { name: '🌿 Git Branch', value: '`main`', inline: true },
          { name: '📝 Commit Hash', value: '`97e609f`', inline: true },
          { name: '🛠️ Changes', value: '- Added Groq Llama-3.3 integration\n- Redesigned color picker theme logic\n- Optimized database connection pooling', inline: false }
        ],
        footer: { text: 'GitHub Actions • Deploy Hook' },
        timestamp: ts()
      }]
    }
  },
  {
    id: 'new-improved-gaming-tournament',
    category: 'Gaming',
    name: '🎮 Tournament Bracket & Match Card',
    description: 'Dynamic layout for gaming tournaments, match announcements, and stats.',
    icon: Gamepad2,
    color: '#f0b232',
    isNew: true,
    payload: {
      username: 'Esports Coordinators',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/5.png',
      embeds: [{
        title: '🏆 Weekend Championship Series - Finals',
        description: 'The final matchup of our seasonal tournament is about to begin! Who will claim the ultimate title?',
        color: 15105570,
        fields: [
          { name: '🔴 Team A', value: '**Alpha Predators** (Seed #1)', inline: true },
          { name: '🔵 Team B', value: '**Cyber Sentinels** (Seed #3)', inline: true },
          { name: '🕒 Match Time', value: `<t:${unix(3600)}:F>`, inline: false }
        ],
        footer: { text: 'Gaming Division • Good Luck Teams' },
        timestamp: ts()
      }]
    }
  },
  {
    id: 'new-improved-polls-voting',
    category: 'Polls',
    name: '📊 Feature Voting Interactive Poll',
    description: 'Perfect format for community voting and request feedback loops.',
    icon: BarChart3,
    color: '#00b0f4',
    isNew: true,
    payload: {
      username: 'Community Polls',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: [{
        title: '📊 Poll: What feature should we prioritize next?',
        description: 'React below to cast your vote! Every vote counts towards the next milestone.',
        color: 3447003,
        fields: [
          { name: '1️⃣ Automated Scheduler', value: 'Schedule webhooks to trigger at specific times.', inline: false },
          { name: '2️⃣ Latency Analytics', value: 'Track webhook status, latency, and success rates.', inline: false }
        ],
        footer: { text: 'Feedback Loop • Closes in 24 hours' },
        timestamp: ts()
      }]
    }
  },
  {
    id: 'new-improved-premium-welcome',
    category: 'Premium',
    name: '👑 Pro Club Member Benefits Card',
    description: 'Extremely premium look for inviting users to purchase VIP status.',
    icon: Crown,
    color: '#fee75c',
    isNew: true,
    isPro: true,
    payload: {
      username: 'VIP Club Benefits',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png',
      embeds: [{
        title: '👑 Unlock HookCraft VIP Perks Today!',
        description: 'Support HookCraft and get access to exclusive premium tools that supercharge your workflow.',
        color: 15844367,
        fields: [
          { name: '⭐ Pre-made Avatars', value: 'Access to 20+ custom premium bot identities.', inline: true },
          { name: '🔥 Pro Templates', value: '15+ high-fidelity template designs.', inline: true },
          { name: '🎗️ Support Server Role', value: 'Get your custom role and priority support chat.', inline: false }
        ],
        footer: { text: 'HookCraft VIP Club Benefits' },
        timestamp: ts()
      }]
    }
  },
  {
    id: 'new-improved-website-signup',
    category: 'Website',
    name: '🌐 New Sign-Up Notification Alert',
    description: 'Clean webhook layout for monitoring active signups on user sites.',
    icon: Globe,
    color: '#00b0f4',
    isNew: true,
    payload: {
      username: 'User Services Monitoring',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png',
      embeds: [{
        title: '👤 New User Registered',
        description: 'A new user has just registered on the main platform website.',
        color: 1752220,
        fields: [
          { name: '📧 Email Address', value: '`user***@domain.com`', inline: true },
          { name: '🌍 Region', value: 'North America (US)', inline: true },
          { name: '⚡ Account Tier', value: 'Free Plan', inline: false }
        ],
        footer: { text: 'Monitoring Services • HookCraft Web' },
        timestamp: ts()
      }]
    }
  },
  {
    id: 'new-improved-changelog-patchnotes',
    category: 'Changelog',
    name: '📝 Release Patch Notes Update',
    description: 'Perfect format for detailing bugs resolved and minor update releases.',
    icon: Code2,
    color: '#5865f2',
    isNew: true,
    payload: {
      username: 'Release Management',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png',
      embeds: [{
        title: '📝 HookCraft Update: Patch v2.4.1',
        description: 'Here are the bug fixes and quality-of-life adjustments live in this release.',
        color: 10181046,
        fields: [
          { name: '✨ Features', value: '- Added Groq Llama 3.3 integration\n- Added real changelog history page\n- Live custom accent color adjustments', inline: false },
          { name: '🐛 Bug Fixes', value: '- Fixed build crashes on stale route validation\n- Patched type mismatch in dropdown elements', inline: false }
        ],
        footer: { text: 'Release Daemon • Patch Logs' },
        timestamp: ts()
      }]
    }
  }
];


// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { color: string; emoji: string }> = {
  All:          { color: '#818cf8', emoji: '✦' },
  Community:    { color: '#57f287', emoji: '👥' },
  Announcements:{ color: '#fee75c', emoji: '📣' },
  Operations:   { color: '#ed4245', emoji: '⚙️' },
  Development:  { color: '#5865f2', emoji: '💻' },
  Gaming:       { color: '#f0b232', emoji: '🎮' },
  Polls:        { color: '#00b0f4', emoji: '📊' },
  Premium:      { color: '#fee75c', emoji: '👑' },
  Website:      { color: '#00b0f4', emoji: '🌐' },
  Changelog:    { color: '#5865f2', emoji: '📝' },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

// ─── Component ────────────────────────────────────────────────────────────────
export function TemplatesEditor() {
  const { setMessage } = useMessageStore();
  const { setActiveSection } = useUIStore();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [query, setQuery]             = useState('');
  const [activeCategory, setCategory] = useState('All');
  const [appliedId, setAppliedId]     = useState<string | null>(null);
  const [activeTab, setActiveTab]     = useState<'templates' | 'avatars'>('templates');
  const [appliedAvatar, setAppliedAvatar] = useState<string | null>(null);

  const filtered = useMemo(() => TEMPLATES.filter((t) => {
    const matchesCat   = activeCategory === 'All' || t.category === activeCategory;
    const matchesQuery = !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()) || t.category.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  }), [query, activeCategory]);

  function applyTemplate(template: Template) {
    if (template.isPro && !(session as any)?.isVip) {
      toast({
        title: "VIP Feature Locked",
        description: session ? "You need the VIP role in the Discord Support Server to use Pro templates." : "Please Login with Discord to use Pro templates.",
        variant: "destructive",
      });
      return;
    }
    
    setMessage(template.payload);
    setAppliedId(template.id);
    setTimeout(() => { setAppliedId(null); setActiveSection('content'); }, 1200);
  }

  function applyAvatar(preset: AvatarPreset) {
    if (preset.isPro && !(session as any)?.isVip) {
      toast({
        title: "VIP Feature Locked",
        description: session ? "You need the VIP role in the Discord Support Server to use Pro avatars." : "Please Login with Discord to use Pro avatars.",
        variant: "destructive",
      });
      return;
    }
    
    const current = useMessageStore.getState().message;
    useMessageStore.getState().setMessage({
      ...current,
      username: preset.username,
      avatar_url: preset.avatar_url,
    });
    setAppliedAvatar(preset.id);
    setTimeout(() => setAppliedAvatar(null), 1500);
  }

  const totalByCategory = useMemo(() => {
    const counts: Record<string, number> = { All: TEMPLATES.length };
    TEMPLATES.forEach((t) => { counts[t.category] = (counts[t.category] ?? 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3 space-y-4"
        style={{ borderBottom: '1px solid hsl(var(--border) / 0.5)' }}
      >
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.25), hsl(270 80% 65% / 0.2))', border: '1px solid hsl(var(--primary) / 0.2)' }}
          >
            <Sparkles className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">Templates Library</h2>
            <p className="text-xs text-muted-foreground">{TEMPLATES.length} templates · {AVATAR_PRESETS.length} bot personas</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'hsl(var(--muted) / 0.5)' }}>
          {(['templates', 'avatars'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 capitalize',
                activeTab === tab
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab === 'templates' ? `📋 Templates` : `🤖 Bot Personas`}
            </button>
          ))}
        </div>

        {/* Search */}
        {activeTab === 'templates' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${TEMPLATES.length} templates…`}
              className="pl-8 h-9 text-sm rounded-xl bg-muted/40 border-border/50 focus:border-primary/50 focus:bg-muted/60"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ── Templates Tab ── */}
        {activeTab === 'templates' && (
          <div className="p-4 space-y-4">
            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const cfg   = CATEGORY_CONFIG[cat];
                const count = totalByCategory[cat] ?? 0;
                const active = activeCategory === cat;
                return (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150',
                      active ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground',
                    )}
                    style={active
                      ? { background: cfg.color, boxShadow: `0 0 12px ${cfg.color}60` }
                      : { background: 'hsl(var(--muted) / 0.6)' }
                    }
                  >
                    <span>{cfg.emoji}</span>
                    <span>{cat}</span>
                    <span className={cn(
                      'text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center',
                      active ? 'bg-white/20' : 'bg-muted-foreground/20',
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Templates grid */}
            <AnimatePresence mode="popLayout">
              {filtered.map((template, i) => {
                const Icon      = template.icon;
                const isApplied = appliedId === template.id;
                return (
                  <motion.div key={template.id} layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15, delay: Math.min(i * 0.025, 0.3) }}
                  >
                    <button onClick={() => applyTemplate(template)}
                      className="template-card w-full text-left group relative overflow-hidden"
                      style={{ marginBottom: '8px' }}
                    >
                      <div className="card-glow" />
                      {/* Hover bg */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                        style={{ background: `linear-gradient(135deg, ${template.color}0a 0%, transparent 60%)` }}
                      />

                      <div className="relative flex items-center gap-3 p-3.5">
                        {/* Icon box */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                          style={{ background: `${template.color}18`, border: `1px solid ${template.color}35`, boxShadow: `0 0 16px ${template.color}12` }}
                        >
                          {isApplied
                            ? <Check className="w-5 h-5" style={{ color: template.color }} />
                            : <Icon  className="w-5 h-5" style={{ color: template.color }} />
                          }
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-sm text-foreground truncate">{template.name}</span>
                            {template.isNew && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 leading-none">NEW</span>
                            )}
                            {template.isPro && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 leading-none">PRO</span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{template.description}</p>
                          <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${template.color}15`, color: template.color }}
                          >
                            {CATEGORY_CONFIG[template.category]?.emoji} {template.category}
                          </span>
                        </div>

                        {/* Arrow */}
                        <div className={cn(
                          'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200',
                          isApplied
                            ? 'bg-primary/20 opacity-100'
                            : 'bg-muted/50 opacity-0 group-hover:opacity-100 translate-x-1.5 group-hover:translate-x-0',
                        )}>
                          {isApplied
                            ? <Check className="w-3.5 h-3.5 text-primary" />
                            : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          }
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'hsl(var(--muted) / 0.6)' }}
                >
                  <Search className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">No templates found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Try a different search or category</p>
              </motion.div>
            )}
          </div>
        )}

        {/* ── Avatar Personas Tab ── */}
        {activeTab === 'avatars' && (
          <div className="p-4 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose a bot persona to quickly set a username and avatar for your webhook message.
            </p>

            <div className="grid gap-2">
              {AVATAR_PRESETS.map((preset, i) => {
                const isApplied = appliedAvatar === preset.id;
                return (
                  <motion.div key={preset.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.04 }}
                  >
                    <button onClick={() => applyAvatar(preset)}
                      className="template-card w-full text-left group relative overflow-hidden"
                    >
                      <div className="card-glow" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                        style={{ background: `linear-gradient(135deg, ${preset.color}0a 0%, transparent 60%)` }}
                      />

                      <div className="relative flex items-center gap-3 p-3.5">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={preset.avatar_url} alt={preset.name} className="w-11 h-11 rounded-full object-cover" />
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: preset.color, boxShadow: `0 0 8px ${preset.color}80` }}
                          >
                            <Bot className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{preset.name}</span>
                            {preset.tag && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: `${preset.color}20`, color: preset.color }}
                              >
                                {preset.tag}
                              </span>
                            )}
                            {preset.isPro && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 leading-none">PRO</span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{preset.description}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-2 h-2 rounded-full" style={{ background: preset.color }} />
                            <span className="text-[10px] font-mono text-muted-foreground/70">{preset.username}</span>
                          </div>
                        </div>

                        {/* Apply */}
                        <div className={cn(
                          'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200',
                          isApplied
                            ? 'opacity-100'
                            : 'bg-muted/50 opacity-0 group-hover:opacity-100 translate-x-1.5 group-hover:translate-x-0',
                        )} style={isApplied ? { background: `${preset.color}25` } : {}}>
                          {isApplied
                            ? <Check className="w-3.5 h-3.5" style={{ color: preset.color }} />
                            : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          }
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Custom tip */}
            <div className="rounded-xl p-3.5 mt-2"
              style={{ background: 'hsl(var(--primary) / 0.06)', border: '1px solid hsl(var(--primary) / 0.15)' }}
            >
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Custom Persona</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    You can set any custom username and avatar URL in the{' '}
                    <button className="text-primary underline underline-offset-2 font-medium"
                      onClick={() => setActiveSection('profile')}
                    >
                      Profile editor
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

