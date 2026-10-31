import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '../../../common/enums/appointment-status.js';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export class QueryAppointmentsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter calendar by doctor identifier',
    example: 1,
    type: Number,
  })
  doctorId?: number;

  @ApiPropertyOptional({
    description: 'Start date range boundary (YYYY-MM-DD or ISO 8601)',
    example: '2026-10-01',
    type: String,
  })
  from?: string;

  @ApiPropertyOptional({
    description: 'End date range boundary (YYYY-MM-DD or ISO 8601)',
    example: '2026-10-31',
    type: String,
  })
  to?: string;

  @ApiPropertyOptional({
    description: 'Filter by patient name (searches first, middle, last name)',
    example: 'Juan Pérez',
    type: String,
  })
  patientName?: string;

  @ApiPropertyOptional({
    description: 'Filter by appointment status',
    enum: AppointmentStatus,
    isArray: true,
    example: [AppointmentStatus.SCHEDULED, AppointmentStatus.WAITING],
  })
  status?: AppointmentStatus[];

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['startTime', 'endTime', 'createdAt', 'updatedAt', 'modifiedAt'],
    example: 'startTime',
  })
  sortBy?: 'startTime' | 'endTime' | 'createdAt' | 'updatedAt' | 'modifiedAt';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
  })
  sortOrder?: 'ASC' | 'DESC';
}
