import re

with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# The original mapping logic
old_logic = r"` \+ cargasVivas\.filter\(c => c\.tipoCarga === 'LECTIVA'\)\.map\(c => \n\s*\"<tr><td class='center'>\" \+ getGradoNombre\(c\.tienCod, c\.grteCod\) \+ \(c\.letraCurso \? \" \" \+ c\.letraCurso : \"\"\) \+ \"</td>\" \+\n\s*\"<td class='center'>\" \+ \(todasAsignaturas\.find\(a => a\.asigCod === c\.codAsignatura\)\?\.asigDescripcion \|\| c\.nombre\) \+ \(c\.especialidad \? ` \(\$\{c\.especialidad\}\)` : \"\"\) \+ \"</td>\" \+\n\s*\"<td class='center'>\" \+ c\.horas \+ \"</td></tr>\"\n\s*\)\.join\(''\) \+ `"

new_logic = """` + (() => {
              const lectivas = cargasVivas.filter(c => c.tipoCarga === 'LECTIVA');
              const normales = [];
              const combinados = {};
              
              lectivas.forEach(c => {
                if (c.esCombinado && c.grupoCombinado) {
                  const asig = c.codAsignatura || 'GEN';
                  const key = `${asig}_${c.grupoCombinado.toUpperCase().trim()}`;
                  if (!combinados[key]) combinados[key] = [];
                  combinados[key].push(c);
                } else {
                  normales.push(c);
                }
              });

              let rowsHtml = '';
              
              // Render normales
              normales.forEach(c => {
                rowsHtml += "<tr><td class='center'>" + getGradoNombre(c.tienCod, c.grteCod) + (c.letraCurso ? " " + c.letraCurso : "") + "</td>" +
                            "<td class='center'>" + (todasAsignaturas.find(a => a.asigCod === c.codAsignatura)?.asigDescripcion || c.nombre) + (c.especialidad ? ` (${c.especialidad})` : "") + "</td>" +
                            "<td class='center'>" + c.horas + "</td></tr>";
              });

              // Render combinados
              for (const key in combinados) {
                const arr = combinados[key];
                const asigObj = todasAsignaturas.find(a => a.asigCod === arr[0].codAsignatura);
                const asigName = asigObj ? asigObj.asigDescripcion : arr[0].nombre;
                const especialidad = arr[0].especialidad ? ` (${arr[0].especialidad})` : "";
                const cursosComb = arr.map(c => getGradoNombre(c.tienCod, c.grteCod) + (c.letraCurso ? " " + c.letraCurso : "")).join(" + ");
                const maxHoras = Math.max(...arr.map(c => c.horas));
                rowsHtml += "<tr><td class='center' style='font-size: 11px;'>" + cursosComb + "</td>" +
                            "<td class='center'>" + asigName + especialidad + " <span style='font-size: 10px; color: #666;'>(Multigrado)</span></td>" +
                            "<td class='center'>" + maxHoras + "</td></tr>";
              }
              
              return rowsHtml;
            })() + `"""

if re.search(old_logic, code):
    code = re.sub(old_logic, new_logic, code)
    with open('src/app/carga/asignacion/page.tsx', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Logic replaced successfully.")
else:
    print("Could not find the target code to replace.")
