import * as xlsx from 'xlsx';
import * as path from 'path';

const files = ['ASIGNATURAS.xls', 'ESTABLECIMIENTOS.xls', 'GRADOS.xls', 'TIPO_ENSENANZA.xls'];
const dir = path.resolve('C:\\Users\\rhormazabal\\.gemini\\antigravity\\scratch\\carga-horaria-cmds\\Tablas');

for (const file of files) {
    try {
        const wb = xlsx.readFile(path.join(dir, file));
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`\n--- ${file} ---`);
        console.log('Headers:', data[0]);
        console.log('Row 1:', data[1]);
    } catch (e: any) {
        console.error(`Error reading ${file}:`, e.message);
    }
}
