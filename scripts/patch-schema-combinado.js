const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

code = code.replace(
  /grupoDesdoble String\? \/\/.*/,
  `grupoDesdoble String? // Ej. 'Damas', 'Varones', 'Violín'
  esCombinado    Boolean @default(false)
  grupoCombinado String? // Ej. 'Comb1'`
);

fs.writeFileSync('prisma/schema.prisma', code);
