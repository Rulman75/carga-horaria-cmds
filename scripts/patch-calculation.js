const fs = require('fs');
let code = fs.readFileSync('src/app/carga/asignacion/page.tsx', 'utf8');

const helper = `
    const calcularHorasConsumidas = (cargasFiltradas: any[]) => {
      const porLetra: Record<string, any[]> = {};
      cargasFiltradas.forEach(c => {
        const l = c.letraCurso || 'GENERIC';
        if (!porLetra[l]) porLetra[l] = [];
        porLetra[l].push(c);
      });

      let totalConsumido = 0;
      for (const letra in porLetra) {
        const cargasLetra = porLetra[letra];
        const porDesdoble: Record<string, number> = {};
        cargasLetra.forEach(c => {
          const g = (c.esDesdoble && c.grupoDesdoble) ? c.grupoDesdoble.toUpperCase().trim() : 'DEFAULT';
          if (!porDesdoble[g]) porDesdoble[g] = 0;
          porDesdoble[g] += c.horasAllocadas;
        });

        let maxEnLetra = 0;
        for (const g in porDesdoble) {
          if (porDesdoble[g] > maxEnLetra) maxEnLetra = porDesdoble[g];
        }
        totalConsumido += maxEnLetra;
      }
      return totalConsumido;
    };

    const getLetras`;

code = code.replace(/const getLetras/g, helper);

// Replace the reduce logic in both instances
// We will replace:
// const tomadasGlobal = todasCargas.filter(...).reduce((sum, c) => sum + c.horasAllocadas, 0);
// With:
// const tomadasGlobal = calcularHorasConsumidas(todasCargas.filter(...));

code = code.replace(
  /\.reduce\(\(sum, c\) => sum \+ c\.horasAllocadas, 0\);/g,
  `);`
);

code = code.replace(
  /const tomadasGlobal = todasCargas\.filter/g,
  `const tomadasGlobal = calcularHorasConsumidas(todasCargas.filter`
);

code = code.replace(
  /const tomadasOtros = tomadasGlobal - todasCargas\.filter/g,
  `const tomadasOtros = tomadasGlobal - calcularHorasConsumidas(todasCargas.filter`
);

fs.writeFileSync('src/app/carga/asignacion/page.tsx', code);
