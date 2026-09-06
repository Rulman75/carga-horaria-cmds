import fs from 'fs';

let c = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

c = c.replace('Horas del Plan Base (Por Alumno)', 'Horas del Plan Base (Por Nivel)');
c = c.replace('Total Fila', 'Total Horas por Asignatura');
c = c.replace('if (cellData) sumaFila += cellData.horas;', 'if (cellData) sumaFila += (cellData.horas * (col.cantidadCursos || 0));');

const replacement = `{totalHorasRealesNivel}
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
                      <td className="px-4 py-2 border-l-2 border-l-[#016098] border-[#e2e8f0] text-center bg-[#e0f2fe] text-[#0369a1] font-bold">
                        {(totalHorasRealesNivel / 28.6).toFixed(1)} Docentes
                      </td>
                    </tr>`;

c = c.replace(/\{totalHorasRealesNivel\}\s*<\/td>\s*<\/tr>/g, replacement);

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', c);
