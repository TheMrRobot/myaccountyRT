import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreateExpenseDto {
  @ApiPropertyOptional({ description: 'Expense category ID' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Expense date' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Supplier name' })
  @IsString()
  supplier: string;

  @ApiProperty({ description: 'Expense description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Amount excluding tax (HT)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amountHT?: number;

  @ApiPropertyOptional({ description: 'Tax rate percentage' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Tax amount' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxAmount?: number;

  @ApiProperty({ description: 'Amount including tax (TTC)' })
  @IsNumber()
  @Min(0)
  amountTTC: number;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Payment reference' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ description: 'Cost center' })
  @IsString()
  @IsOptional()
  costCenter?: string;

  @ApiPropertyOptional({ description: 'Project' })
  @IsString()
  @IsOptional()
  project?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
