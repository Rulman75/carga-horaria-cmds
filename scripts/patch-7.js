const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

const asigFunc = `export async function getAllAsignaturas() {
  return await prisma.asignatura.findMany({
    orderBy: { asigDescripcion: 'asc' }
  });
}`;

const idx = code.indexOf(asigFunc);
if (idx > -1) {
  let rest = code.substring(idx + asigFunc.length);
  // Find getAsignaturasPropiasPorGrado
  const nextFuncIdx = rest.indexOf('export async function getAsignaturasPropiasPorGrado');
  if (nextFuncIdx > -1) {
    const beginning = code.substring(0, idx + asigFunc.length);
    const end = rest.substring(nextFuncIdx);
    const newFunc = `\n\nexport async function agregarAsignaturaIndividualPropio(
  planPropioId: number, 
  tienCod: number, 
  grteCod: number, 
  codAsignatura: string,
  categoria: string = 'BASE',
  especialidad: string | null = null
) {
  const existe = await prisma.planEstablecimientoDet.findFirst({
    where: { planEstablecimientoId: planPropioId, tienCod, grteCod, codAsignatura, especialidad }
  });

  if (!existe) {
    await prisma.planEstablecimientoDet.create({
      data: { planEstablecimientoId: planPropioId, tienCod, grteCod, codAsignatura, horas: 0, obligatoria: 'NO', formacion: 'General', esPropio: true, categoria, especialidad }
    });
  }
}\n\n`;
    fs.writeFileSync('src/app/actions.ts', beginning + newFunc + end);
  }
}
