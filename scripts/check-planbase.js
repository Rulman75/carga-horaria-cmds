const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const detalles = await prisma.planEstudioDet.findMany({
    where: { tienCod: 10, grteCod: 130, codAsignatura: 'A-001' }
  });
  
  console.log(detalles);
}

check().catch(console.error).finally(() => prisma.$disconnect());
