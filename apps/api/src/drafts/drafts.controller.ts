import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DraftsService } from './drafts.service';
import { CreateDraftDto, UpdateDraftDto } from './dto/draft.dto';

@Controller('drafts')
@UseGuards(AuthGuard('jwt'))
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateDraftDto) {
    return this.draftsService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.draftsService.findAll(req.user.userId);
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateDraftDto) {
    return this.draftsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.draftsService.remove(req.user.userId, id);
  }
}
