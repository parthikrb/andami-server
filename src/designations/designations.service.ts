import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DesignationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.DesignationCreateInput) {
    Logger.log('Server::DesignationsService::create');
    return this.prisma.designation.create({ data });
  }

  async findAll() {
    Logger.log('Server::DesignationsService::findAll');
    return this.prisma.designation.findMany();
  }

  async findOne(id: number) {
    Logger.log('Server::DesignationsService::findOne', id);
    return this.prisma.designation.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.DesignationUpdateInput) {
    Logger.log('Server::DesignationsService::update', id);
    return this.prisma.designation.update({ where: { id }, data });
  }

  async remove(id: number) {
    Logger.log('Server::DesignationsService::remove', id);
    return this.prisma.designation.delete({ where: { id } });
  }
}
