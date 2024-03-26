import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.OrganizationCreateInput) {
    Logger.log('Server::OrganizationsService::create');
    return this.prisma.organization.create({ data });
  }

  async findAll() {
    Logger.log('Server::OrganizationsService::findAll');
    return this.prisma.organization.findMany();
  }

  async findOne(id: number) {
    Logger.log('Server::OrganizationsService::findOne', id);
    return this.prisma.organization.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: Prisma.OrganizationUpdateInput) {
    Logger.log('Server::OrganizationsService::update', id);
    return this.prisma.organization.update({ where: { id }, data });
  }
}
