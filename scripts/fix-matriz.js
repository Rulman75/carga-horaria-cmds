const fs = require('fs');
let code = fs.readFileSync('src/app/carga/matriz-clasica/page.tsx', 'utf8');

// Fix 1: Add _combinados to docentesMap init
code = code.replace(
  'totalExtraCrono: 0\n    };',
  'totalExtraCrono: 0,\n      _combinadosBase: {},\n      _combinadosJec: {}\n    };'
);

// Fix 2: Replace cargas.forEach block to handle combinados
const oldCargasLoop = `  cargas.forEach(c => {
    const d = docentesMap[c.docenteId];
    if (!d) return;

    if (c.tipoCarga === 'LECTIVA') {
      const isJec = c.asignatura?.esTallerJec || false;
      const asigDesc = c.asignatura?.asigDescripcion || 'Desconocida';
      
      const key = \`\${c.asignaturaCod}|\${asigDesc}\`;
      if (isJec) {
        asignaturasJecSet.add(key);
        d.asignaturasJec[key] = (d.asignaturasJec[key] || 0) + c.horasAllocadas;
      } else {
        asignaturasBaseSet.add(key);
        d.asignaturasBase[key] = (d.asignaturasBase[key] || 0) + c.horasAllocadas;
      }
    } else if (c.tipoCarga === 'NO_LECTIVA') {
      const anlDesc = c.actividadNoLectiva?.descripcion || 'No Lectiva';
      const finan = c.financiamiento || 'Normal';
      const key = \`\${c.actividadNoLectivaId}|\${anlDesc}|\${finan}\`;
      anlSet.add(key);
      d.anls[key] = (d.anls[key] || 0) + c.horasAllocadas;
      d.totalAnlCrono += c.horasAllocadas;
    } else if (c.tipoCarga === 'EXTRACURRICULAR') {
      const extDesc = c.actividadExtracurricular?.descripcion || 'Extracurricular';
      const finan = c.financiamiento || 'Normal';
      const key = \`\${c.actividadExtracurricularId}|\${extDesc}|\${finan}\`;
      extSet.add(key);
      d.extras[key] = (d.extras[key] || 0) + c.horasAllocadas;
      d.totalExtraCrono += c.horasAllocadas;
    }
  });`;

const newCargasLoop = `  cargas.forEach(c => {
    const d = docentesMap[c.docenteId];
    if (!d) return;

    if (c.tipoCarga === 'LECTIVA') {
      const isJec = c.asignatura?.esTallerJec || false;
      const asigDesc = c.asignatura?.asigDescripcion || 'Desconocida';
      
      const asigKey = \`\${c.asignaturaCod}|\${asigDesc}\`;
      if (isJec) asignaturasJecSet.add(asigKey);
      else asignaturasBaseSet.add(asigKey);

      if (c.esCombinado && c.grupoCombinado) {
        const g = c.grupoCombinado.toUpperCase().trim();
        const combKey = \`\${asigKey}|\${g}\`;
        
        if (isJec) {
          if (!d._combinadosJec[combKey]) d._combinadosJec[combKey] = [];
          d._combinadosJec[combKey].push(c.horasAllocadas);
        } else {
          if (!d._combinadosBase[combKey]) d._combinadosBase[combKey] = [];
          d._combinadosBase[combKey].push(c.horasAllocadas);
        }
      } else {
        if (isJec) d.asignaturasJec[asigKey] = (d.asignaturasJec[asigKey] || 0) + c.horasAllocadas;
        else d.asignaturasBase[asigKey] = (d.asignaturasBase[asigKey] || 0) + c.horasAllocadas;
      }
    } else if (c.tipoCarga === 'NO_LECTIVA') {
      const anlDesc = c.actividadNoLectiva?.descripcion || 'No Lectiva';
      const finan = c.financiamiento || 'Normal';
      const key = \`\${c.actividadNoLectivaId}|\${anlDesc}|\${finan}\`;
      anlSet.add(key);
      d.anls[key] = (d.anls[key] || 0) + c.horasAllocadas;
      d.totalAnlCrono += c.horasAllocadas;
    } else if (c.tipoCarga === 'EXTRACURRICULAR') {
      const extDesc = c.actividadExtracurricular?.descripcion || 'Extracurricular';
      const finan = c.financiamiento || 'Normal';
      const key = \`\${c.actividadExtracurricularId}|\${extDesc}|\${finan}\`;
      extSet.add(key);
      d.extras[key] = (d.extras[key] || 0) + c.horasAllocadas;
      d.totalExtraCrono += c.horasAllocadas;
    }
  });

  // Apply Math.max for combined classes
  Object.values(docentesMap).forEach((d: any) => {
    for (const combKey in d._combinadosBase) {
      const asigKey = combKey.substring(0, combKey.lastIndexOf('|'));
      d.asignaturasBase[asigKey] = (d.asignaturasBase[asigKey] || 0) + Math.max(...d._combinadosBase[combKey]);
    }
    for (const combKey in d._combinadosJec) {
      const asigKey = combKey.substring(0, combKey.lastIndexOf('|'));
      d.asignaturasJec[asigKey] = (d.asignaturasJec[asigKey] || 0) + Math.max(...d._combinadosJec[combKey]);
    }
  });`;

code = code.replace(oldCargasLoop, newCargasLoop);

// Fix 3: Math.round(totalAulaPed)
code = code.replace(
  'const row = tablaConversion.find(r => r.lectivasPedagogicas === totalAulaPed);',
  'const row = tablaConversion.find(r => r.lectivasPedagogicas === Math.round(totalAulaPed));'
);

fs.writeFileSync('src/app/carga/matriz-clasica/page.tsx', code);
