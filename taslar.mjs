// Taş çizimi. Rakamlar yazı tipi yerine yol olarak çizilir, bu yüzden her cihazda aynı görünür.

export const RENKLER = {
  kirmizi: { ad: 'Kırmızı', kod: '#d1242f' },
  sari: { ad: 'Sarı', kod: '#d99100' },
  mavi: { ad: 'Mavi', kod: '#1f5fbf' },
  siyah: { ad: 'Siyah', kod: '#1d1d1f' },
};

export const GENISLIK = 80;
export const YUKSEKLIK = 110;

const GOVDE = '#f6f0e1';
const KENAR = '#c9bb98';
const GOLGE = '#e2d7bb';
const YESIL = '#1e7a4c';

// Her rakam 40 x 60'lık bir kutuda çizilen tek bir çizgi yoludur.
const RAKAM = {
  0: 'M20 4C8 4 6 16 6 30S8 56 20 56 34 44 34 30 32 4 20 4Z',
  1: 'M9 18L22 4V56',
  2: 'M8 17C8 5 32 4 32 18C32 30 8 42 8 56H34',
  3: 'M8 9C20 1 34 9 30 21C28 28 19 30 14 30C25 30 35 35 32 46C29 58 12 60 6 51',
  4: 'M28 56V4L6 38H36',
  5: 'M32 4H12L9 28C20 22 34 26 34 40C34 56 14 60 6 50',
  6: 'M30 7C16 1 6 16 6 38C6 58 34 58 34 40C34 24 12 22 7 36',
  7: 'M6 4H34L16 56',
  8: 'M20 30C6 30 8 4 20 4S34 30 20 30 4 56 20 56 36 30 20 30Z',
  9: 'M10 53C24 59 34 44 34 22C34 2 6 2 6 20C6 36 28 38 33 24',
};

const ARKA_RENGI = '#2f6f5e';

function cerceve(icerik, baslik, aciklama) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GENISLIK} ${YUKSEKLIK}" width="${GENISLIK}" height="${YUKSEKLIK}" role="img" aria-labelledby="t d">\n` +
    `  <title id="t">${baslik}</title>\n` +
    `  <desc id="d">${aciklama}</desc>\n` +
    `  <rect x="3" y="6" width="74" height="101" rx="9" fill="${GOLGE}"/>\n` +
    `  <rect x="3" y="3" width="74" height="101" rx="9" fill="${GOVDE}" stroke="${KENAR}" stroke-width="1.5"/>\n` +
    icerik +
    `</svg>\n`
  );
}

function rakamlar(sayi, renk) {
  const basamaklar = String(sayi).split('');
  const olcek = basamaklar.length === 1 ? 0.95 : 0.66;
  const genislik = 40 * olcek;
  const aralik = basamaklar.length === 1 ? 0 : 3;
  const toplam = basamaklar.length * genislik + (basamaklar.length - 1) * aralik;
  let x = (GENISLIK - toplam) / 2;
  const y = basamaklar.length === 1 ? 20 : 26;

  return basamaklar
    .map((b) => {
      const parca =
        `  <path d="${RAKAM[b]}" transform="translate(${x.toFixed(2)} ${y}) scale(${olcek})" ` +
        `fill="none" stroke="${renk}" stroke-width="${basamaklar.length === 1 ? 6 : 8}" stroke-linecap="round" stroke-linejoin="round"/>\n`;
      x += genislik + aralik;
      return parca;
    })
    .join('');
}

/** Renkli, sayılı taş. */
export function tas(renk, sayi) {
  const r = RENKLER[renk];
  if (!r) throw new Error(`Bilinmeyen renk: ${renk}`);
  if (!Number.isInteger(sayi) || sayi < 1 || sayi > 13) throw new Error(`Sayı 1 ile 13 arasında olmalı: ${sayi}`);

  const alt = `  <circle cx="40" cy="92" r="6" fill="none" stroke="${r.kod}" stroke-width="3"/>\n`;
  return cerceve(rakamlar(sayi, r.kod) + alt, `${r.ad} ${sayi}`, `Okey taşı: ${r.ad.toLowerCase()} renkli ${sayi}`);
}

/** Sahte okey: beş köşeli yeşil yıldız. */
export function sahteOkey() {
  const nokta = [];
  for (let i = 0; i < 10; i++) {
    const yaricap = i % 2 === 0 ? 26 : 11;
    const aci = (-90 + i * 36) * (Math.PI / 180);
    nokta.push(`${(40 + yaricap * Math.cos(aci)).toFixed(2)},${(55 + yaricap * Math.sin(aci)).toFixed(2)}`);
  }
  const yildiz = `  <polygon points="${nokta.join(' ')}" fill="${YESIL}" stroke="${YESIL}" stroke-width="3" stroke-linejoin="round"/>\n`;
  return cerceve(yildiz, 'Sahte okey', 'Okey taşı: sahte okey, yeşil yıldız');
}

/** Taşın arka yüzü. */
export function arka() {
  const desen =
    `  <rect x="12" y="13" width="56" height="81" rx="5" fill="${ARKA_RENGI}"/>\n` +
    `  <path d="M40 24L56 53.5L40 83L24 53.5Z" fill="none" stroke="${GOVDE}" stroke-width="2.5" stroke-linejoin="round"/>\n`;
  return cerceve(desen, 'Taşın arkası', 'Okey taşının arka yüzü');
}

export const SAYILAR = Array.from({ length: 13 }, (_, i) => i + 1);
