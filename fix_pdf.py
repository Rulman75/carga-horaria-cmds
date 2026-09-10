import sys

with open('src/app/carga/asignacion/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Let's see the string we want to remove.
# We had:
#           ` + (observacionCarga ? `
#           <div class="section" style="margin-top: 15px;">III. Observaciones</div>
#           <p style="font-size: 14px; margin-bottom: 20px;">${observacionCarga}</p>
#           ` : '') + `
#           <table>
#             <tr><th colspan="2" class="center">CÁLCULO HORAS CRONOLÓGICAS CONTRATO</th></tr>

old_cert = """          ` + (observacionCarga ? `
          <div class="section" style="margin-top: 15px;">III. Observaciones</div>
          <p style="font-size: 14px; margin-bottom: 20px;">${observacionCarga}</p>
          ` : '') + `
          <table>"""
new_cert = """          <table>"""

code = code.replace(old_cert, new_cert)

with open('src/app/carga/asignacion/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done remove pdf")
