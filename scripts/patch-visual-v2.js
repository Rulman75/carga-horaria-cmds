const fs = require('fs');
let code = fs.readFileSync('src/app/carga/docentes/page.tsx', 'utf8');

// 1. Add state
code = code.replace(
  /const \[docentes, setDocentes\] = useState<any\[\]>\(\[\]\);/,
  `const [docentes, setDocentes] = useState<any[]>([]);
  const [todasCargas, setTodasCargas] = useState<any[]>([]);`
);

// 2. Load it
code = code.replace(
  /getDocentesEstablecimiento\(estId\)\.then\(setDocentes\);/,
  `getDocentesEstablecimiento(estId).then(setDocentes);
    getCargasEstablecimiento(estId).then(setTodasCargas);`
);

// 3. Render
code = code.replace(
  /<tr key=\{docente\.id\} className=\"border-b border-\[\#e2e8f0\] hover:bg-\[\#f8fafc\] transition-colors whitespace-nowrap\">/,
  `<tr key={docente.id} className={\`border-b border-[#e2e8f0] transition-colors whitespace-nowrap \${todasCargas.some(c => c.docenteId === docente.id) ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-white hover:bg-[#f8fafc]'}\`}>`
);

code = code.replace(
  /<button onClick=\{\(\) => handleVerCarga\(docente\)\} className=\"text-emerald-600 hover:text-emerald-800 text-xs font-medium bg-emerald-50 px-2 py-1 rounded\">Ver Carga<\/button>/,
  `<button onClick={() => handleVerCarga(docente)} className={\`text-xs font-medium px-2 py-1 rounded transition-colors \${todasCargas.some(c => c.docenteId === docente.id) ? 'text-emerald-700 bg-emerald-200 hover:bg-emerald-300 shadow-sm border border-emerald-400 font-bold' : 'text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200'}\`}>
                          {todasCargas.some(c => c.docenteId === docente.id) ? 'Ver Carga (Activa)' : 'Ver Carga (Vacía)'}
                        </button>`
);

fs.writeFileSync('src/app/carga/docentes/page.tsx', code);
