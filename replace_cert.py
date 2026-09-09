import sys

with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

start_tag = 'const printCertificado = () => {'
end_tag = '  };\n'

start_idx = code.find(start_tag)
end_idx = code.find(end_tag, start_idx) + len(end_tag)

if start_idx == -1 or end_idx == -1:
    print("Tags not found")
    sys.exit(1)

new_code = """const printCertificado = () => {
    if (!docenteSeleccionadoObj) {
      alert('Por favor selecciona un docente primero.');
      return;
    }
    
    const estName = estConfig?.esedDescripcion || 'Establecimiento Educativo';
    const directorName = estConfig?.nombreDirector || 'Director(a)';
    
    const totalJornadaSema = Math.round(horasLectivasAsignadas * 45 / 60) + recreoDecimal + horasNoLectivasAsignadas;
    const asigTotal = totalJornadaSema + horasExtraAsignadas + colacion;
    
    const formatTime = (cronoDecimal: number) => {
      if (!cronoDecimal) return '0 H';
      const h = Math.floor(cronoDecimal);
      const m = Math.round((cronoDecimal - h) * 60);
      if (h > 0 && m > 0) return h + ' H ' + m + ' MIN';
      if (h > 0) return h + ' H';
      if (m > 0) return m + ' MIN';
      return '0 H';
    };

    const html = `
    <html>
      <head>
        <title>Certificado - ${docenteSeleccionadoObj.apellidos}</title>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 40px; line-height: 1.5; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 10px; font-size: 13px; text-align: left; }
          th { background-color: #f3f4f6; }
          .center { text-align: center; }
          .font-bold { font-weight: bold; }
          .title { font-size: 18px; font-weight: bold; text-align: center; text-transform: uppercase; text-decoration: underline; margin-bottom: 5px; }
          .subtitle { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 30px; }
          .section { font-weight: bold; font-size: 16px; margin-top: 30px; margin-bottom: 10px; text-decoration: underline; }
          .flex { display: flex; justify-content: space-between; margin-top: 100px; }
          .signature { width: 40%; text-align: center; border-top: 1px solid #000; padding-top: 5px; font-size: 14px; }
          @media print { @page { margin: 20mm; } }
        </style>
      </head>
      
      <body>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <img src="${window.location.origin}/logo.png" alt="Logo CMDS" style="height: 70px; object-fit: contain;" />
          <div style="text-align: right; font-size: 12px; color: #666; font-weight: bold;">
             Corporación Municipal de Desarrollo Social<br/>
             Antofagasta
          </div>
        </div>
        <div class="title">Formulario de Conocimiento y Aceptación de Carga Horaria Docente</div>

        <div class="subtitle">Año Escolar 2027</div>

        <div class="section">I. Antecedentes del Docente</div>
        <table>
          <tr><td width="30%"><strong>Nombre Completo:</strong></td><td>${docenteSeleccionadoObj.nombres} ${docenteSeleccionadoObj.apellidos}</td></tr>
          <tr><td><strong>RUT:</strong></td><td>${docenteSeleccionadoObj.rut}</td></tr>
          <tr><td><strong>Establecimiento Educativo:</strong></td><td>${estName}</td></tr>
          <tr><td><strong>Tipo de Contrato:</strong></td><td>${totalHorasContrato} horas cronológicas</td></tr>
        </table>

        <div class="section">II. Detalle de Carga Horaria (Año Escolar 2027)</div>
        <p style="font-size: 14px;">Se detalla a continuación la distribución de las horas cronológicas asignadas para el presente periodo escolar, de acuerdo con la normativa vigente:</p>
        
        <table>
          <tr><th colspan="3" class="center">DESCRIPCIÓN HORAS LECTIVAS</th></tr>
          <tr style="background-color: #fff;">
            <td class="center font-bold" width="20%">CURSO</td>
            <td class="center font-bold">ASIGNATURA</td>
            <td class="center font-bold" width="20%">HORAS</td>
          </tr>
          ` + cargasVivas.filter(c => c.tipoCarga === 'LECTIVA').map(c => 
            "<tr><td class='center'>" + getGradoNombre(c.tienCod, c.grteCod) + (c.letraCurso ? " " + c.letraCurso : "") + "</td>" +
            "<td class='center'>" + (todasAsignaturas.find(a => a.asigCod === c.codAsignatura)?.asigDescripcion || c.nombre) + "</td>" +
            "<td class='center'>" + c.horas + "</td></tr>"
          ).join('') + `
          <tr style="background-color: #f3f4f6; font-weight: bold;">
            <td colspan="2" style="text-align: right;">HORAS PEDAGÓGICAS (LECTIVAS / AULA)</td>
            <td class="center">${Math.round(horasLectivasAsignadas)}</td>
          </tr>
          <tr style="background-color: #f3f4f6; font-weight: bold;">
            <td colspan="2" style="text-align: right;">HORAS CRONOLÓGICAS LECTIVAS</td>
            <td class="center">${formatTime(horasLectivasAsignadas * 45 / 60)}</td>
          </tr>
        </table>

        <table>
          <tr><th colspan="2" class="center">DESCRIPCIÓN HORAS NO LECTIVAS</th></tr>
          ` + cargasVivas.filter(c => c.tipoCarga === 'NO_LECTIVA').map(c => 
            "<tr><td>" + c.nombre + "</td>" +
            "<td class='center' width='30%'>" + formatTime(c.horas) + "</td></tr>"
          ).join('') + `
          <tr style="background-color: #f3f4f6; font-weight: bold;">
            <td style="text-align: right;">TOTAL HORAS NO LECTIVAS</td>
            <td class="center" width="30%">${formatTime(horasNoLectivasAsignadas)}</td>
          </tr>
        </table>

        <table>
          <tr><th colspan="2" class="center">CÁLCULO HORAS CRONOLÓGICAS CONTRATO</th></tr>
          <tr>
            <td>HORAS CRONOLÓGICAS LECTIVAS</td>
            <td class="center" width="30%">${formatTime(horasLectivasAsignadas * 45 / 60)}</td>
          </tr>
          ` + cargasVivas.filter(c => c.tipoCarga === 'EXTRACURRICULAR').map(c => 
            "<tr><td>HORAS CRONOLÓGICAS " + c.nombre.toUpperCase() + "</td>" +
            "<td class='center'>" + formatTime(c.horas) + "</td></tr>"
          ).join('') + `
          <tr>
            <td>HORAS CRONOLÓGICAS RECREO</td>
            <td class="center">${formatTime(recreoDecimal)}</td>
          </tr>
          <tr>
            <td>HORAS CRONOLÓGICAS NO LECTIVAS</td>
            <td class="center">${formatTime(horasNoLectivasAsignadas)}</td>
          </tr>
          ` + (colacion > 0 ? `<tr>
            <td>DERECHO A COLACIÓN</td>
            <td class="center">${formatTime(colacion)}</td>
          </tr>` : '') + `
          <tr style="background-color: #e5e7eb; font-weight: bold;">
            <td style="text-align: right;">TOTAL HORAS CONTRATO</td>
            <td class="center">${formatTime(asigTotal)}</td>
          </tr>
        </table>

        <div class="section">III. Declaración de Aceptación</div>
        <p style="font-size: 14px; text-align: justify;">Mediante la firma del presente documento, declaro haber sido informado(a) detalladamente de mi carga horaria lectiva y no lectiva para el año escolar 2027 en el establecimiento indicado. Comprendo que esta distribución se ajusta a mi contrato de trabajo y a la planificación operativa del establecimiento.</p>

        <p style="font-size: 14px; margin-top: 40px;">En Antofagasta, a ____ de ______________ de 202__.</p>

        <div class="flex">
          <div class="signature">
            <strong>${docenteSeleccionadoObj.nombres} ${docenteSeleccionadoObj.apellidos}</strong><br/>
            Docente<br/>
            RUT: ${docenteSeleccionadoObj.rut}
          </div>
          <div class="signature">
            <strong>${directorName}</strong><br/>
            Director(a)<br/>
            Timbre Institucional
          </div>
        </div>
      </body>
    </html>
    `;
    
    const printWindow = window.open('', '', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };
"""

final_code = code[:start_idx] + new_code + code[end_idx:]

with open('src/app/carga/asignacion/page.tsx', 'w', encoding='utf-8') as f:
    f.write(final_code)

print("Replacement successful")
