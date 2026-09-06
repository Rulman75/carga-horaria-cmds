import pandas as pd
import sqlite3
import glob

db_path = "C:\\Users\\rhormazabal\\.gemini\\antigravity\\scratch\\carga-horaria-web\\prisma\\dev.db"
conn = sqlite3.connect(db_path)

# Insert Asignaturas
df_asig = pd.read_excel("C:\\Users\\rhormazabal\\.gemini\\antigravity\\scratch\\carga-horaria-cmds\\Tablas\\ASIGNATURAS.xls")
df_asig = df_asig.rename(columns={
    'ASIG_COD': 'asigCod',
    'ASIG_DESCRIPCION': 'asigDescripcion',
    'ASIG_TIPO': 'asigTipo'
})
# drop nan
df_asig = df_asig.dropna(subset=['asigCod'])
df_asig['asigCod'] = df_asig['asigCod'].astype(str)
df_asig.to_sql('Asignatura', conn, if_exists='append', index=False)
print(f"Inserted {len(df_asig)} asignaturas.")

# Insert Establecimientos
df_estab = pd.read_excel("C:\\Users\\rhormazabal\\.gemini\\antigravity\\scratch\\carga-horaria-cmds\\Tablas\\ESTABLECIMIENTOS.xls")
df_estab = df_estab.rename(columns={
    'ESED_SEC': 'esedSec',
    'ESED_COD': 'esedCod',
    'ESAD_COD': 'esadCod',
    'ESED_DESCRIPCION': 'esedDescripcion',
    'ESED_DESC_CORTA': 'esedDescCorta'
})
df_estab.to_sql('Establecimiento', conn, if_exists='append', index=False)
print(f"Inserted {len(df_estab)} establecimientos.")

# Insert TipoEnsenanza
df_tipo = pd.read_excel("C:\\Users\\rhormazabal\\.gemini\\antigravity\\scratch\\carga-horaria-cmds\\Tablas\\TIPO_ENSENANZA.xls")
df_tipo = df_tipo.rename(columns={
    'TIEN_COD': 'tienCod',
    'TIEN_DESCRIPCION': 'tienDescripcion'
})
df_tipo.to_sql('TipoEnsenanza', conn, if_exists='append', index=False)
print(f"Inserted {len(df_tipo)} tipos de ensenanza.")

# Insert Grados
df_grados = pd.read_excel("C:\\Users\\rhormazabal\\.gemini\\antigravity\\scratch\\carga-horaria-cmds\\Tablas\\GRADOS.xls")
df_grados = df_grados.rename(columns={
    'TIEN_COD': 'tienCod',
    'GRTE_COD': 'grteCod',
    'GRTE_DESCRIP': 'grteDescrip',
    'GRTE_COD_INT': 'grteCodInt',
    'GRTE_COD_MINISTERIAL': 'grteCodMinisterial',
    'GRTE_DESC_MINISTERIAL': 'grteDescMinisterial',
    'GRTE_COD_SIGE': 'grteCodSige'
})
# We don't have an autoincrement ID in the xls, sqlite autoincrement will handle it if we omit 'id'
df_grados.to_sql('Grado', conn, if_exists='append', index=False)
print(f"Inserted {len(df_grados)} grados.")

conn.close()
