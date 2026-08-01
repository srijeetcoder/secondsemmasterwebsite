/**
 * Sanity checks for the search filter behind the top-bar input.
 *
 *   node --experimental-strip-types scripts/subjects.test.mjs
 */
import assert from 'node:assert/strict';

import { SUBJECTS, filterSubjects } from '../lib/subjects.ts';

const codes = (q) => filterSubjects(SUBJECTS, q).map((s) => s.code);

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok  ${name}`);
}

check('empty query returns all four', () => {
  assert.deepEqual(codes(''), ['ESCS 201', 'BSCH 201', 'BSCH 291', 'BSM 201']);
});

check('filters by course code', () => {
  assert.deepEqual(codes('BSM 201'), ['BSM 201']);
});

check('course code matching is case-insensitive', () => {
  assert.deepEqual(codes('bsm 201'), ['BSM 201']);
});

check('filters by subject name', () => {
  assert.deepEqual(codes('Mathematics'), ['BSM 201']);
});

check('filters by a topic keyword that is not visible in the UI', () => {
  assert.deepEqual(codes('titration'), ['BSCH 291']);
  assert.deepEqual(codes('pointers'), ['ESCS 201']);
});

check('a shared keyword matches both chemistry subjects', () => {
  assert.deepEqual(codes('chemistry'), ['BSCH 201', 'BSCH 291']);
});

check('filters by description text', () => {
  assert.deepEqual(codes('spectroscopy'), ['BSCH 201']);
});

check('trims surrounding whitespace and matches the badge', () => {
  assert.deepEqual(codes('   Lab Practical  '), ['BSCH 291']);
});

check('no match returns empty', () => {
  assert.deepEqual(codes('quantum physics'), []);
});

check('every subject points at an https URL', () => {
  for (const s of SUBJECTS) {
    assert.equal(new URL(s.url).protocol, 'https:', s.code);
  }
});

console.log(`\n${passed} search checks passed.`);
