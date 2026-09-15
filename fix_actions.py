import sys

with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    code = f.read()

old_func = """export async function agregarAsignaturaIndividualPropio(
  planPropioId: number, 
  tienCod: number, 
  grteCod: number, 
  codAsignatura: string
) {"""

new_func = """export async function agregarAsignaturaIndividualPropio(
  planPropioId: number, 
  tienCod: number, 
  grteCod: number, 
  codAsignatura: string,
  categoria: string = 'BASE'
) {"""

code = code.replace(old_func, new_func)

old_data = """        data: {
          planEstablecimientoId: planPropioId,
          tienCod,
          grteCod,
          codAsignatura,
          horas: 0, // Starts at 0 so they can edit it in the matrix
          obligatoria: 'NO',
          formacion: 'General',
          esPropio: true
        }"""

new_data = """        data: {
          planEstablecimientoId: planPropioId,
          tienCod,
          grteCod,
          codAsignatura,
          horas: 0, // Starts at 0 so they can edit it in the matrix
          obligatoria: 'NO',
          formacion: 'General',
          esPropio: true,
          categoria
        }"""

code = code.replace(old_data, new_data)

with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("done actions.ts")
