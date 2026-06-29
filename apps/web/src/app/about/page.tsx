import { Metadata } from 'next';
import { Webhook, Github, Twitter, Heart } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | HookCraft',
  description: 'Learn more about the team and mission behind HookCraft.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      
      <div className="container max-w-4xl px-4 py-24 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-primary/10 border border-primary/20">
            <Webhook className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Building the Ultimate <br className="hidden md:block" />
            <span className="gradient-text">Discord Webhook Tool</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            HookCraft was born out of a simple need: creating beautiful Discord embeds shouldn't require writing raw JSON.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-primary" />
              Our Mission
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We want to empower community managers, server owners, and bot developers to create engaging, rich messages effortlessly. By providing a WYSIWYG editor for Discord's complex webhook API, we save you hours of trial and error.
            </p>
          </div>
          
          <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Open Source
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              HookCraft is built with love and open technologies. We believe in transparency and community contributions. Found a bug or want a new feature? You can easily contribute to our GitHub repository!
            </p>
          </div>
        </div>

        <div className="text-center bg-muted/30 rounded-3xl p-12 border border-border/50">
          <h2 className="text-3xl font-bold mb-6">Join the Community</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Have questions, suggestions, or just want to show off your awesome webhook designs? Join our Discord server.
          </p>
          <Link href="https://discord.gg/vC8jJAREre" target="_blank" className="inline-flex items-center justify-center gap-2 bg-[#5865f2] hover:bg-[#4752c4] text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#5865f2]/25">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.95,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,71.43,71.43,0,0,1-10.5-5A54.34,54.34,0,0,0,31,78,76.81,76.81,0,0,0,96.18,78a54.34,54.34,0,0,0,2.83,2.5,71.43,71.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.87,50.22,123.6,27.39,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
            </svg>
            Join our Discord
          </Link>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
