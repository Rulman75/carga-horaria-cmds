const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

const doubleRegex = /export async function agregarAsignaturaIndividualPropio\([\s\S]*?\}[\s\n]*export async function agregarAsignaturaIndividualPropio\([\s\S]*?categoria: string = 'BASE'\s*\)\s*\{\s*\/\/\s*Check if exists[\s\S]*?\}\n\}\n/;

code = code.replace(doubleRegex, `export async function agregarAsignaturaIndividualPropio(
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
}\n`);
fs.writeFileSync('src/app/actions.ts', code);
