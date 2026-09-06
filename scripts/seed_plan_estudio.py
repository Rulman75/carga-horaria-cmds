import pandas as pd
import sqlite3

db_path = "C:\\Users\\rhormazabal\\.gemini\\antigravity\\scratch\\carga-horaria-web\\prisma\\dev.db"
conn = sqlite3.connect(db_path)

# Delete existing data to be safe, though Prisma might have already dropped columns
cursor = conn.cursor()
cursor.execute("DELETE FROM PlanEstudioDet")
cursor.execute("DELETE FROM PlanEstudioEnc")
conn.commit()

# Insert PLAN_ESTUDIO_ENC
df_enc = pd.read_excel("C:\\Users\\rhormazabal\\.gemini\\antigravity\\scratch\\carga-horaria-cmds\\Tablas\\PLAN_ESTUDIO_ENC.xlsx")
df_enc = df_enc.rename(columns={
    'cod_plan': 'codPlan',
    'Nomble_plan': 'nombrePlan',
    'Estado_Plan': 'estadoPlan',
    'Tipo': 'tipo'
})

df_enc.to_sql('PlanEstudioEnc', conn, if_exists='append', index=False)
print(f"Inserted {len(df_enc)} PlanEstudioEnc.")

# Insert PLAN_ESTUDIO_DET
df_det = pd.read_excel("C:\\Users\\rhormazabal\\.gemini\\antigravity\\scratch\\carga-horaria-cmds\\Tablas\\PLAN_ESTUDIO_DET.xlsx")
# Original columns: Cod_Plan, Tipos de Enseanza, Grados, Cod. Asignatura, Horas_CJ, Horas_SJ, Obligatoria, Formacion
df_det.columns = ['codPlan', 'tienCod', 'grteCod', 'codAsignatura', 'horasCJ', 'horasSJ', 'obligatoria', 'formacion']

# Handle NaN values and data types
df_det = df_det.dropna(subset=['codAsignatura'])
df_det['codAsignatura'] = df_det['codAsignatura'].astype(int).astype(str)
df_det['horasCJ'] = df_det['horasCJ'].fillna(0.0)
df_det['horasSJ'] = df_det['horasSJ'].fillna(0.0)

df_det.to_sql('PlanEstudioDet', conn, if_exists='append', index=False)
print(f"Inserted {len(df_det)} PlanEstudioDet.")

conn.close()
