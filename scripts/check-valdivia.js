const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const doc = await prisma.docenteEstablecimiento.findFirst({
    where: { 
      observacionCarga: null,
      docente: {
         apellidos: { contains: 'VALDIVIA' }
      }
    }
  });
  console.log("Valdivia null obs:", doc);
}

check().catch(console.error).finally(() => prisma.$disconnect());
