import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export type DashboardResponse = {
  users: number;
  teams: number;
};

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMinimalInfo(userId: number): Promise<DashboardResponse> {
    Logger.debug(
      `Server::API::dashboard: Getting minimal info for user - ${userId}`,
    );

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      Logger.error(`Server::API::dashboard: User with id ${userId} not found`);
      throw new Error(`User with id ${userId} not found`);
    }

    if (!user.organizationId) {
      Logger.error(
        `Server::API::dashboard: User with id ${userId} does not belong to any organization`,
      );
      throw new Error(
        `User with id ${userId} does not belong to any organization`,
      );
    }

    const usersCount = await this.prisma.user.count({
      where: {
        organizationId: user?.organizationId,
      },
    });

    const teamsCount = await this.prisma.team.count({
      where: {
        organizationId: user?.organizationId,
      },
    });

    return {
      users: usersCount,
      teams: teamsCount,
    };
  }
}
