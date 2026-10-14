import re

with open('src/app/carga/matriz-clasica/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    'const contrato = d.totalDefinitivo || d.totalJornada || d.horasTitular || 0;',
    'const contratoHoras = d.totalDefinitivo || d.totalJornada || d.horasTitular || 0;'
)

code = code.replace(
    'const colacion = contrato >= 30 ? (config?.horasColacion || 2) : 1;',
    'const colacion = contratoHoras >= 30 ? (config?.horasColacion || 2) : 1;'
)

code = code.replace(
    '        ...d,\n        contrato,\n',
    '        ...d,\n        contratoHoras,\n'
)

code = code.replace(
    '<td className="px-2 py-2 text-center font-bold sticky left-[250px] bg-white z-10 border-r">{doc.contrato}</td>',
    '<td className="px-2 py-2 text-center font-bold sticky left-[250px] bg-white z-10 border-r">{doc.contratoHoras}</td>'
)

code = code.replace(
    'const balance = doc.contrato - asignadoCronoTotal;',
    'const balance = doc.contratoHoras - asignadoCronoTotal;'
)

code = code.replace(
    '<div className="text-[10px] text-gray-500">{doc.rut}</div>',
    '<div className="text-[10px] text-gray-500">{doc.rut} - {doc.contrato || doc.tipoContrato || "No especificado"}</div>'
)

with open('src/app/carga/matriz-clasica/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
