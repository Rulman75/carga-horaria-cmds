const fs = require('fs');

// 1. Fix proxy.ts
let proxyCode = fs.readFileSync('src/proxy.ts', 'utf8');
proxyCode = proxyCode.replace(/export async function middleware/, 'export async function proxy');
fs.writeFileSync('src/proxy.ts', proxyCode);

// 2. Fix actions.ts
let actionsCode = fs.readFileSync('src/app/actions.ts', 'utf8');
actionsCode = actionsCode.replace(/import bcrypt from 'bcryptjs';\nimport \* as jose from 'jose';\nimport \{ cookies \} from 'next\/headers';\n/g, '');
actionsCode = "'use server';\nimport bcrypt from 'bcryptjs';\nimport * as jose from 'jose';\nimport { cookies } from 'next/headers';\n" + actionsCode.replace(/'use server';\n/g, '');

if (!actionsCode.includes('logoutUsuario')) {
  actionsCode += `\nexport async function logoutUsuario() {\n  const cookieStore = await cookies();\n  cookieStore.delete('token');\n}\n`;
}
fs.writeFileSync('src/app/actions.ts', actionsCode);
