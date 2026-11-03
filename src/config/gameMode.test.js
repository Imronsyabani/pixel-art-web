import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGameMode } from './gameMode.js';

test('defaults to single Rintaro when parameters are missing', () => {
  assert.deepEqual({ ...parseGameMode('') }, {
    gender: 'boy', couple: false, mode: 'single',
    leader: 'rintaro', follower: null,
    visibleCharacters: ['rintaro'],
  });
});

test('girl selects Kaoruko only', () => {
  const result = parseGameMode('?G=girl');
  assert.equal(result.leader, 'kaoruko');
  assert.equal(result.couple, false);
  assert.deepEqual([...result.visibleCharacters], ['kaoruko']);
});

test('boy with C=true selects Rintaro as leader and Kaoruko as follower', () => {
  const result = parseGameMode('?G=boy&C=true');
  assert.equal(result.leader, 'rintaro');
  assert.equal(result.follower, 'kaoruko');
  assert.deepEqual([...result.visibleCharacters], ['rintaro', 'kaoruko']);
});

test('girl with C=true selects Kaoruko as leader and Rintaro as follower', () => {
  const result = parseGameMode('?G=girl&C=true');
  assert.equal(result.leader, 'kaoruko');
  assert.equal(result.follower, 'rintaro');
  assert.deepEqual([...result.visibleCharacters], ['kaoruko', 'rintaro']);
});

test('only literal true enables couple mode', () => {
  assert.equal(parseGameMode('?G=boy&C=1').couple, false);
  assert.equal(parseGameMode('?G=boy&C=False').couple, false);
});
