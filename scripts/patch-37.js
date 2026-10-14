const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const regex = /<tr className=\{esp === 'GLOBAL' \? 'bg-gray-100' : 'bg-blue-50\/50'\}>\s*<td colSpan=\{matriz\.columnas\.length \+ 3\} className=\{\`px-4 py-1\.5 text-\[10px\] font-black uppercase tracking-widest \$\{esp === 'GLOBAL' \? 'text-gray-600 border-gray-200' : 'text-blue-900 border-blue-200'\} border-b sticky left-0 z-10 shadow-\[2px_0_5px_-2px_rgba\(0,0,0,0\.05\)\]\`\}>\s*.*?\{esp === 'GLOBAL' \? 'GLOBAL \(SIN ESPECIALIDAD\)' : \`MÓDULO \/ ESPECIALIDAD: \$\{esp\}\`\}\s*<\/td>\s*<\/tr>/m;

// In case the encoding is tricky with MÓDULO, let's use a simpler replace strategy:
const lines = code.split('\n');
let newLines = [];
let replacing = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("esp === 'GLOBAL' ? 'bg-gray-100' : 'bg-blue-50/50'")) {
    replacing = true;
    newLines.push(`                                      <tr className={esp === 'GLOBAL' ? 'bg-gray-200' : 'bg-[#e0f2fe]'}>
                                        <td colSpan={matriz.columnas.length + 3} className={\`px-4 py-2 text-[13px] font-extrabold uppercase tracking-widest border-b border-gray-300 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] \${esp === 'GLOBAL' ? 'text-gray-700' : 'text-[#016098] border-l-4 border-l-[#016098]'}\`}>
                                          {esp === 'GLOBAL' ? '📁 GLOBAL (SIN ESPECIALIDAD)' : \`⚙️ MÓDULO / ESPECIALIDAD: \${esp}\`}
                                        </td>
                                      </tr>`);
  } else if (replacing) {
    if (lines[i].includes("</tr>")) {
      replacing = false;
    }
  } else {
    newLines.push(lines[i]);
  }
}

fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', newLines.join('\n'));
