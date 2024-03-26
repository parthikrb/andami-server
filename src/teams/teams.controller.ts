import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  async findAll(@Req() request: RequestWithUser) {
    return await this.teamsService.findAll(request.user.organizationId);
  }

  @Get(':id')
  async findById(@Req() request: RequestWithUser, @Param('id') id: string) {
    return await this.teamsService.findById(
      parseInt(id),
      request.user.organizationId,
    );
  }

  @Post()
  async create(@Req() request: RequestWithUser, @Body() body: any) {
    const { users, organization, ...data } = body;
    return await this.teamsService.createTeamWithOrganization(
      data,
      organization,
      request.user.id,
      users,
    );
  }

  @Post('/join')
  async joinTeam(@Req() request: RequestWithUser, @Body() body: any) {
    const { inviteCode } = body;
    return await this.teamsService.joinTeamWithInviteCode(
      inviteCode,
      request.user.id,
    );
  }

  @Patch(':id')
  async updateTeam(@Param('id') id: string, @Body() body: any) {
    return await this.teamsService.updateTeam(parseInt(id), body);
  }

  @Delete(':id')
  async deleteTeam(@Param('id') id: string) {
    return await this.teamsService.deleteTeam(parseInt(id));
  }
}
