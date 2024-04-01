import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma, Role, Permission } from '@prisma/client';

type UserWithRolesAndPermissions = User & {
  role: Role | null;
  permissions: Partial<Permission>[];
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async fetchUserWithDetails(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<UserWithRolesAndPermissions> {
    const filteredUser = await this.prisma.user.findUniqueOrThrow({
      where,
      include: {
        organization: true,
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    const userRole = filteredUser.role;

    const allPermissions = userRole?.permissions || [];

    const uniquePermissions = Array.from(
      new Map(
        allPermissions.map((permission) => [permission.id, permission]),
      ).values(),
    );

    return {
      ...filteredUser,
      role: userRole,
      permissions: uniquePermissions,
    };
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    Logger.log('Server::UsersService::createUser');
    return this.prisma.user.create({ data });
  }

  async findAllUsers(organizationId: number): Promise<User[]> {
    Logger.log(
      `Server::UsersService::findAllUsers for Organization - ${organizationId}`,
    );
    const allUsers = await this.prisma.user.findMany({
      where: { organizationId },
      include: {
        organization: {
          include: {
            teams: true,
          },
        },
        designation: {
          select: {
            id: true,
            title: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const usersResponse = allUsers.map((user) => ({
      ...user,
      organization: {
        id: user.organization?.id,
        name: user.organization?.name,
      },
      teams: user.organization?.teams?.map((team) => ({
        id: team.id,
        name: team.name,
      })),
    }));

    return usersResponse;
  }

  async findOneUser(id: number): Promise<User | null> {
    Logger.log(`Server::UsersService::findOneUser - ${id}`);
    return this.fetchUserWithDetails({ id });
  }

  async findOneByAuthId(id: string): Promise<User | null> {
    Logger.log(`Server::UsersService::findOneByAuthId - ${id}`);
    return this.prisma.user.findUnique({
      where: { authId: id },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    Logger.log('Server::UsersService::findOneByEmail', email);
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    Logger.log('Server::UsersService::updateUser', id, data);
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async removeUser(id: number): Promise<User> {
    Logger.log(`Server::UsersService::removeUser - ${id}`);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
