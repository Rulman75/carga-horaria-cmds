const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const t = `                                let sumaFila = 0;
                                return (`;

const r = `                                let sumaFila = 0;
                                const rowKey = fila.asigCod + '-' + (fila._especialidad || 'NONE');
                                return (`;

code = code.replace(t, r);
fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
