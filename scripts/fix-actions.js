const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

const badEndingIndex = code.lastIndexOf('export async function resetPassword');
code = code.substring(0, badEndingIndex);

code += `export async function resetPassword(id: number) {
  const hash = await bcrypt.hash('Cmds2027', 10);
  return await prisma.usuario.update({
    where: { id },
    data: { password: hash, debeCambiarPassword: true }
  });
}

export async function changePassword(id: number, newPass: string) {
  const hash = await bcrypt.hash(newPass, 10);
  return await prisma.usuario.update({
    where: { id },
    data: { password: hash, debeCambiarPassword: false }
  });
}

export async function logoutUsuario() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
`;
fs.writeFileSync('src/app/actions.ts', code);
