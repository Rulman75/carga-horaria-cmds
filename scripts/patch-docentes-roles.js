const fs = require('fs');
let code = fs.readFileSync('src/app/carga/docentes/page.tsx', 'utf8');

// 1. Add userRol state
code = code.replace(
  /const \[loading, setLoading\] = useState\(false\);/,
  `const [loading, setLoading] = useState(false);
  const [userRol, setUserRol] = useState<string>('');`
);

// 2. Set userRol in useEffect
code = code.replace(
  /const estId = Number\(localStorage\.getItem\('selectedEstablecimientoId'\)\) \|\| 2;/,
  `const estId = Number(localStorage.getItem('selectedEstablecimientoId')) || 2;
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          setUserRol(u.rol || '');
        } catch(e) {}
      }`
);

// 3. Hide Agregar Docente button
code = code.replace(
  /<button onClick=\{\(\) => setShowAddModal\(true\)\} className=\"bg-\[\#39BABD\] hover:bg-\[\#2b9799\] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors\">\s*\+\s*Agregar Docente\s*<\/button>/,
  `{userRol === 'ADMIN' && (
              <button onClick={() => setShowAddModal(true)} className="bg-[#39BABD] hover:bg-[#2b9799] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                + Agregar Docente
              </button>
            )}`
);

// 4. Hide Eliminar Docente button
code = code.replace(
  /<button onClick=\{\(\) => handleDeleteDocente\(docente\.id\)\} className=\"text-red-600 hover:text-red-800 text-xs font-medium bg-red-50 px-2 py-1 rounded\">Eliminar<\/button>/,
  `{userRol === 'ADMIN' && (
                          <button onClick={() => handleDeleteDocente(docente.id)} className="text-red-600 hover:text-red-800 text-xs font-medium bg-red-50 px-2 py-1 rounded">Eliminar</button>
                        )}`
);

fs.writeFileSync('src/app/carga/docentes/page.tsx', code);
