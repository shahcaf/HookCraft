import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateDraftDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @IsNotEmpty()
  message: any;
}

export class UpdateDraftDto {
  @IsString()
  name?: string;

  @IsObject()
  message?: any;
}
