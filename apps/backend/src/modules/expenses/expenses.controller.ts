import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { UserRole, ExpenseStatus } from '@prisma/client';

@ApiTags('expenses')
@ApiBearerAuth()
@Controller('expenses')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ACCOUNTING)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create expense' })
  @ApiResponse({ status: 201, description: 'Expense created' })
  create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expensesService.create(organizationId, createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses' })
  @ApiResponse({ status: 200, description: 'Expenses retrieved' })
  findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.expensesService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiResponse({ status: 200, description: 'Expense retrieved' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  findOne(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.expensesService.findOne(organizationId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update expense' })
  @ApiResponse({ status: 200, description: 'Expense updated' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  update(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(organizationId, id, updateExpenseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  remove(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.expensesService.remove(organizationId, id);
  }

  // Attachment management endpoints
  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload attachment for expense' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Attachment uploaded' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async uploadAttachment(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') expenseId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.expensesService.uploadAttachment(organizationId, expenseId, file);
  }

  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete expense attachment' })
  @ApiResponse({ status: 200, description: 'Attachment deleted' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  deleteAttachment(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') expenseId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.expensesService.deleteAttachment(organizationId, expenseId, attachmentId);
  }

  // Status management endpoint
  @Patch(':id/status')
  @ApiOperation({ summary: 'Change expense status' })
  @ApiResponse({ status: 200, description: 'Status changed' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  changeStatus(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body('status') status: ExpenseStatus,
  ) {
    return this.expensesService.changeStatus(organizationId, id, status);
  }

  // Category management endpoints
  @Get('/categories/all')
  @ApiOperation({ summary: 'Get all expense categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  findAllCategories(@CurrentUser('organizationId') organizationId: string) {
    return this.expensesService.findAllCategories(organizationId);
  }

  @Post('/categories')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create expense category' })
  @ApiResponse({ status: 201, description: 'Category created' })
  createCategory(
    @CurrentUser('organizationId') organizationId: string,
    @Body() createExpenseCategoryDto: CreateExpenseCategoryDto,
  ) {
    return this.expensesService.createCategory(organizationId, createExpenseCategoryDto);
  }

  @Patch('/categories/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update expense category' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  updateCategory(
    @CurrentUser('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateData: Partial<CreateExpenseCategoryDto>,
  ) {
    return this.expensesService.updateCategory(organizationId, id, updateData);
  }
}
