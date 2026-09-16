import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  NIC_FORMAT,
  NIC_ERROR,
  MONTH_RANGES,
  cleanNIC,
  parseNIC,
  validateNIC,
  toNewFormat,
  toOldFormat,
  formatNIC,
  extractNICFromText,
  parseSriLankanNIC,
} from '../sriLankaNic.js';

// Fixed reference date so age assertions never rot.
const TODAY = new Date(Date.UTC(2026, 8, 8)); // 2026-09-08
const opts = { today: TODAY };

describe('cleanNIC', () => {
  test('strips separators and upper-cases', () => {
    assert.equal(cleanNIC(' 85 123 4567 v '), '851234567V');
    assert.equal(cleanNIC('1985-1230-4567'), '198512304567');
    assert.equal(cleanNIC(null), '');
    assert.equal(cleanNIC(undefined), '');
  });
});

describe('new format', () => {
  test('decodes year, day, serial, sex and date of birth', () => {
    const r = parseNIC('198512304567', opts);
    assert.equal(r.isValid, true);
    assert.equal(r.format, NIC_FORMAT.NEW);
    assert.equal(r.year, 1985);
    assert.equal(r.dayOfYear, 123);
    assert.equal(r.serial, '04567');
    assert.equal(r.gender, 'Male');
    assert.equal(r.dob, '1985-05-02');
    assert.equal(r.suggestedTitle, 'Mr.');
    assert.equal(r.voterMark, null);
    assert.equal(r.isVoter, null);
    assert.equal(r.age, 41);
  });

  test('day of year above 500 means female, and the offset is removed', () => {
    const r = parseNIC('199563012345', opts);
    assert.equal(r.gender, 'Female');
    assert.equal(r.rawDayOfYear, 630);
    assert.equal(r.dayOfYear, 130);
    assert.equal(r.dob, '1995-05-09');
    assert.equal(r.suggestedTitle, 'Ms.');
  });
});

describe('old format', () => {
  test('decodes the same facts and keeps the voter mark', () => {
    const r = parseNIC('851234567V', opts);
    assert.equal(r.format, NIC_FORMAT.OLD);
    assert.equal(r.year, 1985);
    assert.equal(r.dayOfYear, 123);
    assert.equal(r.serial, '4567');
    assert.equal(r.voterMark, 'V');
    assert.equal(r.isVoter, true);
    assert.equal(r.dob, '1985-05-02');
  });

  test('X marks a non-voter', () => {
    assert.equal(parseNIC('851234567X', opts).isVoter, false);
  });

  test('lower-case suffix is accepted', () => {
    assert.equal(parseNIC('851234567v', opts).nic, '851234567V');
  });

  test('a two-digit year of 00 is 2000, not 1900', () => {
    // Regression: old cards were issued until 2016 and the DRP issues a first
    // NIC at 16, so a "00" holder was born in 2000. Reading it as 1900 put a
    // 126-year-old birth date into the form.
    const r = parseNIC('001234567V', opts);
    assert.equal(r.year, 2000);
    assert.equal(r.dob, '2000-05-02');
    assert.equal(r.age, 26);
  });

  test('other two-digit years stay in the 1900s', () => {
    assert.equal(parseNIC('991234567V', opts).year, 1999);
    assert.equal(parseNIC('011234567V', opts).year, 1901);
  });
});

describe('the February boundary', () => {
  test('February is 29 days for every year, so 61 is 1 March either way', () => {
    // The classic decoder bug: using a real day-of-year table shifts every
    // birthday from March onwards by a day in non-leap years.
    assert.equal(parseNIC('199006112345', opts).dob, '1990-03-01'); // common year
    assert.equal(parseNIC('199206112345', opts).dob, '1992-03-01'); // leap year
  });

  test('day 60 is 29 February and decodes in a leap year', () => {
    assert.equal(parseNIC('199206012345', opts).dob, '1992-02-29');
  });

  test('day 60 in a common year is flagged instead of inventing a date', () => {
    const r = parseNIC('199006012345', opts);
    assert.equal(r.isValid, true);        // the number itself is well formed
    assert.equal(r.dob, null);            // but 29 Feb 1990 never happened
    assert.equal(r.age, null);
    assert.equal(r.warnings.length, 1);
    assert.match(r.warnings[0], /29 February 1990/);
  });

  test('the month table still adds up to a 366-day year', () => {
    assert.equal(MONTH_RANGES.reduce((sum, m) => sum + m.days, 0), 366);
  });
});

describe('rejects values that are not NICs', () => {
  for (const bad of [
    '', '   ', null, undefined, 'ABCDEFGHI', '12345', '1234567890123',
    '85123456V',      // 8 digits + V
    '8512345678V',    // 10 digits + V
    '851234567Y',     // wrong suffix letter
    '19851230456',    // 11 digits
  ]) {
    test(`${JSON.stringify(bad)} does not parse`, () => {
      assert.equal(parseNIC(bad, opts), null);
    });
  }

  test('a birth year in the future is rejected', () => {
    assert.equal(parseNIC('999912312345', opts), null);
    assert.equal(parseNIC('202712312345', opts), null); // next year
  });

  test('a birth year before 1900 is rejected', () => {
    assert.equal(parseNIC('189912312345', opts), null);
  });

  test('an impossible day of year is rejected', () => {
    assert.equal(parseNIC('198500012345', opts), null); // day 0
    assert.equal(parseNIC('198540012345', opts), null); // day 400, male range
    assert.equal(parseNIC('198590012345', opts), null); // day 900 -> 400 female
    assert.equal(parseNIC('198550012345', opts), null); // day 500 exactly
  });

  test('day 501 is the first female day, 1 January', () => {
    const r = parseNIC('198550112345', opts);
    assert.equal(r.gender, 'Female');
    assert.equal(r.dob, '1985-01-01');
  });
});

