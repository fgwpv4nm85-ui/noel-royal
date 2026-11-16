import test from 'node:test';
import assert from 'node:assert/strict';
import { CHRISTMAS_MUSIC_LIBRARY, getNextThemeIndex } from './musicLibrary';

test('christmas music library provides multiple alternating holiday themes with valid notes', () => {
  assert.ok(CHRISTMAS_MUSIC_LIBRARY.length >= 5);

  const ids = new Set(CHRISTMAS_MUSIC_LIBRARY.map((t) => t.id));
  assert.equal(ids.size, CHRISTMAS_MUSIC_LIBRARY.length);

  for (const theme of CHRISTMAS_MUSIC_LIBRARY) {
    assert.ok(theme.title.length > 0);
    assert.ok(theme.beatSec > 0.2 && theme.beatSec < 0.7);
    assert.ok(theme.notes.length >= 20);
    assert.ok(theme.notes.some((n) => typeof n.freq === 'number' && n.freq > 0));
  }
});

test('getNextThemeIndex cycles cleanly through all Christmas themes in order', () => {
  const n = CHRISTMAS_MUSIC_LIBRARY.length;
  let idx = 0;
  const visited: number[] = [idx];
  for (let i = 0; i < n; i++) {
    idx = getNextThemeIndex(idx, n);
    visited.push(idx);
  }
  assert.deepEqual(visited, [0, 1, 2, 3, 4, 0]);
});
