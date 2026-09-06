import pandas as pd
import sqlite3

db_path = "C:\\Users\\rhormazabal\\.gemini\\antigravity\\scratch\\carga-horaria-web\\prisma\\dev.db"
conn = sqlite3.connect(db_path)

cursor = conn.cursor()
cursor.execute("DELETE FROM Docente")
cursor.execute("DELETE FROM DocenteEstablecimiento")
conn.commit()

df = pd.read_excel("C:\\Users\\rhormazabal\\.gemini\\antigravity\\scratch\\carga-horaria-cmds\\Tablas\\DOCENTES.xls")

# Columns: PERS_RUT, PERS_DV, PERS_NOMBRES, PERS_APE_PAT, PERS_APE_MAT, FAPR_NOM_FORMA_ACAD, ESED_SEC

# Prepare Docente DataFrame
df_doc = pd.DataFrame()
df_doc['rut'] = df['PERS_RUT'].astype(str) + '-' + df['PERS_DV'].astype(str)
df_doc['nombres'] = df['PERS_NOMBRES']
df_doc['apellidoPaterno'] = df['PERS_APE_PAT']
df_doc['apellidoMaterno'] = df['PERS_APE_MAT']
df_doc['apellidos'] = df['PERS_APE_PAT'].fillna('') + ' ' + df['PERS_APE_MAT'].fillna('')
df_doc['tituloProfesional'] = df['FAPR_NOM_FORMA_ACAD']
df_doc['tipoContrato'] = None
df_doc['horasTitular'] = None
df_doc['createdAt'] = pd.Timestamp.now().strftime('%Y-%m-%dT%H:%M:%S.000Z')
df_doc['updatedAt'] = pd.Timestamp.now().strftime('%Y-%m-%dT%H:%M:%S.000Z')

# Drop duplicates if any by RUT
df_doc = df_doc.drop_duplicates(subset=['rut'])

# Generate IDs to maintain relation manually, or we can just insert and then fetch IDs back
df_doc['id'] = range(1, len(df_doc) + 1)

df_doc.to_sql('Docente', conn, if_exists='append', index=False)
print(f"Inserted {len(df_doc)} docentes.")

# Prepare DocenteEstablecimiento mapping
df_rel = pd.DataFrame()
df_rel['docenteId'] = df_doc['id']
df_rel['establecimientoId'] = df['ESED_SEC'] # Assuming ESED_SEC matches and the row order corresponds perfectly because we dropped duplicates (wait, what if a teacher is in multiple establishments?)

# Let's rebuild the relation safely
# Create a dictionary of RUT -> ID
rut_to_id = dict(zip(df_doc['rut'], df_doc['id']))

df['rut'] = df['PERS_RUT'].astype(str) + '-' + df['PERS_DV'].astype(str)
df_rel_safe = pd.DataFrame()
df_rel_safe['docenteId'] = df['rut'].map(rut_to_id)
df_rel_safe['establecimientoId'] = df['ESED_SEC']

# Drop records where establecimientoId is NaN or not in Establecimiento table
# Actually, let's just insert valid ones. ESED_SEC could be missing.
df_rel_safe = df_rel_safe.dropna(subset=['establecimientoId'])
df_rel_safe['establecimientoId'] = df_rel_safe['establecimientoId'].astype(int)

# Check if Establecimiento exists
cursor.execute("SELECT esedSec FROM Establecimiento")
valid_esed = {row[0] for row in cursor.fetchall()}

df_rel_safe = df_rel_safe[df_rel_safe['establecimientoId'].isin(valid_esed)]

# drop duplicate relations
df_rel_safe = df_rel_safe.drop_duplicates(subset=['docenteId', 'establecimientoId'])

df_rel_safe.to_sql('DocenteEstablecimiento', conn, if_exists='append', index=False)
print(f"Inserted {len(df_rel_safe)} relaciones Docente-Establecimiento.")

conn.close()
