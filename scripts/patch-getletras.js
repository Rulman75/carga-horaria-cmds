const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const regex = /const getLetras = \(cantidad: number\) => \{[\s\S]*?\};/;
const repl = `const getLetras = (gInfo: any) => {
    if (gInfo && gInfo.letrasCustom && gInfo.letrasCustom.length > 0) {
      return gInfo.letrasCustom;
    }
    return Array.from({ length: gInfo?.cantidadCursos || 1 }, (_, i) => String.fromCharCode(65 + i));
  };`;
code = code.replace(regex, repl);
fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
