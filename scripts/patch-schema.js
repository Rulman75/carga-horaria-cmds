const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

code = code.replace(/maxHorasPie\s+Float\s+@default\(3\)/, 'maxHorasPie     Float   @default(3)\n  especialidades  String[] @default([])');
code = code.replace(/categoria\s+String\s+@default\("BASE"\)/, 'categoria   String  @default("BASE")\n  especialidad String?');
code = code.replace(/letraCurso\s+String\?.*?\n/g, 'letraCurso String?\n  especialidad String?\n');

fs.writeFileSync('prisma/schema.prisma', code);
