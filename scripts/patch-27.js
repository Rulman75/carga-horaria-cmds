const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const target = `<span className="truncate pr-2">{fila.asigDescripcion} {fila._especialidad && <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold tracking-widest uppercase">{fila._especialidad}</span>}</span>`;

const rep = `<div className="flex flex-col gap-1 w-full truncate pr-2">
                                          <span className="truncate">{fila.asigDescripcion}</span>
                                          {plan?.establecimiento?.especialidades?.length > 0 && (
                                            <select 
                                              value={fila._especialidad || ''}
                                              onChange={(e) => handleEspecialidadChange(fila.asigCod, fila._especialidad || null, e.target.value)}
                                              className="text-[10px] border border-gray-200 rounded p-0.5 max-w-fit focus:outline-none focus:border-[#016098] bg-blue-50 text-blue-800 font-bold"
                                            >
                                              <option value="">- Global (Sin Especialidad) -</option>
                                              {plan.establecimiento.especialidades.map((e: string) => (
                                                <option key={e} value={e}>{e}</option>
                                              ))}
                                            </select>
                                          )}
                                        </div>`;

code = code.replace(target, rep);
fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
