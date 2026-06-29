import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;
}

export class UpdateWebhookDto {
  @IsString()
  name?: string;

  @IsUrl()
  url?: string;
}
