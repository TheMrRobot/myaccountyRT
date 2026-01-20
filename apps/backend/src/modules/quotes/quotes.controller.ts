import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { CreateQuoteLineDto } from './dto/create-quote-line.dto';
import { UpdateQuoteLineDto } from './dto/update-quote-line.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('quotes')
@ApiBearerAuth()
@Controller('quotes')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COMMERCIAL)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create quote' })
  @ApiResponse({ status: 201, description: 'Quote created' })
  create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() createQuoteDto: CreateQuoteDto,
  ) {
    return this.quotesService.create(organizationId, createQuoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotes' })
  @ApiResponse({ status: 200, description: 'Quotes retrieved' })
  findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.quotesService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote by ID' })
  @ApiResponse({ status: 200, description: 'Quote retrieved' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  findOne(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.quotesService.findOne(organizationId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quote' })
  @ApiResponse({ status: 200, description: 'Quote updated' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quotesService.update(organizationId, id, updateQuoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quote' })
  @ApiResponse({ status: 200, description: 'Quote deleted' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  remove(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.quotesService.remove(organizationId, id);
  }

  // Line management endpoints
  @Post(':id/lines')
  @ApiOperation({ summary: 'Add line to quote' })
  @ApiResponse({ status: 201, description: 'Line added' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  addLine(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') quoteId: string,
    @Body() createQuoteLineDto: CreateQuoteLineDto,
  ) {
    return this.quotesService.addLine(organizationId, quoteId, createQuoteLineDto);
  }

  @Patch(':id/lines/:lineId')
  @ApiOperation({ summary: 'Update quote line' })
  @ApiResponse({ status: 200, description: 'Line updated' })
  @ApiResponse({ status: 404, description: 'Line not found' })
  updateLine(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') quoteId: string,
    @Param('lineId') lineId: string,
    @Body() updateQuoteLineDto: UpdateQuoteLineDto,
  ) {
    return this.quotesService.updateLine(organizationId, quoteId, lineId, updateQuoteLineDto);
  }

  @Delete(':id/lines/:lineId')
  @ApiOperation({ summary: 'Remove line from quote' })
  @ApiResponse({ status: 200, description: 'Line removed' })
  @ApiResponse({ status: 404, description: 'Line not found' })
  removeLine(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') quoteId: string,
    @Param('lineId') lineId: string,
  ) {
    return this.quotesService.removeLine(organizationId, quoteId, lineId);
  }

  // Status and duplication endpoints
  @Patch(':id/status')
  @ApiOperation({ summary: 'Change quote status' })
  @ApiResponse({ status: 200, description: 'Status changed' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  changeStatus(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeStatusDto,
  ) {
    return this.quotesService.changeStatus(organizationId, id, changeStatusDto);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate quote' })
  @ApiResponse({ status: 201, description: 'Quote duplicated' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  duplicate(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.quotesService.duplicate(organizationId, id);
  }

  // PDF and Export endpoints
  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate PDF for quote' })
  @ApiResponse({ status: 200, description: 'PDF generated', type: 'application/pdf' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @Header('Content-Type', 'application/pdf')
  async generatePdf(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdf = await this.quotesService.generatePdf(organizationId, id);
    const quote = await this.quotesService.findOne(organizationId, id);

    res.setHeader('Content-Disposition', `attachment; filename="quote-${quote.number}.pdf"`);
    res.send(pdf);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export all quotes to CSV' })
  @ApiResponse({ status: 200, description: 'CSV exported', type: 'text/csv' })
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(
    @CurrentUser('organizationId') organizationId: string,
    @Res() res: Response,
  ) {
    const csv = await this.quotesService.exportCsv(organizationId);
    const timestamp = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Disposition', `attachment; filename="quotes-${timestamp}.csv"`);
    res.send(csv);
  }

  @Get('export/xlsx')
  @ApiOperation({ summary: 'Export all quotes to XLSX' })
  @ApiResponse({ status: 200, description: 'XLSX exported', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportXlsx(
    @CurrentUser('organizationId') organizationId: string,
    @Res() res: Response,
  ) {
    const xlsx = await this.quotesService.exportXlsx(organizationId);
    const timestamp = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Disposition', `attachment; filename="quotes-${timestamp}.xlsx"`);
    res.send(xlsx);
  }
}
