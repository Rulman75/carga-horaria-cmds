const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const anchor = `                                    </tr>
                                  );
                                })}
                                </React.Fragment>`;

const replacement = `                                    </tr>
                                  );
                                })}
                                  {esp !== 'GLOBAL' && filasDeEspecialidad.length > 0 && (() => {
                                    return (
                                      <tr className="bg-sky-50 font-bold text-[#016098] border-b-2 border-b-[#016098] shadow-sm">
                                        <td className="px-4 py-2 text-right border-r border-[#e2e8f0] sticky left-0 z-10 bg-sky-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] uppercase tracking-wider text-xs">
                                          Total {esp}
                                        </td>
                                        {matriz.columnas.map((col: any) => {
                                          let sumCol = 0;
                                          filasDeEspecialidad.forEach((f: any) => {
                                            const cData = matriz.matrizDatos.get(\`\${f.asigCod}-\${f._especialidad || 'NONE'}-\${col.grteCod}\`);
                                            if (cData) sumCol += cData.horas;
                                          });
                                          return (
                                            <td key={\`sub-\${col.grteCod}\`} className="text-center px-4 py-2 border-r border-blue-200 text-sm">
                                              {sumCol > 0 ? sumCol : ''}
                                            </td>
                                          );
                                        })}
                                        <td className="px-4 py-2 font-black border-l-2 border-l-[#016098] border-r border-[#e2e8f0] text-center min-w-[120px] bg-sky-100 text-[#016098] text-lg">
                                          {(() => {
                                            let totalReal = 0;
                                            matriz.columnas.forEach((col: any) => {
                                              filasDeEspecialidad.forEach((f: any) => {
                                                const cData = matriz.matrizDatos.get(\`\${f.asigCod}-\${f._especialidad || 'NONE'}-\${col.grteCod}\`);
                                                if (cData && (col.grteCod > 40 || isEspecialistaAsig(f))) {
                                                  totalReal += (cData.horas * (col.cantidadCursos || 0));
                                                }
                                              });
                                            });
                                            return totalReal > 0 ? totalReal : '-';
                                          })()}
                                        </td>
                                        <td className="border-b border-l border-[#e2e8f0] px-3 py-2 bg-sky-50"></td>
                                      </tr>
                                    );
                                  })()}
                                </React.Fragment>`;

if (code.includes(anchor)) {
    code = code.replace(anchor, replacement);
    fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
    console.log("Successfully replaced block.");
} else {
    console.log("Anchor not found!");
}
