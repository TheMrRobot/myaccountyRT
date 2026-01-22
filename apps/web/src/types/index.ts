// User & Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  COMMERCIAL = 'COMMERCIAL',
  ACCOUNTING = 'ACCOUNTING',
  READ_ONLY = 'READ_ONLY',
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Customer Types
export interface Customer {
  id: string;
  type: 'B2B' | 'B2C';
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  vatNumber?: string;
  notes?: string;
  addresses?: CustomerAddress[];
  contacts?: Contact[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  type: 'BILLING' | 'SHIPPING';
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
}

// Quote Types
export interface Quote {
  id: string;
  number: string;
  type: 'SALE' | 'RENTAL';
  status: QuoteStatus;
  date: string;
  validUntil?: string;
  customerId: string;
  customer?: Customer;
  vehicleId?: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  includedKm?: number;
  extraKmRate?: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  lines: QuoteLine[];
  customerNotes?: string;
  internalNotes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface QuoteLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxId?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  isSection: boolean;
  order: number;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  licensePlate: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'UNAVAILABLE';
  dailyRate?: number;
  kmRate?: number;
  createdAt: string;
}

// Invoice Types
export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  date: string;
  dueDate?: string;
  customerId: string;
  customer?: Customer;
  subtotal: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  lines: InvoiceLine[];
  payments?: Payment[];
  createdAt: string;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  VALIDATED = 'VALIDATED',
  SENT = 'SENT',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  CANCELLED = 'CANCELLED',
}

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: 'CARD' | 'CASH' | 'TRANSFER' | 'CHECK';
  date: string;
  reference?: string;
}

// Expense Types
export interface Expense {
  id: string;
  description: string;
  amount: number;
  taxRate: number;
  status: ExpenseStatus;
  date: string;
  categoryId: string;
  category?: ExpenseCategory;
  attachments?: ExpenseAttachment[];
  createdAt: string;
}

export enum ExpenseStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color?: string;
}

export interface ExpenseAttachment {
  id: string;
  name: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  type: 'PRODUCT' | 'SERVICE';
  sku?: string;
  price: number;
  taxId?: string;
  isActive: boolean;
}

// Tax Types
export interface Tax {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Dashboard Types
export interface DashboardStats {
  totalQuotes: number;
  totalInvoices: number;
  totalRevenue: number;
  pendingPayments: number;
  recentQuotes: Quote[];
  recentInvoices: Invoice[];
}
