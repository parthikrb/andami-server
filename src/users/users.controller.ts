import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UsersService } from './users.service';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async findMe(@Req() request: RequestWithUser, @Res() response: Response) {
    const userId = request.user?.id;
    try {
      const user = await this.usersService.findOneUser(userId);
      response.status(200).json(user);
    } catch (error) {
      response.status(500).json({ message: error.message, error: true });
    }
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  findAll(@Req() request: RequestWithUser) {
    return this.usersService.findAllUsers(request.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneUser(+id);
  }

  @Get()
  async findOneByAuthId(
    @Query('authId') authId: string,
    @Res() response: Response,
  ) {
    try {
      const user = await this.usersService.findOneByAuthId(authId); // Note the 'await' here
      response.status(200).json(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        // Handle not found error specifically
        response.status(404).json({ message: 'User not found', error: true });
      } else {
        // Handle other errors
        response.status(500).json({ message: error.message, error: true });
      }
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.removeUser(+id);
  }
}
