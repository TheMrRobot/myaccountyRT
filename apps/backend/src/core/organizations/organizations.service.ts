import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: {
        name: createOrganizationDto.name,
        legalName: createOrganizationDto.legalName,
        vatNumber: createOrganizationDto.vatNumber,
        iban: createOrganizationDto.iban,
        email: createOrganizationDto.email,
        phone: createOrganizationDto.phone,
        website: createOrganizationDto.website,
        street: createOrganizationDto.street,
        city: createOrganizationDto.city,
        zipCode: createOrganizationDto.zipCode,
        country: createOrganizationDto.country,
        currency: createOrganizationDto.currency,
        locale: createOrganizationDto.locale,
        timezone: createOrganizationDto.timezone,
        modulesEnabled: createOrganizationDto.modulesEnabled || [],
      },
    });
  }

  async findAll() {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    await this.findOne(id);

    return this.prisma.organization.update({
      where: { id },
      data: {
        name: updateOrganizationDto.name,
        legalName: updateOrganizationDto.legalName,
        vatNumber: updateOrganizationDto.vatNumber,
        iban: updateOrganizationDto.iban,
        email: updateOrganizationDto.email,
        phone: updateOrganizationDto.phone,
        website: updateOrganizationDto.website,
        street: updateOrganizationDto.street,
        city: updateOrganizationDto.city,
        zipCode: updateOrganizationDto.zipCode,
        country: updateOrganizationDto.country,
        currency: updateOrganizationDto.currency,
        locale: updateOrganizationDto.locale,
        timezone: updateOrganizationDto.timezone,
        modulesEnabled: updateOrganizationDto.modulesEnabled,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.organization.delete({
      where: { id },
    });
  }
}
