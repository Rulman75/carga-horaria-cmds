const fs = require('fs');

let actions = fs.readFileSync('src/app/actions.ts', 'utf8');
actions += `
export async function getCargasEstablecimiento(establecimientoId: number) {
  return await prisma.cargaHoraria.findMany({
    where: {
      planEstablecimiento: { establecimientoId }
    },
    include: {
      asignatura: true,
      grado: { include: { tipoEnsenanza: true } }
    }
  });
}

export async function saveCargasHorarias(docenteId: number, cargas: any[]) {
  // Replace all assignments for this teacher
  await prisma.cargaHoraria.deleteMany({
    where: { docenteId }
  });
  
  if (cargas.length > 0) {
    await prisma.cargaHoraria.createMany({
      data: cargas.map(c => ({
        docenteId,
        planEstablecimientoId: c.planEstablecimientoId,
        tienCod: c.tienCod,
        grteCod: c.grteCod,
        asignaturaCod: c.codAsignatura,
        horasAllocadas: c.horas,
        tipoCarga: c.tipoCarga,
        observacion: ''
      }))
    });
  }
  return true;
}
`;
fs.writeFileSync('src/app/actions.ts', actions);
