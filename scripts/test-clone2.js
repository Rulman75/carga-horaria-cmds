const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const planBase = await prisma.planEstudioEnc.findUnique({
    where: { codPlan: 4 },
    include: { detalles: true }
  });
  const estab = await prisma.establecimiento.findUnique({ where: { esedSec: 11 } });
  const estabGrados = await prisma.establecimientoGrado.findMany({ where: { establecimientoId: 11 } });
  const isJecMap = new Map();
  for (const g of estabGrados) {
    isJecMap.set(`${g.tienCod}-${g.grteCod}`, g.esJec);
  }
  
  const tiposAutorizados = await prisma.establecimientoTipoEnsenanza.findMany({ where: { establecimientoId: 11 } });
  const tiposPermitidos = new Set(tiposAutorizados.map((t) => t.tienCod));

  const detallesFiltrados = planBase.detalles.filter(det => {
    if (tiposPermitidos.size > 0 && !tiposPermitidos.has(det.tienCod)) return false;
    return true;
  });

  const create = detallesFiltrados.reduce((acc, det) => {
    const key = `${det.tienCod}-${det.grteCod}`;
    const esGradoJec = isJecMap.has(key) ? isJecMap.get(key) : (estab?.esJec || false);
    const horasFinales = esGradoJec ? (det.horasCJ || 0) : (det.horasSJ || 0);
    if (horasFinales > 0) {
      acc.push({
        codAsignatura: det.codAsignatura,
        horas: horasFinales
      });
    }
    return acc;
  }, []);

  console.log('Would insert A-002?', create.filter(c => c.codAsignatura === 'A-002'));
}
main();
