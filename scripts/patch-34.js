const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const regex = /\{matriz\.columnas\.map\(\(col: any\) => \{[\s\S]*?<\/td>\n\s*<\/tr>\n\s*\);\n\s*\}\)}/m;

const replacement = `{matriz.columnas.map((col: any) => {
                                        const cellData = matriz.matrizDatos.get(\`\${fila.asigCod}-\${fila._especialidad || 'NONE'}-\${col.grteCod}\`);
                                        if (cellData && (col.grteCod > 40 || isEspecialistaAsig(fila))) sumaFila += (cellData.horas * (col.cantidadCursos || 0));
                                        
                                        return (
                                          <td key={col.grteCod} className="border-b border-r border-[#e2e8f0] text-center p-0 align-middle">
                                            {cellData ? (
                                              <div className="w-full h-full min-h-[48px] flex items-center justify-center hover:bg-[#e0f2fe] transition-colors">
                                                {editingId === cellData.id ? (
                                                  <div className="flex items-center justify-center p-1">
                                                    <input 
                                                      type="number"
                                                      step="0.5"
                                                      className="w-16 h-8 border-2 border-[#0369a1] rounded text-center font-bold text-[#0369a1] focus:outline-none"
                                                      value={editValue}
                                                      onChange={(e) => setEditValue(e.target.value)}
                                                      autoFocus
                                                      onKeyDown={(e) => e.key === 'Enter' && handleSaveHoras(cellData.id)}
                                                      onBlur={() => handleSaveHoras(cellData.id)}
                                                    />
                                                  </div>
                                                ) : (
                                                  <div 
                                                    className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-2"
                                                    onClick={() => handleEdit(cellData.id, cellData.horas)}
                                                  >
                                                    <span className={\`text-lg font-bold \${cellData.horas > 0 ? 'text-[#016098]' : 'text-red-400'}\`}>
                                                      {cellData.horas}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            ) : (
                                              <div className="w-full h-full min-h-[48px] bg-gray-50 flex items-center justify-center text-gray-300 text-xs">-</div>
                                            )}
                                          </td>
                                        );
                                      })}
                                      <td className="px-4 py-3 font-bold border-b border-l-2 border-l-[#016098] border-r border-[#e2e8f0] text-center bg-[#f8fafc] text-[#016098]">
                                        {sumaFila > 0 ? sumaFila : '-'}
                                      </td>
                                      <td className="border-b border-l border-[#e2e8f0] px-3 py-2">
                                        {(() => {
                                          const asigBase = plan.planBase?.detalles?.find((db: any) => db.codAsignatura === fila.asigCod);
                                          return <span className="text-xs text-gray-500 font-medium">{asigBase ? asigBase.formacion : 'General'}</span>;
                                        })()}
                                      </td>
                                    </tr>
                                  );
                                })}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
