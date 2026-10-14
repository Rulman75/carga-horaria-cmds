const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const regex = /(\s*)\}\)\}\n(\s*)<\/React\.Fragment>/;

code = code.replace(regex, (fullMatch, indent1, indent2) => {
    return `${indent1}})}\n${indent1}  {esp !== 'GLOBAL' && filasDeEspecialidad.length > 0 && (() => {
${indent1}    return (
${indent1}      <tr className="bg-sky-50 font-bold text-[#016098] border-b-2 border-b-[#016098] shadow-sm">
${indent1}        <td className="px-4 py-2 text-right border-r border-[#e2e8f0] sticky left-0 z-10 bg-sky-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] uppercase tracking-wider text-xs">
${indent1}          Total {esp}
${indent1}        </td>
${indent1}        {matriz.columnas.map((col: any) => {
${indent1}          let sumCol = 0;
${indent1}          filasDeEspecialidad.forEach((f: any) => {
${indent1}            const cData = matriz.matrizDatos.get(\`\${f.asigCod}-\${f._especialidad || 'NONE'}-\${col.grteCod}\`);
${indent1}            if (cData) sumCol += cData.horas;
${indent1}          });
${indent1}          return (
${indent1}            <td key={\`sub-\${col.grteCod}\`} className="text-center px-4 py-2 border-r border-blue-200 text-sm">
${indent1}              {sumCol > 0 ? sumCol : ''}
${indent1}            </td>
${indent1}          );
${indent1}        })}
${indent1}        <td className="px-4 py-2 font-black border-l-2 border-l-[#016098] border-r border-[#e2e8f0] text-center min-w-[120px] bg-sky-100 text-[#016098] text-lg">
${indent1}          {(() => {
${indent1}            let totalReal = 0;
${indent1}            matriz.columnas.forEach((col: any) => {
${indent1}              filasDeEspecialidad.forEach((f: any) => {
${indent1}                const cData = matriz.matrizDatos.get(\`\${f.asigCod}-\${f._especialidad || 'NONE'}-\${col.grteCod}\`);
${indent1}                if (cData && (col.grteCod > 40 || isEspecialistaAsig(f))) {
${indent1}                  totalReal += (cData.horas * (col.cantidadCursos || 0));
${indent1}                }
${indent1}              });
${indent1}            });
${indent1}            return totalReal > 0 ? totalReal : '-';
${indent1}          })()}
${indent1}        </td>
${indent1}        <td className="border-b border-l border-[#e2e8f0] px-3 py-2 bg-sky-50"></td>
${indent1}      </tr>
${indent1}    );
${indent1}  })()}
${indent2}</React.Fragment>`;
});

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
console.log("Regex replacement executed.");
