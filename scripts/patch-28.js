const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const t = `const renderGroup = (filasGrupo: any[], titulo: string, bgClass: string) => {
                          if (filasGrupo.length === 0) return null;
                          return (
                            <>
                              <tr className={bgClass}>
                                <td colSpan={matriz.columnas.length + 3} className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-700 border-b border-gray-300 sticky left-0 z-10">
                                  {titulo}
                                </td>
                              </tr>
                              {filasGrupo.map((fila: any, fIdx: number) => {`;

const r = `const renderGroup = (filasGrupo: any[], titulo: string, bgClass: string) => {
                          if (filasGrupo.length === 0) return null;
                          
                          // Group by especialidad
                          const grouped = new Map<string, any[]>();
                          
                          // Always put GLOBAL first
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
                              {Array.from(grouped.entries()).map(([esp, filasDeEspecialidad], gIdx) => {
                                if (filasDeEspecialidad.length === 0) return null;
                                return (
                                <React.Fragment key={esp}>
                                  {esp !== 'GLOBAL' && (
                                    <tr className="bg-blue-50/50">
                                      <td colSpan={matriz.columnas.length + 3} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-900 border-b border-blue-100 sticky left-0 z-10 flex items-center gap-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                        ESPECIALIDAD: {esp}
                                      </td>
                                    </tr>
                                  )}
                                  {filasDeEspecialidad.map((fila: any, fIdx: number) => {`;

code = code.replace(t, r);
fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
