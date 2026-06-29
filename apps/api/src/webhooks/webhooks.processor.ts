import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../auth/encryption.service';
import { CreateWebhookDto } from './dto/webhook.dto';

export interface WebhookJobData {
  webhookId: string;
  payload: any;
  action: 'send' | 'edit' | 'delete';
  messageId?: string;
  threadId?: string;
}

@Processor('webhooks')
export class WebhooksProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhooksProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
  }

  async process(job: Job<WebhookJobData, any, string>): Promise<any> {
    const { webhookId, payload, action, messageId, threadId } = job.data;
    
    this.logger.debug(`Processing webhook job ${job.id} for webhook ${webhookId} (action: ${action})`);

    const webhook = await this.prisma.savedWebhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook) {
      throw new Error(`Webhook ${webhookId} not found`);
    }

    const decryptedUrl = this.encryptionService.decrypt(webhook.url);
    
    let url = decryptedUrl;
    if (action === 'edit' || action === 'delete') {
      url = `${decryptedUrl}/messages/${messageId}`;
    }
    
    if (threadId) {
      url += `?thread_id=${threadId}`;
    } else if (action === 'send') {
      url += `?wait=true`;
    }

    const method = action === 'send' ? 'POST' : action === 'edit' ? 'PATCH' : 'DELETE';
    const body = action === 'delete' ? undefined : JSON.stringify(payload);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        throw new Error(`Discord API error (${response.status}): ${errorText}`);
      }

      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      this.logger.error(`Failed to process webhook job ${job.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error; // Let BullMQ handle retries
    }
  }
}
