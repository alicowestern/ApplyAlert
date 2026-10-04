import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create dev user
  const user = await prisma.user.upsert({
    where: { id: 'dev-user-id' },
    update: {},
    create: {
      id: 'dev-user-id',
    },
  });

  console.log(`Created/found user: ${user.id}`);

  // Create an Exact Instant opportunity
  await prisma.opportunity.create({
    data: {
      userId: user.id,
      title: 'Global Tech Scholarship',
      organization: 'Tech Foundation',
      opportunityType: 'SCHOLARSHIP',
      status: 'SAVED',
      deadline: {
        create: {
          kind: 'EXACT_INSTANT',
          originalText: 'Closes Dec 31, 2026 at 11:59 PM EST',
          localDate: '2026-12-31',
          localTime: '23:59:00',
          timezone: 'America/New_York',
          utcInstant: new Date('2027-01-01T04:59:00Z'),
          confidence: 1.0,
          userConfirmed: true,
        },
      },
      source: {
        create: {
          type: 'MANUAL',
        },
      },
    },
  });

  // Create a Date Only opportunity
  await prisma.opportunity.create({
    data: {
      userId: user.id,
      title: 'Summer Research Internship',
      organization: 'National Lab',
      opportunityType: 'INTERNSHIP',
      status: 'PREPARING',
      deadline: {
        create: {
          kind: 'DATE_ONLY',
          originalText: 'Applications due November 15, 2026',
          localDate: '2026-11-15',
          confidence: 0.9,
          userConfirmed: true,
        },
      },
      source: {
        create: {
          type: 'URL',
          url: 'https://example.com/internship',
        },
      },
    },
  });

  // Create an applied opportunity
  await prisma.opportunity.create({
    data: {
      userId: user.id,
      title: 'Open Source Grant',
      organization: 'OS Initiative',
      opportunityType: 'GRANT',
      status: 'APPLIED',
      appliedAt: new Date(),
      deadline: {
        create: {
          kind: 'ROLLING',
          confidence: 1.0,
          userConfirmed: true,
        },
      },
      source: {
        create: {
          type: 'MANUAL',
        },
      },
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
