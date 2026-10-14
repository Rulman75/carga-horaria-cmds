const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const blockRegex = /\s*\{esp !== 'GLOBAL'[\s\S]*?\}\)\(\)\}/;
const match = code.match(blockRegex);

if (match) {
  const block = match[0];
  code = code.replace(blockRegex, '');
  
  const targetRegex = /(\s*)\}\)\}\s*<\/React\.Fragment>/;
  code = code.replace(targetRegex, (fullMatch, indent) => {
    return `\n${indent}  }${block}\n${fullMatch}`;
  });
  
  fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
  console.log("Moved successfully.");
} else {
  console.log("Block not found.");
}
