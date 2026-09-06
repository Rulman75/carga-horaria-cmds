import fs from 'fs';

let c = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

// We will find the entire <table ...> ... </table> string and replace it.
const tableStart = c.indexOf('<table className="w-full text-sm text-left border-collapse">');
const tableEnd = c.indexOf('</table>', tableStart) + 8;

if (tableStart === -1 || tableEnd === -1) {
  console.log("Error finding table block");
  process.exit(1);
}

const newTable = `<table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-[#f8fafc] text-[#64748b]">
                    <tr>
                      <th className="px-4 py-3 font-bold border-b border-r border-[#e2e8f0] bg-white sticky left-0 z-10 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        Asignatura
                      </th>
                      {matriz.columnas.map(col => (
                        <th key={col.grteCod} className="px-4 py-3 font-semibold border-b border-r border-[#e2e8f0] text-center min-w-[100px] group relative">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span>{col.grteDescrip}</span>
                            <button 
                              onClick={() => handleEliminarColumna(matriz.tipo.tienCod, col.grteCod)}
                              className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                              title="Eliminar Curso Completo"
                            >
                              🗑️
                            </button>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 font-bold border-b border-l-2 border-l-[#016098] border-[#e2e8f0] text-center min-w-[120px] bg-sky-50 text-[#016098]">
                        Total Horas
                      </th>
                      <th className="px-4 py-3 font-bold border-b border-r border-[#e2e8f0] text-center min-w-[120px] bg-emerald-50 text-emerald-800">
                        Docentes Esp.
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {matriz.filas.map((fila, fIdx) => {
                      let sumaFila = 0;
                      
                      return (
                        <tr key={fila.asigCod} className={\`\${fIdx % 2 === 0 ? 'bg-white' : 'bg-[#fcfcfc]'} group\`}>
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
                            const cellData = matriz.matrizDatos.get(\`\${fila.asigCod}-\${col.grteCod}\`);
                            if (cellData) sumaFila += (cellData.horas * (col.cantidadCursos || 0));

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
                          <td className="border-b border-l-2 border-l-[#016098] border-[#e2e8f0] text-center align-middle bg-sky-50 font-bold text-[#016098] p-2">
                            <span className="text-lg">{sumaFila}</span> <span className="text-xs font-normal">hrs</span>
                          </td>
                          <td className="border-b border-r border-[#e2e8f0] text-center align-middle bg-emerald-50 font-bold text-emerald-700 p-2">
                            {sumaFila > 0 ? (
                              <span>{(sumaFila / 28.6).toFixed(1)} <span className="text-xs font-normal">Doc.</span></span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  
                  {/* FOOTER TOTALS */}
                  <tfoot className="bg-[#f1f5f9] font-bold text-[#1e293b]">
                    <tr>
                      <td className="px-4 py-3 border-r border-[#e2e8f0] text-right sticky left-0 bg-[#f1f5f9] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        Horas del Plan Base (Por Nivel)
                      </td>
                      {matriz.columnas.map(col => {
                        let sumaColumna = 0;
                        matriz.filas.forEach(f => {
                          const cData = matriz.matrizDatos.get(\`\${f.asigCod}-\${col.grteCod}\`);
                          if (cData) sumaColumna += cData.horas;
                        });
                        totalHorasNivel += sumaColumna;
                        return (
                          <td key={\`total-\${col.grteCod}\`} className="px-4 py-3 border-r border-[#e2e8f0] text-center text-[#016098] text-lg">
                            {sumaColumna}
                          </td>
                        );
                      })}
                      <td colSpan={2} className="px-4 py-3 border-l-2 border-l-[#016098] border-[#e2e8f0] text-center bg-[#e0f2fe] text-[#0369a1] text-xl">
                        {totalHorasNivel} hrs base
                      </td>
                    </tr>
                    
                    <tr className="bg-[#f8fafc] text-gray-500 text-xs">
                      <td className="px-4 py-2 border-r border-[#e2e8f0] text-right sticky left-0 bg-[#f8fafc] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        Dotación de Cursos
                      </td>
                      {matriz.columnas.map(col => (
                        <td key={\`dot-\${col.grteCod}\`} className="px-4 py-2 border-r border-[#e2e8f0] text-center">
                          x {col.cantidadCursos} cursos
                        </td>
                      ))}
                      <td colSpan={2} className="px-4 py-2 border-l-2 border-l-[#016098] border-[#e2e8f0] bg-sky-50 text-center"></td>
                    </tr>

                    <tr className="bg-[#016098] text-white">
                      <td className="px-4 py-4 border-r border-[#016098] text-right uppercase tracking-wider text-xs sticky left-0 bg-[#016098] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        Total Horas Docentes Requeridas
                      </td>
                      {matriz.columnas.map(col => {
                        let sumaColumna = 0;
                        matriz.filas.forEach(f => {
                          const cData = matriz.matrizDatos.get(\`\${f.asigCod}-\${col.grteCod}\`);
                          if (cData) sumaColumna += cData.horas;
                        });
                        const real = sumaColumna * (col.cantidadCursos || 0);
                        totalHorasRealesNivel += real;
                        
                        return (
                          <td key={\`real-\${col.grteCod}\`} className="px-4 py-4 border-r border-[#014d7a] text-center text-xl">
                            {real}
                          </td>
                        );
                      })}
                      <td colSpan={2} className="px-4 py-4 border-l-2 border-l-[#0369a1] text-center text-2xl bg-[#0369a1]">
                        {totalHorasRealesNivel} <span className="text-sm font-normal">hrs reales</span>
                      </td>
                    </tr>
                    
                    {/* Row 4: Estimacion Docentes */}
                    <tr className="bg-[#f1f5f9] text-[#1e293b]">
                      <td className="px-4 py-2 border-r border-[#e2e8f0] text-right sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <div className="text-sm">Estimación Docentes (Contratos 44 Hrs)</div>
                        <div className="text-[10px] font-normal text-gray-500">* Asumiendo proporción 65/35 (28.6 hrs lectivas)</div>
                      </td>
                      {matriz.columnas.map(col => {
                        let sumaColumna = 0;
                        matriz.filas.forEach(f => {
                          const cData = matriz.matrizDatos.get(\`\${f.asigCod}-\${col.grteCod}\`);
                          if (cData) sumaColumna += cData.horas;
                        });
                        const real = sumaColumna * (col.cantidadCursos || 0);
                        const docentes = (real / 28.6).toFixed(1);
                        return (
                          <td key={\`doc-\${col.grteCod}\`} className="px-4 py-2 border-r border-[#e2e8f0] text-center text-sm font-bold text-gray-600">
                            {docentes}
                          </td>
                        );
                      })}
                      <td colSpan={2} className="px-4 py-2 border-l-2 border-l-[#016098] border-[#e2e8f0] text-center bg-emerald-100 text-emerald-800 font-bold text-lg">
                        {(totalHorasRealesNivel / 28.6).toFixed(1)} Docentes en Total
                      </td>
                    </tr>
                  </tfoot>
                </table>`;

c = c.substring(0, tableStart) + newTable + c.substring(tableEnd);

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', c);
