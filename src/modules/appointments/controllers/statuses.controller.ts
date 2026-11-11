import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StatusesService } from '../services/statuses.service.js';
import { AppointmentStatusDto } from '../dto/appointment-status.dto.js';
import { UpdateAppointmentStatusDto } from '../dto/update-appointment-status.dto.js';
import { UpdateAppointmentStatusResponseDto } from '../dto/appointment-status-response.dto.js';

@ApiTags('Statuses')
@Controller('statuses')
export class StatusesController {
  constructor(private readonly statusesService: StatusesService) {}

  @Get('statuses')
  @ApiOperation({
    summary: 'Get all available appointment statuses',
    description:
      'Returns a list of all active appointment statuses with their IDs, names, colors, and descriptions. ' +
      'Use this endpoint to populate status dropdowns in the frontend. ' +
      'The `statusId` from this response should be used when creating or updating appointments.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'List of active appointment statuses ordered by display order.',
    type: [AppointmentStatusDto],
  })
  async getStatuses(): Promise<AppointmentStatusDto[]> {
    return this.statusesService.getStatuses();
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Advance appointment lifecycle status',
    description:
      'Transitions the appointment status (e.g., from scheduled to confirmed, completed, or cancelled).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique identifier of the appointment',
    example: 101,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment status transitioned successfully.',
    type: UpdateAppointmentStatusResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Supplied status transition is illegal or invalid.',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found.',
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
  ): Promise<UpdateAppointmentStatusResponseDto> {
    return this.statusesService.updateStatus(id, updateStatusDto);
  }
}
