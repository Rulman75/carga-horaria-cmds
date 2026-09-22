const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(
  /financiamiento\s+String\?\s*\/\/\s*'SEP', 'PIE', null/,
  `financiamiento        String? // 'SEP', 'PIE', null
  
  esDesdoble            Boolean @default(false)
  grupoDesdoble         String? // Ej. 'Damas', 'Varones', 'Violín'`
);

const newModel = `
model EstablecimientoCursoLetra {
  id                    Int      @id @default(autoincrement())
  establecimientoId     Int
  establecimiento       Establecimiento @relation(fields: [establecimientoId], references: [esedSec])
  
  tienCod               Int
  grteCod               Int
  grado                 Grado @relation(fields: [tienCod, grteCod], references: [tienCod, grteCod])
  
  letra                 String
  esJec                 Boolean?
  
  planEstablecimientoId Int?
  planEstablecimiento   PlanEstablecimiento? @relation(fields: [planEstablecimientoId], references: [id])

  @@unique([establecimientoId, tienCod, grteCod, letra])
}
`;

schema += newModel;

schema = schema.replace(
  /grados\s+EstablecimientoGrado\[\]/,
  `grados                EstablecimientoGrado[]
  cursosLetra           EstablecimientoCursoLetra[]`
);

schema = schema.replace(
  /establecimientos\s+EstablecimientoGrado\[\]/,
  `establecimientos      EstablecimientoGrado[]
  cursosLetra           EstablecimientoCursoLetra[]`
);

schema = schema.replace(
  /cargasHorarias\s+CargaHoraria\[\]/,
  `cargasHorarias        CargaHoraria[]
  cursosLetra           EstablecimientoCursoLetra[]`
);

fs.writeFileSync('prisma/schema.prisma', schema);
