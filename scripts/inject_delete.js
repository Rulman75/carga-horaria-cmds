import fs from 'fs';

let c = fs.readFileSync('src/app/establecimiento/planes/page.tsx', 'utf8');

const target = '<div key={plan.id} className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6 hover:shadow-md transition-shadow relative overflow-hidden group">';
const replacement = target + '\n              <button onClick={(e) => handleEliminarPlan(e, plan.id)} className="absolute top-3 right-3 text-red-300 hover:text-red-600 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-red-50" title="Eliminar Plan Completo">🗑️</button>';

c = c.replace(target, replacement);

fs.writeFileSync('src/app/establecimiento/planes/page.tsx', c);
