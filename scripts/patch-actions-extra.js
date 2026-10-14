const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

const oldCreate = /export async function createActividadExtracurricular\(descripcion: string, horasDefault\?: number \| null\) \{\n\s*return await prisma\.actividadExtracurricular\.create\(\{\n\s*data: \{ descripcion, horasDefault: horasDefault \|\| null \}\n\s*\}\);\n\s*\}/m;
const newCreate = `export async function createActividadExtracurricular(descripcion: string, horasDefault?: number | null, topeMaximo?: number | null) {
  return await prisma.actividadExtracurricular.create({
    data: { descripcion, horasDefault: horasDefault || null, topeMaximo: topeMaximo || null }
  });
}`;

const oldUpdate = /export async function updateActividadExtracurricular\(id: number, descripcion: string, horasDefault\?: number \| null\) \{\n\s*return await prisma\.actividadExtracurricular\.update\(\{\n\s*where: \{ id \},\n\s*data: \{ descripcion, horasDefault: horasDefault \|\| null \}\n\s*\}\);\n\s*\}/m;
const newUpdate = `export async function updateActividadExtracurricular(id: number, descripcion: string, horasDefault?: number | null, topeMaximo?: number | null) {
  return await prisma.actividadExtracurricular.update({
    where: { id },
    data: { descripcion, horasDefault: horasDefault || null, topeMaximo: topeMaximo || null }
  });
}`;

code = code.replace(oldCreate, newCreate);
code = code.replace(oldUpdate, newUpdate);

fs.writeFileSync('src/app/actions.ts', code);
