const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

// Step 1: Remove the existing Desdoble block
code = code.replace(
  /<div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">[\s\S]*?\{\s*modoAsignacion === 'GENERALISTA'/g,
  `{modoAsignacion === 'GENERALISTA'`
);

// Step 2: Inject it below the ternary, adding col-span-2
code = code.replace(
  /<\/select>\s*<\/div>\s*\)\}\s*<\/div>\s*<div className=\"flex-1 overflow-auto p-4 custom-scrollbar\">/,
  `</select>
                         </div>
                       )}

                      <div className="col-span-2 flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={esDesdobleUI} onChange={e => setEsDesdobleUI(e.target.checked)} className="rounded border-gray-300 text-[#016098] focus:ring-[#016098]" />
                          <span className="text-sm font-semibold text-gray-700">Es Grupo Paralelo (Desdoble/Dupla)</span>
                        </label>
                        {esDesdobleUI && (
                          <input type="text" placeholder="Ej: Damas, Varones, Violín" value={grupoDesdobleUI} onChange={e => setGrupoDesdobleUI(e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm flex-1" />
                        )}
                      </div>
                    </div>
  
                    <div className="flex-1 overflow-auto p-4 custom-scrollbar">`
);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
