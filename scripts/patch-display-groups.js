const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

code = code.replace(
  /if \(c\.letraCurso\) nombre \+= ` \(\$\{c\.letraCurso\}\)`;\s*if \(c\.financiamiento && c\.financiamiento !== 'Normal'\) nombre \+= ` \[\$\{c\.financiamiento\}\]`;/,
  `if (c.letraCurso) nombre += \` (\${c.letraCurso})\`;
            if (c.esDesdoble) nombre += \` [\${c.grupoDesdoble || 'Grupo'}]\`;
            if (c.financiamiento && c.financiamiento !== 'Normal') nombre += \` [\${c.financiamiento}]\`;`
);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
