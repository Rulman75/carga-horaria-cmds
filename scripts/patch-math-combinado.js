const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const regex = /const horasLectivasAsignadas = cargasVivas\.filter\(c => c\.tipoCarga === 'LECTIVA'\)\.reduce\(\(sum, c\) => sum \+ c\.horas, 0\);/;

const replacement = `const calcularHorasLectivas = (cargasArray) => {
      const lectivas = cargasArray.filter(c => c.tipoCarga === 'LECTIVA');
      let total = 0;
      const combinados = {};
      lectivas.forEach(c => {
        if (c.esCombinado && c.grupoCombinado) {
          const g = c.grupoCombinado.toUpperCase().trim();
          if (!combinados[g]) combinados[g] = [];
          combinados[g].push(c.horas);
        } else {
          total += c.horas;
        }
      });
      for (const g in combinados) {
        total += Math.max(...combinados[g]);
      }
      return total;
    };
    const horasLectivasAsignadas = calcularHorasLectivas(cargasVivas);`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
