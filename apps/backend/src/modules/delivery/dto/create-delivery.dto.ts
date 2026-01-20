import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryType } from '@prisma/client';

export class CreateDeliveryDto {
  @ApiProperty({ description: 'Quote ID' })
  @IsString()
  quoteId: string;

  @ApiPropertyOptional({ description: 'Vehicle ID for delivery' })
  @IsString()
  @IsOptional()
  vehicleId?: string;

  @ApiProperty({ enum: DeliveryType, description: 'Delivery type', default: DeliveryType.WITH_DELIVERY })
  @IsEnum(DeliveryType)
  type: DeliveryType;

  @ApiPropertyOptional({ description: 'Delivery street address' })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({ description: 'Delivery city' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Delivery zip code' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Delivery country', default: 'BE' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Delivery date' })
  @IsDateString()
  @IsOptional()
  deliveryDate?: string;

  @ApiPropertyOptional({ description: 'Distance in kilometers' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  distance?: number;

  @ApiPropertyOptional({ description: 'Fixed delivery price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  fixedPrice?: number;

  @ApiPropertyOptional({ description: 'Price per kilometer' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pricePerKm?: number;

  @ApiPropertyOptional({ description: 'Has return trip', default: false })
  @IsBoolean()
  @IsOptional()
  hasReturn?: boolean;

  @ApiPropertyOptional({ description: 'Notes for driver' })
  @IsString()
  @IsOptional()
  driverNotes?: string;
}
