import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    Logger.log('Server::RolesService::findAll');
    return this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }
}
