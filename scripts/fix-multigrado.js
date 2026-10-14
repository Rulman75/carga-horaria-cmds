const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

// Fix hydration bug
code = code.replace(
  'grupoDesdoble: c.grupoDesdoble || undefined,',
  'grupoDesdoble: c.grupoDesdoble || undefined,\n            esCombinado: c.esCombinado || false,\n            grupoCombinado: c.grupoCombinado || undefined,'
);

// Fix calculation bug
const oldCalc = `  const calcularHorasLectivas = (cargasArray: any[]) => {
      const lectivas = cargasArray.filter(c => c.tipoCarga === 'LECTIVA');
      let total = 0;
      const combinados: Record<string, number[]> = {};
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
    };`;

const newCalc = `  const calcularHorasLectivas = (cargasArray: any[]) => {
      const lectivas = cargasArray.filter(c => c.tipoCarga === 'LECTIVA');
      let total = 0;
      const combinados: Record<string, number[]> = {};
      lectivas.forEach(c => {
        if (c.esCombinado && c.grupoCombinado) {
          const g = c.grupoCombinado.toUpperCase().trim();
          const asig = c.codAsignatura || 'GEN';
          const key = \`\${asig}_\${g}\`;
          if (!combinados[key]) combinados[key] = [];
          combinados[key].push(c.horas);
        } else {
          total += c.horas;
        }
      });
      for (const key in combinados) {
        total += Math.max(...combinados[key]);
      }
      return total;
    };`;

code = code.replace(oldCalc, newCalc);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
