const fs = require('fs');
let code = fs.readFileSync('src/app/carga/matriz-clasica/page.tsx', 'utf8');

const regex = /docentesMap\[d\.id\] = \{\s*\.\.\.d,\s*contrato,\s*colacion,\s*asignaturasBase: \{\},\s*asignaturasJec: \{\},\s*anls: \{\},\s*extras: \{\},\s*totalAnlCrono: 0,\s*totalExtraCrono: 0\s*\};/;

const replacement = `docentesMap[d.id] = {
      ...d,
      contrato,
      colacion,
      asignaturasBase: {},
      asignaturasJec: {},
      _combinadosBase: {},
      _combinadosJec: {},
      anls: {},
      extras: {},
      totalAnlCrono: 0,
      totalExtraCrono: 0
    };`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/app/carga/matriz-clasica/page.tsx', code);
