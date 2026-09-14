export const ROWS = {
  Numpad0: ['や', null, 'ゆ', null, 'よ'],
  Numpad1: [...'まみむめも'], Numpad2: [...'らりるれろ'],
  Numpad3: ['わ', 'ん', null, null, 'を'], Numpad4: [...'なにぬねの'],
  Numpad5: [...'たちつてと'], Numpad6: [...'かきくけこ'],
  Numpad7: [...'さしすせそ'], Numpad8: [...'あいうえお'], Numpad9: [...'はひふへほ'],
};
export const SEGMENTS = { KeyF: 0, KeyD: 1, KeyG: 2, KeyA: 3, KeyS: 4 };
const voiced = new Map([...('かきくけこさしすせそたちつてとはひふへほう')].map((c,i)=>[c,[...'がぎぐげござじずぜぞだぢづでどばびぶべぼゔ'][i]]));
const semi = new Map([...'はひふへほ'].map((c,i)=>[c,[...'ぱぴぷぺぽ'][i]]));
const small = new Map([...'あいうえおつやゆよわ'].map((c,i)=>[c,[...'ぁぃぅぇぉっゃゅょゎ'][i]]));
export function kana(row, segment, voice = '', isSmall = false) {
  let c = ROWS[row]?.[segment];
  if (!c) return null;
  if (voice) c = (voice === 'voiced' ? voiced : semi).get(c);
  if (!c) return null;
  if (isSmall) c = small.get(c);
  return c || null;
}
export function glyph(c, mode) {
  return mode === 'katakana' ? [...c].map(x => x >= 'ぁ' && x <= 'ゖ' ? String.fromCharCode(x.charCodeAt(0)+0x60) : x).join('') : c;
}
export function makeKana(row, segment, mode) {
  const valid = kana(row,segment);
  return { kind:'kana', row, segment: valid ? segment : 0, voice:'', small:false, mode,
    suffix: valid ? '' : Object.keys(SEGMENTS).find(k=>SEGMENTS[k]===segment).slice(3).toLowerCase() };
}
export function unitText(u) { return u.kind === 'literal' ? u.text : glyph(kana(u.row,u.segment,u.voice,u.small),u.mode)+u.suffix; }
