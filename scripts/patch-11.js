const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const target = `                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría de Asignatura</label>
                      <select 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098]"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                      >
                        <option value="BASE">Plan Base (Adicional / Electiva)</option>
                        <option value="JEC">Horas de Libre Disposición (JEC)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Sirve para ordenar visualmente la matriz del plan.</p>
                    </div>`;

const rep = `                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría de Asignatura</label>
                      <select 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098]"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                      >
                        <option value="BASE">Plan Base (Adicional / Electiva)</option>
                        <option value="JEC">Horas de Libre Disposición (JEC)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Sirve para ordenar visualmente la matriz del plan.</p>
                    </div>

                    {plan?.establecimiento?.especialidades?.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Módulo / Especialidad TP</label>
                        <select 
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098]"
                          value={especialidad}
                          onChange={(e) => setEspecialidad(e.target.value)}
                        >
                          <option value="">-- Ninguna Especialidad --</option>
                          {plan.establecimiento.especialidades.map((e: string) => (
                            <option key={e} value={e}>{e}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Si es una asignatura Técnica que varía por especialidad, selecciónela aquí.</p>
                      </div>
                    )}`;

code = code.replace(target, rep);
fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
