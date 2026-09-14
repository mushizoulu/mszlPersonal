import {initialState,transition} from './core.mjs';
// Version 2: backspace deletes completed kana instead of undoing their input.
export const LOG_VERSION=2;
export const MAX_LOG_EVENTS=10_000;
export const MAX_LOG_BYTES=10_000_000;
const LOG_DATE_PLACEHOLDER='0000-00-00T00:00:00.000Z';
const encoder=new TextEncoder();
const allowed=new Set(['keydown','keyup','blur','reset','undo','text','candidates']);

export function utf8ByteLength(text) { return encoder.encode(text).byteLength; }
export function replay(events) { return events.reduce((s,e)=>transition(s,e).state,initialState()); }

function formatEvent(event) {
  const json=JSON.stringify(event,null,2);
  if(typeof json!=='string') throw new Error('无效事件');
  return json.split('\n').map(line=>'    '+line).join('\n');
}

/* The timestamp in every exported v2 log is a 24-byte ISO instant. */
export function createLogSizeTracker() {
  const prefix=`{\n  "version": ${LOG_VERSION},\n  "createdAt": "${LOG_DATE_PLACEHOLDER}",\n  "events": `;
  const emptyBytes=utf8ByteLength(prefix+'[]\n}');
  const openingBytes=utf8ByteLength(prefix+'[\n');
  const closingBytes=utf8ByteLength('\n  ]\n}');
  const separatorBytes=utf8ByteLength(',\n');
  let count=0,bytes=emptyBytes;
  return {
    add(event) {
      const eventBytes=utf8ByteLength(formatEvent(event));
      bytes=count===0 ? openingBytes+eventBytes+closingBytes : bytes+separatorBytes+eventBytes;
      count++;
      return bytes;
    },
    get count() { return count; },
    get bytes() { return bytes; }
  };
}

function validateLog(data) {
  if(data?.version===1) throw new Error('旧版日志（版本 1）使用旧退格规则，与当前版本 2 不兼容，无法回放。');
  if(data?.version!==LOG_VERSION||!Array.isArray(data.events)||data.events.length>MAX_LOG_EVENTS) throw new Error(`不支持的日志格式或事件超过 ${MAX_LOG_EVENTS} 条`);
  for(const e of data.events) {
    if(!e||!allowed.has(e.type)) throw new Error('无效事件');
    if(['keydown','keyup'].includes(e.type)&&(typeof e.code!=='string'||e.code.length>40)) throw new Error('无效按键');
    if(e.key!==undefined&&(typeof e.key!=='string'||e.key.length>40)) throw new Error('无效键值');
    for(const name of ['repeat','ctrlKey','altKey','metaKey','shiftKey'])if(e[name]!==undefined&&typeof e[name]!=='boolean')throw new Error('无效按键标志');
    if(e.type==='text'&&(typeof e.text!=='string'||e.text.length>10000)) throw new Error('无效文本');
    if(e.type==='candidates'&&(!Array.isArray(e.items)||e.items.length>100||e.items.some(x=>typeof x!=='string'||x.length>1000))) throw new Error('无效候选');
  }
  return data.events;
}

export function parseLog(text) {
  if(typeof text!=='string'||utf8ByteLength(text)>MAX_LOG_BYTES) throw new Error(`日志超过 ${MAX_LOG_BYTES} 字节`);
  return validateLog(JSON.parse(text));
}

export function serializeLog(events) {
  const text=JSON.stringify({version:LOG_VERSION,createdAt:new Date().toISOString(),events},null,2);
  // Keep export acceptance identical to import acceptance, including UTF-8 size.
  parseLog(text);
  return text;
}
