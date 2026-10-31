import { SchemaObject } from '@nestjs/swagger';

export const PaginatedAppointmentsResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: { $ref: '#/components/schemas/Appointment' },
    },
    meta: {
      nullable: true,
      type: 'object',
      properties: {
        total_count: { type: 'number', example: 42 },
        total_pages: { type: 'number', example: 5 },
        page: { type: 'number', example: 1 },
        per_page: { type: 'number', example: 10 },
      },
    },
  },
};
