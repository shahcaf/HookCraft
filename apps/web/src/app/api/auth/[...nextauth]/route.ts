export const dynamic = 'force-dynamic';
import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

// Auto-detect URL on Netlify/Vercel if NEXTAUTH_URL is not explicitly set
if (!process.env.NEXTAUTH_URL) {
  if (process.env.URL) process.env.NEXTAUTH_URL = process.env.URL; // Netlify sets URL automatically
  else if (process.env.VERCEL_URL) process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

const VIP_GUILD_ID = process.env.DISCORD_SUPPORT_GUILD_ID || "1459243809224392879";
const VIP_ROLE_ID = "1521343753879683222";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev_mode_only",
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: { params: { scope: 'identify email guilds guilds.members.read guilds.join' } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;

        // Auto-join support server if bot token is provided
        const botToken = process.env.DISCORD_BOT_TOKEN;
        if (botToken && account.providerAccountId && account.access_token) {
          try {
            await fetch(`https://discord.com/api/v10/guilds/${VIP_GUILD_ID}/members/${account.providerAccountId}`, {
              method: 'PUT',
              headers: {
                Authorization: `Bot ${botToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                access_token: account.access_token,
              }),
            });
          } catch (err) {
            console.error("Auto-join support server error:", err);
          }
        }

        if (VIP_GUILD_ID && account.access_token) {
          try {
            const res = await fetch(`https://discord.com/api/v10/users/@me/guilds/${VIP_GUILD_ID}/member`, {
              headers: { Authorization: `Bearer ${account.access_token}` }
            });
            if (res.ok) {
              const member = await res.json();
              token.isVip = member.roles?.includes(VIP_ROLE_ID) ?? false;
            } else {
              token.isVip = false;
            }
          } catch (e) {
            token.isVip = false;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).isVip = token.isVip;
      return session;
    }
  }
}

const handler = NextAuth(authOptions);

export async function GET(req: Request, context: any) {
  try {
    return await handler(req, context);
  } catch (error: any) {
    console.error("NextAuth GET Error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(req: Request, context: any) {
  try {
    return await handler(req, context);
  } catch (error: any) {
    console.error("NextAuth POST Error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
