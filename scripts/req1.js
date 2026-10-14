const fs = require('fs');
let code = fs.readFileSync('src/components/SidebarLayout.tsx', 'utf8');

code = code.replace(
    'className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-md shadow-md text-[#016098]"',
    'className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-md shadow-md text-[#016098] print:hidden"'
);

code = code.replace(
    'fixed md:static inset-y-0 left-0 z-40',
    'fixed md:static inset-y-0 left-0 z-40 print:hidden'
);

code = code.replace(
    '<main className="flex-1 overflow-auto h-screen bg-[#f8fafc] p-6 md:p-8">',
    '<main className="flex-1 overflow-auto h-screen bg-[#f8fafc] p-6 md:p-8 print:p-0 print:h-auto print:overflow-visible">'
);

fs.writeFileSync('src/components/SidebarLayout.tsx', code);
console.log('SidebarLayout updated.');
