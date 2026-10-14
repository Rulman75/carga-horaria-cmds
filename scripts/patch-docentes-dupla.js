const fs = require('fs');
let code = fs.readFileSync('src/app/carga/docentes/page.tsx', 'utf8');

code = code.replace(
  /\{c\.grado\?\.grteDescrip \|\| ''\} \{c\.letraCurso \|\| ''\}<\/span>/,
  `{c.grado?.grteDescrip || ''} {c.letraCurso || ''} {c.esDesdoble ? \`[\${c.grupoDesdoble || 'Grupo'}]\` : ''}</span>`
);

fs.writeFileSync('src/app/carga/docentes/page.tsx', code);
