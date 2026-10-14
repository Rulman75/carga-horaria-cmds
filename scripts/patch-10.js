const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

code = code.replace(
  /const \[categoria, setCategoria\] = useState\('BASE'\);/, 
  "const [categoria, setCategoria] = useState('BASE');\n  const [especialidad, setEspecialidad] = useState('');"
);

code = code.replace(
  /asigCod,\s*categoria\s*\);/g,
  "asigCod,\n            categoria,\n            especialidad || null\n          );"
);

code = code.replace(
  /setCategoria\('BASE'\);/g,
  "setCategoria('BASE');\n        setEspecialidad('');"
);

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
