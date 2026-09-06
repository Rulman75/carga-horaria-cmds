import fs from 'fs';

let c = fs.readFileSync('src/app/config/planes/[id]/page.tsx', 'utf8');
c = c.replace(/"Vigente"Plan/g, '"Vigente"');
fs.writeFileSync('src/app/config/planes/[id]/page.tsx', c);
