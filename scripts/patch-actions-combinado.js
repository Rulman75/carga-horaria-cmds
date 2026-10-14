const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

code = code.replace(
  /grupoDesdoble: c\.grupoDesdoble \|\| null,/,
  `grupoDesdoble: c.grupoDesdoble || null,
          esCombinado: c.esCombinado || false,
          grupoCombinado: c.grupoCombinado || null,`
);

fs.writeFileSync('src/app/actions.ts', code);
