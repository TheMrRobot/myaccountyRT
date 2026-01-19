import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { FilesService } from '../../core/files/files.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  async create(organizationId: string, createVehicleDto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        organizationId,
        ...createVehicleDto,
        lastMaintenance: createVehicleDto.lastMaintenance
          ? new Date(createVehicleDto.lastMaintenance)
          : undefined,
      },
      include: {
        documents: true,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.vehicle.findMany({
      where: { organizationId },
      include: {
        documents: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, organizationId },
      include: {
        documents: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async update(organizationId: string, id: string, updateVehicleDto: UpdateVehicleDto) {
    await this.findOne(organizationId, id);

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...updateVehicleDto,
        lastMaintenance: updateVehicleDto.lastMaintenance
          ? new Date(updateVehicleDto.lastMaintenance)
          : undefined,
      },
      include: {
        documents: true,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    const vehicle = await this.findOne(organizationId, id);

    // Delete all associated documents from filesystem
    for (const document of vehicle.documents) {
      try {
        await this.filesService.deleteFile(document.filePath);
      } catch (error) {
        // Continue even if file deletion fails
        console.error(`Failed to delete file: ${document.filePath}`, error);
      }
    }

    return this.prisma.vehicle.delete({
      where: { id },
    });
  }

  async uploadDocument(
    organizationId: string,
    vehicleId: string,
    uploadDocumentDto: UploadDocumentDto,
    file: Express.Multer.File,
  ) {
    await this.findOne(organizationId, vehicleId);

    // Save file to filesystem
    const savedFile = await this.filesService.saveFile(organizationId, file, 'vehicles');

    // Create document record
    const document = await this.prisma.vehicleDocument.create({
      data: {
        vehicleId,
        name: uploadDocumentDto.name,
        type: uploadDocumentDto.type,
        filePath: savedFile.path,
        expiryDate: uploadDocumentDto.expiryDate
          ? new Date(uploadDocumentDto.expiryDate)
          : undefined,
      },
    });

    return document;
  }

  async deleteDocument(organizationId: string, vehicleId: string, documentId: string) {
    const vehicle = await this.findOne(organizationId, vehicleId);

    const document = await this.prisma.vehicleDocument.findFirst({
      where: { id: documentId, vehicleId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Delete file from filesystem
    try {
      await this.filesService.deleteFile(document.filePath);
    } catch (error) {
      // Continue even if file deletion fails
      console.error(`Failed to delete file: ${document.filePath}`, error);
    }

    // Delete document record
    await this.prisma.vehicleDocument.delete({
      where: { id: documentId },
    });

    return { message: 'Document deleted successfully' };
  }

  async checkAvailability(organizationId: string, vehicleId: string, startDate: Date, endDate: Date) {
    await this.findOne(organizationId, vehicleId);

    // Check if vehicle has any quotes or deliveries in the given date range
    const conflicts = await this.prisma.quote.findMany({
      where: {
        vehicleId,
        organizationId,
        status: { in: ['SENT', 'ACCEPTED'] },
        OR: [
          {
            AND: [
              { rentalStartDate: { lte: endDate } },
              { rentalEndDate: { gte: startDate } },
            ],
          },
        ],
      },
    });

    const isAvailable = conflicts.length === 0;

    return {
      available: isAvailable,
      conflicts: conflicts.map(conflict => ({
        quoteId: conflict.id,
        quoteNumber: conflict.number,
        startDate: conflict.rentalStartDate,
        endDate: conflict.rentalEndDate,
      })),
    };
  }
}
