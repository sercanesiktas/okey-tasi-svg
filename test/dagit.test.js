import test from 'node:test';
import assert from 'node:assert/strict';
import { dagit, takim, rastgeleUret } from '../dagit.mjs';

const anahtar = (t) => (t.sahte ? 'sahte' : `${t.renk}-${t.sayi}`);

test('takım 106 taştır: 104 sayılı, 2 sahte okey', () => {
  const t = takim();
  assert.equal(t.length, 106);
  assert.equal(t.filter((x) => x.sahte).length, 2);
});

test('dağıtım: 15, 14, 14, 14 taş ve kalan yığın, toplam 106', () => {
  const d = dagit(1);
  assert.deepEqual(d.eller.map((e) => e.length), [15, 14, 14, 14]);
  assert.equal(d.eller.flat().length + d.yigin.length + 1, 106);
});

test('aynı tohum aynı dağıtımı verir, farklı tohum farklı', () => {
  const s = (d) => d.eller.flat().map(anahtar).join();
  assert.equal(s(dagit(42)), s(dagit(42)));
  assert.notEqual(s(dagit(42)), s(dagit(43)));
});

test('hiçbir taş fazla ya da eksik değil: dağıtılan takım orijinalle aynı', () => {
  const d = dagit(7);
  const hepsi = [d.gosterge, ...d.eller.flat(), ...d.yigin].map(anahtar).sort();
  assert.deepEqual(hepsi, takim().map(anahtar).sort());
});

test('gösterge sahte okey olmaz, okey göstergenin bir üstüdür', () => {
  for (let tohum = 0; tohum < 200; tohum++) {
    const d = dagit(tohum);
    assert.equal(d.gosterge.sahte, false);
    assert.equal(d.okey.renk, d.gosterge.renk);
    assert.equal(d.okey.sayi, (d.gosterge.sayi % 13) + 1);
  }
});

test('13 göstergede okey 1 olur', () => {
  let bulundu = false;
  for (let tohum = 0; tohum < 2000 && !bulundu; tohum++) {
    const d = dagit(tohum);
    if (d.gosterge.sayi === 13) {
      assert.equal(d.okey.sayi, 1);
      bulundu = true;
    }
  }
  assert.ok(bulundu, '2000 tohum içinde 13 göstergesi çıkmalı');
});

test('rastgele üretici 0 ile 1 arasında ve tekrarlanabilir', () => {
  const a = rastgeleUret(5);
  const b = rastgeleUret(5);
  for (let i = 0; i < 100; i++) {
    const x = a();
    assert.ok(x >= 0 && x < 1);
    assert.equal(x, b());
  }
});
