import { Controller, Get, Param } from '@nestjs/common';
import { DesignationsService } from './designations.service';

@Controller('designations')
export class DesignationsController {
  constructor(private readonly designationsService: DesignationsService) {}

  @Get()
  findAll() {
    return this.designationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.designationsService.findOne(+id);
  }
}
