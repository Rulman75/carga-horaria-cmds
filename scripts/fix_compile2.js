import fs from 'fs';

let c = fs.readFileSync('src/app/config/planes/[id]/page.tsx', 'utf8');
c = c.replace(/plan\.estado/g, '"Vigente"');
fs.writeFileSync('src/app/config/planes/[id]/page.tsx', c);
