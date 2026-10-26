import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSriLankanAddress,
  extractAddressFromOCR,
  extractFullNameFromOCR,
  isValidAddressText,
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

  await t.test('strips Registration of Persons Act and statutory noise from address', () => {
    const rawOcr = `
      153, BATHFORD DIVISION, DICKOYA
      FETC a, 5 wren op Saunt acai Reaistration ot Persons Ace, Noo 32 of 1968
    `;
    const extracted = extractAddressFromOCR(rawOcr);
    const parsed = parseSriLankanAddress(extracted);
    assert.equal(parsed.addressLine1, '153, BATHFORD DIVISION');
    assert.equal(parsed.addressLine2, '');
    assert.equal(parsed.city, 'Dickoya');
    assert.equal(parsed.district, 'Nuwara Eliya');
  });

  await t.test('parses rawAddress directly when containing statutory Act noise', () => {
    const rawAddress = '153, BATHFORD DIVISION, DICKOYA, FETC a, 5 wren op Saunt acai Reaistration ot Persons Ace, Noo 32 of 1968';
    const parsed = parseSriLankanAddress(rawAddress);
    assert.equal(parsed.addressLine1, '153, BATHFORD DIVISION');
    assert.equal(parsed.addressLine2, '');
    assert.equal(parsed.city, 'Dickoya');
    assert.equal(parsed.district, 'Nuwara Eliya');
  });

  await t.test('rejects garbled OCR noise (51 5 i, 153, em0e, fd.) and returns empty address', () => {
    const rawJunk = '51 5 i, 153, em0e, fd.';
    assert.equal(isValidAddressText(rawJunk), false);
    const parsed = parseSriLankanAddress(rawJunk);
    assert.equal(parsed.addressLine1, '');
    assert.equal(parsed.addressLine2, '');
    assert.equal(parsed.city, '');
    assert.equal(parsed.district, '');
    assert.equal(parsed.postalCode, '');
  });

  await t.test('extractAddressFromOCR rejects garbled lines like 51 5 i', () => {
    const rawOcr = `
      51 5 i
      153, em0e, fd.
      2018/05/10
    `;
    const extracted = extractAddressFromOCR(rawOcr);
    assert.equal(extracted, '');
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

  await t.test('strips TC OCR artifacts from name', () => {
    const rawOcr = `
      NATIONAL IDENTITY CARD
      TC MAHALINGAM DAWANHAREN
      SRI LANKAN
    `;
    const name = extractFullNameFromOCR(rawOcr);
    assert.equal(name, 'MAHALINGAM DAWANHAREN');
  });

  await t.test('strips trailing TC from name', () => {
    const rawOcr = `
      MAHALINGAM DAWANHAREN TC
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
