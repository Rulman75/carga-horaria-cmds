const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/config/page.tsx', 'utf8');

code = code.replace(
  /await updateEstablecimientoConfig\(establecimientoId!, esJec, payload, \[\], cursosLetra\);/,
  "await updateEstablecimientoConfig(establecimientoId!, esJec, payload, [], cursosLetra, especialidades);"
);

fs.writeFileSync('src/app/establecimiento/config/page.tsx', code);
