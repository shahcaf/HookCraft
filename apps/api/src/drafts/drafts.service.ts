import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDraftDto, UpdateDraftDto } from './dto/draft.dto';

@Injectable()
export class DraftsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDraftDto) {
    return this.prisma.draft.create({
      data: {
        name: dto.name,
        message: dto.message,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.draft.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async update(userId: string, id: string, dto: UpdateDraftDto) {
    return this.prisma.draft.update({
      where: { id, userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.message && { message: dto.message }),
      },
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.draft.delete({
      where: { id, userId },
    });
  }
}
