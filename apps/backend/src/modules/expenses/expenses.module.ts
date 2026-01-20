import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { FilesModule } from '../../core/files/files.module';

@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
