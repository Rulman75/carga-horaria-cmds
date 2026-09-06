const fs = require('fs');

let c = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

// Replace the helper logic with the database field
c = c.replace(
  `  const isEspecialistaAsig = (nombre: string) => {
    if (!nombre) return false;
    const n = nombre.toUpperCase();
    return n.includes('RELIGIÓN') || 
           n.includes('RELIGION') || 
           n.includes('EDUCACIÓN FÍSICA') || 
           n.includes('EDUCACION FISICA') || 
           n.includes('INGLÉS') || 
           n.includes('INGLES');
  };`,
  `  const isEspecialistaAsig = (fila: any) => {
    return fila?.esEspecialistaSiempre === true;
  };`
);

// We need to update all calls to isEspecialistaAsig to pass 'fila' instead of 'fila.asigDescripcion'
c = c.replace(/isEspecialistaAsig\(fila\.asigDescripcion\)/g, 'isEspecialistaAsig(fila)');

// Wait, the generalist footer vertical sum loops over 'f'
c = c.replace(/isEspecialistaAsig\(f\.asigDescripcion\)/g, 'isEspecialistaAsig(f)');

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', c);
