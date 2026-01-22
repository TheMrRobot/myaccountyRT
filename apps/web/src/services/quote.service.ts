import api from '@/lib/axios';
import { Quote, QuoteLine } from '@/types';

export interface CreateQuoteDto {
  type: 'SALE' | 'RENTAL';
  customerId: string;
  vehicleId?: string;
  validUntil?: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  includedKm?: number;
  extraKmRate?: number;
  customerNotes?: string;
  internalNotes?: string;
  terms?: string;
}

export interface UpdateQuoteDto extends Partial<CreateQuoteDto> {}

export interface CreateQuoteLineDto {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxId?: string;
  isSection?: boolean;
  productId?: string;
  order?: number;
}

export const quoteService = {
  getAll: async (): Promise<Quote[]> => {
    const response = await api.get<Quote[]>('/quotes');
    return response.data;
  },

  getOne: async (id: string): Promise<Quote> => {
    const response = await api.get<Quote>(`/quotes/${id}`);
    return response.data;
  },

  create: async (data: CreateQuoteDto): Promise<Quote> => {
    const response = await api.post<Quote>('/quotes', data);
    return response.data;
  },

  update: async (id: string, data: UpdateQuoteDto): Promise<Quote> => {
    const response = await api.patch<Quote>(`/quotes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/quotes/${id}`);
  },

  duplicate: async (id: string): Promise<Quote> => {
    const response = await api.post<Quote>(`/quotes/${id}/duplicate`);
    return response.data;
  },

  changeStatus: async (id: string, status: string): Promise<Quote> => {
    const response = await api.post<Quote>(`/quotes/${id}/status`, { status });
    return response.data;
  },

  // Lines
  addLine: async (quoteId: string, data: CreateQuoteLineDto): Promise<QuoteLine> => {
    const response = await api.post<QuoteLine>(`/quotes/${quoteId}/lines`, data);
    return response.data;
  },

  updateLine: async (quoteId: string, lineId: string, data: Partial<CreateQuoteLineDto>): Promise<QuoteLine> => {
    const response = await api.patch<QuoteLine>(`/quotes/${quoteId}/lines/${lineId}`, data);
    return response.data;
  },

  deleteLine: async (quoteId: string, lineId: string): Promise<void> => {
    await api.delete(`/quotes/${quoteId}/lines/${lineId}`);
  },

  // PDF & Exports
  downloadPdf: async (id: string): Promise<Blob> => {
    const response = await api.get(`/quotes/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportCsv: async (): Promise<Blob> => {
    const response = await api.get('/quotes/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  },

  exportXlsx: async (): Promise<Blob> => {
    const response = await api.get('/quotes/export/xlsx', {
      responseType: 'blob',
    });
    return response.data;
  },
};
