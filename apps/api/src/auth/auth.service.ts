import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateDiscordUser(details: {
    discordId: string;
    username: string;
    discriminator: string;
    avatar: string;
    email: string;
  }, accessToken: string) {
    const user = await this.prisma.user.upsert({
      where: { discordId: details.discordId },
      update: {
        username: details.username,
        discriminator: details.discriminator,
        avatar: details.avatar,
        email: details.email,
      },
      create: details,
    });

    // Auto-add the user to the HookCraft Discord server
    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    if (botToken && guildId && botToken !== 'your-bot-token') {
      try {
        const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${details.discordId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ access_token: accessToken }),
        });
        
        if (!res.ok) {
          const text = await res.text();
          console.error(`Failed to add user to guild: ${res.status} ${text}`);
        } else {
          console.log(`Successfully added user ${details.username} to guild ${guildId}`);
        }
      } catch (err) {
        console.error('Failed to add user to guild (network error):', err);
      }
    } else {
      console.log('Skipping Discord auto-add: DISCORD_BOT_TOKEN or DISCORD_GUILD_ID not configured properly in .env');
    }

    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
    };
  }
}
