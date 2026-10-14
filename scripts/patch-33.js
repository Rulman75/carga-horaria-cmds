const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const regex = /const renderGroup = \(filasGrupo: any\[\], titulo: string, bgClass: string\) => \{[\s\S]*?return \([\s\S]*?<>[\s\S]*?\{renderGroup\(filasDecreto/m;

const replacement = `const renderGroup = (filasGrupo: any[], titulo: string, bgClass: string) => {
                          if (filasGrupo.length === 0) return null;
                          
                          const grouped = new Map<string, any[]>();
                          grouped.set('GLOBAL', []);
                          filasGrupo.forEach(f => {
                            const esp = f._especialidad || 'GLOBAL';
                            if (!grouped.has(esp)) grouped.set(esp, []);
                            grouped.get(esp)!.push(f);
                          });

                          return (
                            <>
                              <tr className={bgClass}>
                                <td colSpan={matriz.columnas.length + 3} className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-700 border-b border-gray-300 sticky left-0 z-10">
                                  {titulo}
                                </td>
                              </tr>
                              {Array.from(grouped.entries()).map(([esp, filasDeEspecialidad]) => {
                                if (filasDeEspecialidad.length === 0) return null;
                                return (
                                <React.Fragment key={esp}>
                                  {esp !== 'GLOBAL' && (
                                    <tr className="bg-blue-50/50">
                                      <td colSpan={matriz.columnas.length + 3} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-900 border-b border-blue-200 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        ↳ MÓDULO / ESPECIALIDAD: {esp}
                                      </td>
                                    </tr>
                                  )}
                                  {filasDeEspecialidad.map((fila: any, fIdx: number) => {
                                    let sumaFila = 0;
                                    const rowKey = fila.asigCod + '-' + (fila._especialidad || 'NONE');
                                    return (
                                      <tr key={rowKey} className={\`\${fIdx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]'} group\`}>
                                        <td className="px-4 py-3 font-semibold text-[#1e293b] border-b border-r border-[#e2e8f0] sticky left-0 z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] flex justify-between items-center">
                                          <div className="flex flex-col gap-1 w-full truncate pr-2">
                                              <span className="truncate">{fila.asigDescripcion}</span>
                                              {plan?.establecimiento?.especialidades?.length > 0 && fila._esPropio && (
                                                <select 
                                                  value={fila._especialidad || ''}
                                                  onChange={(e) => handleEspecialidadChange(fila.asigCod, fila._especialidad || null, e.target.value)}
                                                  className="text-[10px] border border-gray-200 rounded p-0.5 max-w-fit focus:outline-none focus:border-[#016098] bg-blue-50 text-blue-800 font-bold">
                                                  <option value="">- Global (Sin Especialidad) -</option>
                                                  {plan.establecimiento.especialidades.map((e: string) => (
                                                    <option key={e} value={e}>{e}</option>
                                                  ))}
                                                </select>
                                              )}
                                            </div>
                                          <button 
                                            onClick={() => handleEliminarFila(fila.asigCod, matriz.tipo.tienCod, fila._especialidad)}
                                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                            title="Eliminar Asignatura">
                                            🗑️
                                          </button>
                                        </td>
                                        {matriz.columnas.map((col: any) => {
                                          const cellData = matriz.matrizDatos.get(\`\${fila.asigCod}-\${fila._especialidad || 'NONE'}-\${col.grteCod}\`);
                                          if (cellData && (col.grteCod > 40 || isEspecialistaAsig(fila))) sumaFila += (cellData.horas * (col.cantidadCursos || 0));
                                          return (
                                            <td key={col.grteCod} className="border-b border-r border-[#e2e8f0] text-center p-0 align-middle">
                                              {cellData ? (
                                                <div className="w-full h-full min-h-[48px] flex items-center justify-center hover:bg-[#e0f2fe] transition-colors">
                                                  <input type="number" min="0" max="44" step="0.5" className="w-12 h-8 text-center border border-gray-300 rounded text-sm focus:border-[#016098] focus:ring-1 focus:ring-[#016098]" value={cellData.horas || ''} onChange={(e) => handleHourChange(cellData.id, e.target.value)} />
                                                </div>
                                              ) : (
                                                <div className="w-full h-full min-h-[48px] flex items-center justify-center bg-gray-50/50 hover:bg-[#e0f2fe] transition-colors cursor-pointer" onClick={() => handleEmptyCellClick(matriz.tipo.tienCod, col.grteCod, fila.asigCod, fila._categoria, fila._esPropio, fila._especialidad)} title="Clic para habilitar esta asignatura en este grado">
                                                  <span className="text-transparent hover:text-[#016098] opacity-50">+</span>
                                                </div>
                                              )}
                                            </td>
                                          );
                                        })}
                                        <td className="border-b border-l-2 border-l-[#016098] border-[#e2e8f0] text-center font-bold text-[#016098] bg-[#f8fafc]">
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
                                  })}
                                </React.Fragment>
                                )})}
                            </>
                          );
                        };

                        return (
                          <>
                            {renderGroup(filasDecreto`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
