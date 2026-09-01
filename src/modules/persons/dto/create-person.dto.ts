import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePersonDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MaxLength(255)
  firstName: string;

  @ApiPropertyOptional({ example: 'Carlos' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  middleName?: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @MaxLength(255)
  lastName: string;

  @ApiPropertyOptional({ example: 'profile.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  profilePictureName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  profilePictureUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  personTypeId: number;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  phone?: string;

  @ApiPropertyOptional({ example: 'Av. Corrientes 1234' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  address?: string;

  @ApiPropertyOptional({ example: 'Odontólogo' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  occupation?: string;
}
