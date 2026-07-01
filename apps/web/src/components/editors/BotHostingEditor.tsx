'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Github, Key, Terminal, Crown, Rocket, Lock, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export function BotHostingEditor() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  
  const [githubUrl, setGithubUrl] = useState('');
  const [clientId, setClientId] = useState('');
  const [botToken, setBotToken] = useState('');
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [isDeployed, setIsDeployed] = useState(false);

  const isVip = (session as any)?.isVip;

  const handleDeploy = async () => {
    if (!githubUrl || !clientId || !botToken) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields to deploy.', variant: 'destructive' });
      return;
    }
    if (!githubUrl.includes('github.com') && !githubUrl.includes('c:\\')) {
      toast({ title: 'Invalid URL', description: 'Please provide a valid GitHub repository URL or absolute path.', variant: 'destructive' });
      return;
    }

    setIsDeploying(true);
    setDeployStep(0);
    
    try {
      // Step 1: Initializing & Cloning
      setDeployStep(1);
      
      const res = await fetch('/api/hosting/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl, botToken })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details ? `${data.error}: ${data.details}` : data.error || 'Failed to deploy bot');
      }

      setDeployStep(2); // Building
      await new Promise(r => setTimeout(r, 800)); // UI delay for effect
      
      setDeployStep(3); // Starting process
      await new Promise(r => setTimeout(r, 800)); // UI delay for effect
      
      setDeployStep(4); // Online
      setIsDeploying(false);
      setIsDeployed(true);
      
      toast({
        title: 'Bot Deployed Successfully! 🚀',
        description: 'Your bot is now running.',
        style: { background: '#10b981', color: '#fff', border: 'none' }
      });

    } catch (err: any) {
      setIsDeploying(false);
      toast({
        title: 'Deployment Failed',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const DEPLOY_STEPS = [
    'Initializing secure container...',
    'Cloning GitHub repository...',
    'Installing dependencies & building...',
    'Starting bot process...',
    'Online'
  ];

  // ─── Loading State ───
  if (status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  // ─── Locked State ───
  if (!session || !isVip) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
        
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 relative z-10">
          <Crown className="w-10 h-10 text-amber-500" />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-2 relative z-10">Premium Bot Hosting</h2>
        <p className="text-sm text-muted-foreground max-w-[280px] mb-8 relative z-10">
          Host your custom Discord bots 24/7 directly from GitHub. This feature is exclusive to VIP members.
        </p>
        
        <Button 
          className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 w-full max-w-[240px] relative z-10"
          onClick={() => {
            if (!session) signIn('discord');
            else window.open('https://discord.gg/PqdZAgzjTs', '_blank');
          }}
        >
          <Crown className="w-4 h-4 mr-2" />
          {session ? 'Get VIP Role' : 'Login with Discord'}
        </Button>
      </div>
    );
  }

  // ─── VIP Form State ───
  return (
    <div className="flex-1 p-5 space-y-6">
      
      {/* Premium Banner */}
      <div className="rounded-xl p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Rocket className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" /> VIP Hosting Active
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[90%]">
            Your premium benefits include 24/7 uptime, edge deployment, and automatic GitHub deployments. Connect your repo below to get started.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isDeployed ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-card/30">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5" /> GitHub Repository URL
                </Label>
                <Input 
                  placeholder="https://github.com/username/my-discord-bot" 
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="font-mono text-sm bg-background/50"
                  disabled={isDeploying}
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" /> Discord Bot Client ID
                </Label>
                <Input 
                  placeholder="e.g. 123456789012345678" 
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="font-mono text-sm bg-background/50"
                  disabled={isDeploying}
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" /> Discord Bot Token
                </Label>
                <Input 
                  type="password"
                  placeholder="Paste your bot token here..." 
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="font-mono text-sm bg-background/50"
                  disabled={isDeploying}
                />
                <p className="text-[10px] text-muted-foreground/60 px-1">
                  Your token is encrypted and never stored in plain text.
                </p>
              </div>
            </div>

            <Button 
              className={cn(
                "w-full h-11 text-sm font-bold shadow-lg transition-all",
                isDeploying 
                  ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/20" 
                  : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
              )}
              onClick={handleDeploy}
              disabled={isDeploying}
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {DEPLOY_STEPS[deployStep]}
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy Bot Instance
                </>
              )}
            </Button>
            
            {/* Terminal Preview */}
            {isDeploying && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="rounded-lg bg-[#0d1117] border border-[#30363d] p-3 font-mono text-[10px] overflow-hidden"
              >
                <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-[#30363d]/50">
                  <Terminal className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground font-semibold">Deployment Logs</span>
                </div>
                <div className="space-y-1 flex flex-col">
                  {DEPLOY_STEPS.slice(0, deployStep + 1).map((step, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2"
                    >
                      <span className={idx === deployStep ? "text-amber-400" : "text-[#3fb950]"}>
                        {idx === deployStep ? '>' : '✓'}
                      </span>
                      <span className="text-muted-foreground break-all">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            
            <div>
              <h3 className="text-base font-bold text-foreground">Bot is Online</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your container is running and connected to Discord Gateway.
              </p>
            </div>

            <div className="rounded-lg bg-background/50 border border-border/50 p-3 text-left space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Status</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Running
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Source</span>
                <span className="text-xs font-mono text-muted-foreground max-w-[150px] truncate">
                  {githubUrl.split('github.com/')[1] || githubUrl}
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-9 text-xs"
              onClick={() => {
                setIsDeployed(false);
                setDeployStep(0);
                setGithubUrl('');
                setClientId('');
                setBotToken('');
              }}
            >
              Deploy Another Bot
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
