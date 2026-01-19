import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createDeliveryDto: CreateDeliveryDto) {
    const { quoteId, ...deliveryData } = createDeliveryDto;

    // Check if quote exists and belongs to organization
    const quote = await this.prisma.quote.findFirst({
      where: { id: quoteId, organizationId },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    // Check if delivery already exists for this quote
    const existingDelivery = await this.prisma.delivery.findUnique({
      where: { quoteId },
    });

    if (existingDelivery) {
      throw new ConflictException('Delivery already exists for this quote');
    }

    const delivery = await this.prisma.delivery.create({
      data: {
        quoteId,
        ...deliveryData,
        deliveryDate: deliveryData.deliveryDate ? new Date(deliveryData.deliveryDate) : undefined,
      },
      include: {
        quote: true,
        vehicle: true,
      },
    });

    return delivery;
  }

  async findByQuote(organizationId: string, quoteId: string) {
    // Verify quote belongs to organization
    const quote = await this.prisma.quote.findFirst({
      where: { id: quoteId, organizationId },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    const delivery = await this.prisma.delivery.findUnique({
      where: { quoteId },
      include: {
        quote: true,
        vehicle: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found for this quote');
    }

    return delivery;
  }

  async update(organizationId: string, quoteId: string, updateDeliveryDto: UpdateDeliveryDto) {
    // Verify delivery exists
    await this.findByQuote(organizationId, quoteId);

    const delivery = await this.prisma.delivery.update({
      where: { quoteId },
      data: {
        ...updateDeliveryDto,
        deliveryDate: updateDeliveryDto.deliveryDate ? new Date(updateDeliveryDto.deliveryDate) : undefined,
      },
      include: {
        quote: true,
        vehicle: true,
      },
    });

    return delivery;
  }

  async remove(organizationId: string, quoteId: string) {
    // Verify delivery exists
    await this.findByQuote(organizationId, quoteId);

    await this.prisma.delivery.delete({
      where: { quoteId },
    });

    return { message: 'Delivery removed successfully' };
  }

  calculateDeliveryCost(distance: number, pricePerKm: number, fixedPrice: number, hasReturn: boolean): number {
    const effectiveDistance = hasReturn ? distance * 2 : distance;
    const distanceCost = effectiveDistance * pricePerKm;
    const total = fixedPrice + distanceCost;

    return Math.round(total * 100) / 100;
  }
}
