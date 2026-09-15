import sys

with open('src/app/establecimiento/planes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

import re

# We want to replace from `<tbody>` to `</tbody>`
# Let's find exactly the `<tbody>` block inside the table

old_block = """                    <tbody>
                      {matriz.filas.map((fila, fIdx) => {
                        let sumaFila = 0;
                        
                        return (
                          <tr key={fila.asigCod} className={`${fIdx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]'} group`}>
                            <td className="px-4 py-3 font-semibold text-[#1e293b] border-b border-r border-[#e2e8f0] sticky left-0 z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] flex justify-between items-center">
                              <span className="truncate pr-2">{fila.asigDescripcion}</span>
                              <button 
                                onClick={() => handleEliminarFila(fila.asigCod, matriz.tipo.tienCod)}
                                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                title="Eliminar Asignatura"
                              >
                                🗑️
                              </button>
                            </td>
                            {matriz.columnas.map(col => {
                              const cellData = matriz.matrizDatos.get(`${fila.asigCod}-${col.grteCod}`);
                              // Solo sumar en Total Horas los grados especialistas (5º+)
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
                                          <span className={`text-lg font-bold ${cellData.horas > 0 ? 'text-[#016098]' : 'text-red-400'}`}>
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
                            <td className="px-4 py-3 font-bold border-b border-r border-[#e2e8f0] text-center bg-[#f8fafc] text-[#0f766e]">
                              {(() => {
                                // Cálculo de docentes requeridos
                                // Si es generalista no se divide aquí (ya se cuenta en la fila de generalistas)
                                if (sumaFila > 0) {
                                  const req = sumaFila / 28.6;
                                  return req.toFixed(1);
                                }
                                return '-';
                              })()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>"""


new_block = """                    <tbody>
                      {(() => {
                        const filasDecreto = matriz.filas.filter((f: any) => !f._esPropio);
                        const filasAdicionales = matriz.filas.filter((f: any) => f._esPropio && f._categoria === 'BASE');
                        const filasJec = matriz.filas.filter((f: any) => f._esPropio && f._categoria === 'JEC');
                        
                        const renderGroup = (filasGrupo: any[], titulo: string, bgClass: string) => {
                          if (filasGrupo.length === 0) return null;
                          return (
                            <>
                              <tr className={bgClass}>
                                <td colSpan={matriz.columnas.length + 3} className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-700 border-b border-gray-300 sticky left-0 z-10">
                                  {titulo}
                                </td>
                              </tr>
                              {filasGrupo.map((fila: any, fIdx: number) => {
                                let sumaFila = 0;
                                return (
                                  <tr key={fila.asigCod} className={`${fIdx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]'} group`}>
                                    <td className="px-4 py-3 font-semibold text-[#1e293b] border-b border-r border-[#e2e8f0] sticky left-0 z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] flex justify-between items-center">
                                      <span className="truncate pr-2">{fila.asigDescripcion}</span>
                                      <button 
                                        onClick={() => handleEliminarFila(fila.asigCod, matriz.tipo.tienCod)}
                                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        title="Eliminar Asignatura"
                                      >
                                        🗑️
                                      </button>
                                    </td>
                                    {matriz.columnas.map((col: any) => {
                                      const cellData = matriz.matrizDatos.get(`${fila.asigCod}-${col.grteCod}`);
                                      // Solo sumar en Total Horas los grados especialistas (5º+)
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
                                                  <span className={`text-lg font-bold ${cellData.horas > 0 ? 'text-[#016098]' : 'text-red-400'}`}>
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
                                    <td className="px-4 py-3 font-bold border-b border-r border-[#e2e8f0] text-center bg-[#f8fafc] text-[#0f766e]">
                                      {(() => {
                                        // Cálculo de docentes requeridos
                                        if (sumaFila > 0) {
                                          const req = sumaFila / 28.6;
                                          return req.toFixed(1);
                                        }
                                        return '-';
                                      })()}
                                    </td>
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
                    </tbody>"""

# In case encoding has issues, let's use regex with DOTALL to replace just the block between <tbody> and </tbody>
import re
code_new = re.sub(r'<tbody>.*?</tbody>', new_block, code, flags=re.DOTALL)

with open('src/app/establecimiento/planes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code_new)

print("done render tbody")
