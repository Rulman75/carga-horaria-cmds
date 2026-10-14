const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

// We need to restore clonarPlanEstudioBase to handle it correctly.
const regexClone = /const esGradoJec = isJecMap\.has\(key\) \? isJecMap\.get\(key\) : \(estab\?\.esJec \|\| false\);\s*return \{/g;
const replacementClone = `const esGradoJec = isJecMap.has(key) ? isJecMap.get(key) : (estab?.esJec || false);
            const hrsFinales = esGradoJec ? (det.horasCJ || 0) : (det.horasSJ || 0);
            if (hrsFinales === 0) return null;
            return {`;

code = code.replace(regexClone, replacementClone);

// Filter out nulls before returning array
const regexMap = /detallesFiltrados\.map\(\(det: any\) => \{/;
const replacementMap = `detallesFiltrados.map((det: any) => {`;
code = code.replace(regexMap, replacementMap);

const regexFilterNull = /\}\)\s*\}\s*\}\);\s*return planPropio;/;
const replacementFilterNull = `}).filter(d => d !== null)
        }
      }
    });

    return planPropio;`;
code = code.replace(regexFilterNull, replacementFilterNull);

fs.writeFileSync('src/app/actions.ts', code);
