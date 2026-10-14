const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const t = `                                          <span className="truncate">{fila.asigDescripcion}</span>
                                          {plan?.establecimiento?.especialidades?.length > 0 && (`;
const r = `                                          <span className="truncate">{fila.asigDescripcion}</span>
                                          {plan?.establecimiento?.especialidades?.length > 0 && fila._esPropio && (`;

code = code.replace(t, r);
fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
