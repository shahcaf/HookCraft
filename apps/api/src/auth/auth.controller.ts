import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordAuth() {
    // Redirects to Discord login
  }

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordAuthRedirect(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.login(req.user);
    // Redirect back to frontend with Token and User Details
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      token: result.access_token,
      id: result.user.id,
      username: result.user.username,
      avatar: result.user.avatar || '',
    });
    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }
}
