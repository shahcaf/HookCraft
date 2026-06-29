import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../auth/encryption.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    @InjectQueue('webhooks') private readonly queue: Queue,
  ) {}

  async create(userId: string, dto: CreateWebhookDto) {
    const encryptedUrl = this.encryptionService.encrypt(dto.url);
    return this.prisma.savedWebhook.create({
      data: {
        name: dto.name,
        url: encryptedUrl,
        userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async findAll(userId: string) {
    const webhooks = await this.prisma.savedWebhook.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        url: true,
        createdAt: true,
      },
    });

    // Decrypt URLs for local memory manipulation (if requested client-side under auth)
    return webhooks.map((w) => ({
      id: w.id,
      name: w.name,
      url: this.encryptionService.decrypt(w.url),
      createdAt: w.createdAt,
    }));
  }

  async remove(userId: string, id: string) {
    return this.prisma.savedWebhook.delete({
      where: { id, userId },
    });
  }

  async enqueueExecution(userId: string, id: string, body: any) {
    const webhook = await this.prisma.savedWebhook.findUnique({
      where: { id, userId },
    });
    if (!webhook) throw new Error('Webhook not found');

    const job = await this.queue.add('execute-webhook', {
      webhookId: webhook.id,
      payload: body.message,
      action: body.action || 'send',
      messageId: body.messageId,
      threadId: body.threadId,
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });

    return { jobId: job.id };
  }
}
