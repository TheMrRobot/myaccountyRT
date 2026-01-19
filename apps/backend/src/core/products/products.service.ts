import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        organizationId,
        name: createProductDto.name,
        description: createProductDto.description,
        sku: createProductDto.sku,
        price: createProductDto.price,
        taxId: createProductDto.taxId,
        unit: createProductDto.unit || 'unit',
        isService: createProductDto.isService || false,
        isActive: createProductDto.isActive ?? true,
      },
      include: {
        tax: true,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.product.findMany({
      where: { organizationId },
      include: {
        tax: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, organizationId },
      include: {
        tax: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(organizationId: string, id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(organizationId, id);

    return this.prisma.product.update({
      where: { id },
      data: {
        name: updateProductDto.name,
        description: updateProductDto.description,
        sku: updateProductDto.sku,
        price: updateProductDto.price,
        taxId: updateProductDto.taxId,
        unit: updateProductDto.unit,
        isService: updateProductDto.isService,
        isActive: updateProductDto.isActive,
      },
      include: {
        tax: true,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
