const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const est = await prisma.establecimiento.findFirst({
    where: { esedDescripcion: { contains: 'HUMBERTO GONZALEZ' } },
    include: { grados: true }
  });
  const g = est.grados.find(g => g.tienCod === 10 && g.grteCod === 130);
  console.log('Grado 130 JEC:', g.esJec);
}

check().catch(console.error).finally(() => prisma.$disconnect());
