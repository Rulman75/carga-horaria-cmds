const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const docente = await prisma.docente.findFirst({
    where: { apellidos: { contains: 'ZAMORA' }, nombres: { contains: 'KAREN' } }
  });

  if (!docente) {
    console.log("No se encontró ZAMORA KAREN");
    return;
  }
  console.log("Docente:", docente.id, docente.apellidos, docente.nombres);

  const estDoc = await prisma.docenteEstablecimiento.findMany({
    where: { docenteId: docente.id },
    include: { establecimiento: true }
  });

  if (estDoc.length === 0) {
     console.log("No tiene establecimientos");
     return;
  }

  const est = estDoc[0].establecimiento;
  console.log("Establecimiento:", est.esedSec, est.esedDescripcion);

  const cargas = await prisma.cargaHoraria.findMany({
    where: { docenteId: docente.id, planEstablecimiento: { establecimientoId: est.esedSec } },
    include: { asignatura: true, actividadNoLectiva: true, actividadExtracurricular: true }
  });

  console.log("\nCargas:");
  let lectivasPed = 0;
  let anlCrono = 0;
  let extCrono = 0;
  for (const c of cargas) {
    console.log(`- ${c.tipoCarga}: ${c.horasAllocadas} hrs (${c.asignatura?.asigDescripcion || c.actividadNoLectiva?.descripcion || c.actividadExtracurricular?.descripcion})`);
    if (c.tipoCarga === 'LECTIVA') lectivasPed += c.horasAllocadas;
    if (c.tipoCarga === 'NO_LECTIVA') anlCrono += c.horasAllocadas;
    if (c.tipoCarga === 'EXTRACURRICULAR') extCrono += c.horasAllocadas;
  }

  console.log("\nSumatorias Directas:");
  console.log("Lectivas Pedagógicas:", lectivasPed);
  console.log("ANL Cronológicas:", anlCrono);
  console.log("Extra Cronológicas:", extCrono);

  const tabla = await prisma.tablaConversion.findFirst({
    where: { lectivasPedagogicas: lectivasPed }
  });

  console.log("\nTabla de Conversión para", lectivasPed, "horas:");
  console.log(tabla);

  if (tabla) {
    const parseCronoToDecimal = (crono) => {
      if(!crono) return 0;
      const p = crono.split(':');
      if(p.length !== 2) return 0;
      return parseInt(p[0]) + parseInt(p[1])/60;
    };

    const recreoDec = parseCronoToDecimal(tabla.recreoCronologicas);
    console.log("Recreo Decimal:", recreoDec);
    
    const aulaCrono = (lectivasPed * 45) / 60;
    console.log("Aula Crono:", aulaCrono);
    
    // colacion
    const contrato = docente.totalDefinitivo || docente.totalJornada || docente.horasTitular || 0;
    const colacion = contrato >= 30 ? (est.horasColacion || 2) : 1;
    console.log("Contrato:", contrato, "Colacion:", colacion);

    const totalAsignado = Math.round(aulaCrono + recreoDec) + anlCrono + extCrono + colacion;
    console.log("TOTAL ASIGNADO (como matriz-clasica):", totalAsignado);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
