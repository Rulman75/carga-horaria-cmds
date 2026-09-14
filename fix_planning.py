import sys

with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_calc = "const maxPlanificacionDecimal = maxNoLectivasDecimal * 0.4;"
new_calc = "const minPlanificacionDecimal = maxNoLectivasDecimal * 0.4;"
code = code.replace(old_calc, new_calc)

old_check = """      if (anlInfo?.esPlanificacion) {
        if (planificacionActual + horasManual > maxPlanificacionDecimal) {
          alert(`No puedes exceder el 40% de horas de planificación. Límite: ${maxPlanificacionDecimal.toFixed(1)} hrs. Actual: ${planificacionActual}`);
          return;
        }
      }"""

new_check = """      if (anlInfo?.esPlanificacion) {
        if (planificacionActual + horasManual < minPlanificacionDecimal) {
          alert(`Por ley, la planificación debe ser al menos el 40% de las horas no lectivas. La cantidad mínima que debes asignar es ${minPlanificacionDecimal.toFixed(1)} hrs.`);
          return;
        }
      }"""

code = code.replace(old_check, new_check)

with open('src/app/carga/asignacion/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done")
