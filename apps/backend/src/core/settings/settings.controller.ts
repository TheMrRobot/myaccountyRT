import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateNumberingDto } from './dto/update-numbering.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('numbering')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all document numbering settings' })
  @ApiResponse({ status: 200, description: 'Document numbering settings retrieved' })
  getDocumentNumberings(@CurrentUser('organizationId') organizationId: string) {
    return this.settingsService.getDocumentNumberings(organizationId);
  }

  @Get('numbering/:type')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get document numbering by type' })
  @ApiResponse({ status: 200, description: 'Document numbering retrieved' })
  @ApiResponse({ status: 404, description: 'Document numbering not found' })
  getDocumentNumbering(
    @CurrentUser('organizationId') organizationId: string,
    @Param('type') type: string,
  ) {
    return this.settingsService.getDocumentNumbering(organizationId, type);
  }

  @Patch('numbering/:type')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update document numbering' })
  @ApiResponse({ status: 200, description: 'Document numbering updated' })
  updateDocumentNumbering(
    @CurrentUser('organizationId') organizationId: string,
    @Param('type') type: string,
    @Body() updateNumberingDto: UpdateNumberingDto,
  ) {
    return this.settingsService.updateDocumentNumbering(organizationId, type, updateNumberingDto);
  }
}
