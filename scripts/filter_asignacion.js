const fs = require('fs');

let c = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

c = c.replace(
  "import { getDocentes, getGrados, getAsignaturasPropiasPorGrado } from '../../actions';",
  "import { getDocentesEstablecimiento, getGradosEstablecimiento, getAsignaturasPropiasPorGrado } from '../../actions';"
);

c = c.replace(
  "getDocentes().then(setDocentes);",
  "getDocentesEstablecimiento(2).then(setDocentes);"
);

c = c.replace(
  "getGrados().then(setGrados);",
  "getGradosEstablecimiento(2).then(setGrados);"
);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', c);
