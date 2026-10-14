import re

with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_guardar = r"if \(horasLectivasAsignadas > 0 && planificacionActual < minPlanificacionDecimal\) \{"
new_guardar = """if (horasLectivasAsignadas > 0 && planificacionActual > 0 && planificacionActual < minPlanificacionDecimal) {"""

code = re.sub(old_guardar, new_guardar, code)

with open('src/app/carga/asignacion/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated handleGuardar to only validate if planificacionActual > 0")
