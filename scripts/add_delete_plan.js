import fs from 'fs';

let c = fs.readFileSync('src/app/establecimiento/planes/page.tsx', 'utf8');

// Update imports
c = c.replace(
  'import { getPlanesPropios, getPlanesEstudio, clonarPlanEstudioBase } from \'../../actions\';',
  'import { getPlanesPropios, getPlanesEstudio, clonarPlanEstudioBase, eliminarPlanPropio } from \'../../actions\';'
);

// Insert handleEliminarPlan function before handleClonar
const handleEliminarFunc = `
  const handleEliminarPlan = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (!confirm('¿Estás seguro que deseas ELIMINAR completamente este plan propio y todas sus horas configuradas?')) return;
    
    try {
      await eliminarPlanPropio(id);
      await loadData();
    } catch(err) {
      alert('Error al eliminar el plan');
    }
  };

  const handleClonar = async () => {
`;

c = c.replace('  const handleClonar = async () => {', handleEliminarFunc);

// Find where the plan cards are rendered
const targetLink = `              <Link 
                key={plan.id}
                href={\`/establecimiento/planes/\${plan.id}\`}
                className="bg-white rounded-xl p-5 shadow-sm border border-[#e2e8f0] hover:shadow-md hover:border-[#016098] transition-all group relative"
              >`;

const replacementLink = `              <Link 
                key={plan.id}
                href={\`/establecimiento/planes/\${plan.id}\`}
                className="bg-white rounded-xl p-5 shadow-sm border border-[#e2e8f0] hover:shadow-md hover:border-[#016098] transition-all group relative block"
              >
                {/* Botón Eliminar Absoluto */}
                <button 
                  onClick={(e) => handleEliminarPlan(e, plan.id)}
                  className="absolute top-4 right-4 text-red-300 hover:text-red-600 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm border border-transparent hover:border-red-200"
                  title="Eliminar Plan Completo"
                >
                  🗑️
                </button>`;

c = c.replace(targetLink, replacementLink);

fs.writeFileSync('src/app/establecimiento/planes/page.tsx', c);
