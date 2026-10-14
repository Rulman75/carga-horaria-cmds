const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

// 1. Fix clonarPlanEstudioBase
const cloneRegex = /create: detallesFiltrados\.map\(\(det: any\) => \{\s*const key = \`\$\{det\.tienCod\}-\$\{det\.grteCod\}\`;\s*const esGradoJec = isJecMap\.has\(key\) \? isJecMap\.get\(key\) : \(estab\?\.esJec \|\| false\);\s*return \{/g;
const cloneRepl = `create: detallesFiltrados.map((det: any) => {
          const key = \`\${det.tienCod}-\${det.grteCod}\`;
          const esGradoJec = isJecMap.has(key) ? isJecMap.get(key) : (estab?.esJec || false);
          const hrsFinales = esGradoJec ? (det.horasCJ || 0) : (det.horasSJ || 0);
          if (hrsFinales === 0) return null;
          return {`;
code = code.replace(cloneRegex, cloneRepl);

code = code.replace(
  /horas: esGradoJec \? \(det\.horasCJ \|\| 0\) : \(det\.horasSJ \|\| 0\),/g,
  `horas: hrsFinales,`
);

const filterRegex = /esPropio: false\s*\}\s*\}\)/;
const filterRepl = `esPropio: false
          }
        }).filter((d: any) => d !== null)`;
code = code.replace(filterRegex, filterRepl);

// 2. Fix importarPlanBaseAPropio
const importRegex = /const esGradoJec = isJecMap\.has\(key\) \? isJecMap\.get\(key\) : \(planPropio\.establecimiento\?\.esJec \|\| false\);\s*await prisma\.planEstablecimientoDet\.create\(\{/;
const importRepl = `const esGradoJec = isJecMap.has(key) ? isJecMap.get(key) : (planPropio.establecimiento?.esJec || false);
      const hrsFinales = esGradoJec ? (det.horasCJ || 0) : (det.horasSJ || 0);
      if (hrsFinales === 0) continue;
      
      await prisma.planEstablecimientoDet.create({`;
code = code.replace(importRegex, importRepl);

fs.writeFileSync('src/app/actions.ts', code);
