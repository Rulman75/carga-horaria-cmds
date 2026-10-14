const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

code = code.replace(
  /grupoCombinado: c\.grupoCombinado \|\| null,/,
  "grupoCombinado: c.grupoCombinado || null,\n          especialidad: c.especialidad || null,"
);

fs.writeFileSync('src/app/actions.ts', code);
