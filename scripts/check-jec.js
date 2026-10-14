const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const est = await prisma.establecimiento.findFirst({
    where: { esedDescripcion: { contains: 'HUMBERTO GONZALEZ' } }
  });
  console.log('JEC:', est.esJec);
}

check().catch(console.error).finally(() => prisma.$disconnect());
