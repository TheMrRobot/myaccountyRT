import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNumberingDto } from './dto/update-numbering.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getDocumentNumberings(organizationId: string) {
    return this.prisma.documentNumbering.findMany({
      where: { organizationId },
      orderBy: { type: 'asc' },
    });
  }

  async getDocumentNumbering(organizationId: string, type: string) {
    const numbering = await this.prisma.documentNumbering.findUnique({
      where: {
        organizationId_type: {
          organizationId,
          type,
        },
      },
    });

    if (!numbering) {
      throw new NotFoundException(`Document numbering for type ${type} not found`);
    }

    return numbering;
  }

  async updateDocumentNumbering(
    organizationId: string,
    type: string,
    updateNumberingDto: UpdateNumberingDto,
  ) {
    // Check if exists
    const existing = await this.prisma.documentNumbering.findUnique({
      where: {
        organizationId_type: {
          organizationId,
          type,
        },
      },
    });

    if (!existing) {
      // Create if doesn't exist
      return this.prisma.documentNumbering.create({
        data: {
          organizationId,
          type,
          prefix: updateNumberingDto.prefix || '',
          next: updateNumberingDto.next || 1,
          length: updateNumberingDto.length || 6,
        },
      });
    }

    // Update if exists
    return this.prisma.documentNumbering.update({
      where: {
        organizationId_type: {
          organizationId,
          type,
        },
      },
      data: {
        prefix: updateNumberingDto.prefix,
        next: updateNumberingDto.next,
        length: updateNumberingDto.length,
      },
    });
  }

  async getNextNumber(organizationId: string, type: string): Promise<string> {
    const numbering = await this.prisma.documentNumbering.findUnique({
      where: {
        organizationId_type: {
          organizationId,
          type,
        },
      },
    });

    if (!numbering) {
      // Create default numbering if doesn't exist
      const newNumbering = await this.prisma.documentNumbering.create({
        data: {
          organizationId,
          type,
          prefix: this.getDefaultPrefix(type),
          next: 1,
          length: 6,
        },
      });

      const formattedNumber = String(newNumbering.next).padStart(newNumbering.length, '0');

      // Increment for next time
      await this.prisma.documentNumbering.update({
        where: { id: newNumbering.id },
        data: { next: { increment: 1 } },
      });

      return `${newNumbering.prefix}${formattedNumber}`;
    }

    const formattedNumber = String(numbering.next).padStart(numbering.length, '0');

    // Increment for next time
    await this.prisma.documentNumbering.update({
      where: { id: numbering.id },
      data: { next: { increment: 1 } },
    });

    return `${numbering.prefix}${formattedNumber}`;
  }

  private getDefaultPrefix(type: string): string {
    const prefixes: Record<string, string> = {
      quote_sale: 'QS-',
      quote_rental: 'QR-',
      invoice: 'INV-',
    };
    return prefixes[type] || 'DOC-';
  }
}
