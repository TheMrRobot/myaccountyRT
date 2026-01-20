import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

export interface QuotePdfData {
  organization: {
    name: string;
    vatNumber: string;
    address: string;
    email: string;
    phone: string;
    website?: string;
    logo?: string;
  };
  customer: {
    name: string;
    vatNumber?: string;
    address: string;
    email?: string;
    phone?: string;
  };
  quote: {
    number: string;
    date: string;
    validUntil?: string;
    type: string;
    status: string;
    rentalStartDate?: string;
    rentalEndDate?: string;
    includedKm?: number;
    extraKmRate?: number;
  };
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    subtotal: number;
    taxAmount: number;
    total: number;
    isSection: boolean;
  }>;
  delivery?: {
    type: string;
    address?: string;
    deliveryDate?: string;
    distance?: number;
    fixedPrice?: number;
    pricePerKm?: number;
    hasReturn: boolean;
  };
  totals: {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
  };
  notes?: {
    customer?: string;
    terms?: string;
  };
}

@Injectable()
export class PdfService {
  async generateQuotePdf(data: QuotePdfData): Promise<Buffer> {
    const html = this.generateQuoteHtml(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: true,
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private generateQuoteHtml(data: QuotePdfData): string {
    const quoteTypeLabel = data.quote.type === 'SALE' ? 'Devis de Vente' : 'Devis de Location';
    const statusLabels = {
      DRAFT: 'Brouillon',
      SENT: 'Envoyé',
      ACCEPTED: 'Accepté',
      REJECTED: 'Refusé',
      EXPIRED: 'Expiré',
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
    }

    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }

    .company-info {
      flex: 1;
    }

    .company-name {
      font-size: 20pt;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }

    .company-details {
      font-size: 9pt;
      color: #666;
      line-height: 1.6;
    }

    .quote-info {
      text-align: right;
      flex: 1;
    }

    .quote-title {
      font-size: 24pt;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
    }

    .quote-meta {
      font-size: 10pt;
      color: #666;
    }

    .quote-meta .label {
      font-weight: bold;
      color: #333;
    }

    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      gap: 20px;
    }

    .party {
      flex: 1;
      background: #f8fafc;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .party-title {
      font-size: 11pt;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 8px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e2e8f0;
    }

    .party-details {
      font-size: 9pt;
      color: #475569;
      line-height: 1.6;
    }

    .rental-info {
      background: #fef3c7;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
      border-left: 4px solid #f59e0b;
    }

    .rental-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 8px;
    }

    .rental-details {
      font-size: 10pt;
      color: #78350f;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    th {
      background: #1e40af;
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-weight: bold;
      font-size: 9pt;
      text-transform: uppercase;
    }

    th.right, td.right {
      text-align: right;
    }

    td {
      padding: 10px 8px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 10pt;
    }

    tr:hover td {
      background: #f8fafc;
    }

    .section-row td {
      background: #f1f5f9;
      font-weight: bold;
      color: #1e40af;
      border-top: 2px solid #cbd5e1;
      border-bottom: 2px solid #cbd5e1;
    }

    .totals {
      margin-top: 20px;
      margin-left: auto;
      width: 350px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 15px;
      font-size: 10pt;
    }

