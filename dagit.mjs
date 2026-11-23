// Bir okey takımını karıştırıp eli dağıtır: node dagit.mjs [tohum]
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const kok = dirname(fileURLToPath(import.meta.url));

/** Aynı tohum aynı diziyi verir (mulberry32). */
export function rastgeleUret(tohum) {
  let a = tohum >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** taslar.json'daki `adet` alanına göre 106 taşlık tam takım. */
export function takim(manifest = JSON.parse(readFileSync(join(kok, 'taslar.json'), 'utf8'))) {
  return manifest.taslar.flatMap((t) =>
    Array.from({ length: t.adet }, () => ({ dosya: t.dosya, renk: t.renk, sayi: t.sayi, sahte: t.renk === null })),
  );
}

function karistir(dizi, rastgele) {
  const d = [...dizi];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

/**
 * Dört oyunculu okey dağıtımı: başlayan oyuncuya 15, diğerlerine 14 taş.
 * Gösterge sahte okey olamaz. Okey, göstergenin renginde bir üst sayıdır (13'ün üstü 1).
 * Kalan taşlar `yigin` olarak döner.
 */
export function dagit(tohum = Date.now()) {
  const karisik = karistir(takim(), rastgeleUret(tohum));
  const gostergeSirasi = karisik.findIndex((t) => !t.sahte);
  const [gosterge] = karisik.splice(gostergeSirasi, 1);
  const okey = { renk: gosterge.renk, sayi: (gosterge.sayi % 13) + 1 };

  const boyutlar = [15, 14, 14, 14];
  const eller = [];
  let konum = 0;
  for (const n of boyutlar) {
    eller.push(karisik.slice(konum, konum + n));
    konum += n;
  }
  return { tohum, gosterge, okey, eller, yigin: karisik.slice(konum) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tohum = process.argv[2] === undefined ? Date.now() : Number(process.argv[2]);
  if (!Number.isInteger(tohum)) {
    console.error('Tohum bir tam sayı olmalı.');
    process.exit(2);
  }
  const d = dagit(tohum);
  const ad = (t) => (t.sahte ? 'sahte' : `${t.renk}-${t.sayi}`);
  console.log(`Tohum: ${d.tohum}`);
  console.log(`Gösterge: ${ad(d.gosterge)}, okey: ${d.okey.renk}-${d.okey.sayi}`);
  d.eller.forEach((el, i) => console.log(`Oyuncu ${i + 1} (${el.length}): ${el.map(ad).join(' ')}`));
  console.log(`Yığın: ${d.yigin.length} taş`);
}
