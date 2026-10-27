import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../../../common/enums/appointment-status.js';

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    description: 'Target lifecycle status for the appointment',
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
  })
  status: AppointmentStatus;
}
