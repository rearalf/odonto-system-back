import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    description:
      'Target lifecycle status ID for the appointment (references appointment_status table)',
    example: 2,
    type: Number,
  })
  @IsInt({ message: 'El ID del estado debe ser un número entero.' })
  @Min(1, { message: 'El ID del estado debe ser mayor a 0.' })
  @Type(() => Number)
  statusId: number;
}
