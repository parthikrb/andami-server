import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Organization, Prisma } from '@prisma/client';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  private async fetchTeamUsers(teamId: number) {
    const teamUsers = await this.prisma.teamUser.findMany({
      where: { teamId },
      include: {
        user: true,
      },
    });

    const teamUsersWithRoles = await Promise.all(
      teamUsers.map(async (teamUser) => {
        const userRole = await this.prisma.role.findFirst({
          where: {
            id: teamUser.roleId,
          },
        });

        return {
          ...teamUser,
          role: userRole,
        };
      }),
    );

    return teamUsersWithRoles.map(({ user, role }) => ({
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: role,
    }));
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
      ['admin', 'manager'].includes(role?.name && role?.name.toLowerCase()),
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
          ['admin', 'manager'].includes(role?.name && role?.name.toLowerCase()),
        );

        return { ...team, users, admins, membersCount: users.length };
      }),
    );
  }

  async updateTeam(id: number, data: any) {
    Logger.log(`Server::TeamsService::Updating team with id ${id}`);
    return await this.prisma.$transaction(async (prisma) => {
      // Update team information
      const updatedTeam = await prisma.team.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        },
        include: {
          teamUsers: true, // Include to check existing associations
        },
      });

      // Determine which users to add or remove based on the incoming data
      const existingUserIds = new Set(
        updatedTeam.teamUsers.map((u) => u.userId),
      );
      const newUserIds = new Set(data.users.map((u) => u.id));

      // Users to remove are those not present in the new list but exist in the current team
      const usersToRemove = Array.from(existingUserIds).filter(
        (id) => !newUserIds.has(id),
      );

      // Perform removal of users no longer associated with the team
      await Promise.all(
        usersToRemove.map(async (userId) => {
          await prisma.teamUser.deleteMany({
            where: {
              teamId: id,
              userId,
            },
          });
        }),
      );

      // Update or add users and their roles
      await Promise.all(
        data.users.map(async (user: any) => {
          // Check if the user is already part of the team
          if (existingUserIds.has(user.id)) {
            // Update existing user's role within the team
            await prisma.teamUser.updateMany({
              where: {
                teamId: id,
                userId: user.id,
              },
              data: {
                roleId: user.role.id,
              },
            });
          } else {
            // Add new user to the team with specified role
            await prisma.teamUser.create({
              data: {
                teamId: id,
                userId: user.id,
                roleId: user.role.id,
              },
            });
          }
        }),
      );

      return updatedTeam;
    });
  }

  async deleteTeam(id: number) {
    Logger.log(`Server::TeamsService::Deleting team with id ${id}`);
    return await this.prisma.team.delete({
      where: { id },
    });
  }

  generateRandomCharacters(length: number) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async createTeamWithOrganization(
    data: Prisma.TeamCreateInput,
    organization: string,
    userId: number,
    users?: any[],
  ) {
    Logger.log(
      `Server::TeamsService::Creating team with name ${data.name} for organization ${organization}`,
    );
    return this.prisma.$transaction(async (prisma) => {
      const newOrganization: Organization = await prisma.organization.upsert({
        where: {
          name: organization,
        },
        update: {},
        create: {
          name: organization,
        },
      });

      const managerRole = await prisma.role.findFirst({
        where: {
          name: {
            equals: 'manager',
            mode: 'insensitive',
          },
        },
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

      const newTeam = await prisma.team.create({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data: {
          ...data,
          inviteCode: this.generateRandomCharacters(6),
          organizationId: newOrganization.id,
          createdBy: userId,
        },
      });

      if (users) {
        await Promise.all(
          users.map(async (user: any) => {
            // Add new user to the team with specified role
            await prisma.teamUser.create({
              data: {
                teamId: newTeam.id,
                userId: user.id,
                roleId: user.role.id,
              },
            });
          }),
        );
      }

      // Check if the user is already part of the team
      const existingTeamUser = await prisma.teamUser.findUnique({
        where: {
          userId_teamId: {
            userId: userId,
            teamId: newTeam.id,
          },
        },
      });

      if (existingTeamUser) {
        return newTeam;
      }

      // Connect the user to the team
      await prisma.teamUser.create({
        data: {
          team: {
            connect: {
              id: newTeam.id,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
          role: {
            connect: {
              id: managerRole?.id,
            },
          },
        },
      });

      return newTeam;
    });
  }

  async joinTeamWithInviteCode(inviteCode: string, userId: number) {
    Logger.log('Server::TeamsService::Joining team with invite code');
    return this.prisma.$transaction(async (prisma) => {
      const team = await prisma.team.findUnique({
        where: {
          inviteCode,
        },
        include: {
          organization: true, // Include the organization to get its ID
        },
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

      // Check if the user is already part of the team
      const existingTeamUser = await prisma.teamUser.findUnique({
        where: {
          userId_teamId: {
            userId: userId,
            teamId: team.id,
          },
        },
      });

      if (existingTeamUser) {
        return team;
      }

      // Connect the user to the team
      await prisma.teamUser.create({
        data: {
          team: {
            connect: {
              id: team.id,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
          role: {
            connect: {
              id: employeeTeamRole?.id,
            },
          },
        },
      });

      // Update the user's organizationId to reflect the team's organization
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          organizationId: team.organizationId, // Assuming team includes organizationId field
        },
      });

      return team;
    });
  }
}
