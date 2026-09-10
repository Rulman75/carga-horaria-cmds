import sys

with open('prisma/schema.prisma', 'r', encoding='utf-8') as f:
    code = f.read()

old_rel = """model DocenteEstablecimiento {
  docenteId         Int
  establecimientoId Int
  docente           Docente @relation(fields: [docenteId], references: [id])
  establecimiento   Establecimiento @relation(fields: [establecimientoId], references: [esedSec])

  @@id([docenteId, establecimientoId])
}"""

new_rel = """model DocenteEstablecimiento {
  docenteId         Int
  establecimientoId Int
  docente           Docente @relation(fields: [docenteId], references: [id])
  establecimiento   Establecimiento @relation(fields: [establecimientoId], references: [esedSec])
  
  observacionCarga  String? 

  @@id([docenteId, establecimientoId])
}"""

code = code.replace(old_rel, new_rel)

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(code)
print("Schema updated")
