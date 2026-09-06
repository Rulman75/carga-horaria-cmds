import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const planesDir = "C:\\Users\\rhormazabal\\.gemini\\antigravity\\scratch\\carga-horaria-cmds\\Planes";

async function importPlanes() {
  console.log('Iniciando importación de Planes de Estudio...');
  
  const files = fs.readdirSync(planesDir).filter(f => f.endsWith('.xls'));
  
  for (const file of files) {
    const filePath = path.join(planesDir, file);
    console.log(`Procesando archivo: ${file}`);
    
    const content = fs.readFileSync(filePath, 'latin1');
    const $ = cheerio.load(content);
    
    const tables = $('table');
    
    if (tables.length === 0) continue;
    
    const firstTable = tables.first();
    const rows = firstTable.find('tr');
    
    if (rows.length < 2) continue;
    
    const dataRow = rows.eq(1).find('td');
    if (dataRow.length >= 5) {
      const codigo = $(dataRow[0]).text().trim();
      const nombre = $(dataRow[1]).text().trim();
      const estado = $(dataRow[2]).text().trim();
      const fecha = $(dataRow[3]).text().trim();
      const tipo = $(dataRow[4]).text().trim();
      
      console.log(`- Insertando Plan: ${nombre} (Decreto ${codigo})`);
      
      const plan = await prisma.planEstudio.create({
        data: {
          decreto: codigo,
          nombre: nombre,
          estado: estado,
          fechaDecreto: fecha,
          tipo: tipo
        }
      });
      
      // Procesar asignaturas (a partir de la tabla index 3 o 4)
      for (let i = 2; i < tables.length; i++) {
        const t = tables.eq(i);
        const rowsAsig = t.find('tr');
        if (rowsAsig.length >= 2) {
            const cols = rowsAsig.eq(1).find('td');
            if (cols.length >= 5) {
                const asigCodigo = $(cols[0]).text().trim();
                const asigNombre = $(cols[1]).text().trim();
                const asigHoras = parseInt($(cols[2]).text().trim()) || 0;
                const asigEsEvaluable = $(cols[3]).text().trim().toLowerCase() === 'si';
                const asigTipo = $(cols[4]).text().trim();
                
                await prisma.asignatura.create({
                    data: {
                        codigo: asigCodigo,
                        nombre: asigNombre,
                        horas: asigHoras,
                        esEvaluable: asigEsEvaluable,
                        tipo: asigTipo,
                        planEstudioId: plan.id
                    }
                });
            }
        }
      }
    }
  }
  
  console.log('Proceso de parseo e inserción finalizado.');
}

importPlanes().catch(console.error).finally(() => prisma.$disconnect());
