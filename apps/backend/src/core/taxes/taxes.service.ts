import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Injectable()
export class TaxesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createTaxDto: CreateTaxDto) {
    // If this tax is set as default, unset other defaults
    if (createTaxDto.isDefault) {
      await this.prisma.tax.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.tax.create({
      data: {
        organizationId,
        name: createTaxDto.name,
        rate: createTaxDto.rate,
        description: createTaxDto.description,
        isDefault: createTaxDto.isDefault || false,
        isActive: createTaxDto.isActive ?? true,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.tax.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const tax = await this.prisma.tax.findFirst({
      where: { id, organizationId },
    });

    if (!tax) {
      throw new NotFoundException('Tax not found');
    }

    return tax;
  }

  async update(organizationId: string, id: string, updateTaxDto: UpdateTaxDto) {
    await this.findOne(organizationId, id);

    // If this tax is set as default, unset other defaults
    if (updateTaxDto.isDefault) {
      await this.prisma.tax.updateMany({
        where: { organizationId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.tax.update({
      where: { id },
      data: {
        name: updateTaxDto.name,
        rate: updateTaxDto.rate,
        description: updateTaxDto.description,
        isDefault: updateTaxDto.isDefault,
        isActive: updateTaxDto.isActive,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    const tax = await this.findOne(organizationId, id);

    // Check if tax is in use
    const productsUsingTax = await this.prisma.product.count({
      where: { taxId: id },
    });

    if (productsUsingTax > 0) {
      throw new ConflictException('Tax is in use by products and cannot be deleted');
    }

    return this.prisma.tax.delete({
      where: { id },
    });
  }
}
