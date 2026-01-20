import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleStatus } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Vehicle name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'License plate number' })
  @IsString()
  licensePlate: string;

  @ApiPropertyOptional({ description: 'VIN (Vehicle Identification Number)' })
  @IsString()
  @IsOptional()
  vin?: string;

  @ApiPropertyOptional({ description: 'Vehicle category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Vehicle brand' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ description: 'Vehicle model' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ description: 'Manufacturing year' })
  @IsNumber()
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ description: 'Load capacity (kg)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  loadCapacity?: number;

  @ApiPropertyOptional({ description: 'Volume capacity (m³)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  volume?: number;

  @ApiPropertyOptional({ description: 'Number of seats' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  seats?: number;

  @ApiPropertyOptional({ description: 'Daily rental rate' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyRate?: number;

  @ApiPropertyOptional({ description: 'Flat rental rate' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  flatRate?: number;

  @ApiPropertyOptional({ description: 'Rate per kilometer' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  kmRate?: number;

  @ApiPropertyOptional({ description: 'Current kilometers' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentKm?: number;

  @ApiPropertyOptional({ description: 'Last maintenance date' })
  @IsDateString()
  @IsOptional()
  lastMaintenance?: string;

  @ApiPropertyOptional({ enum: VehicleStatus, description: 'Vehicle status', default: VehicleStatus.ACTIVE })
  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;
}