describe('validateNIC', () => {
  test('reports why a value failed', () => {
    assert.equal(validateNIC('', opts).reason, NIC_ERROR.EMPTY);
    assert.equal(validateNIC('not-an-nic', opts).reason, NIC_ERROR.BAD_SHAPE);
    assert.equal(validateNIC('999912312345', opts).reason, NIC_ERROR.YEAR_OUT_OF_RANGE);
    assert.equal(validateNIC('198540012345', opts).reason, NIC_ERROR.DAY_OUT_OF_RANGE);
  });

  test('passes a good NIC through with the parse attached', () => {
    const r = validateNIC('851234567V', opts);
    assert.equal(r.valid, true);
    assert.equal(r.reason, null);
    assert.equal(r.parsed.dob, '1985-05-02');
  });

  test('every failure carries a message fit to show on a form', () => {
    for (const bad of ['', 'nope', '999912312345', '198540012345']) {
      const r = validateNIC(bad, opts);
      assert.equal(r.valid, false);
      assert.ok(r.message && r.message.length > 0);
    }
  });
});

describe('format conversion', () => {
  test('old to new widens the serial with a leading zero', () => {
    assert.equal(toNewFormat('851234567V'), '198512304567');
    assert.equal(toNewFormat('001234567V'), '200012304567');
  });

  test('new to old drops it again, round-tripping exactly', () => {
    assert.equal(toOldFormat('198512304567'), '851234567V');
    assert.equal(toOldFormat('198512304567', 'X'), '851234567X');
    assert.equal(toOldFormat(toNewFormat('851234567V')), '851234567V');
  });

  test('conversion is a no-op when the value is already in that format', () => {
    assert.equal(toNewFormat('198512304567'), '198512304567');
    assert.equal(toOldFormat('851234567V'), '851234567V');
  });

  test('a natively-issued new NIC has no old-format equivalent', () => {
    // Serial 12345 has no leading zero, so it was never an old card.
    assert.equal(toOldFormat('199513312345'), null);
  });

  test('parse exposes the canonical 12-digit form for storage', () => {
    assert.equal(parseNIC('851234567V', opts).normalized, '198512304567');
    assert.equal(parseNIC('198512304567', opts).normalized, '198512304567');
  });

  test('non-NIC input converts to null', () => {
    assert.equal(toNewFormat('rubbish'), null);
    assert.equal(toOldFormat('rubbish'), null);
  });
});

describe('formatNIC', () => {
  test('groups both formats for display', () => {
    assert.equal(formatNIC('198512304567'), '1985 123 04567');
    assert.equal(formatNIC('851234567V'), '851234567 V');
    assert.equal(formatNIC('rubbish'), 'RUBBISH');
  });
});

describe('extractNICFromText', () => {
  test('finds an NIC inside surrounding OCR noise', () => {
    const text = 'DEMOCRATIC SOCIALIST REPUBLIC\nNIC No 198512304567\nCOLOMBO';
    const r = extractNICFromText(text, opts);
    assert.equal(r.nic, '198512304567');
    assert.equal(r.repaired, false);
  });

  test('finds an old-format NIC with its letter', () => {
    const r = extractNICFromText('ID 851234567V issued', opts);
    assert.equal(r.nic, '851234567V');
  });

  test('reads the number even when printed in spaced groups', () => {
    const r = extractNICFromText('No. 1985 123 04567', opts);
    assert.equal(r.nic, '198512304567');
  });

  test('repairs common OCR letter-for-digit confusions', () => {
    const r = extractNICFromText('NIC l98512304567', opts); // lower-case L for 1
    assert.equal(r.nic, '198512304567');
    assert.equal(r.repaired, true);
  });

  test('discards a repair that does not decode', () => {
    assert.equal(extractNICFromText('OOOOOOOOOOOO', opts), null);
  });

  test('returns null when there is nothing to find', () => {
    assert.equal(extractNICFromText('no numbers here', opts), null);
    assert.equal(extractNICFromText('', opts), null);
    assert.equal(extractNICFromText(null, opts), null);
  });

  test('skips a candidate that is the wrong length', () => {
    assert.equal(extractNICFromText('1234567890123456', opts), null);
  });
});

describe('backwards compatibility', () => {
  test('parseSriLankanNIC still works and still returns the old field names', () => {
    const r = parseSriLankanNIC('198512304567', opts);
    assert.equal(r, parseNIC('198512304567', opts).isValid && r);
    for (const key of ['isValid', 'nic', 'format', 'year', 'dayOfYear', 'dob', 'gender', 'suggestedTitle']) {
      assert.ok(key in r, `missing ${key}`);
    }
    assert.equal(r.format, 'NEW_NIC');
  });
});
