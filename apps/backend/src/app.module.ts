import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Core modules
import { PrismaModule } from './core/prisma/prisma.module';
import { AuthModule } from './core/auth/auth.module';
import { OrganizationsModule } from './core/organizations/organizations.module';
import { UsersModule } from './core/users/users.module';
import { CustomersModule } from './core/customers/customers.module';
import { ProductsModule } from './core/products/products.module';
import { TaxesModule } from './core/taxes/taxes.module';
import { SettingsModule } from './core/settings/settings.module';
import { AuditModule } from './core/audit/audit.module';
import { FilesModule } from './core/files/files.module';

// Business modules
import { QuotesModule } from './modules/quotes/quotes.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ExpensesModule } from './modules/expenses/expenses.module';

// Guards
import { JwtAuthGuard } from './core/auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
    ]),

    // Core modules
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    CustomersModule,
    ProductsModule,
    TaxesModule,
    SettingsModule,
    AuditModule,
    FilesModule,

    // Business modules
    QuotesModule,
    VehiclesModule,
    DeliveryModule,
    InvoicesModule,
    ExpensesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
