import { Injectable } from '@nestjs/common';

import { CreateRadiographyReportDto } from './dto/create-radiography-report.dto.js';
import { generateRadiographyReportPdf } from './utils/pdf-generator.js';

@Injectable()
export class RadiographyReportsService {
  async generatePdf(dto: CreateRadiographyReportDto): Promise<Buffer> {
    return generateRadiographyReportPdf({
      fullName: dto.fullName,
      age: dto.age,
      phone: dto.phone,
      radiographs: {
        periapical: dto.radiographs.periapical ?? false,
        panoramic: dto.radiographs.panoramic ?? false,
        bitewing: dto.radiographs.bitewing ?? false,
        occlusal: dto.radiographs.occlusal ?? false,
        cephalometric: dto.radiographs.cephalometric ?? false,
        cbct: dto.radiographs.cbct ?? false,
      },
    });
  }
}
