import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { FilesService } from '../../core/files/files.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { ExpenseStatus } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  async create(organizationId: string, createExpenseDto: CreateExpenseDto) {
    // Calculate tax from TTC if only TTC is provided
    const expenseData = this.calculateTaxFromTTC(createExpenseDto);

    return this.prisma.expense.create({
      data: {
        organizationId,
        ...expenseData,
        date: new Date(expenseData.date),
      },
      include: {
        category: true,
        attachments: true,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.expense.findMany({
      where: { organizationId },
      include: {
        category: true,
        attachments: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, organizationId },
      include: {
        category: true,
        attachments: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async update(organizationId: string, id: string, updateExpenseDto: UpdateExpenseDto) {
    await this.findOne(organizationId, id);

    // Calculate tax from TTC if only TTC is provided
    const expenseData = this.calculateTaxFromTTC(updateExpenseDto);

    return this.prisma.expense.update({
      where: { id },
      data: {
        ...expenseData,
        date: expenseData.date ? new Date(expenseData.date) : undefined,
      },
      include: {
        category: true,
        attachments: true,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    const expense = await this.findOne(organizationId, id);

    // Delete all associated attachments from filesystem
    for (const attachment of expense.attachments) {
      try {
        await this.filesService.deleteFile(attachment.filePath);
      } catch (error) {
        // Continue even if file deletion fails
        console.error(`Failed to delete file: ${attachment.filePath}`, error);
      }
    }

    return this.prisma.expense.delete({
      where: { id },
    });
  }

  async uploadAttachment(
    organizationId: string,
    expenseId: string,
    file: Express.Multer.File,
  ) {
    await this.findOne(organizationId, expenseId);

    // Save file to filesystem
    const savedFile = await this.filesService.saveFile(organizationId, file, 'expenses');

    // Create attachment record
    const attachment = await this.prisma.expenseAttachment.create({
      data: {
        expenseId,
        name: savedFile.originalName,
        filePath: savedFile.path,
        fileSize: savedFile.size,
        mimeType: savedFile.mimeType,
      },
    });

    return attachment;
  }

  async deleteAttachment(organizationId: string, expenseId: string, attachmentId: string) {
    await this.findOne(organizationId, expenseId);

    const attachment = await this.prisma.expenseAttachment.findFirst({
      where: { id: attachmentId, expenseId },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Delete file from filesystem
    try {
      await this.filesService.deleteFile(attachment.filePath);
    } catch (error) {
      // Continue even if file deletion fails
      console.error(`Failed to delete file: ${attachment.filePath}`, error);
    }

    // Delete attachment record
    await this.prisma.expenseAttachment.delete({
      where: { id: attachmentId },
    });

    return { message: 'Attachment deleted successfully' };
  }

  async changeStatus(organizationId: string, id: string, status: ExpenseStatus) {
    await this.findOne(organizationId, id);

    return this.prisma.expense.update({
      where: { id },
      data: { status },
      include: {
        category: true,
        attachments: true,
      },
    });
  }

  // Expense Categories
  async createCategory(organizationId: string, createExpenseCategoryDto: CreateExpenseCategoryDto) {
    return this.prisma.expenseCategory.create({
      data: {
        organizationId,
        ...createExpenseCategoryDto,
      },
    });
  }

  async findAllCategories(organizationId: string) {
    return this.prisma.expenseCategory.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async updateCategory(organizationId: string, id: string, updateData: Partial<CreateExpenseCategoryDto>) {
    const category = await this.prisma.expenseCategory.findFirst({
      where: { id, organizationId },
    });

    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    return this.prisma.expenseCategory.update({
      where: { id },
      data: updateData,
    });
  }

  // Helper method to calculate tax from TTC if not provided
  private calculateTaxFromTTC(expenseDto: CreateExpenseDto | UpdateExpenseDto): any {
    const data = { ...expenseDto };

    // If only amountTTC is provided, calculate HT and tax
    if (data.amountTTC && !data.amountHT && data.taxRate) {
      const amountTTC = Number(data.amountTTC);
      const taxRate = Number(data.taxRate);

      // Formula: HT = TTC / (1 + taxRate/100)
      const amountHT = amountTTC / (1 + taxRate / 100);
      const taxAmount = amountTTC - amountHT;

      data.amountHT = Math.round(amountHT * 100) / 100;
      data.taxAmount = Math.round(taxAmount * 100) / 100;
    } else if (data.amountHT && data.taxRate) {
      // If HT and taxRate are provided, calculate tax amount
      const amountHT = Number(data.amountHT);
      const taxRate = Number(data.taxRate);

      data.taxAmount = Math.round(amountHT * (taxRate / 100) * 100) / 100;
    }

    return data;
  }
}
