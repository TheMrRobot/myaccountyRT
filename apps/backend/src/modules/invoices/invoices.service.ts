import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createInvoiceDto: CreateInvoiceDto) {
    // Generate invoice number
    const number = await this.generateInvoiceNumber(organizationId);

    const invoice = await this.prisma.invoice.create({
      data: {
        organizationId,
        number,
        ...createInvoiceDto,
        dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : undefined,
      },
      include: {
        customer: true,
        quote: true,
        lines: {
          include: {
            product: true,
            tax: true,
          },
          orderBy: { order: 'asc' },
        },
        payments: true,
      },
    });

    return invoice;
  }

  async findAll(organizationId: string) {
    return this.prisma.invoice.findMany({
      where: { organizationId },
      include: {
        customer: true,
        quote: true,
        lines: {
          include: {
            product: true,
            tax: true,
          },
          orderBy: { order: 'asc' },
        },
        payments: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, organizationId },
      include: {
        customer: {
          include: {
            addresses: true,
            contacts: true,
          },
        },
        quote: true,
        lines: {
          include: {
            product: true,
            tax: true,
          },
          orderBy: { order: 'asc' },
        },
        payments: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async update(organizationId: string, id: string, updateInvoiceDto: UpdateInvoiceDto) {
    await this.findOne(organizationId, id);

    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...updateInvoiceDto,
        dueDate: updateInvoiceDto.dueDate ? new Date(updateInvoiceDto.dueDate) : undefined,
      },
      include: {
        customer: true,
        quote: true,
        lines: {
          include: {
            product: true,
            tax: true,
          },
          orderBy: { order: 'asc' },
        },
        payments: true,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    return this.prisma.invoice.delete({
      where: { id },
    });
  }

  async createFromQuote(organizationId: string, quoteId: string) {
    // Get the quote
    const quote = await this.prisma.quote.findFirst({
      where: { id: quoteId, organizationId },
      include: {
        lines: {
          include: {
            product: true,
            tax: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    // Check if quote is accepted
    if (quote.status !== 'ACCEPTED') {
      throw new BadRequestException('Only accepted quotes can be converted to invoices');
    }

    // Generate invoice number
    const number = await this.generateInvoiceNumber(organizationId);

    // Create invoice from quote
    const invoice = await this.prisma.invoice.create({
      data: {
        organizationId,
        customerId: quote.customerId,
        quoteId: quote.id,
        number,
        subtotal: quote.subtotal,
        discountAmount: quote.discountAmount,
        taxAmount: quote.taxAmount,
        total: quote.total,
        lines: {
          create: quote.lines.map(line => ({
            productId: line.productId,
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
        quote: true,
        lines: {
          include: {
            product: true,
            tax: true,
          },
          orderBy: { order: 'asc' },
        },
        payments: true,
      },
    });

    return invoice;
  }

  async addPayment(organizationId: string, invoiceId: string, createPaymentDto: CreatePaymentDto) {
    const invoice = await this.findOne(organizationId, invoiceId);

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        ...createPaymentDto,
        date: createPaymentDto.date ? new Date(createPaymentDto.date) : new Date(),
      },
    });

    // Update invoice paid amount and status
    await this.calculateTotals(invoiceId);

    return payment;
  }

  async removePayment(organizationId: string, invoiceId: string, paymentId: string) {
    const invoice = await this.findOne(organizationId, invoiceId);

    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, invoiceId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    await this.prisma.payment.delete({
      where: { id: paymentId },
    });

    // Update invoice paid amount and status
    await this.calculateTotals(invoiceId);

    return { message: 'Payment removed successfully' };
  }

  async updateStatus(organizationId: string, id: string, status: InvoiceStatus) {
    await this.findOne(organizationId, id);

    return this.prisma.invoice.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        quote: true,
        lines: {
          include: {
            product: true,
            tax: true,
          },
          orderBy: { order: 'asc' },
        },
        payments: true,
      },
    });
  }

  // Helper methods

  async calculateTotals(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Calculate total paid amount
    const paidAmount = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    // Determine status based on paid amount
    let status = invoice.status;
    const total = Number(invoice.total);

    if (paidAmount >= total && status !== InvoiceStatus.CANCELLED) {
      status = InvoiceStatus.PAID;
    } else if (paidAmount > 0 && paidAmount < total && status !== InvoiceStatus.CANCELLED) {
      status = InvoiceStatus.PARTIAL;
    }

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount,
        status,
      },
    });

    return { paidAmount, status };
  }

  private async generateInvoiceNumber(organizationId: string): Promise<string> {
    const numbering = await this.prisma.documentNumbering.findUnique({
      where: {
        organizationId_type: {
          organizationId,
          type: 'invoice',
        },
      },
    });

    if (!numbering) {
      throw new NotFoundException('Numbering configuration not found for invoices');
    }

    const number = `${numbering.prefix}${String(numbering.next).padStart(numbering.length, '0')}`;

    // Increment the next number
    await this.prisma.documentNumbering.update({
      where: {
        organizationId_type: {
          organizationId,
          type: 'invoice',
        },
      },
      data: {
        next: numbering.next + 1,
      },
    });

    return number;
  }
}
