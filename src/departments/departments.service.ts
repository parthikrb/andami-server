import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.DepartmentCreateInput) {
    Logger.log('Server::DepartmentsService::create');
    return this.prisma.department.create({ data });
  }

  async findAll() {
    Logger.log('Server::DepartmentsService::findAll');
    return this.prisma.department.findMany();
  }

  async findOne(id: number) {
    Logger.log('Server::DepartmentsService::findOne', id);
    return this.prisma.department.findUnique({
      where: { id },
    });
  }
}
