import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuoteLineDto {
  @ApiPropertyOptional({ description: 'Product ID (optional if custom line)' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ description: 'Whether this is a section header', default: false })
  @IsBoolean()
  @IsOptional()
  isSection?: boolean;

  @ApiProperty({ description: 'Line description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Quantity', default: 1 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ description: 'Unit price', default: 0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Discount percentage', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ description: 'Tax ID' })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsNumber()
  @IsOptional()
  order?: number;
}
