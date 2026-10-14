const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

// Replace standard reduce with Math.max group logic in actions
const regex1 = /docCargas\.forEach\(c => \{\s*if \(c\.tipoCarga === 'LECTIVA'\) \{\s*lectivasPed \+= c\.horasAllocadas;\s*if \(c\.asignatura\?\.esTallerJec\) totalJecAsignadas \+= c\.horasAllocadas;\s*else totalBaseAsignadas \+= c\.horasAllocadas;\s*\}\s*else if \(c\.tipoCarga === 'NO_LECTIVA'\) \{/g;

const repl1 = `const combinados = {};
    docCargas.forEach(c => {
      if (c.tipoCarga === 'LECTIVA') {
        if (c.esCombinado && c.grupoCombinado) {
          const g = c.grupoCombinado.toUpperCase().trim();
          if (!combinados[g]) combinados[g] = [];
          combinados[g].push(c);
        } else {
          lectivasPed += c.horasAllocadas;
          if (c.asignatura?.esTallerJec) totalJecAsignadas += c.horasAllocadas;
          else totalBaseAsignadas += c.horasAllocadas;
        }
      } else if (c.tipoCarga === 'NO_LECTIVA') {`;

code = code.replace(regex1, repl1);

const regex1_after = /extraDistribution\[extraName\] = \(extraDistribution\[extraName\] \|\| 0\) \+ c\.horasAllocadas;\s*\}\s*\}\);\s*const colacion =/g;

const repl1_after = `extraDistribution[extraName] = (extraDistribution[extraName] || 0) + c.horasAllocadas;
      }
    });
    for (const g in combinados) {
      const maxC = combinados[g].reduce((prev, curr) => (prev.horasAllocadas > curr.horasAllocadas) ? prev : curr);
      lectivasPed += maxC.horasAllocadas;
      if (maxC.asignatura?.esTallerJec) totalJecAsignadas += maxC.horasAllocadas;
      else totalBaseAsignadas += maxC.horasAllocadas;
    }
    
    const colacion =`;
code = code.replace(regex1_after, repl1_after);

const regex2 = /let lectPed = 0, noLect = 0, extra = 0;\s*docCargas\.forEach\(c => \{\s*if\(c\.tipoCarga==='LECTIVA'\) lectPed \+= c\.horasAllocadas;/;

const repl2 = `let lectPed = 0, noLect = 0, extra = 0;
      const combinadosRpt = {};
      docCargas.forEach(c => {
        if(c.tipoCarga==='LECTIVA') {
          if (c.esCombinado && c.grupoCombinado) {
            const g = c.grupoCombinado.toUpperCase().trim();
            if (!combinadosRpt[g]) combinadosRpt[g] = [];
            combinadosRpt[g].push(c.horasAllocadas);
          } else {
            lectPed += c.horasAllocadas;
          }
        }`;
code = code.replace(regex2, repl2);

const regex2_after = /if\(c\.tipoCarga==='EXTRACURRICULAR'\) extra \+= c\.horasAllocadas;\s*\}\);\s*let colacion =/g;
const repl2_after = `if(c.tipoCarga==='EXTRACURRICULAR') extra += c.horasAllocadas;
      });
      for (const g in combinadosRpt) {
        lectPed += Math.max(...combinadosRpt[g]);
      }
      
      let colacion =`;
code = code.replace(regex2_after, repl2_after);

fs.writeFileSync('src/app/actions.ts', code);
