const fs = require('fs');

// Fix actions.ts
let actionsCode = fs.readFileSync('src/app/actions.ts', 'utf8');
actionsCode = actionsCode.replace(
  /const combinados = \{\};/g,
  'const combinados: Record<string, any[]> = {};'
);
actionsCode = actionsCode.replace(
  /const combinadosRpt = \{\};/g,
  'const combinadosRpt: Record<string, number[]> = {};'
);
actionsCode = actionsCode.replace(
  /\(prev, curr\) =>/g,
  '(prev: any, curr: any) =>'
);
fs.writeFileSync('src/app/actions.ts', actionsCode);

// Fix asignacion/page.tsx
let asignacionCode = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');
asignacionCode = asignacionCode.replace(
  /interface CargaEnUI \{/,
  `interface CargaEnUI {
  esCombinado?: boolean;
  grupoCombinado?: string;`
);
asignacionCode = asignacionCode.replace(
  /const calcularHorasLectivas = \(cargasArray\) => \{/,
  `const calcularHorasLectivas = (cargasArray: any[]) => {`
);
asignacionCode = asignacionCode.replace(
  /const combinados = \{\};/g,
  `const combinados: Record<string, number[]> = {};`
);
fs.writeFileSync('src/app/carga/asignacion/page.tsx', asignacionCode);

// Fix docentes/page.tsx
let docentesCode = fs.readFileSync('src/app/carga/docentes/page.tsx', 'utf8');
docentesCode = docentesCode.replace(
  /const calcularHorasLectivas = \(cargasArray\) => \{/,
  `const calcularHorasLectivas = (cargasArray: any[]) => {`
);
docentesCode = docentesCode.replace(
  /const combinados = \{\};/g,
  `const combinados: Record<string, number[]> = {};`
);
fs.writeFileSync('src/app/carga/docentes/page.tsx', docentesCode);
