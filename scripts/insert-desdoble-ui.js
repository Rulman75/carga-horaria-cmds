const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const injection = `</div>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={esDesdobleUI} onChange={e => setEsDesdobleUI(e.target.checked)} className="rounded border-gray-300 text-[#016098] focus:ring-[#016098]" />
                        <span className="text-sm font-semibold text-gray-700">Es Grupo Paralelo (Desdoble/Dupla)</span>
                      </label>
                      {esDesdobleUI && (
                        <input type="text" placeholder="Ej: Damas, Varones, Violín" value={grupoDesdobleUI} onChange={e => setGrupoDesdobleUI(e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm flex-1" />
                      )}
                    </div>`;

code = code.replace(
  /Modo Especialista\s*<\/button>\s*<\/div>\s*<\/div>/,
  `Modo Especialista
                        </button>
                      ${injection}`
);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
