const fs = require('fs');
let code = fs.readFileSync('src/components/SidebarLayout.tsx', 'utf8');

if (!code.includes('logoutUsuario')) {
  code = code.replace(/import Link from 'next\/link';/, "import Link from 'next/link';\nimport { logoutUsuario } from '../app/actions';");
  
  code = code.replace(
    /localStorage\.removeItem\('user'\);\s*localStorage\.removeItem\('token'\);\s*localStorage\.removeItem\('selectedEstablecimientoId'\);/,
    `localStorage.removeItem('user');
              localStorage.removeItem('token');
              localStorage.removeItem('selectedEstablecimientoId');
              logoutUsuario().then(() => {
                window.location.href = '/login';
              });
              return;`
  );
  fs.writeFileSync('src/components/SidebarLayout.tsx', code);
}
