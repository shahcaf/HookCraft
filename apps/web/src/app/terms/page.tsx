import { Metadata } from 'next';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | HookCraft',
  description: 'Terms of Service for using HookCraft.',
};

export default function TermsPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      
      <div className="container max-w-3xl px-4 py-24 relative z-10">
        <div className="mb-12">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-primary/10 border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-invert prose-blue max-w-none">
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing or using HookCraft, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
          </p>

          <h3>2. Use of Service</h3>
          <p>
            HookCraft is a visual builder for Discord webhooks. You agree to use the service only for lawful purposes and in accordance with these Terms and Discord's Developer Terms of Service.
          </p>

          <h3>3. Discord Webhooks</h3>
          <p>
            You are solely responsible for the content you send via webhooks using HookCraft. We do not store your Discord webhook URLs or messages on our servers; they are processed client-side or securely proxied without logging the content.
          </p>

          <h3>4. VIP Features & Memberships</h3>
          <p>
            Access to certain VIP features requires membership in our official Discord server and specific Discord roles. We reserve the right to modify, suspend, or terminate these VIP features at any time without prior notice.
          </p>

          <h3>5. Limitation of Liability</h3>
          <p>
            In no event shall HookCraft or its developers be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.
          </p>

          <h3>6. Contact Us</h3>
          <p>
            If you have any questions about these Terms, please contact us by joining our <Link href="https://discord.gg/PqdZAgzjTs" className="text-primary hover:underline">Support Server</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
