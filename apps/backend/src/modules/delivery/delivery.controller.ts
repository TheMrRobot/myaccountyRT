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
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('delivery')
@ApiBearerAuth()
@Controller('delivery')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COMMERCIAL)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post()
  @ApiOperation({ summary: 'Create delivery' })
  @ApiResponse({ status: 201, description: 'Delivery created' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 409, description: 'Delivery already exists for this quote' })
  create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() createDeliveryDto: CreateDeliveryDto,
  ) {
    return this.deliveryService.create(organizationId, createDeliveryDto);
  }

  @Get('quote/:quoteId')
  @ApiOperation({ summary: 'Get delivery by quote ID' })
  @ApiResponse({ status: 200, description: 'Delivery retrieved' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  findByQuote(
    @CurrentUser('organizationId') organizationId: string,
    @Param('quoteId') quoteId: string,
  ) {
    return this.deliveryService.findByQuote(organizationId, quoteId);
  }

  @Patch('quote/:quoteId')
  @ApiOperation({ summary: 'Update delivery' })
  @ApiResponse({ status: 200, description: 'Delivery updated' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('quoteId') quoteId: string,
    @Body() updateDeliveryDto: UpdateDeliveryDto,
  ) {
    return this.deliveryService.update(organizationId, quoteId, updateDeliveryDto);
  }

  @Delete('quote/:quoteId')
  @ApiOperation({ summary: 'Delete delivery' })
  @ApiResponse({ status: 200, description: 'Delivery deleted' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  remove(
    @CurrentUser('organizationId') organizationId: string,
    @Param('quoteId') quoteId: string,
  ) {
    return this.deliveryService.remove(organizationId, quoteId);
  }
}
