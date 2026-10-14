const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const regex = /const desc = extInfo\.descripcion\.toLowerCase\(\)\.trim\(\);\s*const roles44 = \['director', 'jefe utp', 'curriculista', 'evaluador', 'orientador', 'convivencia escolar', 'inspector general', 'coordinador tp', 'producción', 'produccion', 'informática', 'informatica'\];\s*if \(roles44\.some\(r => desc\.includes\(r\)\)\) \{\s*setHorasManual\(44\);\s*\} else \{\s*setHorasManual\(1\);\s*\}/;

const replacement = `if (extInfo.horasDefault !== null && extInfo.horasDefault !== undefined) {
      setHorasManual(extInfo.horasDefault);
    } else {
      setHorasManual(1);
    }`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
