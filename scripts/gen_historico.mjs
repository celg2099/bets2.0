/**
 * Uso: node scripts/gen_historico.mjs <NombreLiga>
 * Ejemplo: node scripts/gen_historico.mjs Rusia
 *
 * Lee public/Ligas/<NombreLiga>.json y genera public/historico/<NombreLiga>.json
 * con las rachas de partidos sin empate entre cada empate, por temporada.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const nombre = process.argv[2];
if (!nombre) {
  console.error('Error: debes indicar el nombre de la liga.');
  console.error('  Uso: node scripts/gen_historico.mjs <NombreLiga>');
  process.exit(1);
}

const inPath = join(rootDir, 'public/Ligas', `${nombre}.json`);
const outPath = join(rootDir, 'public/historico', `${nombre}.json`);

let liga;
try {
  liga = JSON.parse(readFileSync(inPath, 'utf-8'));
} catch {
  console.error(`Error: no se pudo leer ${inPath}`);
  process.exit(1);
}

function parseFecha(fechaHora) {
  const [fecha, hora] = fechaHora.split(' ');
  const [dia, mes, anio] = fecha.split('/');
  const [hh, mm] = (hora ?? '00:00').split(':');
  return new Date(+anio, +mes - 1, +dia, +hh, +mm).getTime();
}

const temporadasHistorico = [];

for (const temp of liga.temporadas) {
  const match = temp.nombre.match(/(\d{2}\/\d{2})$/);
  const label = match ? match[1] : temp.año;

  const partidos = [];
  for (const jornada of temp.jornadas) {
    for (const partido of jornada.partidos) {
      if (partido.estado !== 'Ended') continue;
      const { golesLocal, golesVisitante } = partido.resultado;
      partidos.push({
        timestamp: parseFecha(partido.fechaHora),
        esEmpate: golesLocal === golesVisitante,
      });
    }
  }

  partidos.sort((a, b) => a.timestamp - b.timestamp);

  let conteo = 0;
  const conteos = [];
  for (const p of partidos) {
    if (p.esEmpate) {
      conteos.push(conteo);
      conteo = 0;
    } else {
      conteo++;
    }
  }
  conteos.push(conteo);

  temporadasHistorico.push({ temporada: label, conteos });
}

const historico = { nombrePublico: nombre, temporadas: temporadasHistorico };
writeFileSync(outPath, JSON.stringify(historico, null, 2), 'utf-8');
console.log(`Historico generado: ${outPath}`);
for (const t of temporadasHistorico) {
  console.log(`  ${t.temporada}: ${t.conteos.length} entradas, sum=${t.conteos.reduce((a, b) => a + b, 0)}`);
}
