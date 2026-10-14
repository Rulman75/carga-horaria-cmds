const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/components/SchoolDashboard.tsx', 'utf8');

const targetStr = `<h2 className="text-2xl font-bold text-[#016098] hidden print:block mb-4">Dashboard del Establecimiento</h2>`;
const replacementStr = `<h2 className="text-2xl font-bold text-[#016098] hidden print:block mb-4">Dashboard: {data.establecimientoNombre}</h2>`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacementStr);
    fs.writeFileSync('src/app/dashboard/components/SchoolDashboard.tsx', code);
    console.log('SchoolDashboard updated.');
} else {
    console.log('Could not find target string in SchoolDashboard.tsx');
}
