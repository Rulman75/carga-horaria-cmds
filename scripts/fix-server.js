const fs = require('fs');
let actionsCode = fs.readFileSync('src/app/actions.ts', 'utf8');

// Strip out ALL 'use server' variations
actionsCode = actionsCode.replace(/'use server';/g, '');
actionsCode = actionsCode.replace(/"use server";/g, '');

// Strip leading whitespace
actionsCode = actionsCode.trimStart();

// Put 'use server' at the very top
actionsCode = "'use server';\n" + actionsCode;

fs.writeFileSync('src/app/actions.ts', actionsCode);
