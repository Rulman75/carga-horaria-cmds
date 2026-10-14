const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

code = code.replace(/parseInt\(e\.target\.value\) \|\| 1/g, 'parseFloat(e.target.value) || 0');
code = code.replace(/type="number"\s*min="1"/g, 'type="number" step="0.1" min="0"');

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
