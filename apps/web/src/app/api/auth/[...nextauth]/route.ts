export const dynamic = 'force-dynamic';
import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const VIP_GUILD_ID = process.env.DISCORD_SUPPORT_GUILD_ID || "YOUR_GUILD_ID"; // We will get the real one from the invite code
const VIP_ROLE_ID = "1521343753879683222";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev_mode_only",
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: { params: { scope: 'identify email guilds guilds.members.read' } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        if (VIP_GUILD_ID && VIP_GUILD_ID !== "YOUR_GUILD_ID" && account.access_token) {
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
export { handler as GET, handler as POST };
