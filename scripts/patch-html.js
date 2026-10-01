const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const oldStr = '        </table>\n\n        <div class="section">III. Declaraci';
const oldStr2 = '        </table>\r\n\r\n        <div class="section">III. Declaraci';

const newStr = `        </table>
        \` + (observacionCarga ? \`
        <div class="section">Observaciones Adicionales</div>
        <p style="font-size: 14px; text-align: justify; white-space: pre-wrap;">\${observacionCarga}</p>
        \` : \`\`) + \`

        <div class="section">III. Declaraci`;

code = code.replace(oldStr, newStr);
code = code.replace(oldStr2, newStr);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
