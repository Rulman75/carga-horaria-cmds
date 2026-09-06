import fs from 'fs';

let c = fs.readFileSync('src/components/SidebarLayout.tsx', 'utf8');

if (!c.includes('usePathname')) {
    c = c.replace(
        "import Link from 'next/link';",
        "import Link from 'next/link';\nimport { usePathname } from 'next/navigation';"
    );
    fs.writeFileSync('src/components/SidebarLayout.tsx', c);
}
