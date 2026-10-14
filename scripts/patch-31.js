const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const r = `  agregarAsignaturaIndividualPropio,
  updateEspecialidadAsignaturaPropia
} from '../../../actions';`;

code = code.replace(/agregarAsignaturaIndividualPropio[\r\n\s]+} from '\.\.\/\.\.\/\.\.\/actions';/, r);

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
