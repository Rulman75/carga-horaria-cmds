const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const est = await prisma.establecimiento.findFirst({
    where: { esedDescripcion: { contains: 'HUMBERTO GONZALEZ' } }
  });
  
  const plan = await prisma.planEstablecimiento.findFirst({
    where: { establecimientoId: est.esedCod },
    include: { detalles: true }
  });
  
  if (!plan) {
      // Maybe the plan is just linked by esedCod? No, it's called establecimientoId.
      const planes = await prisma.planEstablecimiento.findMany({
         where: { establecimientoId: est.esedCod },
         include: { detalles: true }
      });
      console.log(`Found ${planes.length} planes for ${est.esedDescripcion}`);
      if (planes.length > 0) {
          const p = planes[0];
          const det = p.detalles.find(d => d.codAsignatura === 'A-001' && d.grteCod === 130);
          console.log('Detalle Plan Propio:', det);
      }
      return;
  }
  
  const det = plan.detalles.find(d => d.codAsignatura === 'A-001' && d.grteCod === 130);
  console.log('Detalle:', det);
}

check().catch(console.error).finally(() => prisma.$disconnect());
