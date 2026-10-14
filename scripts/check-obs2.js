const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const docs = await prisma.docenteEstablecimiento.findMany({
    where: { observacionCarga: "" }
  });
  console.log(`Found ${docs.length} docs with empty string observation.`);
}

check().catch(console.error).finally(() => prisma.$disconnect());
