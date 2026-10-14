const fs = require('fs');
let lines = fs.readFileSync('src/app/actions.ts', 'utf8').split('\n');
const startIndex = lines.findIndex(l => l.includes('export async function agregarAsignaturaIndividualPropio('));
const endIndex = lines.findIndex((l, i) => i > startIndex && l === '}');

const repLines = `export async function agregarAsignaturaIndividualPropio(
  planPropioId: number, 
  tienCod: number, 
  grteCod: number, 
  codAsignatura: string,
  categoria: string = 'BASE',
  especialidad: string | null = null
) {
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
        horas: 0,
        obligatoria: 'NO',
        formacion: 'General',
        esPropio: true,
        categoria,
        especialidad
      }
    });
  }
}`.split('\n');

lines.splice(startIndex, endIndex - startIndex + 1, ...repLines);
fs.writeFileSync('src/app/actions.ts', lines.join('\n'));
