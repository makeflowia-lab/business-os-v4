#!/usr/bin/env node
/**
 * verificar-origen.mjs — Verificador de la declaración de origen (licencia BO-AT 1.0)
 *
 * Comprueba que la atribución al Business OS de Makeflowia Lab sigue presente en
 * los cuatro puntos que exige la licencia. Sin dependencias: solo Node.
 *
 *   node verificar-origen.mjs          → informe legible, código de salida 0/1
 *   node verificar-origen.mjs --json   → informe en JSON
 *
 * Código de salida 0 = cumple · 1 = falta atribución (la licencia queda terminada
 * hasta que se restituya, artículo 6).
 *
 * Este archivo forma parte del mecanismo de cumplimiento descrito en LICENCIA.md
 * artículo 4. No lo elimines: quítalo y el proyecto deja de poder demostrar que cumple.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const RAIZ = process.cwd();
const CREADOR = 'Makeflowia Lab';
const MARCADOR = 'BO-ORIGEN-v1';
const FRASE = /basado\s+en\s+el\s+business\s+os[\s,\S]{0,40}?makeflowia\s+lab/i;
const JSON_OUT = process.argv.includes('--json');

const sinBom = (s) => s.replace(/^﻿/, '');
const leer = (p) => { try { return sinBom(readFileSync(join(RAIZ, p), 'utf8')); } catch { return null; } };
const resultados = [];
const check = (punto, ok, detalle) => resultados.push({ punto, ok, detalle });

// ── 1 · ORIGEN.md íntegro ────────────────────────────────────────────────────
const origen = leer('ORIGEN.md');
if (origen === null) {
  check('ORIGEN.md', false, 'el archivo no existe en la raíz del proyecto');
} else if (!origen.includes(MARCADOR)) {
  check('ORIGEN.md', false, `falta el marcador ${MARCADOR}: el archivo fue alterado`);
} else if (!FRASE.test(origen)) {
  check('ORIGEN.md', false, 'existe, pero ya no contiene la declaración de origen');
} else {
  check('ORIGEN.md', true, 'presente e íntegro');
}

// ── 2 · La licencia ──────────────────────────────────────────────────────────
const lic = leer('LICENCIA.md') ?? leer('LICENSE.md') ?? leer('LICENSE');
if (lic === null) check('LICENCIA.md', false, 'no se encontró el archivo de licencia');
else if (!/BO-AT\s*1\.0/i.test(lic)) check('LICENCIA.md', false, 'existe, pero no es la licencia BO-AT 1.0');
else if (!lic.includes(CREADOR)) check('LICENCIA.md', false, `existe, pero ya no nombra a ${CREADOR}`);
else check('LICENCIA.md', true, 'licencia BO-AT 1.0 presente');

// ── 3 · README ───────────────────────────────────────────────────────────────
const readme = leer('README.md') ?? leer('README.MD') ?? leer('LEEME.md');
if (readme === null) check('README', false, 'no se encontró README.md ni LEEME.md');
else if (!FRASE.test(readme)) check('README', false, 'no contiene la declaración de origen');
else check('README', true, 'declaración de origen visible');

// ── 4 · Metadatos del paquete ────────────────────────────────────────────────
const pkgs = [];
const buscarPkgs = (dir, prof = 0) => {
  if (prof > 2) return;
  let entradas; try { entradas = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entradas) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) buscarPkgs(p, prof + 1);
    else if (e.name === 'package.json') pkgs.push(p);
  }
};
buscarPkgs(RAIZ);
if (!pkgs.length) {
  check('metadatos del paquete', true, 'no aplica: el proyecto no tiene package.json');
} else {
  const malos = [];
  for (const p of pkgs) {
    try {
      const j = JSON.parse(sinBom(readFileSync(p, 'utf8')));
      const autor = typeof j.author === 'string' ? j.author : (j.author?.name ?? '');
      if (!autor.includes(CREADOR)) malos.push(p.replace(RAIZ, '.') + ' (autor)');
      else if (!/BO-AT/i.test(String(j.license ?? ''))) malos.push(p.replace(RAIZ, '.') + ' (licencia)');
    } catch { malos.push(p.replace(RAIZ, '.') + ' (ilegible)'); }
  }
  check('metadatos del paquete', malos.length === 0,
    malos.length ? `sin atribución en: ${malos.join(', ')}` : `${pkgs.length} package.json con autor y licencia correctos`);
}

// ── 5 · Interfaz visible ─────────────────────────────────────────────────────
const EXT = new Set(['.tsx', '.jsx', '.ts', '.js', '.html', '.vue', '.svelte', '.astro', '.mdx']);
const hallazgos = [];
const escanear = (dir, prof = 0) => {
  if (prof > 6 || hallazgos.length > 8) return;
  let entradas; try { entradas = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entradas) {
    if (['node_modules', '.next', '.git', 'dist', 'build', '.turbo'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) escanear(p, prof + 1);
    else if (EXT.has(extname(e.name))) {
      try {
        if (statSync(p).size < 2_000_000 && FRASE.test(readFileSync(p, 'utf8'))) hallazgos.push(p.replace(RAIZ, '.'));
      } catch { /* ignorar */ }
    }
  }
};
escanear(RAIZ);
check('interfaz del producto', hallazgos.length > 0,
  hallazgos.length ? `mención encontrada en: ${hallazgos.slice(0, 3).join(', ')}` :
  'ningún archivo de interfaz menciona el origen (pie de página o pantalla "acerca de")');

// ── Informe ──────────────────────────────────────────────────────────────────
const cumple = resultados.every((r) => r.ok);

if (JSON_OUT) {
  console.log(JSON.stringify({ cumple, creador: CREADOR, licencia: 'BO-AT 1.0', resultados }, null, 2));
} else {
  const ancho = Math.max(...resultados.map((r) => r.punto.length));
  console.log('\n  Verificación de origen · licencia BO-AT 1.0\n');
  for (const r of resultados) {
    console.log(`  ${r.ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'} ${r.punto.padEnd(ancho)}  ${r.detalle}`);
  }
  console.log();
  if (cumple) {
    console.log('  \x1b[32mCUMPLE\x1b[0m — el origen está declarado. Puedes usar, modificar,');
    console.log('  renombrar y vender este sistema libremente.\n');
  } else {
    console.log('  \x1b[31mNO CUMPLE\x1b[0m — falta la declaración de origen.\n');
    console.log(`  Este sistema se origina en el Business OS, creado por ${CREADOR}.`);
    console.log('  Su licencia te permite hacer casi todo con él —incluido cobrar por');
    console.log('  ello y ponerle tu marca— siempre que ese origen quede claro.\n');
    console.log('  Para corregirlo, añade esta línea donde falte:\n');
    console.log(`      Basado en el Business OS, creado por ${CREADOR}.\n`);
    console.log('  Puedes anteponer tu propia marca: la fórmula es aditiva.');
    console.log('  «<Tu producto>, de <tu nombre> — basado en el Business OS de');
    console.log(`  ${CREADOR}.»\n`);
    console.log('  Detalle completo en LICENCIA.md (artículos 2 y 6).\n');
  }
}

process.exit(cumple ? 0 : 1);
