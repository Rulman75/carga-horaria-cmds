const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

const regex = /isJecMap\.set\(\`\$\{g\.tienCod\}-\$\{g\.grteCod\}\`, g\.esJec\);/g;
console.log('Matches:', code.match(regex));

code = code.replace(regex, 'if (g.cantidadCursos > 0) { isJecMap.set(`${g.tienCod}-${g.grteCod}`, g.esJec); }');
fs.writeFileSync('src/app/actions.ts', code);
