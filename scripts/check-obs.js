const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const docs = await prisma.docenteEstablecimiento.findMany({
    where: { observacionCarga: { not: null } }
  });
  console.log(`Found ${docs.length} docs with observation.`);
  for (const d of docs.slice(0, 5)) {
     console.log(d.docenteId, d.establecimientoId, `"${d.observacionCarga}"`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
