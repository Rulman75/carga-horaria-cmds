const fs = require('fs');

let code = fs.readFileSync('src/app/establecimiento/planes/[id]/page.tsx', 'utf8');

const oldUI = `<div className="w-full h-full min-h-[48px] flex items-center justify-center hover:bg-[#e0f2fe] transition-colors">
                                                  {editingId === cellData.id ? (
                                                    <div className="flex items-center justify-center p-1">
                                                      <input 
                                                        type="number"
                                                        step="0.5"
                                                        className="w-16 h-8 border-2 border-[#0369a1] rounded text-center font-bold text-[#0369a1] focus:outline-none"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveHoras(cellData.id)}
                                                        onBlur={() => handleSaveHoras(cellData.id)}
                                                      />
                                                    </div>
                                                  ) : (
                                                    <div 
                                                      className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-2"
                                                      onClick={() => handleEdit(cellData.id, cellData.horas)}
                                                    >
                                                      <span className={\`text-lg font-bold \${cellData.horas > 0 ? 'text-[#016098]' : 'text-red-400'}\`}>
                                                        {cellData.horas}
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>`;

const newUI = `<div className="w-full h-full min-h-[48px] flex items-center justify-center hover:bg-[#e0f2fe] transition-colors">
                                                  {editingId === cellData.id ? (
                                                    <div className="flex flex-col items-center justify-center p-1 gap-1">
                                                      <div className="flex items-center gap-1">
                                                        <span className="text-[9px] font-bold text-gray-400">HRS</span>
                                                        <input 
                                                          type="number"
                                                          step="0.5"
                                                          className="w-12 h-6 border border-[#0369a1] rounded text-center font-bold text-[#0369a1] focus:outline-none text-xs"
                                                          value={editValue}
                                                          onChange={(e) => setEditValue(e.target.value)}
                                                          autoFocus
                                                          onKeyDown={(e) => e.key === 'Enter' && handleSaveHoras(cellData.id)}
                                                        />
                                                      </div>
                                                      <div className="flex items-center gap-1">
                                                        <span className="text-[9px] font-bold text-gray-400">GRP</span>
                                                        <input 
                                                          type="number"
                                                          className="w-12 h-6 border border-gray-300 rounded text-center font-bold text-gray-600 focus:outline-none text-xs"
                                                          value={editGrupos}
                                                          onChange={(e) => setEditGrupos(e.target.value)}
                                                          placeholder="Auto"
                                                          onKeyDown={(e) => e.key === 'Enter' && handleSaveHoras(cellData.id)}
                                                        />
                                                      </div>
                                                      <button onClick={() => handleSaveHoras(cellData.id)} className="text-[9px] bg-[#0369a1] text-white px-2 py-0.5 rounded w-full">Guardar</button>
                                                    </div>
                                                  ) : (
                                                    <div 
                                                      className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-2 group-cell hover:bg-[#e0f2fe]"
                                                      onClick={() => handleEdit(cellData.id, cellData.horas, cellData.grupos)}
                                                    >
                                                      <span className={\`text-lg font-bold \${cellData.horas > 0 ? 'text-[#016098]' : 'text-red-400'}\`}>
                                                        {cellData.horas}
                                                      </span>
                                                      {(cellData.grupos !== null && cellData.grupos !== undefined) && (
                                                        <span className="text-[10px] text-gray-500 font-bold bg-white px-1 rounded shadow-sm border border-gray-200 mt-1" title="Grupos específicos (sobreescribe la cantidad de cursos)">
                                                          x {cellData.grupos} grp
                                                        </span>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>`;

if (code.includes(oldUI)) {
    code = code.replace(oldUI, newUI);
    fs.writeFileSync('src/app/establecimiento/planes/[id]/page.tsx', code);
    console.log("Successfully replaced block.");
} else {
    console.log("Block not found! Using regex with whitespace agnosticism...");
    
    // Fallback: match by boundaries
    const startBound = '<div className="w-full h-full min-h-[48px] flex items-center justify-center hover:bg-[#e0f2fe] transition-colors">';
    const endBound = ')}' + '\n' + '                                                </div>';
    
    const startIndex = code.indexOf(startBound);
    if (startIndex !== -1) {
        // Find next endBound after startIndex
        const searchSubstr = code.substring(startIndex);
        // We know it's the specific block because it's right before `: (` of the ternary
        // Just extract based on structure if possible, but actually let's try replacing white spaces in oldUI
    }
    
    // Instead of complex logic, remove all whitespace and check
    const normalize = str => str.replace(/\\s+/g, '');
    const codeNorm = normalize(code);
    const oldNorm = normalize(oldUI);
    if(codeNorm.includes(oldNorm)) {
        console.log("Found it without whitespace, replacing manually...");
        // Use a looser regex
    }
}
