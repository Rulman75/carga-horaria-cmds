import re

with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove the block
pattern = r"if \(anlInfo\?\.esPlanificacion\) \{[\s\S]*?return;\s*\}\s*\}"
code = re.sub(pattern, '', code)

# Update handleGuardar
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

print("done")