    .total-row.subtotal {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .total-row.tax {
      background: #f1f5f9;
    }

    .total-row.grand-total {
      background: #1e40af;
      color: white;
      font-size: 14pt;
      font-weight: bold;
      margin-top: 5px;
    }

    .total-label {
      font-weight: 600;
    }

    .total-value {
      font-weight: bold;
    }

    .notes {
      margin-top: 30px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 6px;
      border-left: 4px solid #2563eb;
    }

    .notes-title {
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 8px;
    }

    .notes-content {
      font-size: 9pt;
      color: #475569;
      white-space: pre-wrap;
      line-height: 1.6;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 9pt;
      color: #94a3b8;
    }

    .delivery-info {
      background: #dbeafe;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
      border-left: 4px solid #2563eb;
    }

    .delivery-title {
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <div class="company-name">${data.organization.name}</div>
      <div class="company-details">
        ${data.organization.address}<br>
        TVA: ${data.organization.vatNumber}<br>
        ${data.organization.email} | ${data.organization.phone}
        ${data.organization.website ? `<br>${data.organization.website}` : ''}
      </div>
    </div>
    <div class="quote-info">
      <div class="quote-title">${quoteTypeLabel}</div>
      <div class="quote-meta">
        <div><span class="label">N°:</span> ${data.quote.number}</div>
        <div><span class="label">Date:</span> ${data.quote.date}</div>
        ${data.quote.validUntil ? `<div><span class="label">Valable jusqu'au:</span> ${data.quote.validUntil}</div>` : ''}
        <div><span class="label">Statut:</span> ${statusLabels[data.quote.status] || data.quote.status}</div>
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-title">Client</div>
      <div class="party-details">
        <strong>${data.customer.name}</strong><br>
        ${data.customer.vatNumber ? `TVA: ${data.customer.vatNumber}<br>` : ''}
        ${data.customer.address}<br>
        ${data.customer.email ? `${data.customer.email}<br>` : ''}
        ${data.customer.phone ? `${data.customer.phone}` : ''}
      </div>
    </div>
  </div>

  ${data.quote.type === 'RENTAL' && data.quote.rentalStartDate ? `
  <div class="rental-info">
    <div class="rental-title">📅 Informations de Location</div>
    <div class="rental-details">
      <strong>Période:</strong> Du ${data.quote.rentalStartDate} au ${data.quote.rentalEndDate}<br>
      ${data.quote.includedKm ? `<strong>Kilométrage inclus:</strong> ${data.quote.includedKm} km<br>` : ''}
      ${data.quote.extraKmRate ? `<strong>Tarif km supplémentaire:</strong> ${Number(data.quote.extraKmRate).toFixed(2)} €/km` : ''}
    </div>
  </div>
  ` : ''}

  ${data.delivery && data.delivery.type !== 'WITHOUT_DELIVERY' ? `
  <div class="delivery-info">
    <div class="delivery-title">🚚 Informations de Livraison</div>
    <div class="rental-details">
      ${data.delivery.type === 'WITH_DELIVERY' ? `
        <strong>Adresse de livraison:</strong> ${data.delivery.address}<br>
        ${data.delivery.deliveryDate ? `<strong>Date de livraison:</strong> ${data.delivery.deliveryDate}<br>` : ''}
        ${data.delivery.distance ? `<strong>Distance:</strong> ${data.delivery.distance} km<br>` : ''}
        ${data.delivery.fixedPrice ? `<strong>Prix fixe:</strong> ${Number(data.delivery.fixedPrice).toFixed(2)} €<br>` : ''}
        ${data.delivery.pricePerKm ? `<strong>Prix au km:</strong> ${Number(data.delivery.pricePerKm).toFixed(2)} €/km<br>` : ''}
        ${data.delivery.hasReturn ? '<strong>Trajet retour inclus</strong>' : ''}
      ` : `<strong>Retrait client</strong>`}
    </div>
  </div>
  ` : ''}

  <table>
    <thead>
      <tr>
        <th style="width: 40%">Description</th>
        <th class="right" style="width: 10%">Qté</th>
        <th class="right" style="width: 12%">P.U. HT</th>
        <th class="right" style="width: 10%">Remise</th>
        <th class="right" style="width: 10%">TVA</th>
        <th class="right" style="width: 18%">Total HT</th>
      </tr>
    </thead>
    <tbody>
      ${data.lines.map(line => {
        if (line.isSection) {
          return `
          <tr class="section-row">
            <td colspan="6">${line.description}</td>
          </tr>`;
        }
        return `
        <tr>
          <td>${line.description}</td>
          <td class="right">${Number(line.quantity).toFixed(2)}</td>
          <td class="right">${Number(line.unitPrice).toFixed(2)} €</td>
          <td class="right">${line.discount > 0 ? `${Number(line.discount).toFixed(2)}%` : '-'}</td>
          <td class="right">${Number(line.taxRate).toFixed(0)}%</td>
          <td class="right">${Number(line.subtotal).toFixed(2)} €</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row subtotal">
      <span class="total-label">Sous-total HT</span>
      <span class="total-value">${Number(data.totals.subtotal).toFixed(2)} €</span>
    </div>
    ${data.totals.discountAmount > 0 ? `
    <div class="total-row subtotal">
      <span class="total-label">Remise globale</span>
      <span class="total-value">-${Number(data.totals.discountAmount).toFixed(2)} €</span>
    </div>
    ` : ''}
    <div class="total-row tax">
      <span class="total-label">TVA</span>
      <span class="total-value">${Number(data.totals.taxAmount).toFixed(2)} €</span>
    </div>
    <div class="total-row grand-total">
      <span class="total-label">TOTAL TTC</span>
      <span class="total-value">${Number(data.totals.total).toFixed(2)} €</span>
    </div>
  </div>

  ${data.notes?.customer ? `
  <div class="notes">
    <div class="notes-title">Notes pour le client</div>
    <div class="notes-content">${data.notes.customer}</div>
  </div>
  ` : ''}

  ${data.notes?.terms ? `
  <div class="notes">
    <div class="notes-title">Conditions générales</div>
    <div class="notes-content">${data.notes.terms}</div>
  </div>
  ` : ''}

  <div class="footer">
    Document généré le ${new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
  </div>
</body>
</html>
    `;
  }
}
