const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/config/page.tsx', 'utf8');

const target = `      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6 mb-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={esJec} 
            onChange={(e) => handleGlobalJecChange(e.target.checked)}
            className="w-5 h-5 text-[#016098] border-gray-300 rounded focus:ring-[#016098]" 
          />
          <span className="text-lg font-medium text-[#1e293b]">Establecimiento Adscrito a Jornada Escolar Completa (JEC)</span>
        </label>
      </div>`;

const rep = `      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6 mb-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={esJec} 
            onChange={(e) => handleGlobalJecChange(e.target.checked)}
            className="w-5 h-5 text-[#016098] border-gray-300 rounded focus:ring-[#016098]" 
          />
          <span className="text-lg font-medium text-[#1e293b]">Establecimiento Adscrito a Jornada Escolar Completa (JEC)</span>
        </label>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6 mb-4">
        <h2 className="text-lg font-bold text-[#016098] mb-2">Especialidades (Opcional - TP)</h2>
        <p className="text-sm text-gray-500 mb-4">Solo para formación Técnico Profesional. Agregue especialidades (ej: CONTABILIDAD) para separar las asignaturas base por módulo.</p>
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newEspec}
            onChange={e => setNewEspec(e.target.value)}
            placeholder="Nueva Especialidad" 
            className="border border-[#cbd5e1] rounded-lg px-3 py-2 text-sm max-w-xs focus:outline-none focus:border-[#016098]"
            onKeyDown={e => {
              if (e.key === 'Enter' && newEspec.trim()) {
                if(!especialidades.includes(newEspec.trim().toUpperCase())) {
                  setEspecialidades([...especialidades, newEspec.trim().toUpperCase()]);
                }
                setNewEspec('');
              }
            }}
          />
          <button 
            onClick={() => {
              if (newEspec.trim() && !especialidades.includes(newEspec.trim().toUpperCase())) {
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
              <span className="text-[#1e293b]">{esp}</span>
              <button onClick={() => setEspecialidades(especialidades.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 font-bold">×</button>
            </div>
          ))}
          {especialidades.length === 0 && <span className="text-sm text-[#94a3b8]">No hay especialidades configuradas.</span>}
        </div>
      </div>`;

code = code.replace(target, rep);
fs.writeFileSync('src/app/establecimiento/config/page.tsx', code);
