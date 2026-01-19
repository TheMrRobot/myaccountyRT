import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { CreateQuoteLineDto } from './dto/create-quote-line.dto';
import { UpdateQuoteLineDto } from './dto/update-quote-line.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { QuoteStatus, Prisma } from '@prisma/client';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createQuoteDto: CreateQuoteDto) {
    // Generate quote number
    const number = await this.generateQuoteNumber(organizationId, createQuoteDto.type);

    const quote = await this.prisma.quote.create({
      data: {
        organizationId,
        number,
        ...createQuoteDto,
        validUntil: createQuoteDto.validUntil ? new Date(createQuoteDto.validUntil) : undefined,
        rentalStartDate: createQuoteDto.rentalStartDate ? new Date(createQuoteDto.rentalStartDate) : undefined,
        rentalEndDate: createQuoteDto.rentalEndDate ? new Date(createQuoteDto.rentalEndDate) : undefined,
      },
      include: {
        customer: true,
        vehicle: true,
        lines: {
          include: {
            product: true,
            tax: true,
          },
          orderBy: { order: 'asc' },
        },
        delivery: true,
      },
    });

    return quote;
  }

  async findAll(organizationId: string) {
    return this.prisma.quote.findMany({
      where: { organizationId },
      include: {
        customer: true,
        vehicle: true,
        lines: {
          include: {
            product: true,
            tax: true,
          },
          orderBy: { order: 'asc' },
        },
        delivery: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, organizationId },
      include: {
        customer: {
          include: {
            addresses: true,
            contacts: true,
          },
        },
        vehicle: true,
        lines: {
          include: {
            product: true,
            tax: true,
          },
          orderBy: { order: 'asc' },
        },
        delivery: true,
        attachments: true,
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    return quote;
  }

  async update(organizationId: string, id: string, updateQuoteDto: UpdateQuoteDto) {
    const quote = await this.findOne(organizationId, id);

    // Check if quote can be edited
    if (quote.status === QuoteStatus.ACCEPTED) {
      throw new BadRequestException('Cannot edit an accepted quote');
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        ...updateQuoteDto,
        validUntil: updateQuoteDto.validUntil ? new Date(updateQuoteDto.validUntil) : undefined,
        rentalStartDate: updateQuoteDto.rentalStartDate ? new Date(updateQuoteDto.rentalStartDate) : undefined,
        rentalEndDate: updateQuoteDto.rentalEndDate ? new Date(updateQuoteDto.rentalEndDate) : undefined,
      },
      include: {
        customer: true,
        vehicle: true,
        lines: {
          include: {
            product: true,
            tax: true,
          },
          orderBy: { order: 'asc' },
        },
        delivery: true,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    return this.prisma.quote.delete({
      where: { id },
    });
  }

  async addLine(organizationId: string, quoteId: string, createQuoteLineDto: CreateQuoteLineDto) {
    const quote = await this.findOne(organizationId, quoteId);

    // Check if quote can be edited
    if (quote.status === QuoteStatus.ACCEPTED) {
      throw new BadRequestException('Cannot edit an accepted quote');
    }

    // Calculate line totals
    const { subtotal, taxAmount, total } = this.calculateLineTotals(
      createQuoteLineDto.quantity,
      createQuoteLineDto.unitPrice,
      createQuoteLineDto.discount || 0,
      createQuoteLineDto.taxId ? await this.getTaxRate(createQuoteLineDto.taxId) : 0,
    );

    const line = await this.prisma.quoteLine.create({
      data: {
        quoteId,
        ...createQuoteLineDto,
        subtotal,
        taxAmount,
        total,
      },
      include: {
        product: true,
        tax: true,
      },
    });

    // Recalculate quote totals
    await this.calculateTotals(quoteId);

    return line;
  }

  async updateLine(organizationId: string, quoteId: string, lineId: string, updateQuoteLineDto: UpdateQuoteLineDto) {
    const quote = await this.findOne(organizationId, quoteId);

    // Check if quote can be edited
    if (quote.status === QuoteStatus.ACCEPTED) {
      throw new BadRequestException('Cannot edit an accepted quote');
    }

    // Check if line exists
    const existingLine = await this.prisma.quoteLine.findFirst({
      where: { id: lineId, quoteId },
    });

    if (!existingLine) {
      throw new NotFoundException('Quote line not found');
    }

    // Get current line data for calculation
    const lineData = {
      quantity: updateQuoteLineDto.quantity ?? existingLine.quantity,
      unitPrice: updateQuoteLineDto.unitPrice ?? existingLine.unitPrice,
      discount: updateQuoteLineDto.discount ?? existingLine.discount,
      taxId: updateQuoteLineDto.taxId ?? existingLine.taxId,
    };

    // Calculate line totals
    const { subtotal, taxAmount, total } = this.calculateLineTotals(
      Number(lineData.quantity),
      Number(lineData.unitPrice),
      Number(lineData.discount),
      lineData.taxId ? await this.getTaxRate(lineData.taxId) : 0,
    );

    const line = await this.prisma.quoteLine.update({
      where: { id: lineId },
      data: {
        ...updateQuoteLineDto,
        subtotal,
        taxAmount,
        total,
      },
      include: {
        product: true,
        tax: true,
      },
    });

    // Recalculate quote totals
    await this.calculateTotals(quoteId);

    return line;
  }

  async removeLine(organizationId: string, quoteId: string, lineId: string) {
    const quote = await this.findOne(organizationId, quoteId);

    // Check if quote can be edited
    if (quote.status === QuoteStatus.ACCEPTED) {
      throw new BadRequestException('Cannot edit an accepted quote');
    }

    // Check if line exists
    const existingLine = await this.prisma.quoteLine.findFirst({
      where: { id: lineId, quoteId },
    });

    if (!existingLine) {
      throw new NotFoundException('Quote line not found');
    }

    await this.prisma.quoteLine.delete({
      where: { id: lineId },
    });

    // Recalculate quote totals
    await this.calculateTotals(quoteId);

    return { message: 'Line removed successfully' };
  }

  async changeStatus(organizationId: string, id: string, changeStatusDto: ChangeStatusDto) {
    const quote = await this.findOne(organizationId, id);

    // Validation: cannot edit accepted quotes
    if (quote.status === QuoteStatus.ACCEPTED && changeStatusDto.status !== QuoteStatus.ACCEPTED) {
      throw new BadRequestException('Cannot change status of an accepted quote');
    }

    return this.prisma.quote.update({
      where: { id },
      data: { status: changeStatusDto.status },
      include: {
        customer: true,
        vehicle: true,
        lines: {
          include: {
            product: true,
            tax: true,
          },
          orderBy: { order: 'asc' },
        },
        delivery: true,
      },
    });
  }

  async duplicate(organizationId: string, id: string) {
    const quote = await this.findOne(organizationId, id);

    // Generate new quote number
    const number = await this.generateQuoteNumber(organizationId, quote.type);

    // Create duplicate quote
    const duplicateQuote = await this.prisma.quote.create({
      data: {
        organizationId,
        customerId: quote.customerId,
        vehicleId: quote.vehicleId,
        number,
        type: quote.type,
        status: QuoteStatus.DRAFT,
        validUntil: quote.validUntil,
        rentalStartDate: quote.rentalStartDate,
        rentalEndDate: quote.rentalEndDate,
        includedKm: quote.includedKm,
        extraKmRate: quote.extraKmRate,
        subtotal: quote.subtotal,
        discountAmount: quote.discountAmount,
        taxAmount: quote.taxAmount,
        total: quote.total,
        internalNotes: quote.internalNotes,
        customerNotes: quote.customerNotes,
        terms: quote.terms,
        lines: {
          create: quote.lines.map(line => ({
            productId: line.productId,
            isSection: line.isSection,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discount: line.discount,
            taxId: line.taxId,
            subtotal: line.subtotal,
            taxAmount: line.taxAmount,
            total: line.total,
            order: line.order,
          })),
        },
      },
      include: {
        customer: true,
        vehicle: true,
        lines: {
          include: {
            product: true,
            tax: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return duplicateQuote;
  }

  // Helper methods

  async calculateTotals(quoteId: string) {
    const lines = await this.prisma.quoteLine.findMany({
      where: { quoteId, isSection: false },
    });

    const subtotal = lines.reduce((sum, line) => sum + Number(line.subtotal), 0);
    const taxAmount = lines.reduce((sum, line) => sum + Number(line.taxAmount), 0);
    const total = lines.reduce((sum, line) => sum + Number(line.total), 0);

    await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        subtotal,
        taxAmount,
        total,
      },
    });

    return { subtotal, taxAmount, total };
  }

  private calculateLineTotals(quantity: number, unitPrice: number, discount: number, taxRate: number) {
    const subtotal = quantity * unitPrice * (1 - discount / 100);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  private async getTaxRate(taxId: string): Promise<number> {
    const tax = await this.prisma.tax.findUnique({
      where: { id: taxId },
    });

    return tax ? Number(tax.rate) : 0;
  }

  private async generateQuoteNumber(organizationId: string, type: string): Promise<string> {
    const docType = type === 'SALE' ? 'quote_sale' : 'quote_rental';

    const numbering = await this.prisma.documentNumbering.findUnique({
      where: {
        organizationId_type: {
          organizationId,
          type: docType,
        },
      },
    });

    if (!numbering) {
      throw new NotFoundException(`Numbering configuration not found for ${docType}`);
    }

    const number = `${numbering.prefix}${String(numbering.next).padStart(numbering.length, '0')}`;

    // Increment the next number
    await this.prisma.documentNumbering.update({
      where: {
        organizationId_type: {
          organizationId,
          type: docType,
        },
      },
      data: {
        next: numbering.next + 1,
      },
    });

    return number;
  }
}
