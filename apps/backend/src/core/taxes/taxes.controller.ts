import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('taxes')
@ApiBearerAuth()
@Controller('taxes')
@UseGuards(RolesGuard)
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Create tax' })
  @ApiResponse({ status: 201, description: 'Tax created' })
  create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() createTaxDto: CreateTaxDto,
  ) {
    return this.taxesService.create(organizationId, createTaxDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all taxes' })
  @ApiResponse({ status: 200, description: 'Taxes retrieved' })
  findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.taxesService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tax by ID' })
  @ApiResponse({ status: 200, description: 'Tax retrieved' })
  @ApiResponse({ status: 404, description: 'Tax not found' })
  findOne(@CurrentUser('organizationId') organizationId: string, @Param('id') id: string) {
    return this.taxesService.findOne(organizationId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Update tax' })
  @ApiResponse({ status: 200, description: 'Tax updated' })
  @ApiResponse({ status: 404, description: 'Tax not found' })
  update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateTaxDto: UpdateTaxDto,
  ) {
    return this.taxesService.update(organizationId, id, updateTaxDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Delete tax' })
  @ApiResponse({ status: 200, description: 'Tax deleted' })
  @ApiResponse({ status: 404, description: 'Tax not found' })
  @ApiResponse({ status: 409, description: 'Tax is in use' })
  remove(@CurrentUser('organizationId') organizationId: string, @Param('id') id: string) {
    return this.taxesService.remove(organizationId, id);
  }
}
