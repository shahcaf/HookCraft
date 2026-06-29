import { Metadata } from 'next';
import { Copy, Heart, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Templates | HookCraft',
  description: 'Browse and use pre-made Discord webhook templates for your server.',
};

const templates = [
  {
    id: 1,
    title: 'Server Welcome Message',
    description: 'A beautiful embed to welcome new members to your server with rules and role info.',
    category: 'Onboarding',
    author: 'HookCraft Team',
    likes: 342,
    uses: 1205,
    color: '#8c52ff'
  },
  {
    id: 2,
    title: 'Patch Notes / Update',
    description: 'Format your game or software updates cleanly with versioning and bullet points.',
    category: 'Announcements',
    author: 'HookCraft Team',
    likes: 215,
    uses: 890,
    color: '#00b0f4'
  },
  {
    id: 3,
    title: 'Stream Going Live',
    description: 'An eye-catching template for when you go live on Twitch or YouTube.',
    category: 'Social',
    author: 'HookCraft Team',
    likes: 189,
    uses: 670,
    color: '#9146ff'
  },
  {
    id: 4,
    title: 'Support Ticket Creation',
    description: 'A professional template to acknowledge a new support ticket.',
    category: 'Moderation',
    author: 'HookCraft Team',
    likes: 156,
    uses: 540,
    color: '#fee75c'
  },
  {
    id: 5,
    title: 'Server Rules',
    description: 'A structured embed listing out the community guidelines clearly.',
    category: 'Onboarding',
    author: 'HookCraft Team',
    likes: 420,
    uses: 2100,
    color: '#ed4245'
  },
  {
    id: 6,
    title: 'Event Reminder',
    description: 'Remind your community about an upcoming event or podcast.',
    category: 'Announcements',
    author: 'HookCraft Team',
    likes: 112,
    uses: 430,
    color: '#57f287'
  }
];

export default function TemplatesPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background">
      <div className="w-full bg-gradient-to-b from-primary/10 to-background border-b border-border/50 py-16">
        <div className="container max-w-6xl px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Template Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Start your webhook journey with these pre-designed, ready-to-use templates.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2">
            {['All', 'Onboarding', 'Announcements', 'Social', 'Moderation'].map(cat => (
              <button key={cat} className="px-4 py-1.5 rounded-full text-sm font-medium border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="container max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="flex flex-col rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden group hover:shadow-xl hover:border-primary/30 transition-all">
              <div className="h-32 p-6 flex flex-col justify-end relative" style={{ backgroundColor: template.color + '15' }}>
                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: template.color }} />
                <span className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: template.color }}>{template.category}</span>
                <h3 className="text-xl font-bold truncate">{template.title}</h3>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-muted-foreground text-sm flex-1 mb-6">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-4 text-muted-foreground text-xs font-medium">
                    <span className="flex items-center gap-1 hover:text-red-400 transition-colors cursor-pointer">
                      <Heart className="w-4 h-4" /> {template.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Copy className="w-4 h-4" /> {template.uses}
                    </span>
                  </div>
                  
                  <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
