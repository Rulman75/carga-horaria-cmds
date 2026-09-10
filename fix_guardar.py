import sys

with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_handle = """    const handleGuardar = async () => {
      if (!docenteSeleccionado) return;
      setSaving(true);
      try {
        const payloads = cargas.filter(c => !c.eliminada);
        await saveCargasHorarias(Number(docenteSeleccionado), payloads, ESTABLECIMIENTO_ID || undefined, observacionCarga);
        alert('Carga guardada correctamente');
        loadTodasCargas();
      } catch (e) {
        alert('Error guardando carga');
      }
      setSaving(false);
    };"""

new_handle = """    const handleGuardar = async () => {
      if (!docenteSeleccionado) return;
      setSaving(true);
      try {
        const payloads = cargas.filter(c => !c.eliminada);
        await saveCargasHorarias(Number(docenteSeleccionado), payloads, ESTABLECIMIENTO_ID || undefined, observacionCarga);
        
        // Update local state so it doesn't revert when switching teachers
        setDocentes(prev => prev.map(d => {
          if (d.id.toString() === docenteSeleccionado) {
            return {
              ...d,
              establecimientos: d.establecimientos.map((est: any) => 
                est.establecimientoId === ESTABLECIMIENTO_ID 
                  ? { ...est, observacionCarga } 
                  : est
              )
            };
          }
          return d;
        }));

        alert('Carga guardada correctamente');
        loadTodasCargas();
      } catch (e) {
        alert('Error guardando carga');
      }
      setSaving(false);
    };"""

code = code.replace(old_handle, new_handle)

with open('src/app/carga/asignacion/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done handleGuardar")
