const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const doc = await prisma.docente.findFirst({
    where: { apellidos: { contains: 'VALDIVIA HERRERA' } },
    include: {
      establecimientos: {
        include: {
          establecimiento: true
        }
      },
      cargasHorarias: {
        where: { tipoCarga: 'LECTIVA' },
        include: { asignatura: true, planEstablecimiento: { include: { establecimiento: true } } }
      }
    }
  });
  
  if (!doc) {
    console.log('Docente not found');
    return;
  }
  
  console.log('Docente:', doc.nombres, doc.apellidos);
  for (const ce of doc.establecimientos) {
    console.log('Trabaja en:', ce.establecimiento.esedDescripcion);
  }
  
  for (const c of doc.cargasHorarias) {
      console.log(`- Asignada en: ${c.planEstablecimiento.establecimiento.esedDescripcion}, tienCod: ${c.tienCod}, grteCod: ${c.grteCod}, Asig: ${c.asignaturaCod}, Letra: ${c.letraCurso}, Hrs: ${c.horasAllocadas}`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
