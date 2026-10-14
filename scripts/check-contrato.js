const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const docs = await prisma.docente.findMany({ take: 5 });
  console.log(docs.map(d => ({ tipoContrato: d.tipoContrato, contrato: d.contrato })));
}

check().catch(console.error).finally(() => prisma.$disconnect());
