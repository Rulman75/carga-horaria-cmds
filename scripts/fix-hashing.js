const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

code = code.replace(
  /export async function createUsuario\(data: any\) \{[\s\S]*?return await prisma\.usuario\.create\(\{[\s\S]*?data: \{/m,
  `export async function createUsuario(data: any) {
  if (data.password) data.password = await bcrypt.hash(data.password, 10);
  return await prisma.usuario.create({
    data: {`
);

code = code.replace(
  /export async function updateUsuario\(id: number, data: any\) \{[\s\S]*?return await prisma\.usuario\.update\(\{[\s\S]*?where: \{ id \},[\s\S]*?data: \{/m,
  `export async function updateUsuario(id: number, data: any) {
  if (data.password) data.password = await bcrypt.hash(data.password, 10);
  return await prisma.usuario.update({
    where: { id },
    data: {`
);

fs.writeFileSync('src/app/actions.ts', code);
console.log('Fixed create/update');
