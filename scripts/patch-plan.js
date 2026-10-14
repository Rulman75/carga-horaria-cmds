const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const regex1 = /\/\/ Planificacin rule\s*const minPlanificacionDecimal = maxNoLectivasDecimal \* 0\.4;/m;
const repl1 = `// Planificacin rule
  const pctPlanificacion = (configGlobal?.porcentajeMinimoPlanificacion ?? 40);
  const minPlanificacionDecimal = maxNoLectivasPropDecimal * (pctPlanificacion / 100);`;

const regex2 = /alert\(\`Por ley, la planificaci.*debe ser al menos el 40% de las horas no lectivas\. La cantidad.*mínima que debes asignar en total es \$\{minPlanificacionDecimal\.toFixed\(1\)\} hrs\.\`\);/m;
const repl2 = `alert(\`Por normativa, la planificación debe ser al menos el \${pctPlanificacion}% de las horas no lectivas proporcionales (\${maxNoLectivasPropStr}). La cantidad mínima esperada es \${minPlanificacionDecimal.toFixed(1)} hrs.\`);`;

// Try both encodings for the alert string due to mojibake just in case
const regex3 = /alert\(\`Por ley.*40%.*hrs\.\`\);/m;

if (regex1.test(code)) {
    code = code.replace(regex1, repl1);
}

if (regex3.test(code)) {
    code = code.replace(regex3, repl2);
} else {
    console.log("Could not find alert to replace.");
}

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
