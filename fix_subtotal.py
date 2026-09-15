import sys
import re

with open('src/app/establecimiento/planes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_renderGroup_end = """                                  </tr>
                                );
                              })}
                            </>
                          );
                        };"""

new_renderGroup_end = """                                  </tr>
                                );
                              })}
                              <tr className="bg-gray-100/80 border-t border-b-2 border-b-gray-300/50 font-bold text-gray-600 text-xs shadow-inner">
                                <td className="px-4 py-2 border-r border-[#e2e8f0] text-right uppercase sticky left-0 z-10 bg-gray-100/90 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                  Subtotal {titulo}
                                </td>
                                {matriz.columnas.map((col: any) => {
                                  let sumaCol = 0;
                                  filasGrupo.forEach((f: any) => {
                                    const cData = matriz.matrizDatos.get(`${f.asigCod}-${col.grteCod}`);
                                    if (cData) sumaCol += cData.horas;
                                  });
                                  return (
                                    <td key={col.grteCod} className="border-r border-[#e2e8f0] text-center p-2 text-sm text-gray-600">
                                      {sumaCol > 0 ? sumaCol : '-'}
                                    </td>
                                  );
                                })}
                                {(() => {
                                  let sumTotal = 0;
                                  filasGrupo.forEach((f: any) => {
                                    matriz.columnas.forEach((col: any) => {
                                      const cData = matriz.matrizDatos.get(`${f.asigCod}-${col.grteCod}`);
                                      if (cData && (col.grteCod > 40 || isEspecialistaAsig(f))) {
                                        sumTotal += (cData.horas * (col.cantidadCursos || 0));
                                      }
                                    });
                                  });
                                  return (
                                    <>
                                      <td className="px-4 py-2 border-l-2 border-l-[#016098] border-r border-[#e2e8f0] text-center bg-gray-200/50 text-gray-700">
                                        {sumTotal > 0 ? sumTotal : '-'}
                                      </td>
                                      <td className="px-4 py-2 border-r border-[#e2e8f0] text-center bg-gray-200/50 text-gray-700">
                                        {sumTotal > 0 ? (sumTotal / 28.6).toFixed(1) : '-'}
                                      </td>
                                    </>
                                  );
                                })()}
                              </tr>
                            </>
                          );
                        };"""

code = code.replace(old_renderGroup_end, new_renderGroup_end)

# Also rename the footer text from "Horas del Plan Base (Por Nivel)" to "Total Horas (Por Nivel)"
old_footer = "Horas del Plan Base (Por Nivel)"
new_footer = "Total Horas (Por Nivel)"
code = code.replace(old_footer, new_footer)

old_footer_suffix = "hrs base"
new_footer_suffix = "hrs totales"
code = code.replace(old_footer_suffix, new_footer_suffix)

with open('src/app/establecimiento/planes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done subtotal")
