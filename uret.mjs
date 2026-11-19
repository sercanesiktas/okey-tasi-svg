// svg/ klasörünü ve taslar.json dosyasını üretir: node uret.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RENKLER, SAYILAR, tas, sahteOkey, arka, GENISLIK, YUKSEKLIK } from './taslar.mjs';

const kok = dirname(fileURLToPath(import.meta.url));

export function uret(hedef = join(kok, 'svg')) {
  mkdirSync(hedef, { recursive: true });
  const liste = [];

  for (const renk of Object.keys(RENKLER)) {
    for (const sayi of SAYILAR) {
      const dosya = `${renk}-${String(sayi).padStart(2, '0')}.svg`;
      writeFileSync(join(hedef, dosya), tas(renk, sayi));
      liste.push({ dosya, ad: `${RENKLER[renk].ad} ${sayi}`, renk, sayi, adet: 2 });
    }
  }
  writeFileSync(join(hedef, 'sahte-okey.svg'), sahteOkey());
  liste.push({ dosya: 'sahte-okey.svg', ad: 'Sahte okey', renk: null, sayi: null, adet: 2 });
  writeFileSync(join(hedef, 'arka.svg'), arka());

  const manifest = {
    genislik: GENISLIK,
    yukseklik: YUKSEKLIK,
    arka: 'arka.svg',
    toplamTas: liste.reduce((t, x) => t + x.adet, 0),
    taslar: liste,
  };
  writeFileSync(join(kok, 'taslar.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const m = uret();
  console.log(`${m.taslar.length} yüz + arka yazıldı, toplam ${m.toplamTas} taş.`);
}
