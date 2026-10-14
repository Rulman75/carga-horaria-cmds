const fs = require('fs');
let code = fs.readFileSync('scripts/update-plan4.js', 'utf8');
code = code.replace(/codAsignatura: row\['Cod\. Asignatura'\],/g, `codAsignatura: String(row['Cod. Asignatura']),`);
code = code.replace(/const codAsignatura = row\.codAsignatura;/g, `const codAsignatura = String(row.codAsignatura);`);
fs.writeFileSync('scripts/update-plan4.js', code);
