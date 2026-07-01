import { Metadata } from 'next';
import { Shield, Lock, Eye, Database, Mail, Globe, UserCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | HookCraft',
  description: 'How HookCraft collects, uses, and protects your data.',
};

const sections = [
  {
    icon: Database,
    title: 'Data We Collect',
    color: '#a78bfa',
    items: [
      { heading: 'Discord Account Info', body: 'When you log in with Discord, we collect your Discord user ID, username, avatar, and email address (if granted). This is used solely to create and identify your HookCraft account.' },
      { heading: 'Webhooks & Drafts', body: 'Any webhook URLs, message drafts, and templates you save are stored in our encrypted cloud database. Webhook URLs are stored in plaintext within your account — treat them as sensitive and do not share them.' },
      { heading: 'Usage Data', body: 'We do not collect analytics, page views, or behavioral tracking. We do not use any third-party analytics tools.' },
    ]
  },
  {
    icon: Lock,
    title: 'How We Use Your Data',
    color: '#38bdf8',
    items: [
      { heading: 'Account Management', body: 'Your Discord ID is used as a unique identifier to associate your saved webhooks, drafts, and settings with your account.' },
      { heading: 'VIP Role Verification', body: 'If you are a member of the HookCraft Discord server, we periodically check your roles to determine VIP status. This check uses your Discord OAuth access token and does not store role data beyond the current session.' },
      { heading: 'We Do Not Sell Your Data', body: 'We do not sell, rent, trade, or share your personal information with any third party for marketing purposes.' },
    ]
  },
  {
    icon: Globe,
    title: 'Third-Party Services',
    color: '#10b981',
    items: [
      { heading: 'Discord OAuth', body: 'Login is handled through Discord\'s official OAuth2 flow. We only request the minimum scopes needed (identify, email, guilds.members.read). Discord\'s own Privacy Policy governs their data handling.' },
      { heading: 'CockroachDB', body: 'User data is stored in a CockroachDB Serverless cluster hosted on AWS. All data is encrypted at rest and in transit via TLS.' },
      { heading: 'Groq AI', body: 'When you use the AI Generator, your prompt is sent to Groq\'s API (llama-3.3-70b model) to generate a Discord message. Groq processes this transiently and does not retain your prompts per their privacy policy.' },
      { heading: 'Netlify / Render', body: 'HookCraft is hosted on Netlify and/or Render. Standard server access logs may be collected by these platforms as part of their infrastructure.' },
    ]
  },
  {
    icon: Eye,
    title: 'Data Retention',
    color: '#f59e0b',
    items: [
      { heading: 'Account Data', body: 'Your account and associated data (webhooks, drafts) are retained as long as you have an active account. You can request deletion at any time.' },
      { heading: 'Session Data', body: 'Login sessions are managed via encrypted cookies (NextAuth.js) and expire automatically. No session data is stored on our servers.' },
      { heading: 'Deletion Requests', body: 'To permanently delete your account and all associated data, contact us via the HookCraft Discord server. We will process requests within 7 days.' },
    ]
  },
  {
    icon: UserCheck,
    title: 'Your Rights',
    color: '#f43f5e',
    items: [
      { heading: 'Access', body: 'You can view all data associated with your account by logging into HookCraft and reviewing your saved webhooks and drafts.' },
      { heading: 'Correction', body: 'You can update or delete any saved webhooks, drafts, or templates at any time through the HookCraft interface.' },
      { heading: 'Erasure (GDPR)', body: 'If you are located in the EU/EEA, you have the right to request complete erasure of your personal data under GDPR Article 17. Contact us via Discord.' },
      { heading: 'Portability', body: 'You can export your message payloads as JSON at any time using the Export button in the JSON editor.' },
    ]
  },
  {
    icon: Mail,
    title: 'Contact Us',
    color: '#c084fc',
    items: [
      { heading: 'Discord Server', body: 'The fastest way to reach us is through the official HookCraft Discord server. Open a support ticket for any privacy-related questions or data requests.' },
      { heading: 'Policy Updates', body: 'We may update this Privacy Policy from time to time. Significant changes will be announced in the Changelog. Continued use of HookCraft after changes constitutes acceptance.' },
    ]
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, hsl(252 90% 68% / 0.06) 0%, transparent 70%)' }} />

      <div className="container max-w-3xl px-4 py-24 relative z-10">
        {/* Header */}
        <div className="mb-14">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'hsl(252 90% 68% / 0.12)', border: '1px solid hsl(252 90% 68% / 0.25)' }}>
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 gradient-text">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground mb-3">
            We believe in radical transparency. Here is exactly what data we collect and why.
          </p>
          <p className="text-sm text-muted-foreground/60">Last updated: July 1, 2026</p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded-2xl border p-6"
                style={{ background: 'hsl(var(--card) / 0.7)', borderColor: 'hsl(var(--border) / 0.6)', backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${section.color}15`, border: `1px solid ${section.color}30` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: section.color, width: '18px', height: '18px' }} />
                  </div>
                  <h2 className="text-base font-bold text-foreground">{section.title}</h2>
                </div>
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.heading}>
                      <h3 className="text-sm font-semibold text-foreground mb-1">{item.heading}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-12 p-5 rounded-2xl text-center"
          style={{ background: 'hsl(var(--primary) / 0.06)', border: '1px solid hsl(var(--primary) / 0.15)' }}>
          <p className="text-sm text-muted-foreground">
            HookCraft is a small independent project. We take your privacy seriously and aim to collect the absolute minimum data required to provide the service.
          </p>
        </div>
      </div>
    </div>
  );
}
