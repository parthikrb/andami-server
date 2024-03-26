import { Module } from '@nestjs/common';
import { DesignationsService } from './designations.service';
import { DesignationsController } from './designations.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [DesignationsService, PrismaService],
  controllers: [DesignationsController],
})
export class DesignationsModule {}
