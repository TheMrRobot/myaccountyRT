import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsArray } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'My Company' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'My Company SPRL', required: false })
  @IsOptional()
  @IsString()
  legalName?: string;

  @ApiProperty({ example: 'BE0123456789', required: false })
  @IsOptional()
  @IsString()
  vatNumber?: string;

  @ApiProperty({ example: 'BE68539007547034', required: false })
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiProperty({ example: 'contact@company.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+32 123 456 789', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'https://company.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ example: '123 Main Street', required: false })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ example: 'Brussels', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: '1000', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ example: 'BE', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'EUR', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'fr', required: false })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({ example: 'Europe/Brussels', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ example: ['quotes', 'invoices', 'expenses'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modulesEnabled?: string[];
}
