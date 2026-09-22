const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

code = code.replace(
  /letraCurso\?:\s*string;/,
  `letraCurso?: string;
  esDesdoble?: boolean;
  grupoDesdoble?: string;`
);

// We need to find where the frontend maps the DB object to CargaEnUI
code = code.replace(
  /letraCurso:\s*c\.letraCurso \|\| undefined,/,
  `letraCurso: c.letraCurso || undefined,
          esDesdoble: c.esDesdoble || false,
          grupoDesdoble: c.grupoDesdoble || undefined,`
);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
