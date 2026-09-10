import sys
with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    code = f.read()

old_fn = """export async function getPlanEstudio(codPlan: number) {
  return await prisma.planEstudioEnc.findUnique({
    where: { codPlan },
    include: {
      detalles: {
        include: {
          asignatura: true,
          tipoEnsenanza: true
        }
      }
    }
  });
}"""

new_fn = """export async function getPlanEstudio(codPlan: number) {
  return await prisma.planEstudioEnc.findUnique({
    where: { codPlan },
    include: {
      detalles: {
        include: {
          asignatura: true,
          tipoEnsenanza: true,
          grado: true
        },
        orderBy: [
          { tienCod: 'asc' },
          { grteCod: 'asc' },
          { codAsignatura: 'asc' }
        ]
      }
    }
  });
}"""

code = code.replace(old_fn, new_fn)

with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
    f.write(code)
print("done")
