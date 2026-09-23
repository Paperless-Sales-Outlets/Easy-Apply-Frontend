import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSriLankanAddress,
  extractAddressFromOCR,
  extractFullNameFromOCR,
} from '../nicParser.js';

test('parseSriLankanAddress', async (t) => {
  await t.test('parses English 3-part address into line1, city, district, postal code', () => {
    const res = parseSriLankanAddress('153, BATHFORD DIVISION, DICKOYA');
    assert.equal(res.addressLine1, '153, BATHFORD DIVISION');
    assert.equal(res.city, 'Dickoya');
    assert.equal(res.district, 'Nuwara Eliya');
    assert.equal(res.postalCode, '22050');
  });

  await t.test('parses Sinhala address with town and maps to English city, district, postal code', () => {
    const res = parseSriLankanAddress('153, බාත්ෆෝර්ඩ් වත්ත, දික්ඔය');
    assert.equal(res.city, 'Dickoya');
    assert.equal(res.district, 'Nuwara Eliya');
    assert.equal(res.postalCode, '22050');
  });

  await t.test('parses Colombo address with postal code', () => {
    const res = parseSriLankanAddress('42, Galle Road, Colombo 03');
    assert.equal(res.addressLine1, '42, Galle Road');
    assert.equal(res.city, 'Colombo 03');
    assert.equal(res.district, 'Colombo');
    assert.equal(res.postalCode, '00300');
  });

  await t.test('prefers English address when both Tamil/Sinhala and English are present', () => {
    const rawOcr = `
      153, பாத்தோகர்ட் பிரிவு, டிக்கே
      153, BATHFORD DIVISION, DICKOYA
    `;
    const extracted = extractAddressFromOCR(rawOcr);
    const parsed = parseSriLankanAddress(extracted);
    assert.equal(parsed.addressLine1, '153, BATHFORD DIVISION');
    assert.equal(parsed.addressLine2, '');
    assert.equal(parsed.city, 'Dickoya');
    assert.equal(parsed.district, 'Nuwara Eliya');
    assert.equal(parsed.postalCode, '22050');
  });

  await t.test('cleans . FETC a OCR noise from address and normalizes city', () => {
    const res = parseSriLankanAddress('153, BATHFORD DIVISION, DICKOYA. FETC a');
    assert.equal(res.addressLine1, '153, BATHFORD DIVISION');
    assert.equal(res.addressLine2, '');
    assert.equal(res.city, 'Dickoya');
    assert.equal(res.district, 'Nuwara Eliya');
    assert.equal(res.postalCode, '22050');
  });
});

test('extractFullNameFromOCR', async (t) => {
  await t.test('strips leading OCR artifacts like UCT / UTC / NIC', () => {
    const rawOcr = `
      NATIONAL IDENTITY CARD
      UCT MAHALINGAM DAWANHAREN
      SRI LANKAN
    `;
    const name = extractFullNameFromOCR(rawOcr);
    assert.equal(name, 'MAHALINGAM DAWANHAREN');
  });

  await t.test('strips place of birth town prefix (DICKOYA Jie) from name', () => {
    const rawOcr = `
      DICKOYA Jie, MAHALINGAM DAWANHAREN
    `;
    const name = extractFullNameFromOCR(rawOcr);
    assert.equal(name, 'MAHALINGAM DAWANHAREN');
  });

  await t.test('repairs OCR letter confusion MANALINGAM DAWANHAF -> MAHALINGAM DAWANHAREN', () => {
    const rawOcr = `
      NATIONAL IDENTITY CARD
      MANALINGAM DAWANHAF
      SRI LANKAN
    `;
    const name = extractFullNameFromOCR(rawOcr);
    assert.equal(name, 'MAHALINGAM DAWANHAREN');
  });

  await t.test('strips e IC or IC prefix from name', () => {
    const rawOcr = `
      e IC MAHALINGAM DAWANHAREN
    `;
    const name = extractFullNameFromOCR(rawOcr);
    assert.equal(name, 'MAHALINGAM DAWANHAREN');
  });
});
