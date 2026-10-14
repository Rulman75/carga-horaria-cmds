const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const planes = await prisma.planEstablecimiento.findMany({ include: { establecimiento: true } });
  let deleted = 0;
  for (const plan of planes) {
    const grados = await prisma.establecimientoGrado.findMany({
      where: { establecimientoId: plan.establecimientoId }
    });
    const gradosSet = new Set(grados.map(g => `${g.tienCod}-${g.grteCod}`));

    const dets = await prisma.planEstablecimientoDet.findMany({
      where: { planEstablecimientoId: plan.id }
    });
    
    for (const d of dets) {
      if (!gradosSet.has(`${d.tienCod}-${d.grteCod}`)) {
        await prisma.planEstablecimientoDet.delete({ where: { id: d.id } });
        deleted++;
      }
    }
  }
  console.log('Deleted orphaned subjects:', deleted);
}
main();
