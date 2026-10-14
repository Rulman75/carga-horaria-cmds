const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

// Replace assignedToMe logic
code = code.replace(
  /const assignedToMe = cargasVivas\.some\(c => \s*c\.codAsignatura === det\.codAsignatura && \s*c\.tienCod === det\.tienCod && \s*c\.grteCod === det\.grteCod && \s*c\.letraCurso === l\s*\);/g,
  `const assignedToMe = cargasVivas.some(c => 
    c.codAsignatura === det.codAsignatura && 
    c.tienCod === det.tienCod && 
    c.grteCod === det.grteCod && 
    c.letraCurso === l &&
    (!esDesdobleUI || c.grupoDesdoble === (grupoDesdobleUI || 'Grupo'))
  );`
);

// Replace disabled condition
code = code.replace(
  /disabled=\{!docenteSeleccionado \|\| restantes < det\.horas \|\| assignedToMe\}/g,
  `disabled={!docenteSeleccionado || (!esDesdobleUI && restantes < det.horas) || assignedToMe}`
);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
