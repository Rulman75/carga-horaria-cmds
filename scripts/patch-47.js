const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const regex = /\s*\{esp !== 'GLOBAL'[\s\S]*?\}\)\(\)\}/;
const match = code.match(regex);

if (match) {
  const block = match[0];
  code = code.replace(regex, '');
  
  // Now place it correctly
  const anchor = '                                  })}';
  code = code.replace(anchor, anchor + block);
  
  fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
  console.log("Successfully moved the subtotal block!");
} else {
  console.log("Could not find the block");
}
