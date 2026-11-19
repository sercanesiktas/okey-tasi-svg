// Tüm taşları bir sayfada gösteren onizleme.html dosyasını üretir: node onizleme.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const kok = dirname(fileURLToPath(import.meta.url));
const m = JSON.parse(readFileSync(join(kok, 'taslar.json'), 'utf8'));
const kacir = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const satir = (renk) =>
  m.taslar
    .filter((t) => t.renk === renk)
    .map((t) => `<img src="svg/${t.dosya}" alt="${kacir(t.ad)}" width="${m.genislik}" height="${m.yukseklik}">`)
    .join('');

const renkler = ['kirmizi', 'sari', 'mavi', 'siyah'];
const ozel = m.taslar.filter((t) => t.renk === null).map((t) => `<img src="svg/${t.dosya}" alt="${kacir(t.ad)}" width="${m.genislik}" height="${m.yukseklik}">`).join('');

writeFileSync(
  join(kok, 'onizleme.html'),
  `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><title>Okey taşları</title>
<style>body{margin:0;padding:20px;background:#2f6f5e;font-family:system-ui,sans-serif}
.sira{display:flex;gap:6px;margin-bottom:10px}img{display:block}</style></head>
<body>
${renkler.map((r) => `<div class="sira">${satir(r)}</div>`).join('\n')}
<div class="sira">${ozel}<img src="svg/${m.arka}" alt="Taşın arkası" width="${m.genislik}" height="${m.yukseklik}"></div>
</body></html>
`,
);
console.log('onizleme.html yazıldı');
