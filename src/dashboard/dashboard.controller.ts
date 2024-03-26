import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getMinimalInfo(@Req() req: RequestWithUser, @Res() res: Response) {
    const userId = req.user?.id;
    try {
      const dashboardInfo = await this.dashboardService.getMinimalInfo(userId);
      res.status(HttpStatus.OK).json(dashboardInfo);
    } catch (error) {
      res.status(500).json({ message: error.message, error: true });
    }
  }
}
