import {initialState,transition,reading,preview,displayText} from './src/core.mjs';
import {ROWS,unitText} from './src/mapping.mjs';
import {parseLog,serializeLog,MAX_LOG_EVENTS,MAX_LOG_BYTES,createLogSizeTracker} from './src/replay.mjs';
const $=id=>document.getElementById(id);
let state=initialState(),events=[],records=[],logSize=createLogSizeTracker();
const names={hiragana:'平假名',katakana:'片假名',english:'英数'};
const fixture={'か':['蚊','科','課'],'かな':['仮名','かな'],'にほん':['日本','二本']};
function key(parent,code,label,sub){const el=document.createElement('div');el.className='key'+(!code?' spacer':'');el.dataset.code=code;const a=document.createElement('strong'),b=document.createElement('small');a.textContent=label;b.textContent=sub;el.append(a,b);$(parent).append(el);}
for(const [code,label,sub] of [['KeyW','W','小假名'],['KeyE','E','っ'],['KeyR','R','半浊点'],['KeyT','T','浊点'],['','',''],['KeyA','A','え'],['KeyS','S','お'],['KeyD','D','い'],['KeyF','F','あ'],['KeyG','G','う'],['KeyX','X','、'],['KeyC','C','。']]) key('left-keys',code,label,sub);
for(const n of [7,8,9,4,5,6,1,2,3,0])key('num-keys','Numpad'+n,String(n),n===3?'わ・を・ん':ROWS['Numpad'+n][0]+'行');
key('num-keys','NumpadDecimal','.','退格');key('num-keys','NumpadAdd','+','变换');
function span(text,cls){const el=document.createElement('span');el.textContent=text;el.className=cls;return el;}
function render(){
 $('mode').textContent=names[state.mode];$('output').replaceChildren(span(state.committed,'committed'));
 if(state.candidate) $('output').append(span(state.candidate.items[state.candidate.index],'editing'));
 else for(const u of state.units){const t=unitText(u);$('output').append(span(u.suffix?t.slice(0,-u.suffix.length):t,'editing'));if(u.suffix)$('output').append(span(u.suffix,'suffix'));}
 if(state.pending)$('output').append(span(preview(state),'pending'));
 $('status').replaceChildren();
 const u=state.units.at(-1);
 for(const [name,value] of [['活动行',state.activeRow?ROWS[state.activeRow][0]+'行（按住）':'无'],['配对状态',state.pending?'待定 '+ROWS[state.pending.row][0]+'行':state.units.length?'已配对／可继续输入':'尚未输入'],['可修改前字',!state.candidate&&u?.kind==='kana'?unitText(u):'无'],['撤销记录',String(state.history.length)],['候选来源',state.candidate?'模拟候选':'真实 IME 未接入']]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;$('status').append(dt,dd);}
 document.querySelectorAll('.key').forEach(el=>el.classList.toggle('held',state.held.includes(el.dataset.code)));
 $('candidates').replaceChildren();state.candidate?.items.forEach((t,i)=>$('candidates').append(span(`${i+1} ${t}`,'candidate'+(i===state.candidate.index?' selected':''))));
 $('count').textContent=events.length+' 个事件 · '+logSize.bytes.toLocaleString()+' B';
 const eventNearLimit=events.length>=MAX_LOG_EVENTS*.9,byteNearLimit=logSize.bytes>=MAX_LOG_BYTES*.9;
 $('log-warning').textContent=events.length>MAX_LOG_EVENTS||logSize.bytes>MAX_LOG_BYTES
  ?`日志已超过导出上限（${MAX_LOG_EVENTS.toLocaleString()} 个事件或 ${MAX_LOG_BYTES.toLocaleString()} B）；仍可继续试打、复制和记录，但不能导出。`
  :eventNearLimit||byteNearLimit
   ?`日志接近导出上限（${events.length.toLocaleString()}/${MAX_LOG_EVENTS.toLocaleString()} 个事件，${logSize.bytes.toLocaleString()}/${MAX_LOG_BYTES.toLocaleString()} B）。`
   :'';
 $('log').textContent=records.slice(-150).map(x=>`${x.sequence} ${x.event.type} ${x.event.code||''}${x.event.repeat?' [repeat]':''}  ${JSON.stringify(x.before)} → ${JSON.stringify(x.after)}${x.effects.length?'  '+x.effects.map(e=>e.type).join(', '):''}`).join('\n');
}
function dispatch(event,resolve=true,paint=true){
 const before=displayText(state),result=transition(state,event);state=result.state;events.push(event);logSize.add(event);
 records.push({sequence:state.sequence,event,before,after:displayText(state),effects:result.effects});
 for(const effect of result.effects){
  if(effect.type==='convert'&&resolve){
   if($('demo').checked&&fixture[effect.reading]) dispatch({type:'candidates',reading:effect.reading,items:fixture[effect.reading]},false);
   else $('notice').textContent=$('demo').checked?'这个读音没有模拟词条，可试「か」「かな」「にほん」。':'已请求变换，真实 IME 尚未接入。';
  }
 }
 if(paint)render();return result;
}
function normalized(e,type){return {type,code:e.code,key:e.key,repeat:e.repeat,ctrlKey:e.ctrlKey,altKey:e.altKey,metaKey:e.metaKey,shiftKey:e.shiftKey};}
$('capture').addEventListener('keydown',e=>{
 if(e.isComposing||e.keyCode===229){$('notice').textContent='检测到系统 IME 正在组字。请先切到系统英数输入，再使用此原型。';return;}
 const priorMode=state.mode;
 const r=dispatch(normalized(e,'keydown'));
 if(!r.effects.some(x=>x.type==='passthrough'))e.preventDefault();
 if(priorMode!==state.mode)$('notice').textContent='内部模式：'+names[state.mode]+'。已有读音和字形保持不变；未控制系统 IME。';
});
$('capture').addEventListener('keyup',e=>dispatch(normalized(e,'keyup')));
$('capture').addEventListener('beforeinput',e=>{
 if(e.isComposing)return;
 e.preventDefault();
 if(state.mode==='english'&&e.inputType==='insertText'&&e.data)dispatch({type:'text',text:e.data});
 $('capture').value='';
});
$('capture').addEventListener('input',()=>{$('capture').value='';});
$('capture').addEventListener('paste',e=>{e.preventDefault();$('notice').textContent='试打区仅支持末尾按键输入；事件日志请通过「导入回放」载入。';});
$('capture').addEventListener('focus',()=>{$('focus').textContent='正在捕获';});
$('capture').addEventListener('blur',()=>{$('focus').textContent='未聚焦';dispatch({type:'blur'});});
$('undo').onclick=()=>{dispatch({type:'undo'});$('capture').focus();};
$('clear').onclick=()=>{state=initialState();events=[];records=[];logSize=createLogSizeTracker();render();$('capture').focus();};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(displayText(state));$('notice').textContent='已复制当前显示文字（包含待定预览）。';}catch{$('notice').textContent='浏览器未允许复制，请选择显示文字后手动复制。';}};
$('export').onclick=()=>{
 if(document.activeElement===$('capture')) $('capture').blur();
 try{
  const text=serializeLog(events),blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='kana-session.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }catch(e){$('notice').textContent='导出失败：'+e.message;}
};
$('import').onclick=()=>$('file').click();
$('file').onchange=async()=>{
 const controls=[...document.querySelectorAll('button,input,textarea')];
 const backup={state,events,records};
 try{
  const file=$('file').files[0];if(!file)return;if(file.size>MAX_LOG_BYTES)throw new Error(`日志超过 ${MAX_LOG_BYTES.toLocaleString()} 字节`);
  controls.forEach(el=>el.disabled=true);
  const data=parseLog(await file.text());state=initialState();events=[];records=[];logSize=createLogSizeTracker();
  for(let i=0;i<data.length;i++){dispatch(data[i],false,false);if(i%100===0)await new Promise(r=>setTimeout(r,0));}
  render();$('notice').textContent='已回放 '+data.length+' 个事件。';
 }catch(e){({state,events,records}=backup);logSize=createLogSizeTracker();for(const event of events)logSize.add(event);render();$('notice').textContent='导入失败：'+e.message;}
 finally{controls.forEach(el=>el.disabled=false);$('file').value='';}
};
render();
