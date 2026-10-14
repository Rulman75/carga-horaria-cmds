const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

code = code.replace(/nombre = c\.asignatura\?\.asigDescripcion \|\| 'Lectiva';/, "nombre = (c.asignatura?.asigDescripcion || 'Lectiva') + (c.especialidad ? ` (${c.especialidad})` : '');");
code = code.replace(/nombre: det\.asignatura\?\.asigDescripcion \|\| 'Asignatura',/, "nombre: (det.asignatura?.asigDescripcion || 'Asignatura') + (det.especialidad ? ` (${det.especialidad})` : ''),");

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
