const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const cargas = await prisma.cargaHoraria.findMany({
    where: { 
      tipoCarga: 'LECTIVA',
      tienCod: 10,
      docente: {
        apellidos: { contains: 'VALDIVIA HERRERA' }
      }
    },
    include: {
      docente: true,
      asignatura: true,
      planEstablecimiento: { include: { establecimiento: true } }
    }
  });
  
  if (cargas.length > 0) {
      console.log('Cargas directly found for Katherine Valdivia:');
      console.log(cargas.map(c => c.planEstablecimiento.establecimiento.esedDescripcion));
  } else {
      console.log('No cargas directly found for Katherine Valdivia in Parvularia');
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
