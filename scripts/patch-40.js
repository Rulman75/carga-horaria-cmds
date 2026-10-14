const fs = require('fs');
let code = fs.readFileSync('src/app/carga/matriz-clasica/page.tsx', 'utf8');

code = code.replace(/\.sort\(\(a,b\) => a\.desc\.localeCompare\(b\.desc\)\)/g, '.sort((a,b) => String(a.desc || "").localeCompare(String(b.desc || "")))');
code = code.replace(/\.sort\(\(a, b\) => a\.apellidos\.localeCompare\(b\.apellidos\)\)/g, '.sort((a,b) => String(a.apellidos || "").localeCompare(String(b.apellidos || "")))');

fs.writeFileSync('src/app/carga/matriz-clasica/page.tsx', code);
