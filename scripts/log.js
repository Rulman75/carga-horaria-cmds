const fs = require('fs');
let code = fs.readFileSync('src/app/actions.ts', 'utf8');
code = code.replace(
  /if \(user && await bcrypt\.compare\(pass, user\.password\)\) \{/,
  `console.log('Login attempt for:', email);
  if (user) console.log('User found in DB');
  const isMatch = user ? await bcrypt.compare(pass, user.password) : false;
  console.log('Password match:', isMatch);
  if (isMatch) {`
);
fs.writeFileSync('src/app/actions.ts', code);
