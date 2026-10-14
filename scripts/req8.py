import re

with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Put it back in handleAsignarNoLectiva
old_anl = r"const handleAsignarNoLectiva = \(\) => \{\s*if \(\!anlSeleccionada\) return;\s*const anlInfo = actividadesNL\.find\(a => a\.id\.toString\(\) === anlSeleccionada\);\s*const planId = detallesPlan\[0\]\?\.planEstablecimientoId \|\| todasCargas\[0\]\?\.planEstablecimientoId \|\| 1;"

new_anl = """const handleAsignarNoLectiva = () => {
      if (!anlSeleccionada) return;
      const anlInfo = actividadesNL.find(a => a.id.toString() === anlSeleccionada);
      
      if (anlInfo?.esPlanificacion) {
        if (planificacionActual + horasManual < minPlanificacionDecimal) {
          alert(`Por normativa, la planificación debe ser al menos el ${pctPlanificacion}% de las horas no lectivas proporcionales (${maxNoLectivasPropStr}). La cantidad mínima esperada es ${minPlanificacionDecimal.toFixed(1)} hrs.`);
          return;
        }
      }
      
      const planId = detallesPlan[0]?.planEstablecimientoId || todasCargas[0]?.planEstablecimientoId || 1;"""

code = re.sub(old_anl, new_anl, code)

# Remove the one from handleGuardar
old_guardar = r"const handleGuardar = async \(\) => \{\s*if \(\!docenteSeleccionado\) return;\s*if \(horasLectivasAsignadas > 0 && planificacionActual < minPlanificacionDecimal\) \{\s*alert\([\s\S]*?\);\s*return;\s*\}\s*setSaving\(true\);"

new_guardar = """const handleGuardar = async () => {
      if (!docenteSeleccionado) return;
      setSaving(true);"""

code = re.sub(old_guardar, new_guardar, code)

with open('src/app/carga/asignacion/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Reverted to old logic")
