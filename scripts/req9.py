import re

with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update handleAsignarNoLectiva
old_anl = r"if \(anlInfo\?\.esPlanificacion\) \{\s*if \(planificacionActual \+ horasManual < minPlanificacionDecimal\) \{"
new_anl = """if (anlInfo?.esPlanificacion) {
        if (horasLectivasAsignadas === 0) {
          alert(`Error: No puedes asignar horas de planificación si el docente aún no tiene horas de aula (lectivas) asignadas. Por favor, asigna primero las horas de aula.`);
          return;
        }
        if (planificacionActual + horasManual < minPlanificacionDecimal) {"""
code = re.sub(old_anl, new_anl, code)

# 2. Update handleGuardar
old_guardar = r"const handleGuardar = async \(\) => \{\s*if \(\!docenteSeleccionado\) return;\s*setSaving\(true\);"
new_guardar = """const handleGuardar = async () => {
      if (!docenteSeleccionado) return;
      
      if (horasLectivasAsignadas > 0 && planificacionActual < minPlanificacionDecimal) {
        alert(`Error: Por normativa, el total de horas de planificación debe ser al menos el ${pctPlanificacion}% de las horas no lectivas proporcionales a las horas de aula asignadas.\\n\\nActualmente el docente tiene ${planificacionActual} hrs de planificación.\\nEl mínimo requerido para las horas de aula actuales es de ${minPlanificacionDecimal} hrs.\\n\\nPor favor, completa las horas de planificación antes de guardar.`);
        return;
      }
      
      setSaving(true);"""
code = re.sub(old_guardar, new_guardar, code)

with open('src/app/carga/asignacion/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Applied double-layer validation for planning hours")
