const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/components/SchoolDashboard.tsx', 'utf8');

const oldHeader = `<h2 className="text-2xl font-bold text-[#016098]">Dashboard del Establecimiento</h2>`;
const newHeader = `<div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-[#016098]">Dashboard del Establecimiento</h2>
        <button 
          onClick={() => window.print()}
          className="bg-[#016098] text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Imprimir / PDF
        </button>
      </div>
      <h2 className="text-2xl font-bold text-[#016098] hidden print:block mb-4">Dashboard del Establecimiento</h2>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/app/dashboard/components/SchoolDashboard.tsx', code);
console.log('SchoolDashboard updated.');
