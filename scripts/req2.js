const fs = require('fs');

let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

// 1. Change Contract Row
const oldContractRow = `<tr><td><strong>Tipo de Contrato:</strong></td><td>\${totalHorasContrato} horas cronolgicas</td></tr>`;
const oldContractRowFallback = `<tr><td><strong>Tipo de Contrato:</strong></td><td>\${totalHorasContrato} horas cronológicas</td></tr>`;

const newContractRow = `<tr><td><strong>Tipo de Contrato:</strong></td><td style="text-transform: capitalize;">\${docenteSeleccionadoObj.contrato ? docenteSeleccionadoObj.contrato.toLowerCase() : 'No especificado'}</td></tr>
          <tr><td><strong>Horas Contrato:</strong></td><td>\${totalHorasContrato} horas cronológicas</td></tr>`;

if (code.includes(oldContractRow)) {
    code = code.replace(oldContractRow, newContractRow);
} else if (code.includes(oldContractRowFallback)) {
    code = code.replace(oldContractRowFallback, newContractRow);
} else {
    // try regex ignoring encoding
    code = code.replace(/<tr><td><strong>Tipo de Contrato:<\/strong><\/td><td>\$\{totalHorasContrato\} horas cronol.gicas<\/td><\/tr>/, newContractRow);
}

// 2. Adjust Table Columns
const oldTableHead = `<td class="center font-bold" width="20%">CURSO</td>
            <td class="center font-bold">ASIGNATURA</td>
            <td class="center font-bold" width="20%">HORAS</td>`;
const newTableHead = `<td class="center font-bold" width="35%">CURSO</td>
            <td class="center font-bold">ASIGNATURA</td>
            <td class="center font-bold" width="15%">HORAS</td>`;

if (code.includes(oldTableHead)) {
    code = code.replace(oldTableHead, newTableHead);
} else {
    code = code.replace(/<td class="center font-bold" width="20%">CURSO<\/td>\s*<td class="center font-bold">ASIGNATURA<\/td>\s*<td class="center font-bold" width="20%">HORAS<\/td>/, newTableHead);
}

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
console.log('Requirement 2 applied.');
