/**
 * Sanity checks for the cross-domain handoff URL builder.
 *
 *   node --experimental-strip-types scripts/handoff.test.mjs
 *
 * These matter because a bug here means either "SSO silently doesn't work" or
 * "a refresh token got sent to an origin we don't control".
 */
import assert from 'node:assert/strict';

import { ALLOWED_HANDOFF_ORIGINS, buildHandoffUrl, isSessionFresh } from '../lib/handoff.ts';

const session = {
  access_token: 'ACCESS123',
  refresh_token: 'REFRESH456',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
};

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok  ${name}`);
}

check('appends both tokens to an allowlisted origin', () => {
  const url = buildHandoffUrl('https://pracchem.vercel.app/', session);
  const params = new URLSearchParams(new URL(url).hash.slice(1));
  assert.equal(params.get('access_token'), 'ACCESS123');
  assert.equal(params.get('refresh_token'), 'REFRESH456');
  assert.equal(params.get('type'), 'sso_handoff');
});

check('uses the hash fragment, never the query string', () => {
  const url = new URL(buildHandoffUrl('https://pracchem.vercel.app/', session));
  assert.equal(url.search, '');
  assert.ok(url.hash.includes('access_token'));
});

check('returns a bare URL when there is no session', () => {
  assert.equal(
    buildHandoffUrl('https://pracchem.vercel.app/', null),
    'https://pracchem.vercel.app/',
  );
});

check('refuses to leak tokens to a non-allowlisted origin', () => {
  const url = buildHandoffUrl('https://evil.example.com/', session);
  assert.equal(url, 'https://evil.example.com/');
  assert.ok(!url.includes('REFRESH456'));
});

check('refuses plain http even for an allowlisted host', () => {
  const url = buildHandoffUrl('http://pracchem.vercel.app/', session);
  assert.ok(!url.includes('ACCESS123'));
});

check('tolerates a malformed URL without throwing', () => {
  assert.equal(buildHandoffUrl('not a url', session), 'not a url');
});

check('handles a partial session (missing refresh token)', () => {
  const url = buildHandoffUrl('https://pracchem.vercel.app/', {
    ...session,
    refresh_token: '',
  });
  assert.ok(!url.includes('ACCESS123'));
});

check('all four subject sites are allowlisted', () => {
  assert.equal(ALLOWED_HANDOFF_ORIGINS.length, 4);
  for (const origin of ALLOWED_HANDOFF_ORIGINS) {
    assert.ok(buildHandoffUrl(`${origin}/`, session).includes('ACCESS123'), origin);
  }
});

check('isSessionFresh rejects an expired session', () => {
  assert.equal(isSessionFresh(session), true);
  assert.equal(
    isSessionFresh({ ...session, expires_at: Math.floor(Date.now() / 1000) - 10 }),
    false,
  );
  assert.equal(isSessionFresh(null), false);
});

console.log(`\n${passed} handoff checks passed.`);
