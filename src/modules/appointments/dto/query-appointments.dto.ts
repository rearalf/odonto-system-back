import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryAppointmentsDto {
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
}
