const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const cargas = await prisma.cargaHoraria.findMany({
    where: { 
      planEstablecimiento: { establecimiento: { esedDescripcion: { contains: 'HUMBERTO GONZALEZ' } } },
      tipoCarga: 'LECTIVA',
      tienCod: 10
    },
    include: {
      docente: true,
      asignatura: true
    }
  });
  
  console.log(`Found ${cargas.length} LECTIVAS for tienCod=10`);
  for (const c of cargas) {
      console.log(`- Doc: ${c.docente.apellidos}, Grado: ${c.grteCod}, Asig: ${c.asignaturaCod}, Letra: ${c.letraCurso}, Hrs: ${c.horasAllocadas}`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
