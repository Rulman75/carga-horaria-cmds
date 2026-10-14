const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/components/GlobalDashboard.tsx', 'utf8');

const regex = /<\/ResponsiveContainer>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);/m;

const addition = `</ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 mt-6">
        <h3 className="text-gray-500 font-semibold mb-4">Progreso de Asignación (UTP) por Establecimiento</h3>
        <p className="text-xs text-gray-400 mb-4">Muestra el avance en la configuración de la carga horaria respecto a la capacidad de contrato del colegio.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
          {[...data.schoolStats].sort((a,b) => (b.asignado/(b.contrato||1)) - (a.asignado/(a.contrato||1))).map((d: any, i: number) => {
            const pctReal = d.contrato > 0 ? Math.round((d.asignado / d.contrato) * 100) : 0;
            const pct = Math.min(100, pctReal);
            return (
              <div key={i} className="flex flex-col gap-1 mb-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700 truncate w-3/4" title={d.nombre}>{d.nombre}</span>
                  <span className={\`font-bold \${pctReal >= 100 ? 'text-green-600' : pctReal > 50 ? 'text-[#016098]' : 'text-orange-500'}\`}>{pctReal}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={\`h-2 rounded-full transition-all duration-500 \${pctReal >= 100 ? 'bg-green-500' : pctReal > 50 ? 'bg-[#39BABD]' : 'bg-orange-400'}\`} 
                    style={{ width: \`\${pct}%\` }}
                  ></div>
                </div>
                <div className="text-[10px] text-gray-400 text-right">
                  {d.asignado} / {d.contrato} hrs asignadas
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );`;

code = code.replace(regex, addition);
fs.writeFileSync('src/app/dashboard/components/GlobalDashboard.tsx', code);
