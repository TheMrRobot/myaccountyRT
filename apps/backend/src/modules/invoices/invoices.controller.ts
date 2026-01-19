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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ACCOUNTING)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created' })
  create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() createInvoiceDto: CreateInvoiceDto,
  ) {
    return this.invoicesService.create(organizationId, createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved' })
  findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.invoicesService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.invoicesService.findOne(organizationId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(organizationId, id, updateInvoiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  remove(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.invoicesService.remove(organizationId, id);
  }

  // Create invoice from quote
  @Post('from-quote/:quoteId')
  @ApiOperation({ summary: 'Create invoice from quote' })
  @ApiResponse({ status: 201, description: 'Invoice created from quote' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 400, description: 'Quote must be accepted' })
  createFromQuote(
    @CurrentUser('organizationId') organizationId: string,
    @Param('quoteId') quoteId: string,
  ) {
    return this.invoicesService.createFromQuote(organizationId, quoteId);
  }

  // Payment management endpoints
  @Post(':id/payments')
  @ApiOperation({ summary: 'Add payment to invoice' })
  @ApiResponse({ status: 201, description: 'Payment added' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  addPayment(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') invoiceId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.invoicesService.addPayment(organizationId, invoiceId, createPaymentDto);
  }

  @Delete(':id/payments/:paymentId')
  @ApiOperation({ summary: 'Remove payment from invoice' })
  @ApiResponse({ status: 200, description: 'Payment removed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  removePayment(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') invoiceId: string,
    @Param('paymentId') paymentId: string,
  ) {
    return this.invoicesService.removePayment(organizationId, invoiceId, paymentId);
  }
}
