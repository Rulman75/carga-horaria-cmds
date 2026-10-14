const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/config/page.tsx', 'utf8');

// State
code = code.replace(/const \[esJec, setEsJec\] = useState\(false\);/, "const [esJec, setEsJec] = useState(false);\n  const [especialidades, setEspecialidades] = useState<string[]>([]);\n  const [newEspec, setNewEspec] = useState('');");

// loadData
code = code.replace(/setEsJec\(config\.esJec\);/, "setEsJec(config.esJec);\n      setEspecialidades(config.especialidades || []);");

// handleSave
code = code.replace(/await updateEstablecimientoConfig\(establecimientoId!, esJec, datosGuardar, tiposGuardar, letrasGuardar\);/, "await updateEstablecimientoConfig(establecimientoId!, esJec, datosGuardar, tiposGuardar, letrasGuardar, especialidades);");

// UI Section
const uiTarget = /<\/div>\s*<\/div>\s*<div className=\"flex justify-end gap-3\">/;
const uiReplacement = `</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0]">
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">Especialidades (Formación Técnico Profesional)</h2>
            <p className="text-sm text-[#64748b] mb-4">Si el establecimiento imparte carreras o módulos técnicos (Ej: Contabilidad, Mecánica), configúrelos aquí para poder separar las asignaturas.</p>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={newEspec}
                onChange={e => setNewEspec(e.target.value)}
                placeholder="Nombre de la especialidad" 
                className="border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm flex-1"
                onKeyDown={e => {
                  if (e.key === 'Enter' && newEspec.trim()) {
                    setEspecialidades([...especialidades, newEspec.trim().toUpperCase()]);
                    setNewEspec('');
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (newEspec.trim()) {
                    setEspecialidades([...especialidades, newEspec.trim().toUpperCase()]);
                    setNewEspec('');
                  }
                }}
                className="bg-[#016098] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#014d7a]"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {especialidades.map((esp, i) => (
                <div key={i} className="bg-[#f1f5f9] border border-[#cbd5e1] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  <span>{esp}</span>
                  <button onClick={() => setEspecialidades(especialidades.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 font-bold">×</button>
                </div>
              ))}
              {especialidades.length === 0 && <span className="text-sm text-[#94a3b8]">No hay especialidades configuradas.</span>}
            </div>
          </div>

          <div className="flex justify-end gap-3">`;

code = code.replace(uiTarget, uiReplacement);
fs.writeFileSync('src/app/establecimiento/config/page.tsx', code);
