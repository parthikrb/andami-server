import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  private async fetchTeamUsers(teamId: number) {
    return this.prisma.teamUser
      .findMany({
        where: { teamId },
        include: {
          user: true,
          role: true,
        },
      })
      .then((teamUsers) =>
        teamUsers.map(({ user, role }) => ({
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: role,
        })),
      );
  }

  async findById(id: number, organizationId: number) {
    Logger.log(
      `Server::TeamsService::Fetching team with id ${id} for organization ${organizationId}`,
    );
    const team = await this.prisma.team.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    const users = await this.fetchTeamUsers(id);

    const admins = users.filter(({ role }) =>
      ['admin', 'manager'].includes(role?.name?.toLowerCase()),
    );

    return { ...team, users, admins, membersCount: users.length };
  }

  async findAll(organizationId: number) {
    Logger.log(
      `Server::TeamsService::Fetching all teams for organization ${organizationId}`,
    );
    const teams = await this.prisma.team.findMany({
      where: {
        organizationId,
      },
    });

    return Promise.all(
      teams.map(async (team) => {
        const users = await this.fetchTeamUsers(team.id);
        const admins = users.filter(({ role }) =>
          ['admin', 'manager'].includes(role?.name?.toLowerCase()),
        );
        return { ...team, users, admins, membersCount: users.length };
      }),
    );
  }

  async updateTeam(id: number, data: any) {
    Logger.log(`Updating team with id ${id}`);
    return this.prisma.$transaction(async (prisma) => {
      const updatedTeam = await prisma.team.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          teamUsers: {
            updateMany: data.users
              .filter((user) => user.id)
              .map((user) => ({
                where: { userId: user.id },
                data: { roleId: user.role.id },
              })),
            create: data.users
              .filter((user) => !user.id)
              .map((user) => ({
                userId: user.id,
                roleId: user.role.id,
              })),
          },
        },
        include: { teamUsers: true },
      });
      return updatedTeam;
    });
  }

  async deleteTeam(id: number) {
    Logger.log(`Server::TeamService::Deleting team with id ${id}`);
    return this.prisma.team.delete({ where: { id } });
  }

  generateRandomCharacters(length: number) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  async createTeamWithOrganization(
    data: any,
    organization: string,
    userId: number,
    users?: any[],
  ) {
    Logger.log(
      `Creating team with name ${data.name} for organization ${organization}`,
    );
    return this.prisma.$transaction(async (prisma) => {
      const newOrganization = await prisma.organization.upsert({
        where: { name: organization },
        update: {},
        create: { name: organization },
      });

      const newTeam = await prisma.team.create({
        data: {
          ...data,
          inviteCode: this.generateRandomCharacters(6),
          organizationId: newOrganization.id,
          createdBy: userId,
        },
      });

      if (users) {
        await Promise.all(
          users.map((user) =>
            prisma.teamUser.create({
              data: {
                teamId: newTeam.id,
                userId: user.id,
                roleId: user.role.id,
              },
            }),
          ),
        );
      }
      const managerRole = await prisma.role.findFirst({
        where: { name: { equals: 'manager', mode: 'insensitive' } },
      });

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          organizationId: newOrganization.id,
          roleId: managerRole?.id,
        },
      });

      await prisma.teamUser.upsert({
        where: { userId_teamId: { userId: userId, teamId: newTeam.id } },
        update: {},
        create: {
          teamId: newTeam.id,
          userId: userId,
          roleId: managerRole?.id,
        },
      });

      return newTeam;
    });
  }

  async joinTeamWithInviteCode(inviteCode: string, userId: number) {
    Logger.log('Joining team with invite code');
    return this.prisma.$transaction(async (prisma) => {
      const team = await prisma.team.findUnique({
        where: { inviteCode },
        include: { organization: true },
      });
      if (!team) {
        throw new Error('Invalid invite code');
      }

      const employeeTeamRole = await prisma.role.findFirst({
        where: {
          name: {
            equals: 'employee',
            mode: 'insensitive',
          },
        },
      });

      const existingTeamUser = await prisma.teamUser.findUnique({
        where: { userId_teamId: { userId, teamId: team.id } },
      });

      if (!existingTeamUser) {
        await prisma.teamUser.create({
          data: {
            teamId: team.id,
            userId: userId,
            roleId: employeeTeamRole?.id,
          },
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { organizationId: team.organizationId },
      });

      return team;
    });
  }
}
