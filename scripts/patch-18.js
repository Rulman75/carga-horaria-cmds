const fs = require('fs');
let code = fs.readFileSync('src/app/carga/matriz-clasica/page.tsx', 'utf8');

code = code.replace(
  /const asigDesc = c\.asignatura\?\.asigDescripcion \|\| 'Desconocida';/g,
  "const asigDesc = (c.asignatura?.asigDescripcion || 'Desconocida') + (c.especialidad ? ` (${c.especialidad})` : '');"
);

fs.writeFileSync('src/app/carga/matriz-clasica/page.tsx', code);
