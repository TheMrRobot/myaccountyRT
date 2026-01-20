import { IsString, IsEnum, IsOptional, IsDateString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuoteType } from '@prisma/client';

export class CreateQuoteDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  customerId: string;

  @ApiPropertyOptional({ description: 'Vehicle ID (for rental quotes)' })
  @IsString()
  @IsOptional()
  vehicleId?: string;

  @ApiProperty({ enum: QuoteType, description: 'Quote type' })
  @IsEnum(QuoteType)
  type: QuoteType;

  @ApiPropertyOptional({ description: 'Valid until date' })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiPropertyOptional({ description: 'Rental start date (for RENTAL type)' })
  @IsDateString()
  @IsOptional()
  rentalStartDate?: string;

  @ApiPropertyOptional({ description: 'Rental end date (for RENTAL type)' })
  @IsDateString()
  @IsOptional()
  rentalEndDate?: string;

  @ApiPropertyOptional({ description: 'Included kilometers (for RENTAL type)' })
  @IsNumber()
  @IsOptional()
  includedKm?: number;

  @ApiPropertyOptional({ description: 'Extra kilometer rate (for RENTAL type)' })
  @IsNumber()
  @IsOptional()
  extraKmRate?: number;

  @ApiPropertyOptional({ description: 'Internal notes (not visible to customer)' })
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @ApiPropertyOptional({ description: 'Notes for customer' })
  @IsString()
  @IsOptional()
  customerNotes?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsString()
  @IsOptional()
  terms?: string;
}
