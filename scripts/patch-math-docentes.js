const fs = require('fs');
let code = fs.readFileSync('src/app/carga/docentes/page.tsx', 'utf8');

const regex = /horasLectivasAsignadas = cargaDocente\.filter\(c => c\.tipoCarga === 'LECTIVA'\)\.reduce\(\(sum, c\) => sum \+ \(\c\.horasAllocadas \|\| c\.horas \|\| 0\), 0\);/;

const replacement = `const calcularHorasLectivas = (cargasArray) => {
      const lectivas = cargasArray.filter(c => c.tipoCarga === 'LECTIVA');
      let total = 0;
      const combinados = {};
      lectivas.forEach(c => {
        const hs = c.horasAllocadas || c.horas || 0;
        if (c.esCombinado && c.grupoCombinado) {
          const g = c.grupoCombinado.toUpperCase().trim();
          if (!combinados[g]) combinados[g] = [];
          combinados[g].push(hs);
        } else {
          total += hs;
        }
      });
      for (const g in combinados) {
        total += Math.max(...combinados[g]);
      }
      return total;
    };
    horasLectivasAsignadas = calcularHorasLectivas(cargaDocente);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/app/carga/docentes/page.tsx', code);
