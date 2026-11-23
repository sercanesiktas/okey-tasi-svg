// Tüm taşları tek bir SVG sprite dosyasında toplar: node sprite.mjs
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RENKLER, SAYILAR, tas, sahteOkey, arka, GENISLIK, YUKSEKLIK } from './taslar.mjs';

const kok = dirname(fileURLToPath(import.meta.url));

/** Tek bir taş SVG'sinden `<symbol>` üretir. Başlık ve açıklama korunur, kimlikleri tekilleştirilir. */
function sembol(id, svg) {
  const baslik = /<title id="t">(.*?)<\/title>/.exec(svg)[1];
  const aciklama = /<desc id="d">(.*?)<\/desc>/.exec(svg)[1];
  const icerik = svg
    .replace(/^<svg[^>]*>\n/, '')
    .replace(/<\/svg>\n?$/, '')
    .replace(/ {2}<title id="t">.*?<\/title>\n/, '')
    .replace(/ {2}<desc id="d">.*?<\/desc>\n/, '');
  return (
    `  <symbol id="${id}" viewBox="0 0 ${GENISLIK} ${YUKSEKLIK}" role="img" aria-labelledby="${id}-t ${id}-d">\n` +
    `    <title id="${id}-t">${baslik}</title>\n` +
    `    <desc id="${id}-d">${aciklama}</desc>\n` +
    icerik.replace(/^ {2}/gm, '    ') +
    `  </symbol>\n`
  );
}

/** Sembol kimlikleri dosya adlarıyla aynıdır (uzantısız): `kirmizi-07`, `sahte-okey`, `arka`. */
export function sprite() {
  const semboller = [];
  for (const renk of Object.keys(RENKLER)) {
    for (const sayi of SAYILAR) {
      semboller.push(sembol(`${renk}-${String(sayi).padStart(2, '0')}`, tas(renk, sayi)));
    }
  }
  semboller.push(sembol('sahte-okey', sahteOkey()), sembol('arka', arka()));
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${semboller.join('')}</svg>\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(join(kok, 'sprite.svg'), sprite());
  console.log('sprite.svg yazıldı.');
}
