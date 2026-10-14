const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const t = `const handleImportarDecreto = async () => {`;
const r = `const handleEspecialidadChange = async (asigCodStr: string, oldEspecialidad: string | null, newEspecialidad: string) => {
    if (!confirm(\`¿Mover esta asignatura a la especialidad \${newEspecialidad || 'NINGUNA'}?\`)) return;
    try {
      await updateEspecialidadAsignaturaPropia(plan.id, asigCodStr, oldEspecialidad, newEspecialidad || null);
      await loadData();
    } catch (e) {
      alert("Error al actualizar la especialidad");
    }
  };

  const handleImportarDecreto = async () => {`;

code = code.replace(t, r);
fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
