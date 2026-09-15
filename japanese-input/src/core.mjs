import { ROWS, SEGMENTS, kana, makeKana, unitText, glyph } from './mapping.mjs';
const clone = x => structuredClone(x);
const modes = ['english','hiragana','katakana'];
/** Pure state machine. Physical keys are never restored by text undo. */
export function initialState() {
  return { mode:'hiragana', committed:'', units:[], pending:null, candidate:null,
    held:[], activeRow:null, sequence:0, history:[] };
}
export function reading(s) { return s.units.map(unitText).join(''); }
export function preview(s) { return s.pending ? glyph(ROWS[s.pending.row][0],s.pending.mode) : ''; }
export function displayText(s) { return s.committed+(s.candidate ? s.candidate.items[s.candidate.index] : reading(s))+preview(s); }
function snapshot(s) { const {mode,committed,units,pending,candidate} = s; return clone({mode,committed,units,pending,candidate}); }
function literal(s,text) { s.units.push({kind:'literal',text}); }
function flush(s) { if(s.pending) { s.units.push(makeKana(s.pending.row,0,s.pending.mode)); s.pending=null; } }
function last(s) { const u=s.units.at(-1); return u?.kind==='kana' ? u : null; }
function undo(s) {
  if(s.history.length) Object.assign(s,s.history.pop());
  s.activeRow=null; // undo must not re-arm a physically held row
}
function isSuffixPredecessor(current,previous) {
  if(!previous||current.units.length!==previous.units?.length) return false;
  const a=clone(current), b=clone(previous);
  const au=a.units.at(-1), bu=b.units.at(-1);
  if(au?.kind!=='kana'||bu?.kind!=='kana'||!au.suffix) return false;
  const currentSuffix=au.suffix, previousSuffix=bu.suffix||'';
  if(currentSuffix===previousSuffix) return false;
  au.suffix='';bu.suffix='';
  return JSON.stringify(a)===JSON.stringify(b);
}
// Later completed units may have been deleted after an invalid suffix was
// entered. Skip their deletion snapshots instead of restoring one of them.
function undoTailSuffix(s) {
  const current=snapshot(s);
  for(let i=s.history.length-1;i>=0;i--) {
    if(!isSuffixPredecessor(current,s.history[i])) continue;
    const previous=clone(s.history[i]);
    s.history=s.history.slice(0,i);
    Object.assign(s,previous);
    s.activeRow=null;
    return true;
  }
  const u=last(s);
  if(u?.suffix) {u.suffix='';s.activeRow=null;}
  return false;
}
// Delete a completed input unit, never walk its segment/modifier history.
function deleteTail(s) {
  const u=s.units.at(-1);
  if(u?.kind==='literal') {
    u.text=[...u.text].slice(0,-1).join('');
    if(!u.text)s.units.pop();
  } else if(u) s.units.pop();
  else s.committed=[...s.committed].slice(0,-1).join('');
  s.activeRow=null;
}
function commit(s) { flush(s); s.committed+=reading(s); s.units=[]; s.pending=null; s.activeRow=null; }
function modifySegment(s,code) {
  const u=last(s), seg=SEGMENTS[code];
  if(!u) return literal(s,code.slice(3).toLowerCase());
  if(kana(u.row,seg,u.voice,u.small)) {u.segment=seg; u.suffix='';}
  else u.suffix=code.slice(3).toLowerCase();
}
function modify(s,code) {
  flush(s); const u=last(s);
  if(!u) return literal(s,code.slice(3).toLowerCase());
  u.suffix='';
  let voice=u.voice, small=u.small;
  if(code==='KeyW') small=!small;
  else { const wanted=code==='KeyT'?'voiced':'semi'; voice=voice===wanted?'':wanted; }
  if(kana(u.row,u.segment,voice,small)) {u.voice=voice;u.small=small;}
  else u.suffix=code.slice(3).toLowerCase();
}
/** event: keydown/keyup {code,key,repeat,ctrlKey,altKey,metaKey}, text {text},
 * blur, reset, undo, candidates {items,reading}. Effects describe host actions. */
