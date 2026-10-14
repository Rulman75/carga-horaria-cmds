const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

code = code.replace(
  /grupoDesdoble\?: string;/,
  "grupoDesdoble?: string;\n  especialidad?: string;"
);

code = code.replace(
  /codAsignatura: det\.codAsignatura,/,
  "codAsignatura: det.codAsignatura,\n        especialidad: det.especialidad,"
);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
