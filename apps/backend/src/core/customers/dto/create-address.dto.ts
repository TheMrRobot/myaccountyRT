import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { AddressType } from '@prisma/client';

export class CreateAddressDto {
  @ApiProperty({ enum: AddressType, example: AddressType.BILLING })
  @IsEnum(AddressType)
  type: AddressType;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'Brussels' })
  @IsString()
  city: string;

  @ApiProperty({ example: '1000' })
  @IsString()
  zipCode: string;

  @ApiProperty({ example: 'BE', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
