import re

with open('src/app/establecimiento/planes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix 1: granTotalReales
old_grand_total = r"let sumaCol = 0;\s*m\.filas\.forEach\(\(f: any\) => \{\s*const cData = m\.matrizDatos\.get\(`\$\{f\.asigCod\}-\$\{f\._especialidad \|\| 'NONE'\}-\$\{col\.grteCod\}`\);\s*if \(cData\) sumaCol \+= cData\.horas;\s*\}\);\s*granTotalReales \+= sumaCol \* \(col\.cantidadCursos \|\| 0\);"

new_grand_total = """let sumaColReal = 0;
                  m.filas.forEach((f: any) => {
                    const cData = m.matrizDatos.get(`${f.asigCod}-${f._especialidad || 'NONE'}-${col.grteCod}`);
                    if (cData) sumaColReal += (cData.horas * (cData.grupos ?? col.cantidadCursos ?? 0));
                  });
                  granTotalReales += sumaColReal;"""

code = re.sub(old_grand_total, new_grand_total, code)

# Fix 2: totalHorasRealesNivel
old_col_total = r"let sumaColumna = 0;\s*matriz\.filas\.forEach\(\(f: any\) => \{\s*const cData = matriz\.matrizDatos\.get\(`\$\{f\.asigCod\}-\$\{f\._especialidad \|\| 'NONE'\}-\$\{col\.grteCod\}`\);\s*if \(cData\) sumaColumna \+= cData\.horas;\s*\}\);\s*const real = sumaColumna \* \(col\.cantidadCursos \|\| 0\);"

new_col_total = """let real = 0;
                          matriz.filas.forEach((f: any) => {
                            const cData = matriz.matrizDatos.get(`${f.asigCod}-${f._especialidad || 'NONE'}-${col.grteCod}`);
                            if (cData) real += cData.horas * (cData.grupos ?? col.cantidadCursos ?? 0);
                          });"""

code = re.sub(old_col_total, new_col_total, code)

with open('src/app/establecimiento/planes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Grid calculations fixed.")
