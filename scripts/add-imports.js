const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');
if (!code.includes('bcryptjs')) {
  code = "import bcrypt from 'bcryptjs';\nimport * as jose from 'jose';\nimport { cookies } from 'next/headers';\n" + code;
  fs.writeFileSync('src/app/actions.ts', code);
}
