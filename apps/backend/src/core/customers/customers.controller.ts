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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create customer' })
  @ApiResponse({ status: 201, description: 'Customer created' })
  create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return this.customersService.create(organizationId, createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'Customers retrieved' })
  findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.customersService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(@CurrentUser('organizationId') organizationId: string, @Param('id') id: string) {
    return this.customersService.findOne(organizationId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, description: 'Customer updated' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(organizationId, id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({ status: 200, description: 'Customer deleted' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  remove(@CurrentUser('organizationId') organizationId: string, @Param('id') id: string) {
    return this.customersService.remove(organizationId, id);
  }

  // Address management endpoints
  @Post(':id/addresses')
  @ApiOperation({ summary: 'Add address to customer' })
  @ApiResponse({ status: 201, description: 'Address added' })
  addAddress(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') customerId: string,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.customersService.addAddress(organizationId, customerId, createAddressDto);
  }

  @Delete(':id/addresses/:addressId')
  @ApiOperation({ summary: 'Remove address from customer' })
  @ApiResponse({ status: 200, description: 'Address removed' })
  removeAddress(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') customerId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.customersService.removeAddress(organizationId, customerId, addressId);
  }

  // Contact management endpoints
  @Post(':id/contacts')
  @ApiOperation({ summary: 'Add contact to customer' })
  @ApiResponse({ status: 201, description: 'Contact added' })
  addContact(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') customerId: string,
    @Body() createContactDto: CreateContactDto,
  ) {
    return this.customersService.addContact(organizationId, customerId, createContactDto);
  }

  @Delete(':id/contacts/:contactId')
  @ApiOperation({ summary: 'Remove contact from customer' })
  @ApiResponse({ status: 200, description: 'Contact removed' })
  removeContact(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') customerId: string,
    @Param('contactId') contactId: string,
  ) {
    return this.customersService.removeContact(organizationId, customerId, contactId);
  }
}
