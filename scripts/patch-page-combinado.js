const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

// 1. Add state variables
code = code.replace(
  /const \[grupoDesdobleUI, setGrupoDesdobleUI\] = useState\(''\);/,
  `const [grupoDesdobleUI, setGrupoDesdobleUI] = useState('');
  const [esCombinadoUI, setEsCombinadoUI] = useState(false);
  const [grupoCombinadoUI, setGrupoCombinadoUI] = useState('');`
);

// 2. Update CargaEnUI type (if it exists) to include esCombinado. We will just trust it allows it, since it's an any array in many places, but let's check if CargaEnUI is defined.
// Assuming it is, we will update the payload in handleAsignarLectiva.
code = code.replace(
  /esDesdoble: esDesdobleUI,\s*grupoDesdoble: esDesdobleUI \? \(grupoDesdobleUI \|\| 'Grupo'\) : undefined,/,
  `esDesdoble: esDesdobleUI,
        grupoDesdoble: esDesdobleUI ? (grupoDesdobleUI || 'Grupo') : undefined,
        esCombinado: esCombinadoUI,
        grupoCombinado: esCombinadoUI ? (grupoCombinadoUI || 'Comb1') : undefined,`
);

// 3. Update 'nombre' generation when assigning
code = code.replace(
  /nombre: det\.asignatura\?\.asigDescripcion \+ \(letra \? \` \(\$\{letra\}\)\` : ''\) \+ \(esDesdobleUI \? \` \[\$\{grupoDesdobleUI \|\| 'Grupo'\}\]\` : ''\) \+ \(finanSeleccionado !== 'Normal' \? \` \[\$\{finanSeleccionado\}\]\` : ''\),/,
  `nombre: det.asignatura?.asigDescripcion + (letra ? \` (\${letra})\` : '') + (esDesdobleUI ? \` [\${grupoDesdobleUI || 'Grupo'}]\` : '') + (esCombinadoUI ? \` {Multigrado: \${grupoCombinadoUI || 'Comb1'}}\` : '') + (finanSeleccionado !== 'Normal' ? \` [\${finanSeleccionado}]\` : ''),`
);

// 4. Update 'nombre' reconstruction in useEffect
code = code.replace(
  /if \(c\.esDesdoble\) nombre \+= \` \[\$\{c\.grupoDesdoble \|\| 'Grupo'\}\]\`;/,
  `if (c.esDesdoble) nombre += \` [\${c.grupoDesdoble || 'Grupo'}]\`;
            if (c.esCombinado) nombre += \` {Multigrado: \${c.grupoCombinado || 'Comb1'}}\`;`
);


// 5. Add UI below EsDesdobleUI
code = code.replace(
  /<\/label>\s*\{esDesdobleUI && \(\s*<input type="text" placeholder="Ej: Damas, Varones, Violín" value=\{grupoDesdobleUI\} onChange=\{e => setGrupoDesdobleUI\(e\.target\.value\)\} className="border border-gray-300 rounded p-1\.5 text-sm flex-1" \/>\s*\)\}\s*<\/div>/,
  `</label>
                          {esDesdobleUI && (
                            <input type="text" placeholder="Ej: Damas, Varones, Violín" value={grupoDesdobleUI} onChange={e => setGrupoDesdobleUI(e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm flex-1" />
                          )}
                        </div>

                        <div className="col-span-2 flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={esCombinadoUI} onChange={e => setEsCombinadoUI(e.target.checked)} className="rounded border-gray-300 text-[#016098] focus:ring-[#016098]" />
                            <span className="text-sm font-semibold text-gray-700">Es Curso Combinado (Multigrado)</span>
                          </label>
                          {esCombinadoUI && (
                            <input type="text" placeholder="Ej: Comb 1, Multigrado A" value={grupoCombinadoUI} onChange={e => setGrupoCombinadoUI(e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm flex-1" />
                          )}
                        </div>`
);

// We need to do the UI replacement TWICE if there are multiple occurrences? No, wait, if there's only one it's fine, but wait, the label for esDesdoble UI might be rendered in the tab "LECTIVA", which is rendered only once. Let's check how many times it occurs. Let's use global regex if safe, or just run it.
fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
