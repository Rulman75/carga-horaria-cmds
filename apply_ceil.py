import sys

# 1. Update src/app/carga/asignacion/page.tsx
with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# The widget:
code = code.replace(
    "Math.round(((horasLectivasAsignadas * 45 / 60) + recreoDecimal) + horasNoLectivasAsignadas + horasExtraAsignadas + colacion)",
    "Math.ceil(((horasLectivasAsignadas * 45 / 60) + recreoDecimal) + horasNoLectivasAsignadas + horasExtraAsignadas + colacion)"
)

# printCertificado:
code = code.replace(
    "Math.round(asigTotal)",
    "Math.ceil(asigTotal)"
)

with open('src/app/carga/asignacion/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

# 2. Update src/app/carga/matriz-clasica/page.tsx
with open('src/app/carga/matriz-clasica/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_jornada = "const totalJornadaSemanalCrono = Math.round((totalAulaPed * 45 / 60) + recreoDecimal) + totalAnlCrono;"
new_jornada = "const totalJornadaSemanalCrono = Math.ceil((totalAulaPed * 45 / 60) + recreoDecimal + totalAnlCrono);"
code = code.replace(old_jornada, new_jornada)

old_asignado = "const asignadoCronoTotal = Math.round((totalAulaPed * 45 / 60) + recreoDecimal) + totalAnlCrono + totalExtCrono + doc.colacion;"
new_asignado = "const asignadoCronoTotal = Math.ceil((totalAulaPed * 45 / 60) + recreoDecimal + totalAnlCrono + totalExtCrono + doc.colacion);"
code = code.replace(old_asignado, new_asignado)

# Also change where it prints `asignadoCronoTotal` if it has Math.round just in case
code = code.replace("Math.round(asignadoCronoTotal)", "Math.ceil(asignadoCronoTotal)")

# also replace totalJornadaSemanalCrono print just in case
code = code.replace("Math.round(totalJornadaSemanalCrono)", "Math.ceil(totalJornadaSemanalCrono)")

with open('src/app/carga/matriz-clasica/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

# 3. Update src/app/actions.ts
with open('src/app/actions.ts', 'r', encoding='utf-8') as f:
    code = f.read()

# getSchoolAnalytics updates
old_est_asignado = "estAsignado += Math.round((lectPed * 45 / 60) + recreoDecimal) + noLect + extra + colacion;"
new_est_asignado = "estAsignado += Math.ceil((lectPed * 45 / 60) + recreoDecimal + noLect + extra + colacion);"
code = code.replace(old_est_asignado, new_est_asignado)

code = code.replace("totalHorasContrato: Math.round(totalHorasContrato)", "totalHorasContrato: Math.ceil(totalHorasContrato)")
code = code.replace("totalHorasAsignadas: Math.round(totalHorasAsignadas)", "totalHorasAsignadas: Math.ceil(totalHorasAsignadas)")
code = code.replace("horasOciosas: Math.round(totalHorasContrato - totalHorasAsignadas)", "horasOciosas: Math.ceil(totalHorasContrato - totalHorasAsignadas)")

with open('src/app/actions.ts', 'w', encoding='utf-8') as f:
    f.write(code)

print("done Math.ceil")
