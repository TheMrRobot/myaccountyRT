import api from '@/lib/axios';
import { Customer } from '@/types';

export interface CreateCustomerDto {
  type: 'B2B' | 'B2C';
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  vatNumber?: string;
  notes?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get<Customer[]>('/customers');
    return response.data;
  },

  getOne: async (id: string): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CreateCustomerDto): Promise<Customer> => {
    const response = await api.post<Customer>('/customers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
    const response = await api.patch<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
