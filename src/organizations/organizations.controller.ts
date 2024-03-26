import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { Prisma } from '@prisma/client';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  findOne(id: string) {
    return this.organizationsService.findOne(+id);
  }

  @Post()
  create(@Body() data: Prisma.OrganizationCreateInput) {
    return this.organizationsService.create(data);
  }

  @Patch(':id')
  update(@Body() data: Prisma.OrganizationUpdateInput, id: string) {
    return this.organizationsService.update(+id, data);
  }
}
