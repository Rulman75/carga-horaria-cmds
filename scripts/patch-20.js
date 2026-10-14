const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

code = code.replace(
  /let sumaFila = 0;\n\s*return \(/g,
  "let sumaFila = 0;\n                                const rowKey = fila.asigCod + '-' + (fila._especialidad || 'NONE');\n                                return ("
);

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
