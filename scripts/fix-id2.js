const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const regex = /const id = Number\(localStorage\.getItem\('selectedEstablecimientoId'\)\) \|\| 0;\s*if \(id > 0 && id !== 2\) \{\s*setEstId\(id\);\s*\}/;
const replacement = `const idStr = localStorage.getItem('selectedEstablecimientoId');
    const id = idStr ? Number(idStr) : 0;
    if (id > 0) {
      setEstId(id);
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/app/page.tsx', code);
