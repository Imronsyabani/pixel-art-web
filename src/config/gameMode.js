const normalizeGender = (value) => value === 'girl' ? 'girl' : 'boy';
const isTrue = (value) => value === 'true';

export function parseGameMode(search = globalThis.location?.search ?? '') {
  const params = new URLSearchParams(search);
  const gender = normalizeGender(params.get('G'));
  const couple = isTrue(params.get('C'));
  const leader = gender === 'boy' ? 'rintaro' : 'kaoruko';
  const follower = gender === 'boy' ? 'kaoruko' : 'rintaro';

  return Object.freeze({
    gender,
    couple,
    mode: couple ? 'couple' : 'single',
    leader,
    follower: couple ? follower : null,
    visibleCharacters: Object.freeze(couple ? [leader, follower] : [leader]),
  });
}
