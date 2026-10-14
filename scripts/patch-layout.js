const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

// 1. Agrandar modal
code = code.replace(/max-w-2xl/g, 'max-w-4xl');
code = code.replace(/max-h-\[60vh\]/g, 'max-h-[80vh]');

// 2. Reestructurar tab individual
const regexUI = /\{modalTab === 'individual' && \(\s*<div className="space-y-5">[\s\S]*?<\/div>\s*\)\}/;

const replUI = `{modalTab === 'individual' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
                  
                  {/* COLUMNA IZQUIERDA: Filtros y Cursos */}
                  <div className="flex flex-col gap-5 h-full">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Enseñanza</label>
                      <select 
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098]"
                        value={asigTienCod}
                        onChange={(e) => {
                          setAsigTienCod(Number(e.target.value));
                          setAsigGrteCods([]); // reset grades
                        }}
                      >
                        <option value="">Seleccione...</option>
                        {uniqueTiposEnsenanza.map(t => (
                          <option key={t.tienCod} value={t.tienCod}>{t.tienDescripcion}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Cursos Destino (Múltiple)</label>
                      <div className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm overflow-y-auto custom-scrollbar bg-white">
                        {!asigTienCod ? (
                          <div className="text-gray-400 text-center mt-10">Seleccione Tipo Enseñanza</div>
                        ) : (
                          availableGradesForForm.map((g: any) => (
                            <label key={g.grteCod} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 text-[#016098]"
                                checked={asigGrteCods.includes(g.grteCod)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAsigGrteCods([...asigGrteCods, g.grteCod]);
                                  } else {
                                    setAsigGrteCods(asigGrteCods.filter(c => c !== g.grteCod));
                                  }
                                }}
                              />
                              <span className="text-gray-800">{g.grteDescrip}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
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
                  </div>

                  {/* COLUMNA DERECHA: Asignaturas */}
                  <div className="flex flex-col h-full min-h-0">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Asignatura</label>
                    <input 
                      type="text"
                      placeholder="Buscar por nombre o código..."
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm mb-2 focus:outline-none focus:border-[#016098]"
                      value={searchAsig}
                      onChange={(e) => setSearchAsig(e.target.value)}
                    />
                    
                    <div className="flex-1 border border-gray-200 rounded-lg overflow-y-auto custom-scrollbar bg-white">
                      {filteredAsignaturas.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">No se encontraron asignaturas.</div>
                      ) : (
                        <div className="flex flex-col">
                          {filteredAsignaturas.map(a => (
                            <label key={a.asigCod} className={\`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 \${asigCod === a.asigCod ? 'bg-sky-50' : ''}\`}>
                              <input 
                                type="radio" 
                                name="asignatura" 
                                className="w-4 h-4 text-[#016098] shrink-0"
                                checked={asigCod === a.asigCod}
                                onChange={() => setAsigCod(a.asigCod)}
                              />
                              <span className="text-sm text-gray-800 font-medium leading-tight">
                                <span className="text-gray-400 font-mono text-xs mr-2">[{a.asigCod}]</span>
                                {a.asigDescripcion}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}`;

if (regexUI.test(code)) {
  code = code.replace(regexUI, replUI);
  fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
  console.log("Success");
} else {
  console.log("Regex not found!");
}
