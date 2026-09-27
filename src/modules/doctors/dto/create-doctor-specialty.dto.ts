import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

import { TransformBoolean } from '../../../common/dto/transform-boolean.js';

export class CreateDoctorSpecialtyDto {
  @ApiProperty({
    description: 'Foreign key referencing the specialty to attach',
    example: 3,
  })
  @Type(() => Number)
  @IsInt({
    message: 'El campo especialidad debe ser un número entero.',
  })
  @Min(1, { message: 'El campo especialidad debe ser mayor que 0.' })
  specialtyId: number;

  @ApiPropertyOptional({
    description:
      'Marks this specialty as the main one of the doctor. Only one specialty per doctor can be primary, so setting it to true demotes the others. When several entries of the same request arrive as true, the last one wins',
    example: false,
    default: false,
  })
  @TransformBoolean()
  @IsOptional()
  @IsBoolean({
    message: 'El campo especialidad principal debe ser un valor booleano.',
  })
  isPrimary?: boolean;
}
