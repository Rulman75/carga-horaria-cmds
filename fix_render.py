import sys

with open('src/app/establecimiento/planes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Modify the asigMap loop to include category info
old_asig = """        const asigMap = new Map<string, any>();
        detallesTipo.forEach((d: any) => {
          if (!asigMap.has(d.codAsignatura) && d.asignatura) {
            asigMap.set(d.codAsignatura, d.asignatura);
          }
        });
        const filas = Array.from(asigMap.values()).sort((a, b) => a.asigDescripcion.localeCompare(b.asigDescripcion));"""

new_asig = """        const asigMap = new Map<string, any>();
        detallesTipo.forEach((d: any) => {
          if (!asigMap.has(d.codAsignatura) && d.asignatura) {
            asigMap.set(d.codAsignatura, { 
              ...d.asignatura, 
              _categoria: d.categoria, 
              _esPropio: d.esPropio 
            });
          }
        });
        const filas = Array.from(asigMap.values()).sort((a, b) => a.asigDescripcion.localeCompare(b.asigDescripcion));"""
code = code.replace(old_asig, new_asig)


# 2. Modify the tbody rendering
# I need to capture the block starting with `{matriz.filas.map((fila, fIdx) => {`
# up to the end of that block before ` {/* GENERALISTAS */}`
import re

old_tbody_pattern = r"\{matriz\.filas\.map\(\(fila, fIdx\) => \{.*?\)\s*\}\s*\{\/\* GENERALISTAS \*\/}"
# Wait, this regex might be tricky. Let me just replace the specific map logic.

old_map = """                    <tbody>
                      {matriz.filas.map((fila, fIdx) => {
                        let sumaFila = 0;"""

new_map = """                    <tbody>
                      {(() => {
                        const filasDecreto = matriz.filas.filter((f: any) => !f._esPropio);
                        const filasAdicionales = matriz.filas.filter((f: any) => f._esPropio && f._categoria === 'BASE');
                        const filasJec = matriz.filas.filter((f: any) => f._esPropio && f._categoria === 'JEC');
                        
                        const renderGroup = (filasGrupo: any[], titulo: string, bgClass: string) => {
                          if (filasGrupo.length === 0) return null;
                          return (
                            <>
                              <tr className={bgClass}>
                                <td colSpan={matriz.columnas.length + 2} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-300 sticky left-0 z-10">
                                  {titulo}
                                </td>
                              </tr>
                              {filasGrupo.map((fila, fIdx) => {
                                let sumaFila = 0;
"""

code = code.replace(old_map, new_map)

old_end_map = """                                </td>
                              </tr>
                            );
                          })}
                      {/* GENERALISTAS */}"""

new_end_map = """                                </td>
                              </tr>
                            );
                          })}
                        </>
                      );
                    };
                    
                    return (
                      <>
                        {renderGroup(filasDecreto, "Plan Base (Decreto)", "bg-[#f1f5f9]")}
                        {renderGroup(filasAdicionales, "Plan Base (Adicional / Electiva)", "bg-[#e0e7ff]")}
                        {renderGroup(filasJec, "Horas de Libre Disposición (JEC)", "bg-[#dcfce7]")}
                      </>
                    );
                  })()}
                      {/* GENERALISTAS */}"""

code = code.replace(old_end_map, new_end_map)

with open('src/app/establecimiento/planes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done render logic")
