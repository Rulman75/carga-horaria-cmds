const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const t = `                                  <React.Fragment key={esp}>
                                    {esp !== 'GLOBAL' && (
                                      <tr className="bg-blue-50/50">
                                        <td colSpan={matriz.columnas.length + 3} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-900 border-b border-blue-200 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                          ↳ MÓDULO / ESPECIALIDAD: {esp}
                                        </td>
                                      </tr>
                                    )}`;

const r = `                                  <React.Fragment key={esp}>
                                    {(esp !== 'GLOBAL' || (titulo.includes('Adicional') && grouped.size > 1)) && (
                                      <tr className={esp === 'GLOBAL' ? 'bg-gray-100' : 'bg-blue-50/50'}>
                                        <td colSpan={matriz.columnas.length + 3} className={\`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest \${esp === 'GLOBAL' ? 'text-gray-600 border-gray-200' : 'text-blue-900 border-blue-200'} border-b sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]\`}>
                                          ↳ {esp === 'GLOBAL' ? 'GLOBAL (SIN ESPECIALIDAD)' : \`MÓDULO / ESPECIALIDAD: \${esp}\`}
                                        </td>
                                      </tr>
                                    )}`;

code = code.replace(t, r);
fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
