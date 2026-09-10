import sys

with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    code = f.read()

new_getSchoolAnalytics = """export async function getSchoolAnalytics(establecimientoId: number) {
  const tablaConversion = await prisma.tablaConversion.findMany();
  // Get all teachers for this school
  const rels = await prisma.docenteEstablecimiento.findMany({
    where: { establecimientoId },
    include: { docente: true }
  });
  
  // Get all cargas for this school
  const cargas = await prisma.cargaHoraria.findMany({
    where: { planEstablecimiento: { establecimientoId } },
    include: { asignatura: true, actividadExtracurricular: true }
  });

  const planesDetalles = await prisma.planEstablecimientoDet.findMany({
    where: { planEstablecimiento: { establecimientoId } },
    include: { 
      asignatura: true, 
      grado: { 
        include: { establecimientoGrados: { where: { establecimientoId } } } 
      } 
    }
  });

  const subjectNeed: Record<string, { needed: number, assigned: number, name: string }> = {};

  planesDetalles.forEach(det => {
    const asig = det.asignatura?.asigDescripcion || 'Desconocida';
    const gInfo = det.grado?.establecimientoGrados?.[0];
    const cursos = gInfo?.cantidadCursos || 1;
    if (!subjectNeed[det.codAsignatura]) subjectNeed[det.codAsignatura] = { needed: 0, assigned: 0, name: asig };
    subjectNeed[det.codAsignatura].needed += (det.horas * cursos);
  });

  cargas.forEach(c => {
    if (c.tipoCarga === 'LECTIVA' && c.asignaturaCod && subjectNeed[c.asignaturaCod]) {
       subjectNeed[c.asignaturaCod].assigned += c.horasAllocadas;
    }
  });

  const subjectProgress = Object.values(subjectNeed).sort((a, b) => b.needed - a.needed);

  // Calculate metrics
  let totalHorasContrato = 0;
  let totalHorasAsignadas = 0;
  let totalJecAsignadas = 0;
  let totalBaseAsignadas = 0;
  let docentesAsignados = 0;
  let extraDistribution: Record<string, number> = {};

  for (const rel of rels) {
    const doc = rel.docente;
    const contrato = doc.totalDefinitivo || doc.totalJornada || doc.horasTitular || 0;
    totalHorasContrato += contrato;
    
    const docCargas = cargas.filter(c => c.docenteId === doc.id);
    let lectivasPed = 0;
    let anlCrono = 0;
    let extraCrono = 0;
    
    docCargas.forEach(c => {
      if (c.tipoCarga === 'LECTIVA') {
        lectivasPed += c.horasAllocadas;
        if (c.asignatura?.esTallerJec) totalJecAsignadas += c.horasAllocadas;
        else totalBaseAsignadas += c.horasAllocadas;
      } else if (c.tipoCarga === 'NO_LECTIVA') {
        anlCrono += c.horasAllocadas;
      } else if (c.tipoCarga === 'EXTRACURRICULAR') {
        extraCrono += c.horasAllocadas;
        const extraName = c.actividadExtracurricular?.descripcion || 'Otra Extra';
        extraDistribution[extraName] = (extraDistribution[extraName] || 0) + c.horasAllocadas;
      }
    });

    const colacion = contrato >= 30 ? 2 : 1;
    let recreoDecimal = 0;
    if (lectivasPed > 0) {
      const row = tablaConversion.find(r => r.lectivasPedagogicas === lectivasPed);
      if (row) {
         const [h, m] = row.recreoCronologicas.split(':').map(Number);
         recreoDecimal = h + (m / 60);
      }
    }
    
    let asigTotal = 0;
    if (lectivasPed > 0 || anlCrono > 0 || extraCrono > 0) {
      asigTotal = (lectivasPed * 45 / 60) + recreoDecimal + anlCrono + extraCrono + colacion;
    }
 
    totalHorasAsignadas += asigTotal;
    
    if (docCargas.length > 0) docentesAsignados++;
  }

  const chartExtra = Object.entries(extraDistribution).map(([name, value]) => ({ name, value }));

  return {
    totalDocentes: rels.length,
    docentesAsignados,
    totalHorasContrato: Math.round(totalHorasContrato),
    totalHorasAsignadas: Math.round(totalHorasAsignadas),
    horasOciosas: Math.round(totalHorasContrato - totalHorasAsignadas),
    totalBaseAsignadas,
    totalJecAsignadas,
    chartExtra,
    subjectProgress
  };
}"""

start_marker = "export async function getSchoolAnalytics"
end_marker = "export async function getGlobalAnalytics"
start_idx = code.find(start_marker)
end_idx = code.find(end_marker)

if start_idx != -1 and end_idx != -1:
    code = code[:start_idx] + new_getSchoolAnalytics + "\n\n" + code[end_idx:]
    with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Replaced successfully")
else:
    print("Markers not found")
