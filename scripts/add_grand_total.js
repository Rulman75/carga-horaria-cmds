import fs from 'fs';

let c = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const target = `        {matricesPorTipo.length === 0 && (
          <div className="bg-white p-10 rounded-xl border border-[#e2e8f0] text-center text-gray-500">
            El plan clonado no contenía ninguna asignatura.
          </div>
        )}
      </div>`;

const replacement = `        {matricesPorTipo.length === 0 && (
          <div className="bg-white p-10 rounded-xl border border-[#e2e8f0] text-center text-gray-500">
            El plan clonado no contenía ninguna asignatura.
          </div>
        )}

        {/* GRAND TOTAL DEL ESTABLECIMIENTO */}
        {matricesPorTipo.length > 0 && (
          <div className="bg-[#016098] rounded-xl shadow-lg border border-[#014d7a] p-6 text-white mt-4 mb-8 mx-2 shrink-0">
            <h2 className="text-xl font-bold mb-4 border-b border-[#014d7a] pb-2 text-center md:text-left">Resumen Global del Plan de Estudio</h2>
            
            {(() => {
              let granTotalReales = 0;
              matricesPorTipo.forEach(m => {
                m.columnas.forEach((col: any) => {
                  let sumaCol = 0;
                  m.filas.forEach((f: any) => {
                    const cData = m.matrizDatos.get(\`\${f.asigCod}-\${col.grteCod}\`);
                    if (cData) sumaCol += cData.horas;
                  });
                  granTotalReales += sumaCol * (col.cantidadCursos || 0);
                });
              });
              
              const granTotalDocentes = (granTotalReales / 28.6).toFixed(1);

              return (
                <div className="flex flex-col md:flex-row gap-8 items-center justify-around py-2">
                  <div className="text-center">
                    <div className="text-sm text-sky-200 uppercase tracking-widest font-semibold mb-1">Total Horas Reales Malla</div>
                    <div className="text-4xl font-black">{granTotalReales} <span className="text-xl font-medium">hrs</span></div>
                  </div>
                  <div className="hidden md:block w-px h-16 bg-[#014d7a]"></div>
                  <div className="text-center">
                    <div className="text-sm text-emerald-300 uppercase tracking-widest font-semibold mb-1">Total Docentes del Establecimiento</div>
                    <div className="text-5xl font-black text-emerald-400">{granTotalDocentes}</div>
                    <div className="text-xs text-sky-200 mt-2 font-light">Proyección contratos 44 Hrs (65/35)</div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>`;

c = c.replace(target, replacement);

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', c);
