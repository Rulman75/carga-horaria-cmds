import re

with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(
    r"export async function getSchoolAnalytics\(establecimientoId: number\) \{\s*const tablaConversion = await prisma\.tablaConversion\.findMany\(\);",
    r"export async function getSchoolAnalytics(establecimientoId: number) {\n  const est = await prisma.establecimiento.findUnique({ where: { esedSec: establecimientoId } });\n  const establecimientoNombre = est?.esedDescripcion || \"Establecimiento\";\n  const tablaConversion = await prisma.tablaConversion.findMany();",
    code
)

code = re.sub(
    r"return \{\s*totalDocentes: rels\.length,",
    r"return {\n    establecimientoNombre,\n    totalDocentes: rels.length,",
    code
)

with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
