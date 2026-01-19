import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Document name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Document type (insurance, registration, inspection, etc.)' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Expiry date for the document' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}
