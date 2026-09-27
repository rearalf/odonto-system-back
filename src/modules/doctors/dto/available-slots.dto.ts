import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class AvailableSlotsDto {
  @ApiProperty({
    description:
      'Date to compute the free slots for (YYYY-MM-DD). Past dates are rejected and slots of the current day that already elapsed are omitted',
    example: '2026-10-15',
  })
  @IsString({ message: 'El campo fecha debe ser una cadena de texto.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'El campo fecha debe tener el formato YYYY-MM-DD.',
  })
  date: string;
}
