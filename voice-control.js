// Bounded commands only. This module never saves records or calls external services.
const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const plus=(key,n)=>{const d=new Date(key+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
export function interpretVoice(text,today){
 const raw=text.trim().slice(0,1500),s=raw.toLowerCase().replace(/[.?!]+$/,'');
 if(/^(?:open|show)(?: me)? (?:my |the )?buyers$/.test(s))return {kind:'buyers'};
 if(/^(?:open|show)(?: me)? (?:my |the )?(?:appointments|bookings|schedule)$/.test(s))return {kind:'appointments'};
 if(/^(?:add|create)(?: a)?(?: new)? contact\b/.test(s)){
  const rest=raw.replace(/^(?:add|create)(?: a)?(?: new)? contact(?: (?:called|named))?\s*/i,'');
  const name=rest.split(/,|\b(?:mobile|phone|at)\b/i)[0].trim();
  const phone=rest.match(/(?:mobile(?: number)?|phone(?: number)?)\s*([+\d][\d\s()-]+)/i)?.[1].trim()||'';
  return {kind:'contact',name,phone,address:rest.match(/\bat\s+(.+)$/i)?.[1].trim()||''};
 }
 const kind=/^(?:book|schedule)\b/.test(s)?'appointment':/^(?:add|create)(?: a)? task\b|^assign\b/.test(s)?'task':'';
 if(!kind)return {error:'Try “open my buyers”, “add a contact”, “add a task to call John tomorrow”, or “book Ray for an appraisal…”.'};
 let date='',time='',dateText='';
 const iso=s.match(/\b(\d{4}-\d{2}-\d{2})\b/);
 if(iso){if(!Number.isFinite(+new Date(iso[1]+'T12:00:00Z'))||plus(iso[1],0)!==iso[1])return {error:'That date is not valid.'};date=iso[1];dateText=iso[0]}
 else if(/\btomorrow\b/.test(s)){date=plus(today,1);dateText='tomorrow'}
 else if(/\btoday\b/.test(s)){date=today;dateText='today'}
 else {const m=s.match(/\b(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);if(m){let offset=(days.indexOf(m[2])-new Date(today+'T12:00:00Z').getUTCDay()+7)%7;if(!offset)offset=7;date=plus(today,offset);dateText=m[0]}}
 if(/\b(midday|noon)\b/.test(s))time='12:00';else if(/\bmidnight\b/.test(s))time='00:00';else {const m=s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);if(m){const h=+m[1],min=+(m[2]||0);if(h<1||h>12||min>59)return {error:'Choose a valid time.'};time=String(h%12+(m[3]==='pm'?12:0)).padStart(2,'0')+':'+String(min).padStart(2,'0')}}
 const person=kind==='appointment'?(raw.match(/^(?:book|schedule)\s+(.+?)\s+(?:in\s+)?for\b/i)?.[1]||raw.match(/^(?:book|schedule)\s+(.+?)\s+(?:an?|the)\s+(?:appraisal|inspection|appointment)\b/i)?.[1]):raw.match(/^assign\s+(.+?)\s+(?:a|an|the)\s+/i)?.[1];
 const address=kind==='appointment'?(raw.match(/\bat\s+(\d[^]+?)(?=\s+(?:next\s+)?(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday)|\s+at\s+(?:\d|midday|noon|midnight)|,?\s+(?:on|today|tomorrow)\b|$)/i)?.[1]||'').replace(/[,\s]+$/,''):'';
 const type=/\bappraisal\b/i.test(raw)?'MAP':/\bsecond inspection\b|\bbuyer appointment\b/i.test(raw)?'BAP':'';
 return {kind,raw,person:person?.trim()||'',date,time,dateText,address,type,title:kind==='task'?raw.replace(/^(?:add|create)(?: a)? task(?: to)?\s*|^assign\s+.+?\s+(?:a|an|the)\s+/i,'').replace(dateText,'').replace(/\s+(?:for|on|at)\s*$/i,'').trim():''};
}
// Local suggestions only: never fabricate a property or silently apply a fuzzy match.
export function voiceAddressSuggestions(address,properties=[],suburbs=[]){
 const norm=v=>String(v||'').toLowerCase().replace(/\bstreet\b/g,'st').replace(/\broad\b/g,'rd').replace(/\bavenue\b/g,'ave').replace(/\bdrive\b/g,'dr').replace(/[^a-z0-9]/g,'');
 const distance=(a,b)=>{let row=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const next=[i+1];for(let j=0;j<b.length;j++)next.push(Math.min(next[j]+1,row[j+1]+1,row[j]+(a[i]!==b[j])));row=next}return row[b.length]};
 const input=String(address||'').trim(),key=norm(input),number=input.match(/^\d+[a-z]?(?:\/\d+[a-z]?)?/i)?.[0];if(!key)return [];
 const candidates=[...new Set(properties.filter(Boolean))].map(value=>({value,key:norm(value)})).filter(p=>p.key===key||(number&&p.value.match(/^\d+[a-z]?(?:\/\d+[a-z]?)?/i)?.[0].toLowerCase()===number.toLowerCase()&&(p.key.startsWith(key)||distance(key,p.key)<=Math.max(2,Math.floor(p.key.length*.2))))).sort((a,b)=>distance(key,a.key)-distance(key,b.key)).map(p=>p.value);
 // Correct only the suburb suffix, and present it as an option for explicit selection.
 const parts=input.match(/^(.*[, ]+)([^,]+)$/);if(parts){const tokens=input.split(/[, ]+/);for(let n=1;n<=Math.min(4,tokens.length-1);n++){const tail=tokens.slice(-n).join(' '),t=norm(tail);if(t.length<4)continue;for(const suburb of suburbs){const sk=norm(suburb);if(sk===t||distance(t,sk)<=Math.max(1,Math.floor(sk.length*.2)))candidates.push(tokens.slice(0,-n).join(' ')+', '+suburb)}}}
 return [...new Set(candidates)].slice(0,8);
}
export function createVoiceControl(env){
 let panel=null,recognition=null,epoch=0,held=false,finishing=false,processed=false,busy=false,draft=null,timer=null,started=false,activePointer=null,returnFocus=null,suppressClickUntil=0;
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const status=text=>{if(panel)panel.querySelector('[data-status]').textContent=text};
 const close=({keepDraft=false}={})=>{if(draft&&!keepDraft)draft.cancel?.();epoch++;held=false;activePointer=null;started=false;finishing=false;clearTimeout(timer);try{recognition?.abort()}catch{}recognition=null;panel?.remove();panel=null;draft=null;busy=false;returnFocus?.isConnected&&returnFocus.focus({preventScroll:true})};
 function shell(){
  if(panel)return;returnFocus=document.activeElement;panel=document.createElement('div');panel.className='voice-overlay voice-conversation';
  panel.innerHTML='<section class="voice-sheet" role="dialog" aria-modal="true" aria-labelledby="voiceTitle"><header><div><small>AGNT ASSISTANT</small><h2 id="voiceTitle">What needs doing?</h2></div><button type="button" data-close aria-label="Close">×</button></header><p data-status role="status">Hold to speak. Release when finished.</p><div data-review></div><div class="voice-capture"><button type="button" data-hold aria-label="Hold to speak"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg></button><span>Hold to speak · release to finish</span></div><details data-transcript><summary>Type or edit command</summary><label>Command<textarea rows="3" maxlength="1500" placeholder="Book Ray an appraisal next Tuesday at midday"></textarea></label><button type="button" data-use>Use command</button></details><div class="voice-secondary"><button type="button" data-task>Add task manually</button><button type="button" data-close>Cancel</button></div></section>';
  document.body.append(panel);
  panel.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close();else if(e.target.closest('[data-use]')){processed=false;process()}else if(e.target.closest('[data-task]')){close();env.manualTask()}else if(e.target.closest('[data-edit]')){const edit=draft?.edit;close({keepDraft:true});edit?.()}else if(e.target.closest('[data-confirm]'))confirm();else if(e.target.closest('[data-member]'))process(e.target.closest('[data-member]').dataset.member)});
  panel.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const nodes=[...panel.querySelectorAll('button,textarea,summary,input,select')].filter(n=>n.getClientRects().length&&!n.disabled),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}});
 }
 function begin(){
  if(held||busy)return;if(draft){status('Confirm this draft or choose Edit details before starting another command.');return}
  shell();epoch++;clearTimeout(timer);try{recognition?.abort()}catch{}recognition=null;held=true;started=false;finishing=false;processed=false;
  panel.querySelector('textarea').value='';panel.querySelector('[data-review]').replaceChildren();
  const API=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!API){held=false;status('Voice is unavailable here. Type your command instead.');panel.querySelector('details').open=true;return}
  const token=epoch,r=new API();recognition=r;r.lang='en-AU';r.continuous=true;r.interimResults=true;panel.dataset.listening='true';status('Starting microphone… wait for Listening before speaking.');
  r.onstart=()=>{if(token!==epoch||!panel)return;started=true;if(finishing){try{r.stop()}catch{}}else status('Listening. Release when you’re finished.')};
  r.onaudiostart=()=>{if(token===epoch&&panel&&!finishing)status('Listening. Release when you’re finished.')};
  r.onspeechstart=()=>{if(token===epoch&&panel&&!finishing)status('Speech detected. Keep holding until finished.')};
  r.onresult=e=>{if(token!==epoch||!panel||processed)return;panel.querySelector('textarea').value=Array.from(e.results).map(result=>result[0].transcript).join(' ');if(!finishing)status('Hearing you. Release when finished.');panel.querySelector('details').open=true};
  r.onerror=e=>{if(token!==epoch||!panel)return;held=false;finishing=false;recognition=null;clearTimeout(timer);panel.dataset.listening='false';status(e.error==='not-allowed'?'Microphone access is denied. Type below or update device permissions.':e.error==='network'?'Voice recognition needs a connection. Type below to continue.':'No usable speech received. Hold to retry or type below.');panel.querySelector('details').open=true;epoch++};
  r.onend=()=>{if(token!==epoch||!panel)return;recognition=null;panel.dataset.listening='false';if(finishing)process();else status('Listening ended. Release to prepare the command or hold to retry.')};
  try{r.start()}catch{held=false;recognition=null;panel.dataset.listening='false';status('Voice could not start. Type below to continue.');panel.querySelector('details').open=true}
 }
 function finish(){
  if(!held||!panel)return;held=false;finishing=true;panel.dataset.listening='false';status('Preparing your request…');
  if(recognition){if(started){try{recognition.stop()}catch{}}timer=setTimeout(()=>{epoch++;try{recognition?.abort()}catch{}recognition=null;process()},6000)}else process();
 }
 function process(memberId=''){
  if(!panel||busy||(processed&&!memberId))return;clearTimeout(timer);finishing=false;
  const command=interpretVoice(panel.querySelector('textarea').value,env.today());
  if(command.error){status(command.error);panel.querySelector('details').open=true;return}
  let member=null;
  if(command.person){const needle=command.person.toLowerCase(),matches=env.members().filter(m=>(m.name||'').toLowerCase()===needle||(m.name||'').toLowerCase().split(' ')[0]===needle);member=memberId?matches.find(m=>m.uid===memberId):matches.length===1?matches[0]:null;
   if(!member){status(matches.length?'Which team member?':'I couldn’t match that team member. Edit their name below.');panel.querySelector('[data-review]').innerHTML=matches.map(m=>`<button type="button" data-member="${escape(m.uid)}">${escape(m.name)}</button>`).join('');if(!matches.length)panel.querySelector('details').open=true;return}}
  busy=true;processed=true;epoch++;
  try{draft=env.prepare(command,member);if(!draft){close();return}renderReview()}catch(error){processed=false;status(error.message);panel.querySelector('details').open=true}finally{busy=false}
 }
 function renderReview(){
  panel.querySelector('.voice-capture').hidden=true;panel.querySelector('details').open=false;panel.querySelector('[data-use]').hidden=true;panel.querySelector('textarea').readOnly=true;panel.querySelector('summary').textContent='What I heard';panel.querySelector('[data-task]').hidden=true;
  const missing=draft.fields.filter(f=>(f.required&&!f.get())||f.suggestions?.length);
  status(missing.length?'Just add the missing details below.':'Ready when you are.');
  panel.querySelector('[data-review]').innerHTML=`<p class="voice-assignee">${escape(draft.assignee)}</p><dl>${draft.fields.filter(f=>f.get()).map(f=>{const value=f.get();const shown=f.label==='Appointment type'?({MAP:'Market appraisal',LAP:'Listing appointment',BAP:'Buyer appointment',OFI:'Open home'}[value]||value):f.type==='date'?new Date(value+'T12:00:00Z').toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Australia/Sydney'}):value;return `<div><dt>${escape(f.label)}</dt><dd>${escape(shown)}</dd></div>`}).join('')}</dl>${missing.map(f=>`<label>${escape(f.label)}${f.type==='select'?`<select data-field="${draft.fields.indexOf(f)}"><option value="">Choose type</option>${f.options.map(v=>`<option>${v}</option>`).join('')}</select>`:`<input data-field="${draft.fields.indexOf(f)}" type="${escape(f.type)}" value="${escape(f.get())}" ${f.required?'required':''} ${f.suggestions?.length?'list="voiceAddresses"':''}>${f.suggestions?.length?`<datalist id="voiceAddresses">${f.suggestions.map(value=>`<option value="${escape(value)}"></option>`).join('')}</datalist><small>Check against saved properties and suburbs</small>`:''}`}</label>`).join('')}<button type="button" data-confirm class="voice-confirm">${escape(draft.label)}</button><button type="button" data-edit>Edit details</button>`;
 }
 function confirm(){
  if(!draft||busy)return;
  for(const input of panel.querySelectorAll('[data-field]')){if(!input.checkValidity()){input.reportValidity();return}draft.fields[+input.dataset.field].set(input.value)}
  if(draft.fields.some(f=>f.required&&!f.get())){renderReview();return}
  busy=true;try{if(draft.commit()){draft=null;close()}else{status('Check the highlighted details in the editor.');const edit=draft.edit;close({keepDraft:true});edit?.()}}catch(error){busy=false;status(error.message)}
 }
 document.addEventListener('pointerdown',e=>{if(e.button!==0||held)return;const button=e.target.closest('.voice-entry,[data-hold]');if(!button)return;e.preventDefault();activePointer=e.pointerId;suppressClickUntil=Date.now()+1000;try{button.setPointerCapture(e.pointerId)}catch{}begin()},true);
 document.addEventListener('pointerup',e=>{if(activePointer!==null&&e.pointerId!==activePointer)return;activePointer=null;if(held)suppressClickUntil=Date.now()+1000;finish()},true);document.addEventListener('pointercancel',e=>{if(held&&e.pointerId===activePointer)close()},true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest('.voice-entry,[data-hold]'))e.preventDefault()});
 document.addEventListener('selectstart',e=>{if(e.target.closest('.voice-entry,[data-hold]'))e.preventDefault()});
 document.addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='Enter')&&e.target.closest('.voice-entry,[data-hold]')){e.preventDefault();if(!e.repeat)begin()}},true);
 document.addEventListener('keyup',e=>{if(e.code==='Space'||e.code==='Enter')finish()},true);
 document.addEventListener('click',e=>{if(e.target.closest('.voice-entry')){e.preventDefault();if(Date.now()>=suppressClickUntil&&!panel)shell()}},true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&panel)close({keepDraft:true})});window.addEventListener('pagehide',()=>close({keepDraft:true}));
 return {open:shell,close};
}
