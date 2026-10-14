const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

const regex1 = /let estContrato = 0;\s*let estAsignado = 0;/;
const repl1 = `let estContrato = 0;\n    let estAsignado = 0;\n    let estDocentesConCarga = 0;`;

const regex2 = /if \(lectPed > 0 \|\| noLect > 0 \|\| extra > 0\) \{\s*estAsignado \+= Math\.ceil\(\(lectPed \* 45 \/ 60\) \+ recreoDecimal \+ noLect \+ extra \+ colacion\);\s*\}/;
const repl2 = `if (lectPed > 0 || noLect > 0 || extra > 0) {\n        estAsignado += Math.ceil((lectPed * 45 / 60) + recreoDecimal + noLect + extra + colacion);\n        estDocentesConCarga++;\n      }`;

const regex3 = /if \(sRels\.length > 0\) \{\s*schoolStats\.push\(\{\s*nombre: est\.esedDescripcion,\s*contrato: estContrato,\s*asignado: estAsignado,\s*ociosas: estContrato - estAsignado\s*\}\);\s*\}/;
const repl3 = `if (sRels.length > 0) {\n      schoolStats.push({\n        nombre: est.esedDescripcion,\n        contrato: estContrato,\n        asignado: estAsignado,\n        ociosas: estContrato - estAsignado,\n        totalDocentes: sRels.length,\n        docentesConCarga: estDocentesConCarga\n      });\n    }`;

code = code.replace(regex1, repl1);
code = code.replace(regex2, repl2);
code = code.replace(regex3, repl3);

fs.writeFileSync('src/app/actions.ts', code);
