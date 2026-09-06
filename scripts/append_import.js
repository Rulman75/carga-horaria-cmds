import fs from 'fs';

const code = `
export async function importarPlanBaseAPropio(planPropioId: number, codPlanBase: number) {
  // Obtener el plan base con sus detalles
  const planBase = await prisma.planEstudioEnc.findUnique({
    where: { codPlan: codPlanBase },
    include: { detalles: true }
  });

  if (!planBase) throw new Error("Plan base no encontrado");

  // Obtener si el colegio es JEC para saber qué horas traer
  const planPropio = await prisma.planEstablecimiento.findUnique({
    where: { id: planPropioId },
    include: { establecimiento: true }
  });
  
  if (!planPropio) throw new Error("Plan propio no encontrado");
  
  const esJec = planPropio.establecimiento.esJec || false;

  // Insertar cada detalle nuevo
  for (const det of planBase.detalles) {
    // Verificar si ya existe para no duplicar (por asignatura y grado)
    const existe = await prisma.planEstablecimientoDet.findFirst({
      where: {
        planEstablecimientoId: planPropioId,
        tienCod: det.tienCod,
        grteCod: det.grteCod,
        codAsignatura: det.codAsignatura
      }
    });

    if (!existe) {
      await prisma.planEstablecimientoDet.create({
        data: {
          planEstablecimientoId: planPropioId,
          tienCod: det.tienCod,
          grteCod: det.grteCod,
          codAsignatura: det.codAsignatura,
          horas: esJec ? (det.horasCJ || 0) : (det.horasSJ || 0),
          obligatoria: det.obligatoria,
          formacion: det.formacion,
          esPropio: false
        }
      });
    }
  }
}
`;

fs.appendFileSync('src/app/actions.ts', code);
