const fs = require('fs');
let code = fs.readFileSync('src/app/establecimiento/config/page.tsx', 'utf8');

const search1 = `const handleCursoChange = (tienCod: number, grteCod: number, value: string) => {
    const num = parseInt(value) || 0;
    setGradosDotacion(gradosDotacion.map(g => 
      (g.tienCod === tienCod && g.grteCod === grteCod) ? { ...g, cantidadCursos: Math.max(0, num) } : g
    ));
  };`;

const repl1 = `const handleCursoChange = (tienCod: number, grteCod: number, value: string) => {
    const num = Math.max(0, parseInt(value) || 0);
    setGradosDotacion(gradosDotacion.map(g => 
      (g.tienCod === tienCod && g.grteCod === grteCod) ? { ...g, cantidadCursos: num } : g
    ));
    
    setCursosLetra(prev => {
      let newCursos = [...prev];
      const existing = newCursos.filter(c => c.tienCod === tienCod && c.grteCod === grteCod);
      if (existing.length < num) {
        for (let i = existing.length; i < num; i++) {
          // Find next available letter logic is tricky if user edited them, but we just use A,B,C mapped by index
          // But to avoid duplicate default letters if user named one "B", we can just use CharCode.
          // For simplicity, just append standard letter for the new index.
          newCursos.push({ tienCod, grteCod, letra: String.fromCharCode(65 + i), esJec: null });
        }
      } else if (existing.length > num) {
        const toRemove = existing.slice(num);
        newCursos = newCursos.filter(c => !toRemove.includes(c));
      }
      return newCursos;
    });
  };`;

code = code.replace(search1, repl1);

const search2 = `const handleJecLetraChange = (tienCod: number, grteCod: number, letra: string, checked: boolean) => {
    const existe = cursosLetra.find(c => c.tienCod === tienCod && c.grteCod === grteCod && c.letra === letra);
    if (existe) {
      setCursosLetra(cursosLetra.map(c => c === existe ? { ...c, esJec: checked } : c));
    } else {
      setCursosLetra([...cursosLetra, { tienCod, grteCod, letra, esJec: checked }]);
    }
  };`;

const repl2 = `const handleJecLetraChange = (tienCod: number, grteCod: number, oldLetra: string, checked: boolean) => {
    const existe = cursosLetra.find(c => c.tienCod === tienCod && c.grteCod === grteCod && c.letra === oldLetra);
    if (existe) {
      setCursosLetra(cursosLetra.map(c => c === existe ? { ...c, esJec: checked } : c));
    } else {
      setCursosLetra([...cursosLetra, { tienCod, grteCod, letra: oldLetra, esJec: checked }]);
    }
  };

  const handleLetraNameChange = (tienCod: number, grteCod: number, indexEnGrado: number, newLetra: string) => {
    setCursosLetra(prev => {
      const existing = prev.filter(c => c.tienCod === tienCod && c.grteCod === grteCod);
      if (existing[indexEnGrado]) {
        const target = existing[indexEnGrado];
        return prev.map(c => c === target ? { ...c, letra: newLetra } : c);
      }
      return prev;
    });
  };`;

code = code.replace(search2, repl2);

const search3 = `{Array.from({length: g.cantidadCursos}, (_, i) => String.fromCharCode(65 + i)).map(letra => {
                                const override = cursosLetra.find(c => c.tienCod === g.tienCod && c.grteCod === g.grteCod && c.letra === letra);
                                const isLetraJec = override && override.esJec !== null ? override.esJec : (g.esJec || false);
                                return (
                                  <div key={letra} className="flex items-center gap-2">
                                    <input 
                                      type="checkbox"
                                      checked={isLetraJec}
                                      onChange={(e) => handleJecLetraChange(g.tienCod, g.grteCod, letra, e.target.checked)}
                                      className="w-3 h-3 text-[#016098]"
                                    />
                                    <span className="text-[10px] text-gray-600">{letra} - {isLetraJec ? 'JEC' : 'Normal'}</span>
                                  </div>
                                );
                              })}`;

const repl3 = `{cursosLetra.filter(c => c.tienCod === g.tienCod && c.grteCod === g.grteCod).map((curso, idx) => {
                                const isLetraJec = curso.esJec !== null ? curso.esJec : (g.esJec || false);
                                return (
                                  <div key={idx} className="flex items-center gap-2">
                                    <input 
                                      type="text"
                                      value={curso.letra}
                                      onChange={(e) => handleLetraNameChange(g.tienCod, g.grteCod, idx, e.target.value.toUpperCase())}
                                      className="w-6 p-0.5 border border-gray-300 rounded text-center text-[10px] focus:outline-none focus:border-[#016098]"
                                      maxLength={2}
                                    />
                                    <input 
                                      type="checkbox"
                                      checked={isLetraJec}
                                      onChange={(e) => handleJecLetraChange(g.tienCod, g.grteCod, curso.letra, e.target.checked)}
                                      className="w-3 h-3 text-[#016098]"
                                    />
                                    <span className="text-[10px] text-gray-600">{isLetraJec ? 'JEC' : 'Normal'}</span>
                                  </div>
                                );
                              })}`;

code = code.replace(search3, repl3);

// Fix initial load of cursosLetra: when loading, some grades might have cantidadCursos > 0 but NO rows in cursosLetra yet (because they didn't have exceptions).
// We should populate missing letters on load.
const search4 = `setTodosGrados(g);
  
    if (config) {`;

const repl4 = `setTodosGrados(g);
  
    if (config) {
      // Auto-populate missing letters
      let loadedLetras = cl || [];
      config.grados.forEach((cg: any) => {
        if (cg.cantidadCursos > 0) {
          const existing = loadedLetras.filter((l: any) => l.tienCod === cg.tienCod && l.grteCod === cg.grteCod);
          if (existing.length < cg.cantidadCursos) {
            for (let i = existing.length; i < cg.cantidadCursos; i++) {
              loadedLetras.push({ tienCod: cg.tienCod, grteCod: cg.grteCod, letra: String.fromCharCode(65 + i), esJec: null });
            }
          }
        }
      });
      setCursosLetra(loadedLetras);
      `;

code = code.replace(search4, repl4);


fs.writeFileSync('src/app/establecimiento/config/page.tsx', code);
console.log('Done');
