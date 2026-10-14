const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

code = code.replace(
  /export async function createActividadExtracurricular\(descripcion: string\) \{\s*return await prisma\.actividadExtracurricular\.create\(\{\s*data: \{ descripcion \}\s*\}\);\s*\}/,
  `export async function createActividadExtracurricular(descripcion: string, horasDefault?: number | null) {
  return await prisma.actividadExtracurricular.create({
    data: { descripcion, horasDefault: horasDefault || null }
  });
}`
);

code = code.replace(
  /export async function deleteActividadExtracurricular\(id: number\) \{/,
  `export async function updateActividadExtracurricular(id: number, descripcion: string, horasDefault?: number | null) {
  return await prisma.actividadExtracurricular.update({
    where: { id },
    data: { descripcion, horasDefault: horasDefault || null }
  });
}

export async function deleteActividadExtracurricular(id: number) {`
);

fs.writeFileSync('src/app/actions.ts', code);
