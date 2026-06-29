import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/webhook.dto';

@Controller('webhooks')
@UseGuards(AuthGuard('jwt'))
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateWebhookDto) {
    return this.webhooksService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.webhooksService.findAll(req.user.userId);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.webhooksService.remove(req.user.userId, id);
  }

  @Post(':id/execute')
  async execute(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any
  ) {
    return this.webhooksService.enqueueExecution(req.user.userId, id, body);
  }
}
