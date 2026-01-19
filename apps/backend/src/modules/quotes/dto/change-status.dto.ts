import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuoteStatus } from '@prisma/client';

export class ChangeStatusDto {
  @ApiProperty({ enum: QuoteStatus, description: 'New status' })
  @IsEnum(QuoteStatus)
  status: QuoteStatus;
}
