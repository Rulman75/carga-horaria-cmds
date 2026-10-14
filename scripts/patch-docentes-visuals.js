const fs = require('fs');
let code = fs.readFileSync('src/app/carga/docentes/page.tsx', 'utf8');

// 1. Import
code = code.replace(
  /getTablaConversion \} from '\.\.\/\.\.\/actions';/,
  `getTablaConversion, getCargasEstablecimiento } from '../../actions';`
);

// 2. State
code = code.replace(
  /const \[docentes, setDocentes\] = useState<any\[\]>\(\[\]\);/,
  `const [docentes, setDocentes] = useState<any[]>([]);\n  const [todasCargas, setTodasCargas] = useState<any[]>([]);`
);

// 3. Load
code = code.replace(
  /getDocentesEstablecimiento\(estId\)\.then\(setDocentes\);/,
  `getDocentesEstablecimiento(estId).then(setDocentes);\n    getCargasEstablecimiento(estId).then(setTodasCargas);`
);

// 4. Render Row & Button
const trMatch = /<tr key=\{docente\.id\} className="border-b border-\[\#e2e8f0\] hover:bg-\[\#f8fafc\] transition-colors\s*whitespace-nowrap">/;
code = code.replace(trMatch, 
  `{(() => {
    const tieneCarga = todasCargas.some(c => c.docenteId === docente.id);
    return (
      <tr key={docente.id} className={\`border-b border-[#e2e8f0] transition-colors whitespace-nowrap \${tieneCarga ? 'bg-emerald-50/40 hover:bg-emerald-100/50' : 'bg-white hover:bg-[#f8fafc]'}\`}>`
);

const trCloseMatch = /<\/tr>\s*\}\)\}/;
code = code.replace(trCloseMatch, `</tr>\n    );\n  })()}\n                })}`);

const buttonMatch = /<button onClick=\{\(\) => handleVerCarga\(docente\)\} className=\"text-emerald-600 hover:text-emerald-800 text-xs font-medium bg-emerald-50 px-2 py-1 rounded\">Ver Carga<\/button>/;
code = code.replace(buttonMatch,
  `<button onClick={() => handleVerCarga(docente)} className={\`text-xs font-medium px-2 py-1 rounded border transition-colors \${tieneCarga ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border-emerald-300 shadow-sm' : 'text-gray-500 bg-gray-50 hover:bg-gray-100 border-gray-200'}\`}>{tieneCarga ? 'Ver Carga (Activa)' : 'Ver Carga (Vacía)'}</button>`
);

fs.writeFileSync('src/app/carga/docentes/page.tsx', code);
