const fs = require('fs');
let code = fs.readFileSync('src/app/carga/docentes/page.tsx', 'utf8');

code = code.replace(
  /c\.grado\?\.grado\?\.grteDescrip/g,
  `c.grado?.grteDescrip`
);

fs.writeFileSync('src/app/carga/docentes/page.tsx', code);
