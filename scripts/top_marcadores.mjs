/**
 * top_marcadores.mjs
 *
 * Analiza los archivos de public/Ligas/ y reporta qué ligas tienen
 * como marcadores más frecuentes dos resultados de empate.
 *
 * Uso:
 *   node scripts/top_marcadores.mjs            → todas las ligas
 *   node scripts/top_marcadores.mjs España     → solo esa liga
 *   node scripts/top_marcadores.mjs --top 3    → ligas con top-N siendo empates (default 2)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIGAS_DIR = path.join(__dirname, '..', 'public', 'Ligas');

const args = process.argv.slice(2);
const topFlag = args.indexOf('--top');
const TOP_N = topFlag !== -1 ? parseInt(args[topFlag + 1], 10) : 2;
const filtroLiga = args.filter((a) => !a.startsWith('--') && isNaN(Number(a)));

function isDraw(score) {
  const [a, b] = score.split('-').map(Number);
  return a === b;
}

function calcularFrecuencias(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const freq = {};

  const temporadas = data.temporadas ?? data.torneos ?? [];
  for (const temp of temporadas) {
    const jornadas = temp.jornadas ?? temp.partidos ?? [];
    for (const jornada of jornadas) {
      const partidos = jornada.partidos ?? [jornada];
      for (const p of partidos) {
        const r = p.resultado;
        if (!r) continue;
        const gl = r.golesLocal ?? r.golesLocales;
        const gv = r.golesVisitante ?? r.golesVisitantes;
        if (gl == null || gv == null || gl < 0 || gv < 0) continue;
        if (p.estado === 'NS' || p.estado === 'Postp.') continue;
        const key = `${gl}-${gv}`;
        freq[key] = (freq[key] || 0) + 1;
      }
    }
  }

  return Object.entries(freq).sort((a, b) => b[1] - a[1]);
}

const files = fs.readdirSync(LIGAS_DIR).filter((f) => f.endsWith('.json'));
const ligas = filtroLiga.length > 0
  ? files.filter((f) => filtroLiga.some((n) => f.toLowerCase().includes(n.toLowerCase())))
  : files;

const resultados = [];

for (const file of ligas) {
  const sorted = calcularFrecuencias(path.join(LIGAS_DIR, file));
  if (sorted.length < TOP_N) continue;

  const topN = sorted.slice(0, TOP_N);
  if (topN.every(([score]) => isDraw(score))) {
    resultados.push({
      liga: file.replace('.json', ''),
      top: sorted.slice(0, TOP_N + 1),
    });
  }
}

resultados.sort((a, b) => b.top[0][1] - a.top[0][1]);

if (resultados.length === 0) {
  console.log(`No se encontraron ligas con los ${TOP_N} marcadores más frecuentes siendo empates.`);
  process.exit(0);
}

const COL_LIGA = 25;
const COL_SCORE = 14;

const header = 'LIGA'.padEnd(COL_LIGA) +
  Array.from({ length: TOP_N }, (_, i) => `${i + 1}°`.padEnd(COL_SCORE)).join('') +
  'siguiente';
console.log('\n' + header);
console.log('-'.repeat(header.length + 5));

for (const r of resultados) {
  const cols = r.top.map(([s, c]) => `${s} (${c})`.padEnd(COL_SCORE)).join('');
  console.log(r.liga.padEnd(COL_LIGA) + cols);
}

console.log(`\nTotal: ${resultados.length} liga(s) de ${ligas.length} analizadas`);
console.log(`Criterio: top-${TOP_N} marcadores más frecuentes son empates\n`);
