const fs = require('fs');
let code = fs.readFileSync('src/app/carga/docentes/page.tsx', 'utf8');

const oldCalc = /horasLectivasAsignadas = cargaDocente\.filter\(c => c\.tipoCarga === 'LECTIVA'\)\.reduce\(\(sum, c\) => sum \+ \(c\.horasAllocadas \|\| c\.horas \|\| 0\), 0\);/;

const newCalc = `      const lectivasDocente = cargaDocente.filter(c => c.tipoCarga === 'LECTIVA');
      let tmpLectivas = 0;
      const combinadosDoc: Record<string, number[]> = {};
      lectivasDocente.forEach(c => {
        if (c.esCombinado && c.grupoCombinado) {
          const g = c.grupoCombinado.toUpperCase().trim();
          const asig = c.asignaturaCod || c.codAsignatura || 'GEN';
          const key = \`\${asig}_\${g}\`;
          if (!combinadosDoc[key]) combinadosDoc[key] = [];
          combinadosDoc[key].push(c.horasAllocadas || c.horas || 0);
        } else {
          tmpLectivas += (c.horasAllocadas || c.horas || 0);
        }
      });
      for (const key in combinadosDoc) {
        tmpLectivas += Math.max(...combinadosDoc[key]);
      }
      horasLectivasAsignadas = tmpLectivas;`;

code = code.replace(oldCalc, newCalc);
fs.writeFileSync('src/app/carga/docentes/page.tsx', code);
