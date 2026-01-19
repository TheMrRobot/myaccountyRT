import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateNumberingDto {
  @ApiProperty({ example: 'INV-', required: false })
  @IsOptional()
  @IsString()
  prefix?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  next?: number;

  @ApiProperty({ example: 6, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  length?: number;
}
