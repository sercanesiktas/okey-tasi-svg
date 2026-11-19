import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { tas, sahteOkey, arka, RENKLER, SAYILAR } from '../taslar.mjs';
import { uret } from '../uret.mjs';

const kok = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(kok, 'taslar.json'), 'utf8'));
const oku = (dosya) => readFileSync(join(kok, 'svg', dosya), 'utf8');

/** Küçük bir XML kontrolü: etiketler dengeli, tek kök, ham < ya da & yok. */
function xmlKontrol(metin) {
  const yigin = [];
  let kokSayisi = 0;
  for (const m of metin.matchAll(/<(\/?)([A-Za-z][\w:-]*)([^>]*?)(\/?)>/g)) {
    const [, kapanis, ad, , tekil] = m;
    if (tekil) { if (!yigin.length) kokSayisi++; continue; }
    if (kapanis) {
      assert.equal(yigin.pop(), ad, `etiket dengesiz: ${ad}`);
    } else {
      if (!yigin.length) kokSayisi++;
      yigin.push(ad);
    }
  }
  assert.deepEqual(yigin, [], 'kapanmamış etiket');
  assert.equal(kokSayisi, 1, 'tek kök öğe olmalı');
  assert.doesNotMatch(metin.replace(/<[^>]*>/g, ''), /[<&]/, 'metin içinde kaçırılmamış karakter');
}

test('manifest: 52 renkli yüz ve sahte okey, toplam 106 taş', () => {
  assert.equal(manifest.taslar.length, 53);
  assert.equal(manifest.toplamTas, 106);
  const renkli = manifest.taslar.filter((t) => t.renk);
  assert.equal(renkli.length, 52);
  for (const renk of Object.keys(RENKLER)) {
    assert.deepEqual(renkli.filter((t) => t.renk === renk).map((t) => t.sayi), SAYILAR, `${renk} 1-13 olmalı`);
  }
  assert.equal(manifest.taslar.filter((t) => t.renk === null).length, 1);
  assert.ok(manifest.taslar.every((t) => t.adet === 2));
});

test('manifest ile svg klasörü birebir aynı dosyaları içerir', () => {
  const beklenen = [...manifest.taslar.map((t) => t.dosya), manifest.arka].sort();
  assert.deepEqual(readdirSync(join(kok, 'svg')).sort(), beklenen);
});

test('her svg iyi biçimli, boyutları ve erişilebilirlik alanları doğru', () => {
  for (const dosya of readdirSync(join(kok, 'svg'))) {
    const metin = oku(dosya);
    xmlKontrol(metin);
    assert.match(metin, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 80 110" width="80" height="110" role="img"/, dosya);
    assert.match(metin, /<title id="t">[^<]+<\/title>/, dosya);
    assert.match(metin, /<desc id="d">[^<]+<\/desc>/, dosya);
  }
});

test('başlıklar manifestteki Türkçe adlarla aynı', () => {
  for (const t of manifest.taslar) {
    assert.match(oku(t.dosya), new RegExp(`<title id="t">${t.ad}</title>`));
  }
  assert.match(oku('arka.svg'), /<title id="t">Taşın arkası<\/title>/);
});

test('renkli taşlar yalnızca kendi renklerini kullanır', () => {
  for (const t of manifest.taslar.filter((x) => x.renk)) {
    const metin = oku(t.dosya);
    for (const [renk, { kod }] of Object.entries(RENKLER)) {
      assert.equal(metin.includes(`stroke="${kod}"`), renk === t.renk, `${t.dosya}: ${renk}`);
    }
  }
});

test('iki haneli sayılar iki yol, tek haneliler tek yol çizer', () => {
  const yol = (d) => (oku(d).match(/<path /g) ?? []).length;
  assert.equal(yol('kirmizi-07.svg'), 1);
  assert.equal(yol('kirmizi-10.svg'), 2);
  assert.equal(yol('mavi-13.svg'), 2);
});

test('üretim belirgindir: aynı girdi aynı çıktı, depodaki dosyalar güncel', () => {
  const gecici = mkdtempSync(join(tmpdir(), 'okey-'));
  uret(gecici);
  for (const dosya of readdirSync(gecici)) {
    assert.equal(readFileSync(join(gecici, dosya), 'utf8'), oku(dosya), `güncel değil: ${dosya}`);
  }
  assert.equal(tas('kirmizi', 7), tas('kirmizi', 7));
  assert.notEqual(sahteOkey(), arka());
});

test('geçersiz girdi hata verir', () => {
  assert.throws(() => tas('mor', 5), /Bilinmeyen renk/);
  assert.throws(() => tas('kirmizi', 0), /1 ile 13/);
  assert.throws(() => tas('kirmizi', 14), /1 ile 13/);
  assert.throws(() => tas('kirmizi', 2.5), /1 ile 13/);
});

// --- gerçek tarayıcıda çizim ---------------------------------------------------------------------------
let chromium = null;
try {
  chromium = createRequire(import.meta.url)('playwright').chromium;
} catch { /* playwright yok */ }

test('tarayıcıda çizilen 54 görselin hepsi birbirinden farklı ve boş değil', { skip: chromium ? false : 'playwright kurulu değil' }, async () => {
  const tarayici = await chromium.launch();
  try {
    const sayfa = await tarayici.newPage({ viewport: { width: 80, height: 110 } });
    const ozetler = new Map();
    for (const dosya of readdirSync(join(kok, 'svg'))) {
      await sayfa.goto(`file://${join(kok, 'svg', dosya)}`);
      const png = await sayfa.screenshot();
      const ozet = createHash('sha1').update(png).digest('hex');
      assert.ok(!ozetler.has(ozet), `${dosya} ile ${ozetler.get(ozet)} aynı görünüyor`);
      ozetler.set(ozet, dosya);
      assert.ok(png.length > 400, `${dosya} boş görünüyor`);
    }
    assert.equal(ozetler.size, 54);
  } finally {
    await tarayici.close();
  }
});
