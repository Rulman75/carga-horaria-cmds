const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');
code = code.replace(/c\.asignaturaCod \|\| c\.codAsignatura \|\| 'GEN'/g, "c.asignaturaCod || 'GEN'");
fs.writeFileSync('src/app/actions.ts', code);
