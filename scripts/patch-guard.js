const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const regex = /const data = await getPlanPropio\(parseInt\(id as string\)\);\s*setPlan\(data\);/;
const replacement = `const data = await getPlanPropio(parseInt(id as string));
    
    const selectedEstId = localStorage.getItem('selectedEstablecimientoId');
    if (selectedEstId && data && data.establecimientoId && data.establecimientoId.toString() !== selectedEstId) {
      router.push('/establecimiento/planes');
      return;
    }

    setPlan(data);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
