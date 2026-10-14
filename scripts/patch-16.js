const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

code = code.replace(
  /codAsignatura: c\.asignaturaCod \|\| undefined,/,
  "codAsignatura: c.asignaturaCod || undefined,\n          especialidad: c.especialidad || undefined,"
);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
