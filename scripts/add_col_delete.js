import fs from 'fs';

let c = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const func = `  const handleEliminarColumna = async (tienCod: number, grteCod: number) => {
    if (!confirm("¿Eliminar este nivel/curso completo de la malla?")) return;
    
    const detallesABorrar = plan.detalles.filter((d: any) => d.grteCod === grteCod && d.tienCod === tienCod);
    
    setPlan({
      ...plan,
      detalles: plan.detalles.filter((d: any) => !(d.grteCod === grteCod && d.tienCod === tienCod))
    });

    for (const d of detallesABorrar) {
      await eliminarDetallePropio(d.id);
    }
  };
`;
c = c.replace('  const handleEliminarFila = async', func + '\n  const handleEliminarFila = async');

const target_header = `{matriz.columnas.map(col => (
                        <th key={col.grteCod} className="px-4 py-3 font-semibold border-b border-r border-[#e2e8f0] text-center min-w-[100px]">
                          {col.grteDescrip}
                        </th>
                      ))}`;

const replacement_header = `{matriz.columnas.map(col => (
                        <th key={col.grteCod} className="px-4 py-3 font-semibold border-b border-r border-[#e2e8f0] text-center min-w-[100px] group relative">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span>{col.grteDescrip}</span>
                            <button 
                              onClick={() => handleEliminarColumna(matriz.tipo.tienCod, col.grteCod)}
                              className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                              title="Eliminar Curso Completo"
                            >
                              🗑️
                            </button>
                          </div>
                        </th>
                      ))}`;

c = c.replace(target_header, replacement_header);
fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', c);
