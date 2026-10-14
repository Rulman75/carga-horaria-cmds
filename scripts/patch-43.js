const fs = require('fs');
let code = fs.readFileSync('src/app/carga/matriz-clasica/page.tsx', 'utf8');

const search = `      docentesMap[d.id] = {
        ...d,
        contrato,
        colacion,
        asignaturasBase: {},
        asignaturasJec: {},
        anls: {},
        extras: {},
        totalAnlCrono: 0,
        totalExtraCrono: 0
      };`;

const replace = `      docentesMap[d.id] = {
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

code = code.replace(search, replace);

fs.writeFileSync('src/app/carga/matriz-clasica/page.tsx', code);
