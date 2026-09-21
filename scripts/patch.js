const fs = require('fs');

let code = fs.readFileSync('src/app/actions.ts', 'utf8');

// Insert imports
if (!code.includes('bcryptjs')) {
  code = `import bcrypt from 'bcryptjs';\nimport { SignJWT } from 'jose';\nimport { cookies } from 'next/headers';\n` + code;
}

// 1. Patch createUsuario
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

// 2. Patch updateUsuario
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

// 3. Patch loginUsuario
code = code.replace(
  /export async function loginUsuario\(email: string, pass: string\) \{[\s\S]*?const user = await prisma.usuario.findUnique\(\{[\s\S]*?where: \{ email \},[\s\S]*?include: \{ establecimiento: true \}[\s\S]*?\}\);[\s\S]*?if \(user && user.password === pass\) \{[\s\S]*?const \{ password, establecimiento, \.\.\.safeUser \} = user;[\s\S]*?return \{[\s\S]*?\.\.\.safeUser,[\s\S]*?establecimientoNombre: establecimiento\?.esedDescripcion \|\| null[\s\S]*?\};[\s\S]*?\}[\s\S]*?return null;[\s\S]*?\}/,
  `export async function loginUsuario(email: string, pass: string) {
  const user = await prisma.usuario.findUnique({
    where: { email },
    include: { establecimiento: true }
  });
  if (user && await bcrypt.compare(pass, user.password)) {
    const { password, establecimiento, ...safeUser } = user;
    
    // Generar JWT seguro
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'cmds2026_super_secret_key');
    const token = await new SignJWT({ id: user.id, rol: user.rol, establecimientoId: user.establecimientoId })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('12h')
      .sign(secret);
    
    const cookieStore = await cookies();
    cookieStore.set('token', token, { httpOnly: true, path: '/' });

    return {
      ...safeUser,
      establecimientoNombre: establecimiento?.esedDescripcion || null
    };
  }
  return null;
}`
);

// 4. Patch resetPassword
code = code.replace(
  /export async function resetPassword\(id: number\) \{[\s\S]*?return await prisma.usuario.update\(\{[\s\S]*?where: \{ id \},[\s\S]*?data: \{[\s\S]*?password: 'Cmds2027',[\s\S]*?debeCambiarPassword: true[\s\S]*?\}[\s\S]*?\}\);[\s\S]*?\}/,
  `export async function resetPassword(id: number) {
  const hash = await bcrypt.hash('Cmds2027', 10);
  return await prisma.usuario.update({
    where: { id },
    data: { password: hash, debeCambiarPassword: true }
  });
}`
);

// 5. Patch changePassword
code = code.replace(
  /export async function changePassword\(id: number, newPass: string\) \{[\s\S]*?return await prisma.usuario.update\(\{[\s\S]*?where: \{ id \},[\s\S]*?data: \{[\s\S]*?password: newPass,[\s\S]*?debeCambiarPassword: false[\s\S]*?\}[\s\S]*?\}\);[\s\S]*?\}/,
  `export async function changePassword(id: number, newPass: string) {
  const hash = await bcrypt.hash(newPass, 10);
  return await prisma.usuario.update({
    where: { id },
    data: { password: hash, debeCambiarPassword: false }
  });
}`
);

// Add logoutUsuario if not present
if (!code.includes('logoutUsuario')) {
  code += `\nexport async function logoutUsuario() {\n  const cookieStore = await cookies();\n  cookieStore.delete('token');\n}\n`;
}

fs.writeFileSync('src/app/actions.ts', code);
