import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

export interface QuoteExportData {
  quotes: Array<{
    number: string;
    date: string;
    validUntil?: string;
    type: string;
    status: string;
    customerName: string;
    customerVat?: string;
    subtotal: number;
    taxAmount: number;
    total: number;
    lineCount: number;
  }>;
}

@Injectable()
export class ExportService {
  /**
   * Generate CSV export for quotes list
   */
  generateQuotesCsv(data: QuoteExportData): string {
    const headers = [
      'Numéro',
      'Date',
      'Valable jusqu\'au',
      'Type',
      'Statut',
      'Client',
      'N° TVA Client',
      'Sous-total HT',
      'TVA',
      'Total TTC',
      'Nb. Lignes',
    ];

    const rows = data.quotes.map(quote => [
      quote.number,
      quote.date,
      quote.validUntil || '',
      quote.type === 'SALE' ? 'Vente' : 'Location',
      this.translateStatus(quote.status),
      quote.customerName,
      quote.customerVat || '',
      Number(quote.subtotal).toFixed(2),
      Number(quote.taxAmount).toFixed(2),
      Number(quote.total).toFixed(2),
      quote.lineCount.toString(),
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';')),
    ].join('\n');

    // Add BOM for Excel UTF-8 compatibility
    return '\uFEFF' + csvContent;
  }

  /**
   * Generate XLSX export for quotes list
   */
  async generateQuotesXlsx(data: QuoteExportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Devis', {
      properties: { tabColor: { argb: '2563eb' } },
    });

    // Define columns
    worksheet.columns = [
      { header: 'Numéro', key: 'number', width: 15 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Valable jusqu\'au', key: 'validUntil', width: 15 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Statut', key: 'status', width: 12 },
      { header: 'Client', key: 'customerName', width: 30 },
      { header: 'N° TVA Client', key: 'customerVat', width: 18 },
      { header: 'Sous-total HT', key: 'subtotal', width: 15 },
      { header: 'TVA', key: 'taxAmount', width: 12 },
      { header: 'Total TTC', key: 'total', width: 15 },
      { header: 'Nb. Lignes', key: 'lineCount', width: 12 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2563eb' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Add data rows
    data.quotes.forEach((quote, index) => {
      const row = worksheet.addRow({
        number: quote.number,
        date: quote.date,
        validUntil: quote.validUntil || '',
        type: quote.type === 'SALE' ? 'Vente' : 'Location',
        status: this.translateStatus(quote.status),
        customerName: quote.customerName,
        customerVat: quote.customerVat || '',
        subtotal: Number(quote.subtotal),
        taxAmount: Number(quote.taxAmount),
        total: Number(quote.total),
        lineCount: quote.lineCount,
      });

      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8FAFC' },
        };
      }

      // Format currency columns
      row.getCell('subtotal').numFmt = '#,##0.00 €';
      row.getCell('taxAmount').numFmt = '#,##0.00 €';
      row.getCell('total').numFmt = '#,##0.00 €';

      // Center align numeric columns
      row.getCell('lineCount').alignment = { horizontal: 'center' };
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } },
        };
      });
    });

    // Add totals row
    if (data.quotes.length > 0) {
      const totalRow = worksheet.addRow({
        number: '',
        date: '',
        validUntil: '',
        type: '',
        status: '',
        customerName: '',
        customerVat: 'TOTAUX:',
        subtotal: data.quotes.reduce((sum, q) => sum + Number(q.subtotal), 0),
        taxAmount: data.quotes.reduce((sum, q) => sum + Number(q.taxAmount), 0),
        total: data.quotes.reduce((sum, q) => sum + Number(q.total), 0),
        lineCount: data.quotes.length,
      });

      totalRow.font = { bold: true };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DBEAFE' },
      };

      totalRow.getCell('subtotal').numFmt = '#,##0.00 €';
      totalRow.getCell('taxAmount').numFmt = '#,##0.00 €';
      totalRow.getCell('total').numFmt = '#,##0.00 €';
    }

    // Freeze header row
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 1 },
    ];

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Translate quote status to French
   */
  private translateStatus(status: string): string {
    const translations = {
      DRAFT: 'Brouillon',
      SENT: 'Envoyé',
      ACCEPTED: 'Accepté',
      REJECTED: 'Refusé',
      EXPIRED: 'Expiré',
    };
    return translations[status] || status;
  }
}
