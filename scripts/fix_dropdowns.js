const fs = require('fs');
let content = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

content = content.replace(
  "const [gradoSeleccionado, setGradoSeleccionado] = useState('');",
  "const [tipoEnsenanzaSeleccionado, setTipoEnsenanzaSeleccionado] = useState('');\n  const [gradoSeleccionado, setGradoSeleccionado] = useState('');"
);

const helper = `
  const tiposEnsenanzaUnicos = Array.from(new Set(grados.map(g => g.tienCod))).map(tienCod => {
    return grados.find(g => g.tienCod === tienCod)?.tipoEnsenanza;
  }).filter(Boolean);
  
  const gradosFiltrados = tipoEnsenanzaSeleccionado 
    ? grados.filter(g => g.tienCod.toString() === tipoEnsenanzaSeleccionado)
    : [];
`;

content = content.replace(
  "const ESTABLECIMIENTO_ID = 2; // Hardcoded multi-tenant",
  "const ESTABLECIMIENTO_ID = 2; // Hardcoded multi-tenant\n" + helper
);

const oldDropdowns = `      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#e2e8f0]">
          <label className="block text-sm font-medium text-[#64748b] mb-1">Seleccionar Docente</label>
          <select 
            className="w-full border border-[#e2e8f0] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098]"
            value={docenteSeleccionado}
            onChange={(e) => setDocenteSeleccionado(e.target.value)}
          >
            <option value="">Seleccione un docente...</option>
            {docentes.map(d => (
              <option key={d.id} value={d.id}>{d.nombres} {d.apellidos} ({d.horasTitular || 0} Hrs)</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#e2e8f0]">
          <label className="block text-sm font-medium text-[#64748b] mb-1">Seleccionar Grado</label>
          <select 
            className="w-full border border-[#e2e8f0] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098]"
            value={gradoSeleccionado}
            onChange={(e) => setGradoSeleccionado(e.target.value)}
          >
            <option value="">Seleccione un grado...</option>
            {grados.map(g => (
              <option key={\`\${g.tienCod}-\${g.grteCod}\`} value={\`\${g.tienCod}-\${g.grteCod}\`}>
                {g.tipoEnsenanza?.tienDescripcion} - {g.grteDescrip}
              </option>
            ))}
          </select>
        </div>
      </div>`;

const newDropdowns = `      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#e2e8f0]">
          <label className="block text-sm font-medium text-[#64748b] mb-1">Seleccionar Docente</label>
          <select 
            className="w-full border border-[#e2e8f0] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098]"
            value={docenteSeleccionado}
            onChange={(e) => setDocenteSeleccionado(e.target.value)}
          >
            <option value="">Seleccione un docente...</option>
            {docentes.map(d => (
              <option key={d.id} value={d.id}>{d.nombres} {d.apellidos} ({d.horasTitular || 0} Hrs)</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#e2e8f0]">
          <label className="block text-sm font-medium text-[#64748b] mb-1">Tipo de Enseñanza</label>
          <select 
            className="w-full border border-[#e2e8f0] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098]"
            value={tipoEnsenanzaSeleccionado}
            onChange={(e) => {
              setTipoEnsenanzaSeleccionado(e.target.value);
              setGradoSeleccionado('');
            }}
          >
            <option value="">Seleccione tipo...</option>
            {tiposEnsenanzaUnicos.map((t: any) => (
              <option key={t.tienCod} value={t.tienCod}>
                {t.tienDescripcion}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#e2e8f0]">
          <label className="block text-sm font-medium text-[#64748b] mb-1">Grado / Curso</label>
          <select 
            className="w-full border border-[#e2e8f0] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#016098]"
            value={gradoSeleccionado}
            onChange={(e) => setGradoSeleccionado(e.target.value)}
            disabled={!tipoEnsenanzaSeleccionado}
          >
            <option value="">Seleccione un grado...</option>
            {gradosFiltrados.map(g => (
              <option key={\`\${g.tienCod}-\${g.grteCod}\`} value={\`\${g.tienCod}-\${g.grteCod}\`}>
                {g.grteDescrip}
              </option>
            ))}
          </select>
        </div>
      </div>`;

content = content.replace(oldDropdowns, newDropdowns);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', content);
