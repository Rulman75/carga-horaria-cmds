const fs = require('fs');

let code = fs.readFileSync('src/app/actions.ts', 'utf8');

code = code.replace(
    'export async function getSchoolAnalytics(establecimientoId: number) {\n  const tablaConversion = await prisma.tablaConversion.findMany();',
    'export async function getSchoolAnalytics(establecimientoId: number) {\n  const est = await prisma.establecimiento.findUnique({ where: { esedSec: establecimientoId } });\n  const establecimientoNombre = est?.esedDescripcion || "Establecimiento";\n  const tablaConversion = await prisma.tablaConversion.findMany();'
);

code = code.replace(
    'return {\n    totalDocentes: rels.length,',
    'return {\n    establecimientoNombre,\n    totalDocentes: rels.length,'
);

fs.writeFileSync('src/app/actions.ts', code);
console.log('actions.ts patched.');
