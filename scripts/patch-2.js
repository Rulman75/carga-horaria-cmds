const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

code = code.replace(/export async function agregarAsignaturaIndividualPropio\([\s\S]*?categoria: string = 'BASE'\n\)/, `export async function agregarAsignaturaIndividualPropio(
  planPropioId: number, 
  tienCod: number, 
  grteCod: number, 
  codAsignatura: string,
  categoria: string = 'BASE',
  especialidad: string | null = null
)`);

code = code.replace(/codAsignatura\n    }\n  }\);/, `codAsignatura,
      especialidad
    }
  });`);

code = code.replace(/categoria \/\/ ADDED CATEGORIA\n      }\n    }\);/, `categoria, // ADDED CATEGORIA
        especialidad
      }
    });`);

fs.writeFileSync('src/app/actions.ts', code);
