import { Module } from '@nestjs/common';

import { RadiographyReportsController } from './radiography-reports.controller.js';
import { RadiographyReportsService } from './radiography-reports.service.js';

@Module({
  controllers: [RadiographyReportsController],
  providers: [RadiographyReportsService],
  exports: [RadiographyReportsService],
})
export class RadiographyReportsModule {}
