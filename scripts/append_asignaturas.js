import fs from 'fs';

const code = `
export async function getAllAsignaturas() {
  return await prisma.asignatura.findMany({
    orderBy: { asigDescripcion: 'asc' }
  });
}

export async function agregarAsignaturaIndividualPropio(
  planPropioId: number, 
  tienCod: number, 
  grteCod: number, 
  codAsignatura: string
) {
  // Check if exists
  const existe = await prisma.planEstablecimientoDet.findFirst({
    where: {
      planEstablecimientoId: planPropioId,
      tienCod,
      grteCod,
      codAsignatura
    }
  });

  if (!existe) {
    await prisma.planEstablecimientoDet.create({
      data: {
        planEstablecimientoId: planPropioId,
        tienCod,
        grteCod,
        codAsignatura,
        horas: 0, // Starts at 0 so they can edit it in the matrix
        obligatoria: 'NO',
        formacion: 'General',
        esPropio: true
      }
    });
  }
}
`;

fs.appendFileSync('src/app/actions.ts', code);
