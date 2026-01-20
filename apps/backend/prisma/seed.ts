import { PrismaClient, UserRole, QuoteType, QuoteStatus, VehicleStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create organization
  console.log('Creating organization...');
  const organization = await prisma.organization.create({
    data: {
      name: 'Demo Company',
      legalName: 'Demo Company SPRL',
      vatNumber: 'BE0123456789',
      email: 'contact@democompany.be',
      phone: '+32 2 123 45 67',
      street: 'Rue de la Démonstration 123',
      city: 'Brussels',
      zipCode: '1000',
      country: 'BE',
      modulesEnabled: ['quotes', 'vehicles', 'delivery', 'invoices', 'expenses'],
    },
  });

  console.log('✅ Organization created:', organization.name);

  // Create admin user
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: 'admin@democompany.be',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+32 2 123 45 67',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create commercial user
  console.log('Creating commercial user...');
  const commercialUser = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: 'commercial@democompany.be',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Commercial',
      phone: '+32 2 123 45 68',
      role: UserRole.COMMERCIAL,
      isActive: true,
    },
  });

  console.log('✅ Commercial user created:', commercialUser.email);

  // Create accounting user
  console.log('Creating accounting user...');
  const accountingUser = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: 'accounting@democompany.be',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Accountant',
      phone: '+32 2 123 45 69',
      role: UserRole.ACCOUNTING,
      isActive: true,
    },
  });

  console.log('✅ Accounting user created:', accountingUser.email);

  // Create taxes
  console.log('Creating taxes...');
  const taxStandard = await prisma.tax.create({
    data: {
      organizationId: organization.id,
      name: 'TVA 21%',
      rate: 21,
      description: 'Taux standard Belgique',
      isDefault: true,
      isActive: true,
    },
  });

  const taxReduced = await prisma.tax.create({
    data: {
      organizationId: organization.id,
      name: 'TVA 6%',
      rate: 6,
      description: 'Taux réduit',
      isDefault: false,
      isActive: true,
    },
  });

  console.log('✅ Taxes created');

  // Create customers
  console.log('Creating customers...');
  const customer1 = await prisma.customer.create({
    data: {
      organizationId: organization.id,
      type: 'B2B',
      companyName: 'Acme Corporation',
      vatNumber: 'BE0987654321',
      email: 'contact@acme.be',
      phone: '+32 2 987 65 43',
      addresses: {
        create: [
          {
            type: 'BILLING',
            street: 'Avenue de la Liberté 456',
            city: 'Brussels',
            zipCode: '1050',
            country: 'BE',
            isDefault: true,
          },
          {
            type: 'DELIVERY',
            street: 'Rue du Commerce 789',
            city: 'Antwerp',
            zipCode: '2000',
            country: 'BE',
            isDefault: false,
          },
        ],
      },
      contacts: {
        create: [
          {
            firstName: 'Robert',
            lastName: 'Manager',
            email: 'robert@acme.be',
            phone: '+32 2 987 65 44',
            position: 'Purchasing Manager',
            isPrimary: true,
          },
        ],
      },
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      organizationId: organization.id,
      type: 'B2C',
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie.dupont@email.be',
      phone: '+32 475 12 34 56',
      addresses: {
        create: [
          {
            type: 'BILLING',
            street: 'Rue des Fleurs 12',
            city: 'Liège',
            zipCode: '4000',
            country: 'BE',
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log('✅ Customers created');

  // Create products
  console.log('Creating products...');
  const product1 = await prisma.product.create({
    data: {
      organizationId: organization.id,
      name: 'Service de déménagement',
      description: 'Service complet de déménagement',
      sku: 'SRV-MOVE-001',
      price: 150,
      taxId: taxStandard.id,
      unit: 'hour',
      isService: true,
      isActive: true,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      organizationId: organization.id,
      name: 'Carton de déménagement',
      description: 'Carton standard 60x40x40cm',
      sku: 'BOX-STD-001',
      price: 2.5,
      taxId: taxReduced.id,
      unit: 'unit',
      isService: false,
      isActive: true,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      organizationId: organization.id,
      name: 'Location véhicule utilitaire',
      description: 'Location véhicule 20m³',
      sku: 'RENT-VAN-001',
      price: 80,
      taxId: taxStandard.id,
      unit: 'day',
      isService: true,
      isActive: true,
    },
  });

  console.log('✅ Products created');

  // Create vehicles
  console.log('Creating vehicles...');
  const vehicle1 = await prisma.vehicle.create({
    data: {
      organizationId: organization.id,
      name: 'Camionnette 1',
      licensePlate: '1-ABC-123',
      vin: 'VF1KZ000123456789',
      category: 'Utilitaire',
      brand: 'Renault',
      model: 'Master',
      year: 2022,
      loadCapacity: 1200,
      volume: 20,
      seats: 3,
      dailyRate: 80,
      kmRate: 0.25,
      currentKm: 45000,
      status: VehicleStatus.ACTIVE,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      organizationId: organization.id,
      name: 'Camion 1',
      licensePlate: '1-XYZ-789',
      vin: 'VF1KZ000987654321',
      category: 'Poids lourd',
      brand: 'Mercedes',
      model: 'Sprinter',
      year: 2021,
      loadCapacity: 2000,
      volume: 35,
      seats: 3,
      dailyRate: 120,
      kmRate: 0.35,
      currentKm: 78000,
      status: VehicleStatus.ACTIVE,
    },
  });

  console.log('✅ Vehicles created');

  // Create expense categories
  console.log('Creating expense categories...');
  await prisma.expenseCategory.createMany({
    data: [
      {
        organizationId: organization.id,
        name: 'Carburant',
        description: 'Frais de carburant',
        isActive: true,
      },
      {
        organizationId: organization.id,
        name: 'Maintenance',
        description: 'Entretien véhicules',
        isActive: true,
      },
      {
        organizationId: organization.id,
        name: 'Fournitures',
        description: 'Fournitures de bureau',
        isActive: true,
      },
      {
        organizationId: organization.id,
        name: 'Assurances',
        description: 'Primes d\'assurance',
        isActive: true,
      },
    ],
  });

  console.log('✅ Expense categories created');

  // Create document numbering
  console.log('Creating document numbering...');
  await prisma.documentNumbering.createMany({
    data: [
      {
        organizationId: organization.id,
        type: 'quote_sale',
        prefix: 'QV',
        next: 1,
        length: 6,
      },
      {
        organizationId: organization.id,
        type: 'quote_rental',
        prefix: 'QL',
        next: 1,
        length: 6,
      },
      {
        organizationId: organization.id,
        type: 'invoice',
        prefix: 'INV',
        next: 1,
        length: 6,
      },
    ],
  });

  console.log('✅ Document numbering created');

  // Create a sample quote
  console.log('Creating sample quote...');
  const quote = await prisma.quote.create({
    data: {
      organizationId: organization.id,
      customerId: customer1.id,
      vehicleId: vehicle1.id,
      number: 'QV-000001',
      type: QuoteType.SALE,
      status: QuoteStatus.DRAFT,
      date: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      customerNotes: 'Merci pour votre confiance',
    },
  });

  // Add lines to quote
  await prisma.quoteLine.createMany({
    data: [
      {
        quoteId: quote.id,
        productId: product1.id,
        description: 'Service de déménagement',
        quantity: 4,
        unitPrice: 150,
        discount: 0,
        taxId: taxStandard.id,
        subtotal: 600,
        taxAmount: 126,
        total: 726,
        order: 0,
      },
      {
        quoteId: quote.id,
        productId: product2.id,
        description: 'Carton de déménagement',
        quantity: 20,
        unitPrice: 2.5,
        discount: 10,
        taxId: taxReduced.id,
        subtotal: 45,
        taxAmount: 2.7,
        total: 47.7,
        order: 1,
      },
    ],
  });

  // Update quote totals
  await prisma.quote.update({
    where: { id: quote.id },
    data: {
      subtotal: 645,
      taxAmount: 128.7,
      total: 773.7,
    },
  });

  console.log('✅ Sample quote created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Credentials:');
  console.log('   Admin: admin@democompany.be / admin123');
  console.log('   Commercial: commercial@democompany.be / admin123');
  console.log('   Accounting: accounting@democompany.be / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
