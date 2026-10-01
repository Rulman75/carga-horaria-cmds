const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

// Fix 1
code = code.replace(
  /const g = c\.grupoCombinado\.toUpperCase\(\)\.trim\(\);\s*if \(\!combinados\[g\]\) combinados\[g\] = \[\];\s*combinados\[g\]\.push\(c\);/g,
  `const g = c.grupoCombinado.toUpperCase().trim();
            const asig = c.asignaturaCod || c.codAsignatura || 'GEN';
            const key = \`\${asig}_\${g}\`;
            if (!combinados[key]) combinados[key] = [];
            combinados[key].push(c);`
);

// Fix 2
code = code.replace(
  /const g = c\.grupoCombinado\.toUpperCase\(\)\.trim\(\);\s*if \(\!combinadosRpt\[g\]\) combinadosRpt\[g\] = \[\];\s*combinadosRpt\[g\]\.push\(c\.horasAllocadas\);/g,
  `const g = c.grupoCombinado.toUpperCase().trim();
              const asig = c.asignaturaCod || c.codAsignatura || 'GEN';
              const key = \`\${asig}_\${g}\`;
              if (!combinadosRpt[key]) combinadosRpt[key] = [];
              combinadosRpt[key].push(c.horasAllocadas);`
);

fs.writeFileSync('src/app/actions.ts', code);
