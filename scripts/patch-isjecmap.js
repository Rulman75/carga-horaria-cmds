const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

const target = `const isJecMap = new Map();
    for (const g of estabGrados) {
      isJecMap.set(\`\${g.tienCod}-\${g.grteCod}\`, g.esJec);
    }`;

const replacement = `const isJecMap = new Map();
    for (const g of estabGrados) {
      if (g.cantidadCursos > 0) {
        isJecMap.set(\`\${g.tienCod}-\${g.grteCod}\`, g.esJec);
      }
    }`;

code = code.split(target).join(replacement);

// Check second instance because split might have missed if indentation differs
const target2 = `const isJecMap = new Map();
  for (const g of estabGrados) {
    isJecMap.set(\`\${g.tienCod}-\${g.grteCod}\`, g.esJec);
  }`;

const replacement2 = `const isJecMap = new Map();
  for (const g of estabGrados) {
    if (g.cantidadCursos > 0) {
      isJecMap.set(\`\${g.tienCod}-\${g.grteCod}\`, g.esJec);
    }
  }`;

code = code.split(target2).join(replacement2);

fs.writeFileSync('src/app/actions.ts', code);
