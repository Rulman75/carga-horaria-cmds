const fs = require('fs');
let code = fs.readFileSync('src/app/carga/docentes/page.tsx', 'utf8');

code = code.replace(
  /if \(c\.tipoCarga === 'LECTIVA'\) text = c\.asignatura\?\.asigDescripcion \|\| 'Asignatura';/g,
  "if (c.tipoCarga === 'LECTIVA') text = (c.asignatura?.asigDescripcion || 'Asignatura') + (c.especialidad ? ` (${c.especialidad})` : '');"
);

fs.writeFileSync('src/app/carga/docentes/page.tsx', code);
