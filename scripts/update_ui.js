import fs from 'fs';

let c = fs.readFileSync('src/app/establecimiento/config/page.tsx', 'utf8');

c = c.replace(
  `import { getEstablecimientoConfig, updateEstablecimientoConfig, getGrados } from '../../actions';`,
  `import { getEstablecimientoConfig, updateEstablecimientoConfig, getGrados, getTiposEnsenanza } from '../../actions';`
);

c = c.replace(
  `  const [gradosDotacion, setGradosDotacion] = useState<any[]>([]);\n  const [todosGrados, setTodosGrados] = useState<any[]>([]);`,
  `  const [gradosDotacion, setGradosDotacion] = useState<any[]>([]);\n  const [todosGrados, setTodosGrados] = useState<any[]>([]);\n  const [todosTipos, setTodosTipos] = useState<any[]>([]);\n  const [tiposSeleccionados, setTiposSeleccionados] = useState<number[]>([]);`
);

c = c.replace(
  `      const config = await getEstablecimientoConfig(establecimientoId);\n      const allGrados = await getGrados();\n      \n      setTodosGrados(allGrados);\n      \n      if (config) {\n        setEsJec(config.esJec);\n        setGradosDotacion(config.grados);\n      }`,
  `      const config = await getEstablecimientoConfig(establecimientoId);\n      const allGrados = await getGrados();\n      const allTipos = await getTiposEnsenanza();\n      \n      setTodosGrados(allGrados);\n      setTodosTipos(allTipos);\n      \n      if (config) {\n        setEsJec(config.esJec);\n        setGradosDotacion(config.grados);\n        setTiposSeleccionados(config.tiposEnsenanza.map((t: any) => t.tienCod));\n      }`
);

c = c.replace(
  `await updateEstablecimientoConfig(establecimientoId, esJec, payload);`,
  `await updateEstablecimientoConfig(establecimientoId, esJec, payload, tiposSeleccionados);`
);

const target5 = `      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0]">
        <h3 className="font-semibold text-[#1e293b] mb-4">Régimen Horario</h3>`;

const replacement5 = `      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0]">
        <h3 className="font-semibold text-[#1e293b] mb-4">Tipos de Enseñanza Impartidos</h3>
        <p className="text-sm text-gray-500 mb-4">Selecciona los niveles educativos que posee el establecimiento.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {todosTipos.map(tipo => (
            <label key={tipo.tienCod} className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input 
                type="checkbox" 
                checked={tiposSeleccionados.includes(tipo.tienCod)}
                onChange={(e) => {
                  if (e.target.checked) setTiposSeleccionados([...tiposSeleccionados, tipo.tienCod]);
                  else setTiposSeleccionados(tiposSeleccionados.filter(t => t !== tipo.tienCod));
                }}
                className="w-4 h-4 text-[#016098] rounded border-gray-300 focus:ring-[#016098]"
              />
              <span className="text-sm text-[#1e293b] font-medium">{tipo.tienDescripcion}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0]">
        <h3 className="font-semibold text-[#1e293b] mb-4">Régimen Horario</h3>`;

c = c.replace(target5, replacement5);

c = c.replace(
  `        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todosGrados.map(grado => (`,
  `        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todosGrados.filter(g => tiposSeleccionados.includes(g.tienCod)).map(grado => (`
);

fs.writeFileSync('src/app/establecimiento/config/page.tsx', c);
