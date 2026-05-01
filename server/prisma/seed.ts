import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const departments = ["行政", "業務", "財務", "工程"];
  
  console.log('🌱 Start seeding departments...');
  
  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  
  console.log("✅ Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });