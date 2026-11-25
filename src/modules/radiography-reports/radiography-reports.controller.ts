import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { RadiographyReportsService } from './radiography-reports.service.js';
import { CreateRadiographyReportDto } from './dto/create-radiography-report.dto.js';

@ApiTags('radiography-reports')
@Controller('radiography-reports')
export class RadiographyReportsController {
  constructor(
    private readonly radiographyReportsService: RadiographyReportsService,
  ) {}

  @Post('generate-pdf')
  @ApiOperation({
    summary: 'Generate radiography report PDF',
    description:
      'Generates a PDF report with patient data and selected radiograph options.',
  })
  @ApiBody({ type: CreateRadiographyReportDto })
  @ApiCreatedResponse({ description: 'PDF report generated successfully.' })
  async generatePdf(
    @Body() dto: CreateRadiographyReportDto,
    @Res() res: Response,
  ): Promise<void> {
    const pdfBuffer = await this.radiographyReportsService.generatePdf(dto);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="radiography-report.pdf"',
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
