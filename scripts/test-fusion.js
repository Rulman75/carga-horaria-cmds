const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const planBase = await prisma.planEstudioEnc.findUnique({
    where: { codPlan: 4 },
    include: { detalles: true }
  });
  const planPropio = await prisma.planEstablecimiento.findUnique({
    where: { id: 7 },
    include: { establecimiento: true }
  });
  const estabGrados = await prisma.establecimientoGrado.findMany({
    where: { establecimientoId: 11 }
  });
  const isJecMap = new Map();
  for (const g of estabGrados) {
    isJecMap.set(`${g.tienCod}-${g.grteCod}`, g.esJec);
  }
  const existentes = await prisma.planEstablecimientoDet.findMany({
    where: { planEstablecimientoId: 7, tienCod: 299 }
  });
  console.log('Existentes 299:', existentes.length);
  let paraAgregar = [];
  for (const det of planBase.detalles) {
    const existe = existentes.find(e => e.grteCod === det.grteCod && e.codAsignatura === det.codAsignatura);
    if (!existe) {
      const key = `${det.tienCod}-${det.grteCod}`;
      const esJec = isJecMap.has(key) ? isJecMap.get(key) : false;
      paraAgregar.push({
        grteCod: det.grteCod,
        codAsig: det.codAsignatura,
        horas: esJec ? (det.horasCJ || 0) : (det.horasSJ || 0)
      });
    }
  }
  console.log('Faltan agregar:', paraAgregar.filter(a => a.codAsig === '22' || a.codAsig === 'A-002'));
  const allArtes = paraAgregar.filter(a => a.codAsig === '22' || a.codAsig === 'A-002');
  console.log('Total Artes y Aula faltantes:', allArtes);
  
  const currentArtes = existentes.filter(e => e.codAsignatura === '22' || e.codAsignatura === 'A-002');
  console.log('Actualmente en plan:', currentArtes.map(e => ({grado: e.grteCod, asig: e.codAsignatura, horas: e.horas})));
}
main();
