import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Min,
  IsNumber,
  IsObject,
  IsString,
  IsBoolean,
  MaxLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class RadiographOptionsDto {
  @ApiPropertyOptional({
    description: 'Periapical radiograph',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'La opción periapical debe ser un booleano.' })
  @IsOptional()
  periapical?: boolean;

  @ApiPropertyOptional({
    description: 'Panoramic radiograph',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'La opción panorámica debe ser un booleano.' })
  @IsOptional()
  panoramic?: boolean;

  @ApiPropertyOptional({
    description: 'Bitewing radiograph',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'La opción bitewing debe ser un booleano.' })
  @IsOptional()
  bitewing?: boolean;

  @ApiPropertyOptional({
    description: 'Occlusal radiograph',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'La opción oclusal debe ser un booleano.' })
  @IsOptional()
  occlusal?: boolean;

  @ApiPropertyOptional({
    description: 'Cephalometric radiograph',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'La opción cephalométrica debe ser un booleano.' })
  @IsOptional()
  cephalometric?: boolean;

  @ApiPropertyOptional({
    description: 'CBCT radiograph',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'La opción CBCT debe ser un booleano.' })
  @IsOptional()
  cbct?: boolean;
}

export class CreateRadiographyReportDto {
  @ApiProperty({
    description: 'Full name of the patient',
    example: 'Juan Pérez García',
    maxLength: 255,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({
    message: 'El campo nombre completo debe ser una cadena de texto.',
  })
  @IsNotEmpty({ message: 'El campo nombre completo no puede estar vacío.' })
  @MaxLength(255, {
    message: 'El campo nombre completo no puede superar los 255 caracteres.',
  })
  fullName: string;

  @ApiProperty({
    description: 'Age of the patient in years',
    example: 34,
    minimum: 0,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  @IsNumber({}, { message: 'El campo edad debe ser un número.' })
  @Min(0, { message: 'La edad no puede ser negativa.' })
  @IsNotEmpty({ message: 'El campo edad no puede estar vacío.' })
  age: number;

  @ApiProperty({
    description: 'Phone number of the patient',
    example: '+52 55 1234 5678',
    maxLength: 50,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El campo teléfono debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El campo teléfono no puede estar vacío.' })
  @MaxLength(50, {
    message: 'El campo teléfono no puede superar los 50 caracteres.',
  })
  phone: string;

  @ApiProperty({
    description: 'Selected radiograph options',
    type: RadiographOptionsDto,
  })
  @IsObject({ message: 'Las opciones de radiografía deben ser un objeto.' })
  @IsNotEmpty({
    message: 'Las opciones de radiografía no pueden estar vacías.',
  })
  radiographs: RadiographOptionsDto;
}
