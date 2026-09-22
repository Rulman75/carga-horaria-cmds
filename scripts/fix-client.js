const fs = require('fs');
let code = fs.readFileSync('src/app/login/page.tsx', 'utf8');
if (!code.includes("'use client'")) {
  code = "'use client';\n" + code;
  fs.writeFileSync('src/app/login/page.tsx', code);
}
