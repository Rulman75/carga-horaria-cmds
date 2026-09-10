import sys

with open('src/app/establecimiento/planes/[id]/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Normalize search and increase limit
old_filter = """  const filteredAsignaturas = todasAsignaturas.filter(a => 
    a.asigDescripcion.toLowerCase().includes(searchAsig.toLowerCase()) || 
    a.asigCod.toLowerCase().includes(searchAsig.toLowerCase())
  ).slice(0, 50);"""

new_filter = """  const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  const filteredAsignaturas = todasAsignaturas.filter(a => {
    const term = normalize(searchAsig);
    return normalize(a.asigDescripcion).includes(term) || a.asigCod.toLowerCase().includes(searchAsig.toLowerCase());
  }).slice(0, 150);"""

code = code.replace(old_filter, new_filter)

# 2. Render the code in the label
old_label = """<span className="text-sm text-gray-800 font-medium">{a.asigDescripcion}</span>"""
new_label = """<span className="text-sm text-gray-800 font-medium"><span className="text-gray-400 font-mono text-xs mr-2">[{a.asigCod}]</span>{a.asigDescripcion}</span>"""

code = code.replace(old_label, new_label)

with open('src/app/establecimiento/planes/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done search fix")
