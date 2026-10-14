const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const estab = await prisma.establecimiento.findFirst({ where: { esedDescripcion: { contains: 'RENDIC' } } });
  const plan = await prisma.planEstablecimiento.findFirst({ 
    where: { establecimientoId: estab.esedSec, nombre: { contains: '2027' } } 
  });
  console.log('Plan:', plan.id);
  
  const grados = await prisma.establecimientoGrado.findMany({ where: { establecimientoId: estab.esedSec } });
  console.log('Grados configurados:', grados.map(g => `${g.tienCod}-${g.grteCod}`));

  const dets = await prisma.planEstablecimientoDet.findMany({ 
    where: { planEstablecimientoId: plan.id, tienCod: 299 },
    include: { asignatura: true, grado: true }
  });
  
  const formatted = dets.map(d => `${d.tienCod}-${d.grteCod} | Asig: ${d.asignatura?.asigDescripcion} | Horas: ${d.horas}`);
  console.log('Subjects 299:', formatted);
}
main();
