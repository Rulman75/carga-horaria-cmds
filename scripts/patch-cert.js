const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const search = `          <tr style="background-color: #e5e7eb; font-weight: bold;">
            <td style="text-align: right;">TOTAL HORAS CONTRATO</td>
            <td class="center">\${Math.ceil(asigTotal)} H</td>
          </tr>
        </table>`;

const repl = `          <tr style="background-color: #e5e7eb; font-weight: bold;">
            <td style="text-align: right;">TOTAL HORAS CONTRATO</td>
            <td class="center">\${Math.ceil(asigTotal)} H</td>
          </tr>
        </table>
        \` + (observacionCarga ? \`
        <div class="section">Observaciones Adicionales</div>
        <p style="font-size: 14px; text-align: justify; white-space: pre-wrap;">\${observacionCarga}</p>
        \` : \`\`) + \``;

code = code.replace(search, repl);
fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
