const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

code = code.replace(
  /export async function getCargaDocenteUnico\(docenteId: number, establecimientoId: number\) \{[\s\S]*?actividadExtracurricular: true\s*\}\s*\}\);/,
  `export async function getCargaDocenteUnico(docenteId: number, establecimientoId: number) {
  return await prisma.cargaHoraria.findMany({
    where: {
      docenteId,
      planEstablecimiento: { establecimientoId }
    },
    include: {
      asignatura: true,
      actividadNoLectiva: true,
      actividadExtracurricular: true,
      grado: { include: { tipoEnsenanza: true } }
    }
  });`
);

fs.writeFileSync('src/app/actions.ts', code);
