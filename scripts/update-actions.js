const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

// Insert imports at top
if (!code.includes('bcryptjs')) {
  code = `import bcrypt from 'bcryptjs';\nimport { SignJWT } from 'jose';\nimport { cookies } from 'next/headers';\n` + code;
}

// Modify createUsuario
code = code.replace(
  /export async function createUsuario\(data: any\) \{[\s\S]*?password: data.password,[\s\S]*?\}/,
  `export async function createUsuario(data: any) {
  const hash = await bcrypt.hash(data.password, 10);
  return await prisma.usuario.create({
    data: {
      email: data.email,
      nombre: data.nombre,
      password: hash,
      rol: data.rol,
      establecimientoId: data.establecimientoId || null
    }
  });
}`
);

// Modify updateUsuario
code = code.replace(
  /export async function updateUsuario\(id: number, data: any\) \{[\s\S]*?return await prisma.usuario.update\(\{[\s\S]*?where: \{ id \},[\s\S]*?data: \{[\s\S]*?email: data.email,[\s\S]*?nombre: data.nombre,[\s\S]*?password: data.password,[\s\S]*?rol: data.rol,[\s\S]*?establecimientoId: data.establecimientoId \|\| null[\s\S]*?\}[\s\S]*?\}\);[\s\S]*?\}/,
  `export async function updateUsuario(id: number, data: any) {
  const updateData: any = {
    email: data.email,
    nombre: data.nombre,
    rol: data.rol,
    establecimientoId: data.establecimientoId || null
  };
  if (data.password && !data.password.startsWith('$2')) {
    updateData.password = await bcrypt.hash(data.password, 10);
  } else if (data.password) {
    updateData.password = data.password;
  }
  return await prisma.usuario.update({
    where: { id },
    data: updateData
  });
}`
);

// Modify loginUsuario
code = code.replace(
  /export async function loginUsuario\(email: string, pass: string\) \{[\s\S]*?const user = await prisma.usuario.findUnique\(\{[\s\S]*?where: \{ email \},[\s\S]*?include: \{ establecimiento: true \}[\s\S]*?\}\);[\s\S]*?if \(user && user.password === pass\) \{/,
  `export async function loginUsuario(email: string, pass: string) {
  const user = await prisma.usuario.findUnique({
    where: { email },
    include: { establecimiento: true }
  });
  if (user && await bcrypt.compare(pass, user.password)) {`
);

// Add JWT creation to loginUsuario before return
code = code.replace(
  /const \{ password, establecimiento, \.\.\.safeUser \} = user;\n\s*return \{/,
  `const { password, establecimiento, ...safeUser } = user;
    
    // Generar JWT seguro
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'cmds2026_super_secret_key');
    const token = await new SignJWT({ id: user.id, rol: user.rol, establecimientoId: user.establecimientoId })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('12h')
      .sign(secret);
    
    (await cookies()).set('token', token, { httpOnly: true, path: '/' });

    return {`
);

// Modify resetPassword
code = code.replace(
  /export async function resetPassword\(id: number\) \{[\s\S]*?return await prisma.usuario.update\(\{[\s\S]*?where: \{ id \},[\s\S]*?data: \{ password: 'Cmds2027', debeCambiarPassword: true \}[\s\S]*?\}\);[\s\S]*?\}/,
  `export async function resetPassword(id: number) {
  const hash = await bcrypt.hash('Cmds2027', 10);
  return await prisma.usuario.update({
    where: { id },
    data: { password: hash, debeCambiarPassword: true }
  });
}`
);

// Modify changePassword
code = code.replace(
  /export async function changePassword\(id: number, newPass: string\) \{[\s\S]*?return await prisma.usuario.update\(\{[\s\S]*?where: \{ id \},[\s\S]*?data: \{ password: newPass, debeCambiarPassword: false \}[\s\S]*?\}\);[\s\S]*?\}/,
  `export async function changePassword(id: number, newPass: string) {
  const hash = await bcrypt.hash(newPass, 10);
  return await prisma.usuario.update({
    where: { id },
    data: { password: hash, debeCambiarPassword: false }
  });
}`
);

// Add logoutUsuario
if (!code.includes('logoutUsuario')) {
  code += `\nexport async function logoutUsuario() {\n  (await cookies()).delete('token');\n}\n`;
}

fs.writeFileSync('src/app/actions.ts', code);
