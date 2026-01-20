import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createCustomerDto: CreateCustomerDto) {
    const { addresses, contacts, ...customerData } = createCustomerDto;

    return this.prisma.customer.create({
      data: {
        organizationId,
        ...customerData,
        addresses: addresses ? {
          create: addresses,
        } : undefined,
        contacts: contacts ? {
          create: contacts,
        } : undefined,
      },
      include: {
        addresses: true,
        contacts: true,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.customer.findMany({
      where: { organizationId },
      include: {
        addresses: true,
        contacts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId },
      include: {
        addresses: true,
        contacts: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(organizationId: string, id: string, updateCustomerDto: UpdateCustomerDto) {
    await this.findOne(organizationId, id);

    const { addresses, contacts, ...customerData } = updateCustomerDto;

    // For simplicity, we'll update only the customer data
    // Addresses and contacts can be managed through separate endpoints
    return this.prisma.customer.update({
      where: { id },
      data: customerData,
      include: {
        addresses: true,
        contacts: true,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    return this.prisma.customer.delete({
      where: { id },
    });
  }

  // Additional methods for managing addresses
  async addAddress(organizationId: string, customerId: string, addressData: any) {
    await this.findOne(organizationId, customerId);

    return this.prisma.customerAddress.create({
      data: {
        customerId,
        ...addressData,
      },
    });
  }

  async removeAddress(organizationId: string, customerId: string, addressId: string) {
    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
      include: { customer: true },
    });

    if (!address || address.customer.organizationId !== organizationId) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.customerAddress.delete({
      where: { id: addressId },
    });
  }

  // Additional methods for managing contacts
  async addContact(organizationId: string, customerId: string, contactData: any) {
    await this.findOne(organizationId, customerId);

    return this.prisma.contact.create({
      data: {
        customerId,
        ...contactData,
      },
    });
  }

  async removeContact(organizationId: string, customerId: string, contactId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, customerId },
      include: { customer: true },
    });

    if (!contact || contact.customer.organizationId !== organizationId) {
      throw new NotFoundException('Contact not found');
    }

    return this.prisma.contact.delete({
      where: { id: contactId },
    });
  }
}
