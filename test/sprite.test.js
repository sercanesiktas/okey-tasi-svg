import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sprite } from '../sprite.mjs';

const kok = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(kok, 'taslar.json'), 'utf8'));

test('her taş yüzü ve arka için bir sembol var (54 tane)', () => {
  const s = sprite();
  assert.equal((s.match(/<symbol /g) ?? []).length, manifest.taslar.length + 1);
  for (const t of manifest.taslar) assert.ok(s.includes(`id="${t.dosya.replace('.svg', '')}"`), t.dosya);
  assert.ok(s.includes('id="arka"'));
});

test('sembol kimlikleri tekil', () => {
  const idler = [...sprite().matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(idler).size, idler.length);
});

test('sembolün çizimi tek dosyadaki SVG ile aynı: rakam yolu ve renk korunur', () => {
  const tek = readFileSync(join(kok, 'svg', 'kirmizi-07.svg'), 'utf8');
  const yol = /<path d="([^"]+)"/.exec(tek)[1];
  const s = sprite();
  const baslangic = s.indexOf('id="kirmizi-07"');
  const parca = s.slice(baslangic, s.indexOf('</symbol>', baslangic));
  assert.ok(parca.includes(yol));
  assert.ok(parca.includes('#d1242f'));
  assert.ok(parca.includes('<title id="kirmizi-07-t">Kırmızı 7</title>'));
});

test('depodaki sprite.svg güncel (npm run sprite çalıştırılmalı)', () => {
  assert.equal(readFileSync(join(kok, 'sprite.svg'), 'utf8'), sprite());
});
