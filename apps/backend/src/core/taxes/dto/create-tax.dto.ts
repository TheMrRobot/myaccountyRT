import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaxDto {
  @ApiProperty({ example: 'VAT 21%' })
  @IsString()
  name: string;

  @ApiProperty({ example: 21.00 })
  @IsNumber()
  @Type(() => Number)
  rate: number;

  @ApiProperty({ example: 'Standard VAT rate', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
