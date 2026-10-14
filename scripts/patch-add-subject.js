const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');

const t3 = `export async function agregarAsignaturaIndividualPropio(
  planPropioId: number, 
  tienCod: number, 
  grteCod: number, 
  codAsignatura: string,
  categoria: string = 'BASE'
) {`;
const r3 = `export async function agregarAsignaturaIndividualPropio(
  planPropioId: number, 
  tienCod: number, 
  grteCod: number, 
  codAsignatura: string,
  categoria: string = 'BASE',
  especialidad: string | null = null
) {`;

code = code.replace(t3, r3);

const t5 = `planEstablecimientoId: planPropioId,
      tienCod,
      grteCod,
      codAsignatura
    }
  });`;
const r5 = `planEstablecimientoId: planPropioId,
      tienCod,
      grteCod,
      codAsignatura,
      especialidad
    }
  });`;

code = code.replace(t5, r5);

const t4 = `codAsignatura,
        horas: 0, // Starts at 0 so they can edit it in the matrix
        obligatoria: 'NO',
        formacion: 'General',
        esPropio: true,
        categoria // ADDED CATEGORIA
      }
    });`;
const r4 = `codAsignatura,
        horas: 0, // Starts at 0 so they can edit it in the matrix
        obligatoria: 'NO',
        formacion: 'General',
        esPropio: true,
        categoria, // ADDED CATEGORIA
        especialidad
      }
    });`;
code = code.replace(t4, r4);

fs.writeFileSync('src/app/actions.ts', code);
