const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

code = code.replace(/let sumaFila = 0;[\s\n\r]*return \(/g, `let sumaFila = 0;
                                const rowKey = fila.asigCod + '-' + (fila._especialidad || 'NONE');
                                return (`);

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
