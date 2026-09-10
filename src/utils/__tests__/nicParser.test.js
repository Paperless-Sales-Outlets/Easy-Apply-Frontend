import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  extractFullNameFromOCR,
  toNameCase,
  extractAddressFromOCR,
  parseSriLankanAddress,
} from '../nicParser.js';

describe('toNameCase', () => {
  test('turns block capitals into ordinary name case', () => {
    assert.equal(toNameCase('KASUN ANURUDDHA PERERA'), 'Kasun Anuruddha Perera');
  });

  test('leaves initials in capitals', () => {
    assert.equal(toNameCase('K.A.D. PERERA'), 'K.A.D. Perera');
    assert.equal(toNameCase('M. SILVA'), 'M. Silva');
  });

  test('capitalises after a hyphen or apostrophe', () => {
    assert.equal(toNameCase('PERERA-SILVA'), 'Perera-Silva');
    assert.equal(toNameCase("O'BRIEN"), "O'Brien");
  });

  test('handles empty and non-string input', () => {
    assert.equal(toNameCase(''), '');
    assert.equal(toNameCase(null), '');
    assert.equal(toNameCase(undefined), '');
  });
});

describe('extractFullNameFromOCR', () => {
  test('reads every part of a name printed on one line', () => {
    const text = 'NIC No 198512304567\nKASUN ANURUDDHA PERERA\nDate of Birth 1985-05-02';
    assert.equal(extractFullNameFromOCR(text), 'Kasun Anuruddha Perera');
  });

  test('joins a name that wraps across lines', () => {
    // Regression: taking only the single longest line returned "Kasun
    // Anuruddha" and silently dropped the surname on the next line.
    const text = 'DEMOCRATIC SOCIALIST REPUBLIC\nName\nKASUN ANURUDDHA\nPERERA\nSex MALE';
    assert.equal(extractFullNameFromOCR(text), 'Kasun Anuruddha Perera');
  });

  test('keeps initials and drops the OCR debris around them', () => {
    assert.equal(extractFullNameFromOCR('e IC K.A.D. PERERA\n198512304567'), 'K.A.D. Perera');
  });

  test('drops stray two-letter fragments', () => {
    assert.equal(extractFullNameFromOCR('e IC MAHALINGAM DAWANHAREN\nSRI LANKA'), 'Mahalingam Dawanharen');
  });

  test('keeps a real name particle', () => {
    const text = 'Name\nNIMALI DE SILVA\nDate of Birth 1992-03-02';
    assert.equal(extractFullNameFromOCR(text), 'Nimali De Silva');
  });

  test('a field label does not bleed a word into the name', () => {
    // "Date of Birth" sits right under the name; "of" must not join it.
    const text = 'KASUN PERERA\nDate of Birth 1985-05-02';
    assert.equal(extractFullNameFromOCR(text), 'Kasun Perera');
  });

  test('prefers the block introduced by a Name label', () => {
    const text = 'REGISTRATION OF PERSONS DEPARTMENT\nName\nANOMA WIJESINGHE\nCOLOMBO WESTERN PROVINCE';
    assert.equal(extractFullNameFromOCR(text), 'Anoma Wijesinghe');
  });

  test('reads the labelled English name off a real card, not the Sinhala misreads', () => {
    // Regression from a real 2004 card. An `eng` engine renders the Sinhala and
    // Tamil lines as mixed-case nonsense; the old code upper-cased every line
    // first, so those six junk words outscored the two real ones and the form
    // was filled with "Com Shfm Evisens Bad Fem Wren".
    const text = [
      'Ke) Bo emes',
      'Com Shfm',
      'Evisens Bad',
      'Fem Wren',
      'SRI LANKA  NATIONAL IDENTITY CARD',
      'No.: 200410111562',
      'Name: KESAVAN AVANEESH',
      '/ Sex / Male',
      'Date of Birth : 2004/04/10',
    ].join('\n');
    assert.equal(extractFullNameFromOCR(text), 'Kesavan Avaneesh');
  });

  test('mixed-case OCR debris never counts as a name', () => {
    assert.equal(extractFullNameFromOCR('Com Shfm Evisens Bad Fem Wren'), '');
  });

  test('returns empty when the text is only card boilerplate', () => {
    assert.equal(extractFullNameFromOCR('DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA'), '');
    assert.equal(extractFullNameFromOCR(''), '');
    assert.equal(extractFullNameFromOCR(null), '');
  });

  test('caps the number of parts so a paragraph cannot become a name', () => {
    const text = 'ALPHA BRAVO CHARLIE DELTA ECHO FOXTROT GOLF HOTEL INDIA';
    assert.equal(extractFullNameFromOCR(text).split(' ').length, 6);
  });
});

describe('extractAddressFromOCR', () => {
  // The reverse of a real card: the address is printed in Sinhala, then Tamil,
  // then English, and an `eng` engine mangles the first two.
  const back = [
    'P  A6P86G03 - N',
    'Address :',
    'C26/2/2, \u0dc3\u0ddc\u0dba\u0dd2\u0dc3\u0dcf \u0db8\u0dc4\u0dbd\u0dca, \u0db8\u0ddc\u0dbb\u0da7\u0dd4\u0dc0. 036MM-828',
    'C26/2/2, Comm QsTLiTLoM. QsTuFTL Ln, QLDTMLGmen.',
    'C26/2/2, SOYSA FLATS, SOYSAPURA, MORATUWA.',
    'Date of Issue : 2020/05/19  Place of Birth: COLOMBO',
    'Registration of Persons Act, No. 32 of 1968',
  ].join('\n');

  test('picks the English rendering, not the Sinhala or Tamil one', () => {
    // Regression: the old keyword list had no entry matching "FLATS",
    // "SOYSAPURA" or "MORATUWA", and its fallback needed a leading digit — but
    // this house number starts with a letter. The result was no address at all.
    assert.equal(extractAddressFromOCR(back), 'C26/2/2, SOYSA FLATS, SOYSAPURA, MORATUWA');
  });

  test('the extracted line parses into the form fields', () => {
    const parsed = parseSriLankanAddress(extractAddressFromOCR(back));
    assert.equal(parsed.addressLine1, 'C26/2/2, SOYSA FLATS');
    assert.equal(parsed.city, 'MORATUWA');
    assert.equal(parsed.district, 'Colombo');
    assert.equal(parsed.postalCode, '10400');
  });

  test('works without an Address label', () => {
    assert.equal(
      extractAddressFromOCR('45, GALLE ROAD, DEHIWALA.'),
      '45, GALLE ROAD, DEHIWALA'
    );
  });

  test('stops at the legal boilerplate', () => {
    assert.equal(extractAddressFromOCR('Registration of Persons Act, No. 32 of 1968'), '');
  });

  test('returns empty for junk input', () => {
    assert.equal(extractAddressFromOCR(''), '');
    assert.equal(extractAddressFromOCR(null), '');
    assert.equal(extractAddressFromOCR('Comm QsTLiTLoM QsTuFTL'), '');
  });
});