export function transition(previous,event) {
  if(event.type==='reset') return {state:initialState(),effects:[]};
  const {history,...rest}=previous;
  const s=clone(rest), effects=[];s.history=[...history]; s.sequence++;
  if(event.type==='blur') {s.held=[];s.activeRow=null;return {state:s,effects};}
  if(event.type==='keyup') {
    s.held=s.held.filter(k=>k!==event.code);
    if(s.activeRow===event.code) s.activeRow=null;
    return {state:s,effects};
  }
  if(event.type==='undo') {undo(s);return {state:s,effects};}
  if(event.type==='candidates') {
    if(event.reading===reading(s) && !s.pending && event.items?.length && event.items.every(x=>typeof x==='string' && x.length)) {
      s.candidate={items:[...event.items],index:0};
    }
    return {state:s,effects};
  }
  const before=snapshot(s);
  let clearHistory=false, forceHistory=false;
  const apply=()=>{
    if(event.type==='text') {
      if(s.mode==='english' && event.text) literal(s,event.text);
      return;
    }
    if(event.type!=='keydown') return;
    const {code,key=''}=event;
    if(event.ctrlKey||event.altKey||event.metaKey||/^(Control|Alt|Meta)/.test(code)) {
      s.activeRow=null; effects.push({type:'passthrough'});return;
    }
    const held=s.held.includes(code);
    if(!held) s.held.push(code);
    const back=code==='Backspace'||(s.mode!=='english'&&code==='NumpadDecimal');
    if((event.repeat||held)&&s.mode!=='english'&&!back) return;
    if((event.repeat||held)&&code==='CapsLock') return;
    if(code==='CapsLock') {
      s.candidate=null;flush(s);s.mode=modes[(modes.indexOf(s.mode)+1)%3];s.activeRow=null;return;
    }
    if(s.mode==='english') {
      // Ordinary text arrives via browser beforeinput, preserving the actual key character.
      if(code==='Backspace') {
        const u=s.units.at(-1);
        if(u?.kind==='literal') {u.text=[...u.text].slice(0,-1).join('');if(!u.text)s.units.pop();}
        else if(u?.suffix)u.suffix='';
        else if(u)s.units.pop();
        else s.committed=[...s.committed].slice(0,-1).join('');
      }
      else if(code==='Enter'||code==='NumpadEnter') literal(s,'\n');
      else effects.push({type:'passthrough'});
      return;
    }
    if(code==='Escape') {
      undo(s);clearHistory='undo';
      return;
    }
    if(back) {
      if(s.candidate||s.pending) {
        undo(s);clearHistory='undo';
      } else if(last(s)?.suffix) {
        if(undoTailSuffix(s)) clearHistory='undo';
      } else deleteTail(s);
      return;
    }
    if(s.candidate) {
      if(code==='ArrowUp'||code==='ArrowDown') {
        s.candidate.index=(s.candidate.index+(code==='ArrowDown'?1:-1)+s.candidate.items.length)%s.candidate.items.length;return;
      }
      if(code==='NumpadAdd') return;
      if(code==='Space'||code==='Enter'||code==='NumpadEnter') {
        const text=s.candidate.items[s.candidate.index];s.committed+=text;s.units=[];s.candidate=null;s.activeRow=null;
        effects.push({type:'acceptCandidate',text});clearHistory=true;return;
      }
      if(ROWS[code]||code in SEGMENTS||['KeyT','KeyR','KeyW','KeyE','KeyX','KeyC','NumpadSubtract'].includes(code)||key.length===1) {
        s.candidate=null;effects.push({type:'restoreReading',text:reading(s)});
        if(code in SEGMENTS) {literal(s,code.slice(3).toLowerCase());return;}
      } else return;
    }
    if(ROWS[code]) {flush(s);s.pending={row:code,mode:s.mode};s.activeRow=code;return;}
    if(code in SEGMENTS) {
      if(s.pending) {s.units.push(makeKana(s.pending.row,SEGMENTS[code],s.pending.mode));s.pending=null;}
      else if(s.activeRow && s.held.includes(s.activeRow)) s.units.push(makeKana(s.activeRow,SEGMENTS[code],s.mode));
      else modifySegment(s,code);
      return;
    }
    if(['KeyT','KeyR','KeyW'].includes(code)) {modify(s,code);return;}
    if(code==='KeyE') {flush(s);const u=makeKana('Numpad5',2,s.mode);u.small=true;s.units.push(u);s.activeRow=null;return;}
    if(['KeyX','KeyC','NumpadSubtract','Space'].includes(code)) {
      flush(s);literal(s,{KeyX:'、',KeyC:'。',NumpadSubtract:'ー',Space:' '}[code]);s.activeRow=null;return;
    }
    if(code==='NumpadAdd') {flush(s);s.activeRow=null;if(s.units.length) {effects.push({type:'convert',reading:reading(s)});forceHistory=true;}return;}
    if(code==='Enter'||code==='NumpadEnter') {
      if(s.units.length||s.pending) {commit(s);clearHistory=true;} else s.committed+='\n';return;
    }
    if(key.length===1) {flush(s);literal(s,key);s.activeRow=null;}
  };
  apply();
  if(clearHistory===true) s.history=[];
  else if(clearHistory!=='undo'&&(forceHistory||JSON.stringify(before)!==JSON.stringify(snapshot(s)))) s.history.push(before);
  return {state:s,effects};
}
