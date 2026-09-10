import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { extractFullNameFromOCR, toNameCase } from '../nicParser.js';

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
