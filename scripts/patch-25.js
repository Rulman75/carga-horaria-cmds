const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');
code = code.replace(
  /agregarAsignaturaIndividualPropio\n} from '\.\.\/\.\.\/\.\.\/actions';/,
  "agregarAsignaturaIndividualPropio,\n  updateEspecialidadAsignaturaPropia\n} from '../../../actions';"
);
fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
