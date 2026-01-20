import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('vehicles')
@ApiBearerAuth()
@Controller('vehicles')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COMMERCIAL)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Create vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created' })
  create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() createVehicleDto: CreateVehicleDto,
  ) {
    return this.vehiclesService.create(organizationId, createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles' })
  @ApiResponse({ status: 200, description: 'Vehicles retrieved' })
  findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.vehiclesService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Vehicle retrieved' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  findOne(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.vehiclesService.findOne(organizationId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle updated' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(organizationId, id, updateVehicleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle deleted' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  remove(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.vehiclesService.remove(organizationId, id);
  }

  // Document management endpoints
  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload document for vehicle' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: { type: 'string' },
        type: { type: 'string' },
        expiryDate: { type: 'string', format: 'date-time' },
      },
      required: ['file', 'name', 'type'],
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async uploadDocument(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') vehicleId: string,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.vehiclesService.uploadDocument(organizationId, vehicleId, uploadDocumentDto, file);
  }

  @Delete(':id/documents/:documentId')
  @ApiOperation({ summary: 'Delete vehicle document' })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  deleteDocument(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') vehicleId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.vehiclesService.deleteDocument(organizationId, vehicleId, documentId);
  }

  // Availability check endpoint
  @Get(':id/availability')
  @ApiOperation({ summary: 'Check vehicle availability' })
  @ApiResponse({ status: 200, description: 'Availability checked' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  checkAvailability(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') vehicleId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    return this.vehiclesService.checkAvailability(
      organizationId,
      vehicleId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
