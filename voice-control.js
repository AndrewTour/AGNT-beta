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
 const person=kind==='appointment'?raw.match(/^(?:book|schedule)\s+(.+?)\s+(?:in\s+)?for\b/i)?.[1]:raw.match(/^assign\s+(.+?)\s+(?:a|an|the)\s+/i)?.[1];
 const address=kind==='appointment'?(raw.match(/\bat\s+(\d[^]+?)(?=\s+(?:next\s+)?(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday)|\s+at\s+(?:\d|midday|noon|midnight)|,?\s+(?:on|today|tomorrow)\b|$)/i)?.[1]||'').replace(/[,\s]+$/,''):'';
 const type=/\bappraisal\b/i.test(raw)?'MAP':/\bsecond inspection\b|\bbuyer appointment\b/i.test(raw)?'BAP':'';
 return {kind,raw,person:person?.trim()||'',date,time,dateText,address,type,title:kind==='task'?raw.replace(/^(?:add|create)(?: a)? task(?: to)?\s*|^assign\s+.+?\s+(?:a|an|the)\s+/i,'').replace(dateText,'').replace(/\s+(?:for|on|at)\s*$/i,'').trim():''};
}
export function createVoiceControl(env){
 let panel=null,recognition=null,epoch=0,busy=false,returnFocus=null;
 const stop=()=>{epoch++;const r=recognition;recognition=null;try{r?.abort()}catch{};if(panel){panel.dataset.listening='false';panel.querySelector('[data-status]').textContent='Listening stopped. Edit your command or type below.'}};
 const close=()=>{stop();panel?.remove();panel=null;busy=false;returnFocus?.isConnected&&returnFocus.focus({preventScroll:true})};
 function listen(){
  stop();const API=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!API){panel.querySelector('[data-status]').textContent='Voice capture is unavailable in this browser. Type your command below.';return}
  const token=epoch,r=new API();recognition=r;r.lang='en-AU';r.continuous=false;r.interimResults=false;
  panel.dataset.listening='true';panel.querySelector('[data-status]').textContent='Listening… Tap Stop when finished.';
  r.onresult=e=>{if(token!==epoch||!panel)return;panel.querySelector('textarea').value=[...e.results].map(x=>x[0].transcript).join(' ');panel.querySelector('[data-status]').textContent='Check the transcript, then open the existing editor.'};
  r.onerror=e=>{if(token===epoch&&panel){panel.dataset.listening='false';panel.querySelector('[data-status]').textContent=({ 'not-allowed':'Microphone access was denied. Type below or enable access in device settings.','no-speech':'No speech detected. Try again or type below.','network':'Voice recognition needs a connection. You can type instead.','audio-capture':'Microphone unavailable. You can type instead.'}[e.error]||'Listening interrupted. Try again or type below.')}};
  r.onend=()=>{if(token===epoch&&panel){recognition=null;panel.dataset.listening='false';const status=panel.querySelector('[data-status]');if(status.textContent.startsWith('Listening…'))status.textContent='No command received. Try again or type below.'}};
  try{r.start()}catch{recognition=null;panel.dataset.listening='false';panel.querySelector('[data-status]').textContent='Could not start listening. Type your command instead.'}
 }
 async function openEditor(){
  if(busy||!panel)return;stop();const command=interpretVoice(panel.querySelector('textarea').value,env.today());
  if(command.error){panel.querySelector('[data-status]').textContent=command.error;return}
  let member=null;
  if(command.person){const needle=command.person.toLowerCase();const matches=env.members().filter(m=>(m.name||'').toLowerCase()===needle||(m.name||'').toLowerCase().split(' ')[0]===needle);if(matches.length!==1){panel.querySelector('[data-status]').textContent=matches.length?'More than one team member matches. Use their full name.':'Team member not found. Use a permitted team member’s full name.';return}member=matches[0]}
  busy=true;try{env.execute(command,member);close()}catch(error){busy=false;if(panel)panel.querySelector('[data-status]').textContent=error.message}
 }
 function open(){
  if(panel)return;returnFocus=document.activeElement;panel=document.createElement('div');panel.className='voice-overlay';
  panel.innerHTML='<section class="voice-sheet" role="dialog" aria-modal="true" aria-labelledby="voiceTitle"><header><h2 id="voiceTitle">AGNT voice</h2><button type="button" data-close aria-label="Close voice control">×</button></header><p data-status role="status">Type a command or tap Listen.</p><label>Command<textarea rows="4" maxlength="1500" placeholder="Book Ray for an appraisal at 12 Smith Street, Dural, next Tuesday at midday"></textarea></label><p>Commands open existing forms. Review the details and use the normal Save button. Dates use Sydney time. For a specific date, type YYYY-MM-DD.</p><div class="voice-buttons"><button type="button" data-listen>Listen</button><button type="button" data-stop>Stop</button><button type="button" data-open>Open editor / destination</button><button type="button" data-task>Add task manually</button><button type="button" data-close>Cancel</button></div></section>';
  document.body.append(panel);panel.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close();else if(e.target.closest('[data-listen]'))listen();else if(e.target.closest('[data-stop]'))stop();else if(e.target.closest('[data-open]'))openEditor();else if(e.target.closest('[data-task]')){close();env.manualTask()}});
  panel.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const nodes=[...panel.querySelectorAll('button,textarea')],first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
  listen();
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.addEventListener('pagehide',close);
 return {open,close};
}
