const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

const target = `export async function agregarAsignaturaIndividualPropio(
  planPropioId: number, 
  tienCod: number, 
  grteCod: number, 
  codAsignatura: string,
  categoria: string = 'BASE'
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
        esPropio: true,
        categoria // ADDED CATEGORIA
      }
    });
  }
}`;

const rep = `export async function agregarAsignaturaIndividualPropio(
  planPropioId: number, 
  tienCod: number, 
  grteCod: number, 
  codAsignatura: string,
  categoria: string = 'BASE',
  especialidad: string | null = null
) {
  // Check if exists
  const existe = await prisma.planEstablecimientoDet.findFirst({
    where: {
      planEstablecimientoId: planPropioId,
      tienCod,
      grteCod,
      codAsignatura,
      especialidad
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
        esPropio: true,
        categoria, // ADDED CATEGORIA
        especialidad
      }
    });
  }
}`;

code = code.replace(target, rep);
fs.writeFileSync('src/app/actions.ts', code);
