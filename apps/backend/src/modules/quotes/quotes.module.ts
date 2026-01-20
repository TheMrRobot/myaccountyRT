import { Module } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { QuotesController } from './quotes.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { PdfModule } from '../../core/pdf/pdf.module';
import { ExportModule } from '../../core/export/export.module';

@Module({
  imports: [PrismaModule, PdfModule, ExportModule],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}
