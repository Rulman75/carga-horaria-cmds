import sys

with open('src/app/dashboard/components/SchoolDashboard.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

new_section = """
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 mt-6">
        <h3 className="text-gray-500 font-semibold mb-4">Avance de Cobertura Curricular (Horas Pedagógicas)</h3>
        {data.subjectProgress && data.subjectProgress.length > 0 ? (
          <div className="space-y-4">
            {data.subjectProgress.map((sub: any, idx: number) => {
              const pct = sub.needed > 0 ? Math.min(100, Math.round((sub.assigned / sub.needed) * 100)) : 0;
              const color = pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-500';
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">{sub.name}</span>
                    <span className="text-gray-500">{sub.assigned} / {sub.needed} hrs asignadas</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">No hay asignaturas en el plan de estudio.</p>
        )}
      </div>
    </div>
  );
}
"""

code = code.replace("    </div>\n  );\n}", new_section)

with open('src/app/dashboard/components/SchoolDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
    
print("Dashboard updated")
