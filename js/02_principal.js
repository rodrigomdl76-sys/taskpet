
let audioCtx=null;
function obterAudioContext(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});return audioCtx}
function tocarTom(f,t,d,delay=0,v=.15){try{const vol=typeof obterVolumeSom==='function'?obterVolumeSom():0.55;if(vol<=0.01)return;const ctx=obterAudioContext(),o=ctx.createOscillator(),g=ctx.createGain();o.type=t;o.frequency.setValueAtTime(f,ctx.currentTime+delay);const amp=v*vol;g.gain.setValueAtTime(amp,ctx.currentTime+delay);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+delay+d);o.connect(g);g.connect(ctx.destination);o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+d)}catch(e){}}
const ARQUIVOS_SOM={tarefa:'missao',moedas:'moedas',nivel:'nivel',pet:'pet'};
const sonsPrecarregados={};
const ultimoSomPorTipo={};
let bufferClique=null;
function prepararClique(){
  try{
    const ctx=audioCtx||(audioCtx=new(window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'}));
    if(!bufferClique){
      const duracao=.024,n=Math.ceil(ctx.sampleRate*duracao);
      bufferClique=ctx.createBuffer(1,n,ctx.sampleRate);
      const dados=bufferClique.getChannelData(0);
      let anterior=0;
      for(let i=0;i<n;i++){
        const ruido=Math.random()*2-1;
        dados[i]=(ruido-anterior)*Math.exp(-i/(ctx.sampleRate*.0045))*.22;
        anterior=ruido;
      }
    }
  }catch(e){}
}
function tocarClique(){
  const volume=obterVolumeSom();
  if(volume<=0.01)return false;
  try{
    prepararClique();
    const ctx=obterAudioContext();
    if(!bufferClique)return false;
    const fonte=ctx.createBufferSource(),ganho=ctx.createGain();
    fonte.buffer=bufferClique;ganho.gain.value=Math.min(.25,volume*.22);
    fonte.connect(ganho);ganho.connect(ctx.destination);fonte.start();
    return true;
  }catch(e){return false}
}
function prepararSons(){
  Object.entries(ARQUIVOS_SOM).forEach(([tipo,arquivo])=>{
    try{
      const audio=new Audio(`assets/sons/${arquivo}.mp3`);
      audio.preload='auto';audio.load();sonsPrecarregados[tipo]=audio;
    }catch(e){}
  });
}
function playSound(tipo){
  if(tipo==='ui')return tocarClique();
  if(!ARQUIVOS_SOM[tipo]||obterVolumeSom()<=0.01)return false;
  const agora=Date.now();
  if(agora-(ultimoSomPorTipo[tipo]||0)<95)return false;
  ultimoSomPorTipo[tipo]=agora;
  try{
    const audio=sonsPrecarregados[tipo]||(sonsPrecarregados[tipo]=new Audio(`assets/sons/${ARQUIVOS_SOM[tipo]}.mp3`));
    audio.pause();audio.currentTime=0;audio.volume=obterVolumeSom()*(tipo==='ui'?.32:.70);
    audio.play().catch(()=>{});
    return true;
  }catch(e){return false}
}
function somConquista(){playSound('nivel')}
function somBauLendario(){playSound('nivel')}
function somTransicaoMagicaPet(){
  if(estado?.sonsAtivos===false||obterVolumeSom()<=0.01)return;
  try{
    const ctx=obterAudioContext(),agora=ctx.currentTime,vol=obterVolumeSom();
    const puff=ctx.createOscillator(),ganho=ctx.createGain();
    puff.type='sine';puff.frequency.setValueAtTime(360,agora);puff.frequency.exponentialRampToValueAtTime(125,agora+.13);
    ganho.gain.setValueAtTime(.055*vol,agora);ganho.gain.exponentialRampToValueAtTime(.001,agora+.15);
    puff.connect(ganho);ganho.connect(ctx.destination);puff.start(agora);puff.stop(agora+.16);
    tocarTom(784,'sine',.13,.055,.035);tocarTom(1046,'sine',.17,.12,.025);
  }catch(_){}
}
const PETS={
 gato:{id:'gato',nome:'Pipoca',emoji:'🐱',desbloqueioNivel:1,som:'',evolucoes:[
 {nivel:1,nome:'Ovo-gato',desc:'O começo da aventura'},{nivel:21,nome:'Gato Cavalheiro',desc:'Uma nova forma para o pet'},{nivel:41,nome:'Gato Real',desc:'Capa e coroa da última evolução'}]},
 axolote:{id:'axolote',nome:'Axolote',emoji:'🥚',desbloqueioNivel:10,som:'',evolucoes:[{nivel:1,nome:'Axolote no Ovo',desc:'Fase 1 · dentro do ovo'},{nivel:21,nome:'Axolote Desabrochado',desc:'Saiu do ovo e começou uma nova aventura'},{nivel:41,nome:'Axolote Radiante',desc:'Fase 3 · uma nova forma cheia de energia'}]}
};
function ajustarCor(hex,amt){
  hex=String(hex).replace('#','');
  if(hex.length===3)hex=hex.split('').map(x=>x+x).join('');
  const num=parseInt(hex,16)||0;
  let r=(num>>16)+amt,g=((num>>8)&0xff)+amt,b=(num&0xff)+amt;
  r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
function petSVG(tipo,fase){
if(tipo==='axolote')return '';
const colors={gato:'#33333d',cachorra:'#F4A261',cabra:'#F5E6D3',frango:'#FFF9C4',unicornio:'#f8d7ff',dinossauro:'#79c267',capivara:'#b98258'};
const c=colors[tipo],dark=tipo==='gato'?'#111827':tipo==='cachorra'?'#2D1B10':tipo==='cabra'?'#8B5A2B':'#552200';
const acento={gato:c,cachorra:'#E76F51',cabra:'#8B5A2B',frango:'#ff3344'}[tipo];
const corClara=ajustarCor(c,60),corEscura=ajustarCor(c,-45);
const acClara=ajustarCor(acento,55),acEscura=ajustarCor(acento,-40);
const defsPet=`<defs>
<radialGradient id="gradCorpo${tipo}" cx="38%" cy="26%" r="80%"><stop offset="0%" stop-color="${corClara}"/><stop offset="55%" stop-color="${c}"/><stop offset="100%" stop-color="${corEscura}"/></radialGradient>
<radialGradient id="gradAcento${tipo}" cx="35%" cy="22%" r="85%"><stop offset="0%" stop-color="${acClara}"/><stop offset="100%" stop-color="${acEscura}"/></radialGradient>
<radialGradient id="gradBochecha${tipo}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ff9ebb" stop-opacity=".8"/><stop offset="100%" stop-color="#ff9ebb" stop-opacity="0"/></radialGradient>
<filter id="sombraMacia${tipo}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4.5"/></filter>
</defs>`;
let extra='';
if(tipo==='gato'){
 if(fase>=2)extra+='<circle cx="135" cy="80" r="9" fill="#F0F0FF"/><path d="M135 75v20" stroke="#c8c8ff" stroke-width="4"/>';
 if(fase>=3)extra+='<g fill="#FFD700"><circle cx="100" cy="100" r="6"/><circle cx="170" cy="100" r="6"/><circle cx="135" cy="85" r="5"/></g>';
 if(fase>=4)extra+='<path d="M105 45l15-20 15 10 15-10 15 20z" fill="#FFD700" stroke="#B8860B" stroke-width="2"/>';
 if(fase>=5)extra+='<path d="M60 110Q30 90 20 120q20 20 40 10zM210 110q30-20 40 10-20 20-40 10z" fill="#111827" opacity=".7"/>';
}else if(tipo==='cachorra'){
 if(fase>=2)extra+='<path d="M85 165l50 15 50-15-10 25H95z" fill="#ef4444"/>';
 if(fase>=3)extra+='<rect x="90" y="185" width="90" height="25" rx="6" fill="#3b82f6"/><circle cx="160" cy="197" r="10" fill="#ffd700"/>';
 if(fase>=4)extra+='<circle cx="135" cy="60" r="15" fill="#ffd700" stroke="#b8860b" stroke-width="3"/>';
 if(fase>=5)extra+='<path d="M50 120Q20 80 10 110q20 40 50 25zM220 120q30-40 40-10-20 40-50 25z" fill="#ffd700" opacity=".55"/>';
}else if(tipo==='cabra'){
 if(fase>=2)extra+='<path d="M90 55Q70 15 85 5q15 10 10 45zM180 55q20-40 5-50-15 10-10 50z" fill="#A0522D"/>';
 if(fase>=3)extra+='<g fill="#c026d3"><circle cx="100" cy="180" r="8"/><circle cx="135" cy="190" r="8"/><circle cx="170" cy="180" r="8"/></g>';
 if(fase>=4)extra+='<path d="M100 45l10-15 15 10 10-20 10 20 15-10 10 15z" fill="#228b22"/>';
 if(fase>=5)extra+='<circle cx="135" cy="140" r="105" fill="#90ee90" opacity=".2"/>';
}else if(tipo==='unicornio'){
 if(fase>=1)extra+='<path d="M135 72L148 25L126 58Z" fill="#67e8f9" stroke="#fff" stroke-width="3"/><path d="M78 92Q45 65 55 35Q82 52 94 86M192 92Q225 65 215 35Q188 52 176 86" fill="none" stroke="#f472b6" stroke-width="10" stroke-linecap="round"/>';
 if(fase>=2)extra+='<path d="M55 88Q80 48 105 78M165 78Q190 48 215 88" fill="none" stroke="#a78bfa" stroke-width="9"/><path d="M80 205Q135 225 190 205" fill="none" stroke="#22d3ee" stroke-width="7" opacity=".8"/>';
 if(fase>=3)extra+='<path d="M62 150Q25 115 30 155q8 45 48 25zM208 150Q245 115 240 155q-8 45-48 25z" fill="#fff" opacity=".85"/><g fill="#fde047"><circle cx="82" cy="105" r="4"/><circle cx="188" cy="105" r="4"/><circle cx="135" cy="95" r="4"/></g>';
 if(fase>=4)extra+='<path d="M102 48l10-22 14 17 9-25 9 25 14-17 10 22z" fill="#fde68a" stroke="#d97706" stroke-width="2"/>';
 if(fase>=5)extra+='<circle cx="135" cy="140" r="105" fill="#c084fc" opacity=".13"/><g fill="#fff"><circle cx="52" cy="90" r="3"/><circle cx="218" cy="105" r="3"/><circle cx="65" cy="190" r="2"/><circle cx="205" cy="185" r="2"/></g>';
}else if(tipo==='dinossauro'){
 if(fase>=1)extra+='<path d="M72 90l-15-30 28 14 8-30 18 27 14-34 14 35 20-26 5 34 25-13-14 31z" fill="#4d9f55"/>';
 if(fase>=2)extra+='<path d="M95 75l-10-24 20 12M175 75l10-24-20 12" fill="#f59e0b" stroke="#92400e" stroke-width="2"/><path d="M190 205q55 5 62 38" stroke="#5a9e57" stroke-width="18" fill="none" stroke-linecap="round"/>';
 if(fase>=3)extra+='<g fill="#fb923c"><circle cx="95" cy="165" r="7"/><circle cx="135" cy="177" r="7"/><circle cx="175" cy="165" r="7"/></g><path d="M90 52Q135 22 180 52" fill="none" stroke="#f97316" stroke-width="6" opacity=".8"/>';
 if(fase>=4)extra+='<path d="M100 52l10-22 12 16 13-25 13 25 12-16 10 22z" fill="#facc15" stroke="#92400e" stroke-width="2"/>';
 if(fase>=5)extra+='<circle cx="135" cy="140" r="108" fill="#84cc16" opacity=".12"/><path d="M68 112Q38 82 32 110M202 112Q232 82 238 110" stroke="#fbbf24" stroke-width="5" opacity=".8"/>';
}else if(tipo==='capivara'){
 if(fase>=1)extra+='<ellipse cx="70" cy="92" rx="14" ry="10" fill="#8b5e3c"/><ellipse cx="200" cy="92" rx="14" ry="10" fill="#8b5e3c"/><path d="M92 190Q135 215 178 190" fill="none" stroke="#6b442b" stroke-width="4" opacity=".5"/>';
 if(fase>=2)extra+='<path d="M92 68Q135 45 178 68" fill="none" stroke="#e2e8f0" stroke-width="18"/><circle cx="80" cy="64" r="7" fill="#fff" opacity=".7"/><circle cx="190" cy="64" r="7" fill="#fff" opacity=".7"/>';
 if(fase>=3)extra+='<path d="M95 55Q110 20 125 50Q140 18 155 50Q170 20 180 55" fill="none" stroke="#22c55e" stroke-width="9" stroke-linecap="round"/><g fill="#f472b6"><circle cx="100" cy="45" r="6"/><circle cx="170" cy="45" r="6"/></g>';
 if(fase>=4)extra+='<path d="M100 78Q135 58 170 78L160 98Q135 86 110 98Z" fill="#14b8a6"/><circle cx="135" cy="72" r="7" fill="#fde68a"/>';
 if(fase>=5)extra+='<circle cx="135" cy="145" r="105" fill="#fbbf24" opacity=".12"/><g fill="#bae6fd" opacity=".9"><circle cx="55" cy="200" r="8"/><circle cx="205" cy="205" r="8"/><circle cx="75" cy="175" r="5"/><circle cx="195" cy="175" r="5"/></g>';
}else{
 if(fase>=2)extra+='<path d="M200 180q30-20 40 10-15 20-40 10z" fill="#ff6b6b"/><path d="M210 160q35-20 40 10-15 20-40 10z" fill="#4ecdc4"/>';
 if(fase>=3)extra+='<path d="M60 130q-40-30-30 20 20 20 40 0z" fill="#ff6b6b"/>';
 if(fase>=4)extra+='<path d="M115 40l10-20 10 15 10-15 10 20z" fill="#ffd700"/>';
 if(fase>=5)extra+='<path d="M50 100Q10 60 20 100q15 30 40 15zM220 100q40-40 30 0-15 30-40 15z" fill="#ff4500" opacity=".6"/>';
}
let ears=tipo==='gato'?`<path d="M80 85L65 40l40 35zM190 85l15-45-40 35z" fill="url(#gradCorpo${tipo})"/><path d="M78 78L68 46l26 24z" fill="#ffc4d6" opacity=".55"/><path d="M192 78l10-32-26 24z" fill="#ffc4d6" opacity=".55"/>`:
tipo==='cachorra'?`<ellipse cx="85" cy="80" rx="22" ry="35" fill="url(#gradAcento${tipo})"/><ellipse cx="185" cy="80" rx="22" ry="35" fill="url(#gradAcento${tipo})"/><ellipse cx="88" cy="86" rx="11" ry="21" fill="#ffd6c2" opacity=".5"/><ellipse cx="182" cy="86" rx="11" ry="21" fill="#ffd6c2" opacity=".5"/>`:
tipo==='cabra'?`<path d="M90 60Q70 35 85 25q15 10 10 30zM180 60q20-25 5-35-15 10-10 30z" fill="url(#gradAcento${tipo})"/>`:
`<path d="M135 48Q120 28 108 42 95 18 110 35 90 15 110 32 125 12 135 28 145 12 135 32 160 15 140 35 165 25 155 45z" fill="url(#gradAcento${tipo})"/>`;
const olhoLx=tipo==='frango'?100:108,olhoRx=tipo==='frango'?170:162,olhoY=tipo==='gato'?125:115;
const pupLx=tipo==='frango'?107:115,pupRx=tipo==='frango'?163:155,pupY=tipo==='gato'?130:120;
const brLx=tipo==='frango'?103:111,brRx=tipo==='frango'?159:151,brY=tipo==='gato'?122:112;
return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 285">
${defsPet}
<style>.blink{animation:blink 4s infinite;transform-origin:center}@keyframes blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.05)}}
.rp-progress-dashboard{margin:0 0 10px;padding:11px;border-radius:18px;background:linear-gradient(135deg,#eef2ff,#faf5ff);border:1px solid #ddd6fe;box-shadow:0 6px 18px rgba(76,29,149,.08)}
.rpd-head{display:flex;justify-content:space-between;align-items:center;gap:8px}
.rpd-head b{font-size:11px;color:#312e81}
.rpd-head small{display:block;font-size:7px;color:#64748b;margin-top:2px}
.rpd-level{padding:5px 8px;border-radius:99px;background:#fff;border:1px solid #ddd6fe;font-size:8px;color:#7c3aed;white-space:nowrap}
.rpd-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px}
.rpd-stats>div{background:#fff;border:1px solid #e5e7eb;border-radius:13px;padding:7px 4px;text-align:center}
.rpd-stats span{display:block;font-size:15px}
.rpd-stats b{display:block;font-size:11px;color:#1e293b;margin-top:2px}
.rpd-stats small{display:block;font-size:6px;color:#94a3b8;margin-top:2px}
.rpd-next{margin-top:8px;background:#fff;border-radius:12px;padding:7px 8px;border:1px solid #e5e7eb}
.rpd-next-top{display:flex;justify-content:space-between;gap:5px;font-size:8px;color:#475569;margin-bottom:5px}
.rpd-next-top span{font-weight:900;color:#7c3aed}
.rpd-track{height:7px;background:#e5e7eb;border-radius:99px;overflow:hidden}
.rpd-track>div{height:100%;width:0;background:linear-gradient(90deg,#f97316,#facc15,#22c55e);border-radius:99px;transition:width .5s}
.rpd-next small{display:block;font-size:7px;color:#64748b;margin-top:5px}
.rp-shop-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:4px 2px 10px}
.rp-shop-title{font-size:18px;font-weight:1000;letter-spacing:-.4px}
.rp-shop-sub{font-size:9px;color:#64748b;line-height:1.4;margin-top:2px}
.rp-wallet{background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;padding:8px 10px;font-size:13px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.05)}
.rp-shop-progress{background:linear-gradient(135deg,#f8fafc,#eef2ff);border:1px solid #e2e8f0;border-radius:16px;padding:10px 12px;margin-bottom:12px}
.rp-progress-top{display:flex;justify-content:space-between;font-size:9px;margin-bottom:6px;color:#475569}
.rp-progress-track,.rp-mini-track{height:7px;background:#e2e8f0;border-radius:99px;overflow:hidden}
.rp-progress-track>div,.rp-mini-track>div{height:100%;border-radius:99px;background:linear-gradient(90deg,#818cf8,#a855f7)}
.rp-shop-progress small{display:block;font-size:8px;color:#64748b;margin-top:5px}
.rp-shop-section-title{font-size:10px;font-weight:1000;margin:9px 2px 7px}
.rp-prize-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.rp-prize-card{position:relative;border:1px solid #e2e8f0;border-radius:18px;padding:11px 9px 10px;background:#fff;box-shadow:0 5px 16px rgba(15,23,42,.06);text-align:center;overflow:hidden}
.rp-prize-card.ready{border-color:#c4b5fd;box-shadow:0 6px 20px rgba(124,58,237,.12)}
.rp-prize-icon{font-size:34px;line-height:1.1;margin:2px 0 6px}
.rp-prize-name{font-size:11px;font-weight:1000;color:#1e293b;min-height:27px}
.rp-prize-desc{font-size:8px;color:#64748b;line-height:1.3;min-height:23px;margin:2px 0 6px}
.rp-prize-cost{font-size:12px;font-weight:1000;color:#7c3aed;margin-bottom:5px}
.rp-can-get{font-size:7px;color:#16a34a;font-weight:900;margin-bottom:5px}
.rp-missing{font-size:7px;color:#94a3b8;min-height:13px}
.rp-mini-track{height:4px;margin:4px 0 7px}
.rp-mini-track>div{background:#94a3b8}
.rp-prize-btn{border:0;border-radius:11px;padding:8px 7px;width:100%;font-size:8px;font-weight:1000;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;cursor:pointer}
.rp-prize-btn.disabled{background:#e2e8f0;color:#94a3b8}
.rp-prize-btn:disabled{opacity:.75;cursor:default}
.rp-empty{text-align:center;padding:25px 12px;color:#94a3b8;font-size:26px}
.rp-empty b{display:block;font-size:11px;color:#475569;margin-top:5px}
.rp-empty small{display:block;font-size:8px;margin-top:4px}
.rp-my-orders{margin-top:13px}
.rp-order{display:flex;justify-content:space-between;gap:8px;padding:8px 9px;border-radius:11px;margin-bottom:5px;font-size:8px;background:#f8fafc;border-left:3px solid #cbd5e1}
.rp-order.ok{border-left-color:#22c55e;background:#f0fdf4}
.rp-order.no{border-left-color:#ef4444;background:#fef2f2}
.rp-order.wait{border-left-color:#f59e0b;background:#fffbeb}
@media(max-width:360px){.rp-prize-grid{grid-template-columns:1fr}.rp-shop-title{font-size:16px}}
</style>
<ellipse cx="135" cy="271" rx="58" ry="11" fill="#000" opacity=".16" filter="url(#sombraMacia${tipo})"/>
${tipo==='cachorra'?`<path d="M196 208q38-8 38 22q0 27-27 22" stroke="url(#gradCorpo${tipo})" stroke-width="15" fill="none" stroke-linecap="round" class="anim-bandeira" style="transform-origin:196px 208px"/>`:''}
<ellipse cx="135" cy="205" rx="57" ry="49" fill="url(#gradCorpo${tipo})"/><circle cx="135" cy="125" r="68" fill="url(#gradCorpo${tipo})"/>${ears}
<ellipse cx="118" cy="88" rx="30" ry="17" fill="#fff" opacity=".16" transform="rotate(-16 118 88)"/>
<ellipse cx="120" cy="195" rx="34" ry="24" fill="#fff" opacity=".1"/>
<ellipse class="blink" cx="${olhoLx}" cy="${olhoY}" rx="27" ry="31" fill="white"/><ellipse class="blink" cx="${olhoRx}" cy="${olhoY}" rx="27" ry="31" fill="white"/>
<circle cx="${pupLx}" cy="${pupY}" r="13" fill="${fase>=5?'#FFD000':dark}"/><circle cx="${pupRx}" cy="${pupY}" r="13" fill="${fase>=5?'#FFD000':dark}"/>
<circle cx="${brLx}" cy="${brY}" r="5" fill="white"/><circle cx="${brRx}" cy="${brY}" r="5" fill="white"/>
<circle cx="${pupLx+5}" cy="${pupY+6}" r="2.2" fill="white" opacity=".85"/><circle cx="${pupRx+5}" cy="${pupY+6}" r="2.2" fill="white" opacity=".85"/>
${tipo==='frango'?'<path d="M135 138l-23 14h46z" fill="#ffcc00"/><ellipse cx="135" cy="150" rx="12" ry="8" fill="#552200"/>':tipo==='cabra'?'<ellipse cx="135" cy="150" rx="10" ry="7" fill="#ff9ebb"/><path d="M125 158q10 10 20 0" stroke="#2d1b10" stroke-width="2.5" fill="none"/>':tipo==='gato'?'<ellipse cx="135" cy="155" rx="7" ry="5" fill="#ff9ebb"/>':'<ellipse cx="135" cy="150" rx="12" ry="9" fill="#2d1b10"/><path d="M135 162l-7 10h14z" fill="#ff9ebb"/>'}
<ellipse cx="85" cy="145" rx="12" ry="8" fill="url(#gradBochecha${tipo})"/><ellipse cx="185" cy="145" rx="12" ry="8" fill="url(#gradBochecha${tipo})"/>
${tipo==='gato'?'<g stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"><path d="M62 148h-27M64 156h-29M66 164h-26"/><path d="M208 148h27M206 156h29M204 164h26"/></g>':''}
<path d="M95 235Q90 255 105 255M175 235Q180 255 165 255" stroke="url(#gradCorpo${tipo})" stroke-width="14" fill="none" stroke-linecap="round"/>
<ellipse cx="99" cy="253" rx="6" ry="4" fill="${corEscura}" opacity=".5"/><ellipse cx="171" cy="253" rx="6" ry="4" fill="${corEscura}" opacity=".5"/>
${tipo==='gato'?`<path d="M200 220q40 20 30 50" stroke="url(#gradCorpo${tipo})" stroke-width="16" fill="none" stroke-linecap="round"/>`:''}${extra}</svg>`;
}
const ACESSORIOS=[
{id:'chapeu',nome:'Chapéu de Festa',emoji:'🎉',preco:15,svg:'<svg viewBox="0 0 270 285" xmlns="http://www.w3.org/2000/svg"><path d="M108 58 L135 8 L162 58 Z" fill="#f43f5e" stroke="#fff" stroke-width="3"/><circle cx="135" cy="8" r="7" fill="#fbbf24"/><path d="M100 60h70" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>'},
{id:'oculos',nome:'Óculos Estiloso',emoji:'🕶️',preco:18,svg:'<svg viewBox="0 0 270 285" xmlns="http://www.w3.org/2000/svg"><circle cx="108" cy="120" r="27" fill="none" stroke="#172033" stroke-width="6"/><circle cx="162" cy="120" r="27" fill="none" stroke="#172033" stroke-width="6"/><line x1="135" y1="120" x2="135" y2="120" stroke="#172033" stroke-width="6"/><path d="M81 118 L60 108M189 118 L210 108" stroke="#172033" stroke-width="6" stroke-linecap="round"/></svg>'},
{id:'laco',nome:'Laço Fofo',emoji:'🎀',preco:15,svg:'<svg viewBox="0 0 270 285" xmlns="http://www.w3.org/2000/svg"><g transform="translate(160,50)"><path d="M-25 0 Q-25 -18 0 -6 Q25 -18 25 0 Q25 18 0 6 Q-25 18 -25 0Z" fill="#ec4899" stroke="#fff" stroke-width="2"/><circle cx="0" cy="0" r="7" fill="#f9a8d4"/></g></svg>'},
{id:'cachecol',nome:'Cachecol',emoji:'🧣',preco:20,svg:'<svg viewBox="0 0 270 285" xmlns="http://www.w3.org/2000/svg"><path d="M85 178Q135 200 185 178v20Q135 222 85 198Z" fill="#0ea5e9" stroke="#fff" stroke-width="2"/><rect x="150" y="196" width="14" height="34" rx="3" fill="#0ea5e9"/></svg>'},
{id:'bone',nome:'Boné Estiloso',emoji:'🧢',preco:18,svg:'<svg viewBox="0 0 270 285" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gAcBone" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><path d="M95 60Q95 18 135 16Q175 18 175 60Q135 45 95 60Z" fill="url(#gAcBone)" stroke="#1e3a8a" stroke-width="2"/><path d="M171 50Q207 48 213 62Q207 67 171 60Z" fill="url(#gAcBone)" stroke="#1e3a8a" stroke-width="2"/><circle cx="135" cy="22" r="4" fill="#fde047"/></svg>'},
{id:'coroa',nome:'Coroa Real',emoji:'👑',preco:28,svg:'<svg viewBox="0 0 270 285" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gAcCoroa" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs><path d="M100 58 L112 26 L128 46 L135 14 L142 46 L158 26 L170 58Z" fill="url(#gAcCoroa)" stroke="#92400e" stroke-width="2" stroke-linejoin="round"/><rect x="100" y="55" width="70" height="10" rx="3" fill="url(#gAcCoroa)" stroke="#92400e" stroke-width="2"/><circle cx="135" cy="36" r="4.5" fill="#ef4444"/><circle cx="117" cy="46" r="3.5" fill="#3b82f6"/><circle cx="153" cy="46" r="3.5" fill="#22c55e"/></svg>'},
{id:'grinalda',nome:'Grinalda de Flores',emoji:'🌸',preco:22,svg:'<svg viewBox="0 0 270 285" xmlns="http://www.w3.org/2000/svg"><g>'+[ [98,60,'#f472b6'],[118,48,'#fbbf24'],[138,44,'#f472b6'],[158,50,'#a78bfa'],[174,62,'#fbbf24'] ].map(([x,y,cor])=>`<g fill="${cor}"><circle cx="${x-6}" cy="${y}" r="6"/><circle cx="${x+6}" cy="${y}" r="6"/><circle cx="${x}" cy="${y-6}" r="6"/><circle cx="${x}" cy="${y+6}" r="6"/><circle cx="${x}" cy="${y}" r="4" fill="#fff7ed"/></g>`).join('')+'</g></svg>'},
{id:'gravata',nome:'Gravata Borboleta',emoji:'🎀',preco:16,svg:'<svg viewBox="0 0 270 285" xmlns="http://www.w3.org/2000/svg"><g transform="translate(135,196)"><path d="M-22 0 Q-22 -15 0 -5 Q22 -15 22 0 Q22 15 0 5 Q-22 15 -22 0Z" fill="#1e293b" stroke="#fff" stroke-width="2"/><circle cx="0" cy="0" r="6" fill="#ef4444"/></g></svg>'},
{id:'fone',nome:'Fone de Ouvido',emoji:'🎧',preco:25,svg:'<svg viewBox="0 0 270 285" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gAcFone" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#db2777"/></linearGradient></defs><path d="M78 118Q80 55 135 52Q190 55 192 118" fill="none" stroke="url(#gAcFone)" stroke-width="9" stroke-linecap="round"/><ellipse cx="78" cy="128" rx="15" ry="20" fill="url(#gAcFone)" stroke="#831843" stroke-width="2"/><ellipse cx="192" cy="128" rx="15" ry="20" fill="url(#gAcFone)" stroke="#831843" stroke-width="2"/><ellipse cx="78" cy="128" rx="7" ry="11" fill="#fce7f3"/><ellipse cx="192" cy="128" rx="7" ry="11" fill="#fce7f3"/></svg>'}
	];
const OBJETOS_PET=[
  {id:'obj_bola',nome:'Bola Saltitante',emoji:'⚽',preco:24,tipo:'objeto',classe:'objeto-bola'},
  {id:'obj_caixas',nome:'Caixas de Som',emoji:'🔊',preco:32,tipo:'objeto',classe:'objeto-caixas'},
  {id:'obj_planta',nome:'Plantinha Companheira',emoji:'🪴',preco:20,tipo:'objeto',classe:'objeto-planta'},
  {id:'obj_livro',nome:'Livrinho Mágico',emoji:'📖',preco:28,tipo:'objeto',classe:'objeto-livro'},
  {id:'obj_varinha',nome:'Varinha Mágica',emoji:'🪄',preco:30,tipo:'objeto',classe:'objeto-varinha'},
  {id:'obj_balao',nome:'Balão Colorido',emoji:'🎈',preco:22,tipo:'objeto',classe:'objeto-balao'},
  {id:'obj_cama',nome:'Caminha Confortável',emoji:'🛏️',preco:34,tipo:'objeto',classe:'objeto-cama'},
  {id:'obj_bebedouro',nome:'Bebedouro Mágico',emoji:'🚰',preco:26,tipo:'objeto',classe:'objeto-bebedouro'},
  {id:'obj_osso',nome:'Osso Brilhante',emoji:'🦴',preco:24,tipo:'objeto',classe:'objeto-osso'},
  {id:'obj_peixe',nome:'Aquário com Peixinho',emoji:'🐠',preco:36,tipo:'objeto',classe:'objeto-peixe'},
  {id:'obj_pipa',nome:'Pipa Colorida',emoji:'🪁',preco:29,tipo:'objeto',classe:'objeto-pipa'},
  {id:'obj_brinquedos',nome:'Caixa de Brinquedos',emoji:'🧸',preco:32,tipo:'objeto',classe:'objeto-brinquedos'},
  {id:'obj_microfone',nome:'Microfone Musical',emoji:'🎤',preco:38,tipo:'objeto',classe:'objeto-microfone'},
  {id:'obj_medalha',nome:'Medalha de Campeão',emoji:'🏅',preco:42,tipo:'objeto',classe:'objeto-medalha'}
];
ACESSORIOS.push(...OBJETOS_PET);
ACESSORIOS.push({id:'unicornio_estelar',nome:'Diadema Estelar da Lumi',emoji:'✨',preco:32,svg:'<svg viewBox="0 0 270 285" xmlns="http://www.w3.org/2000/svg"><path d="M95 62Q135 28 175 62" fill="none" stroke="#c084fc" stroke-width="7"/><circle cx="135" cy="38" r="9" fill="#fde047"/><circle cx="112" cy="49" r="4" fill="#67e8f9"/><circle cx="158" cy="49" r="4" fill="#f472b6"/></svg>'},{id:'dino_crista',nome:'Crista de Explorador Rex',emoji:'🦖',preco:30,svg:'<svg viewBox="0 0 270 285" xmlns="http://www.w3.org/2000/svg"><path d="M95 60l10-25 12 18 12-27 12 27 12-18 10 25z" fill="#f97316" stroke="#9a3412" stroke-width="2"/></svg>'},{id:'capi_lotus',nome:'Coroa de Lótus da Capi',emoji:'🪷',preco:28,svg:'<svg viewBox="0 0 270 285" xmlns="http://www.w3.org/2000/svg"><g fill="#f9a8d4" stroke="#be185d" stroke-width="1"><path d="M135 58Q120 30 135 18Q150 30 135 58Z"/><path d="M135 58Q95 42 105 25Q125 30 135 58Z"/><path d="M135 58Q175 42 165 25Q145 30 135 58Z"/></g><circle cx="135" cy="48" r="6" fill="#fde68a"/></svg>'});
const BANCO_FUNDOS=[
{id:'ceu',nome:'Céu de Verão',emoji:'☀️',preco:0,bg:'linear-gradient(180deg,#38bdf8,#e0f2fe,#fef9c3)'},{id:'chuva',nome:'Chuva Suave',emoji:'🌧️',preco:12,bg:'linear-gradient(180deg,#334155,#94a3b8)'},{id:'noite',nome:'Noite Estrelada',emoji:'🌙',preco:20,bg:'radial-gradient(ellipse at 70% 20%,#1e3a8a,#020617)'},{id:'arcoiris',nome:'Arco-Íris',emoji:'🌈',preco:30,bg:'linear-gradient(180deg,#f87171,#fbbf24,#4ade80,#38bdf8,#a78bfa)'},{id:'praia',nome:'Praia Tropical',emoji:'🏖️',preco:25,bg:'linear-gradient(180deg,#7dd3fc,#38bdf8,#fde68a,#fbbf24)'},{id:'floresta',nome:'Floresta Mágica',emoji:'🌲',preco:22,bg:'linear-gradient(180deg,#86efac,#166534)'},{id:'floresta_luminosa',nome:'Floresta Luminosa',emoji:'🍄',preco:0,bg:"url('assets/fundos/floresta_luminosa.webp') center / cover no-repeat"},{id:'reino_submarino',nome:'Reino Submarino',emoji:'🐠',preco:0,bg:"url('assets/fundos/reino_submarino.webp') center / cover no-repeat"},{id:'arena_galactica',nome:'Arena Galáctica',emoji:'🛸',preco:55,bg:"url('assets/fundos/arena_galactica.webp') center / cover no-repeat"},{id:'estadio_lunar',nome:'Estádio Lunar',emoji:'⚽',preco:45,bg:"url('assets/fundos/estadio_lunar.webp') center / cover no-repeat"},{id:'reino_dos_doces',nome:'Reino dos Doces',emoji:'🍭',preco:40,bg:"url('assets/fundos/reino_dos_doces.webp') center / cover no-repeat"},{id:'festa',nome:'Balada Neon',emoji:'🎉',preco:35,bg:'linear-gradient(160deg,#f472b6,#a78bfa,#22d3ee)'},{id:'halloween',nome:'Noite de Halloween',emoji:'🎃',preco:40,bg:'linear-gradient(180deg,#1a1033,#7c2d12)'},{id:'estadio',nome:'Campo de Futebol',emoji:'⚽',preco:45,bg:'linear-gradient(180deg,#0c4a6e,#16a34a,#14532d)'},{id:'quarto',nome:'Quarto Fofo',emoji:'🛏️',preco:35,bg:'linear-gradient(180deg,#faf5ff,#e9d5ff)'},{id:'mario',nome:'Mundo Aventura',emoji:'🍄',preco:50,bg:'linear-gradient(180deg,#67e8f9,#4ade80)'},{id:'dino',nome:'Era dos Dinos',emoji:'🦖',preco:45,bg:'linear-gradient(180deg,#fef3c7,#84cc16,#166534)'},{id:'princesa',nome:'Castelo Real',emoji:'👑',preco:40,bg:'linear-gradient(180deg,#fdf2f8,#f9a8d4)'},{id:'astronauta',nome:'Espaço Sideral',emoji:'🚀',preco:50,bg:'radial-gradient(ellipse at 50% 30%,#312e81,#020617)'},{id:'pirata',nome:'Mar dos Piratas',emoji:'🏴‍☠️',preco:45,bg:'linear-gradient(180deg,#0ea5e9,#78350f,#1c1917)'},{id:'fazenda',nome:'Fazenda Feliz',emoji:'🐄',preco:35,bg:'linear-gradient(180deg,#7dd3fc,#fde68a,#4ade80)'},{id:'neve',nome:'Natal Nevado',emoji:'🎄',preco:40,bg:'linear-gradient(180deg,#e0f2fe,#fff)'},{id:'aniversario',nome:'Festa de Aniversário',emoji:'🎂',preco:0,bg:'linear-gradient(180deg,#c4b5fd,#f9a8d4,#fde68a)'},{id:'castelo_noturno',nome:'Vila do Castelo',emoji:'🏰',preco:40,bg:"url('assets/fundos/castelo_noturno.webp') center / cover no-repeat"},{id:'deserto_cactos',nome:'Deserto dos Cactos',emoji:'🌵',preco:30,bg:"url('assets/fundos/deserto_cactos.webp') center / cover no-repeat"},{id:'quarto_gamer',nome:'Quarto Gamer',emoji:'🎮',preco:50,bg:"url('assets/fundos/quarto_gamer.webp') center / cover no-repeat"},{id:'floresta_blocos',nome:'Floresta de Blocos',emoji:'🧱',preco:45,bg:"url('assets/fundos/floresta_blocos.webp') center / cover no-repeat"},{id:'floresta_encantada',nome:'Floresta Encantada',emoji:'🌲',preco:40,bg:"url('assets/fundos/floresta_encantada.webp') center / cover no-repeat"},{id:'cachoeira_florida',nome:'Vale da Cachoeira',emoji:'🌼',preco:35,bg:"url('assets/fundos/cachoeira_florida.webp') center / cover no-repeat"}];
const TEMAS_INTERFACE=[
  {id:'classico',nome:'Clássico',emoji:'✨',fundo:null,icons:['🎤','⚡','✦']},
  {id:'galactico',nome:'Galáctico',emoji:'🛸',fundo:'arena_galactica',icons:['📡','🚀','✧']},
  {id:'lunar',nome:'Futebol Lunar',emoji:'⚽',fundo:'estadio_lunar',icons:['📣','🏆','⚽']},
  {id:'doces',nome:'Doces',emoji:'🍭',fundo:'reino_dos_doces',icons:['🎵','🍬','🍭']}
];
const CURIOSIDADES_FUNDOS={
  ceu:'As nuvens são formadas por gotinhas de água ou pequenos cristais de gelo.',
  chuva:'A água da chuva pode evaporar e voltar a formar nuvens: é parte do ciclo da água.',
  noite:'A Lua reflete a luz do Sol; ela não produz luz própria.',
  arcoiris:'O arco-íris aparece quando a luz atravessa gotinhas de água e se separa em cores.',
  praia:'As ondas transportam energia pelo mar e ajudam a modelar as praias.',
  floresta:'As árvores oferecem abrigo e alimento para muitos seres vivos.',
  floresta_luminosa:'Alguns fungos brilham no escuro graças a um processo chamado bioluminescência.',
  reino_submarino:'Os corais são animais que vivem em grupos e formam recifes.',
  arena_galactica:'No espaço, a gravidade também atua: ela mantém a Terra em órbita do Sol.',
  estadio_lunar:'Na Lua, um salto dura mais tempo porque sua gravidade é menor que a da Terra.',
  reino_dos_doces:'O cacau, usado para fazer chocolate, nasce dentro de frutos do cacaueiro.',
  festa:'Muitos instrumentos fazem som ao vibrar, como as cordas de um violão.',
  halloween:'Abóboras são frutos: elas crescem a partir de flores e contêm sementes.',
  estadio:'O futebol é praticado em muitos países, com diferentes formas de comemorar.',
  quarto:'Organizar os objetos ajuda a encontrar o que precisamos com mais facilidade.',
  mario:'Uma aventura pode começar com um mapa: mapas usam símbolos para representar lugares.',
  dino:'Os fósseis ajudam pesquisadores a estudar animais e plantas do passado.',
  princesa:'Castelos históricos foram construídos com diferentes materiais e estilos.',
  astronauta:'A Estação Espacial Internacional dá várias voltas ao redor da Terra a cada dia.',
  pirata:'Antigos navegadores observavam as estrelas para se orientar à noite.',
  fazenda:'As abelhas ajudam a polinizar flores de muitas plantas cultivadas.',
  neve:'Cada floco de neve é formado por pequenos cristais de gelo.',
  aniversario:'Em muitos lugares, aniversários são celebrados com costumes próprios.'
};
Object.assign(CURIOSIDADES_FUNDOS,{castelo_noturno:'As lanternas ajudam a iluminar as ruas mesmo durante a noite.',deserto_cactos:'Os cactos guardam água para sobreviver ao clima seco.',quarto_gamer:'A luz colorida dos monitores cria um clima de aventura.',floresta_blocos:'Um mundo de blocos com cabana, rio e cachoeira para explorar.',floresta_encantada:'Árvores altas formam um refúgio cheio de vida.',cachoeira_florida:'A água da cachoeira mantém o vale verde e florido.'});

// Compras antigas permanecem no estado; os acessórios dos combos não são mais exibidos.
function buscarAcessorioPorId(id){
  return ACESSORIOS.find(a=>a.id===id)||null;
}
function soprarLinguaDeSogra(el){
  const lingua=el.querySelector&&el.querySelector('.tongue');
  if(!lingua)return;
  lingua.style.transform='scaleY(1.85) rotate(-6deg)';
  setTimeout(()=>{lingua.style.transform='';},380);
}
const firebaseConfig={apiKey:"AIzaSyCiDk3ERIe8_uVqBhRnFRD5Od8nyLNlLVQ",authDomain:"rotinapet-624a9.firebaseapp.com",databaseURL:"https://rotinapet-624a9-default-rtdb.firebaseio.com",projectId:"rotinapet-624a9",storageBucket:"rotinapet-624a9.firebasestorage.app",messagingSenderId:"218579871240",appId:"1:218579871240:web:c681389aacd70f677693bd"};
let dbFirebase=null,storageFirebase=null,sincronizacaoNuvemAtiva=false,ignorarProximoSyncNuvem=false;
// Enquanto true, salvar() NÃO envia nada para a nuvem — evita que um estado local
// "de fábrica" (ex.: depois de limpar cache) sobrescreva dados reais já salvos
// no Firebase antes de terminarmos de baixá-los.
let cargaNuvemPendente=false;
// Última versão do estado que sabemos que está de fato salva na nuvem (top-level).
// Usada para enviar só os campos que mudaram, em vez de sobrescrever tudo — assim,
// se outro aparelho alterar um campo diferente ao mesmo tempo, os dois sobrevivem.
let ultimoEstadoSincronizado=null;
let filaSyncPendente=false;
let ultimaSyncOkEm=null;
let filaEscritaNuvem=Promise.resolve();
let tarefasV2ListenerRef=null;
let tarefasV2ListenerCallback=null;
let tarefasV2ListenerCriancaId=null;
const SCHEMA_TAREFAS_V2=2;
let statusSyncAtual='local'; // local | offline | syncing | online | erro
function atualizarStatusSyncUI(){
  const statusEl=document.getElementById('txt-status-nuvem');
  const banner=document.getElementById('banner-offline');
  if(!navigator.onLine){
    statusSyncAtual='offline';
    if(statusEl)statusEl.textContent=filaSyncPendente?'📡 offline · fila':'📡 offline';
    if(banner){
      banner.classList.add('mostrar');
      banner.classList.remove('syncing','synced');
      banner.textContent=filaSyncPendente
        ?'📡 Offline — há alterações na fila. Sincronizam quando a internet voltar.'
        :'📡 Sem conexão — as alterações ficam salvas neste aparelho.';
    }
    return;
  }
  if(banner){
    if(statusSyncAtual==='syncing'){
      banner.classList.add('mostrar','syncing');
      banner.classList.remove('synced');
      banner.textContent='☁️ Sincronizando com a família…';
    }else if(statusSyncAtual==='online'&&filaSyncPendente===false&&ultimaSyncOkEm&&(Date.now()-ultimaSyncOkEm<4000)){
      banner.classList.add('mostrar','synced');
      banner.classList.remove('syncing');
      banner.textContent='✅ Sincronizado com a nuvem';
      setTimeout(()=>{
        if(statusSyncAtual==='online'&&navigator.onLine){
          banner.classList.remove('mostrar','synced');
        }
      },2500);
    }else if(!filaSyncPendente){
      banner.classList.remove('mostrar','syncing','synced');
    }
  }
  if(!statusEl)return;
  if(!sincronizacaoNuvemAtiva){
    statusEl.textContent='📱 só neste aparelho';
    return;
  }
  if(statusSyncAtual==='syncing')statusEl.textContent='☁️ sync…';
  else if(statusSyncAtual==='erro')statusEl.textContent='⚠️ sync falhou';
  else if(ultimaSyncOkEm){
    const d=new Date(ultimaSyncOkEm);
    const hh=String(d.getHours()).padStart(2,'0');
    const mm=String(d.getMinutes()).padStart(2,'0');
    statusEl.textContent=`☁️ ${hh}:${mm}`;
  }else statusEl.textContent='☁️ online';
}
function marcarFilaSync(pendente){
  filaSyncPendente=!!pendente;
  try{localStorage.setItem('ROTINAPET_FILA_SYNC_'+codigoFamilia,filaSyncPendente?'1':'0')}catch(e){}
  atualizarStatusSyncUI();
}
function calcularDiffParaNuvem(base,atual){
  const mudancas={};
  const chaves=new Set([...Object.keys(base||{}),...Object.keys(atual)]);
  for(const k of chaves){
    const antigo=base?base[k]:undefined;
    const novo=atual[k];
    if(JSON.stringify(antigo)!==JSON.stringify(novo))mudancas[k]=(novo===undefined)?null:novo;
  }
  return mudancas;
}
const urlParams=new URLSearchParams(window.location.search);
// IDs antigos continuam válidos; novos IDs usam 128 bits aleatórios via Web Crypto.
function gerarCodigoFamiliaNovo(){
  const bytes=new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return 'fam_'+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
}
function codigoFamiliaValido(codigo){
  return /^[a-z0-9_-]{8,64}$/.test(codigo)||codigo==='vitor';
}
function sanitizarIdFamilia(id){
  const limp=(id||'').trim().toLowerCase().replace(/[^a-z0-9_-]/g,'');
  if(codigoFamiliaValido(limp))return limp;
  return gerarCodigoFamiliaNovo();
}
let familiaExplicitaNesteAparelho=!!(urlParams.get('familia')||localStorage.getItem('ROTINAPET_FAMILIA_ID'));
let codigoFamilia=sanitizarIdFamilia(urlParams.get('familia')||localStorage.getItem('ROTINAPET_FAMILIA_ID'));
localStorage.setItem('ROTINAPET_FAMILIA_ID',codigoFamilia);
const PREFIXO_FAMILIA_CONTA='rotinapet-familia:';
function familiaDaConta(user){
  const perfil=String(user?.displayName||'');
  if(!perfil.startsWith(PREFIXO_FAMILIA_CONTA))return null;
  const codigo=perfil.slice(PREFIXO_FAMILIA_CONTA.length);
  return codigoFamiliaValido(codigo)?codigo:null;
}
async function vincularFamiliaAConta(user){
  if(!user||user.isAnonymous)throw new Error('Entre com uma conta de responsável.');
  const anterior=familiaDaConta(user);
  if(anterior&&anterior!==codigoFamilia)throw new Error('Este e-mail já está vinculado a outra família. Entre nessa família antes de alterar o vínculo.');
  if(!anterior)await user.updateProfile({displayName:PREFIXO_FAMILIA_CONTA+codigoFamilia});
}
let acessoFamiliar=null;
let ultimoEstadoPrivadoPais={};
const CAMPOS_PRIVADOS_PAIS=['pinHash','pinBloqueadoAte','pinTentativasFalhas','pinPersonalizado','privacidadeAceita','onboardingVistoPais','emailsRecuperacao','emailRecuperacao','pinPais'];
function extrairCamposPrivadosPais(origem){const dados={};CAMPOS_PRIVADOS_PAIS.forEach(k=>{if(Object.prototype.hasOwnProperty.call(origem||{},k))dados[k]=origem[k]});return dados}
function removerCamposPrivadosPais(origem){const dados={...(origem||{})};CAMPOS_PRIVADOS_PAIS.forEach(k=>{delete dados[k]});return dados}
function estadoCompartilhadoParaSincronizar(origem=estado){
  const base=removerCamposPrivadosPais(origem);
  if(acessoFamiliar?.role!=='child')return base;
  const permitidos=new Set([...(typeof CAMPOS_CRIANCA!=='undefined'?CAMPOS_CRIANCA:[]),'tarefas','pets','criancas','criancasDados','criancaAtivaId','schemaTarefas']);
  return Object.fromEntries(Object.entries(base).filter(([k])=>permitidos.has(k)));
}
function aplicarPrivadosPaisLocal(dados){CAMPOS_PRIVADOS_PAIS.forEach(k=>{if(Object.prototype.hasOwnProperty.call(dados||{},k))estado[k]=dados[k]})}
async function verificarMembroFamilia(user){
  const token=await user.getIdTokenResult(true);
  const claims=token?.claims||{};
  if(claims.familyId===codigoFamilia&&['parent','child'].includes(claims.familyRole)){
    acessoFamiliar={familyId:claims.familyId,role:claims.familyRole};
    perfilAtivo=claims.familyRole==='parent'?'pais':'crianca';
    localStorage.setItem(CHAVE_PERFIL_LOCAL,perfilAtivo);
    if(claims.familyRole==='child'){const padrao=extrairCamposPrivadosPais(estadoInicial);CAMPOS_PRIVADOS_PAIS.forEach(k=>{estado[k]=padrao[k]});salvarLocalmente()}
    return true;
  }
  acessoFamiliar=null;
  if(familiaExplicitaNesteAparelho&&window.firebase?.functions){
    try{await firebase.functions('us-central1').httpsCallable('solicitarAcessoFamilia')({familyId:codigoFamilia,deviceLabel:(navigator.userAgent||'Aparelho').slice(0,60)})}
    catch(error){if(error?.code!=='functions/already-exists')console.warn('Solicitação de acesso pendente:',error)}
  }
  return false;
}
let inicializacaoFirebase=Promise.resolve();
  function obterLinkConvite(){
    // URL pública do deploy (pasta histórica taskpet); marca do produto: RotinaPet
    return 'https://rodrigomdl76-sys.github.io/taskpet/?familia=' + encodeURIComponent(codigoFamilia);
  }
  function compartilharConviteFamilia() {
  const linkConvite = obterLinkConvite();
  const texto = 'Entre no RotinaPet comigo para cuidarmos do nosso pet juntos! Acesse: ' + linkConvite;
  if (navigator.share) {
    navigator.share({
      title: 'Convite RotinaPet',
      text: texto,
      url: linkConvite
    }).catch(function(){});
  } else {
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(texto), '_blank');
  }
}
function abrirQrConvite(){
  const link=obterLinkConvite();
  const img=document.getElementById('img-qr-convite');
  const txt=document.getElementById('txt-link-qr-convite');
  if(img){
    try{
      const qr=qrcode(0,'M');
      qr.addData(link,'Byte');
      qr.make();
      img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(qr.createSvgTag(4,4,'QR do convite RotinaPet'));
    }catch(error){
      img.removeAttribute('src');
      mostrarToast('Não foi possível gerar o QR Code neste aparelho.');
    }
  }
  if(txt)txt.textContent=link;
  abrirModal('modal-qrcode');
}
try{
  if(window.firebase){
    firebase.initializeApp(firebaseConfig);
    inicializacaoFirebase=new Promise((resolve,reject)=>{
      const cancelar=firebase.auth().onAuthStateChanged(usuario=>{cancelar();resolve(usuario)},erro=>{cancelar();reject(erro)});
    }).then(async usuario=>{
      if(!usuario)usuario=(await firebase.auth().signInAnonymously()).user;
      dbFirebase = firebase.database();
      try{storageFirebase=firebase.storage()}catch(storageError){console.warn('Firebase Storage indisponível:',storageError)}
      definirIdUsuario(usuario.uid);
      sincronizacaoNuvemAtiva = true;
      const tokenAtual=await usuario.getIdTokenResult();
      const codigoConta=tokenAtual?.claims?.familyId||familiaDaConta(usuario);
      if(codigoConta&&codigoConta!==codigoFamilia){
        codigoFamilia=codigoConta;
        localStorage.setItem('ROTINAPET_FAMILIA_ID',codigoFamilia);
        CHAVE_PERFIL_LOCAL='ROTINAPET_PERFIL_'+codigoFamilia;
        perfilAtivo=localStorage.getItem(CHAVE_PERFIL_LOCAL);
        estado=JSON.parse(JSON.stringify(estadoInicial));
        estado.tarefas=[];
        try{
          const salvo=localStorage.getItem(`ROTINAPET_SAVE_${codigoFamilia}`);
          if(salvo)estado={...estado,...JSON.parse(salvo)};
        }catch(e){console.warn('Cópia local da família indisponível:',e)}
      }
      const membroAprovado=await verificarMembroFamilia(usuario);
      sincronizacaoNuvemAtiva=membroAprovado;
      if(membroAprovado){await iniciarSincronizacaoNuvem()}
      else{statusSyncAtual='local';atualizarStatusSyncUI();if(familiaExplicitaNesteAparelho)mostrarToast('📨 Aparelho aguardando aprovação do responsável.')}
    }).catch((error)=>{
      console.error('Firebase indisponível:',error);
      sincronizacaoNuvemAtiva = false;
      statusSyncAtual='local';
      atualizarStatusSyncUI();
    });
  }
}catch(error){
  console.error('Falha ao inicializar Firebase:',error);
  sincronizacaoNuvemAtiva=false;
  statusSyncAtual='local';
}
window.__rotinapetInitialSync=inicializacaoFirebase.catch(()=>undefined);
function definirIdUsuario(uid){
  if(uid) localStorage.setItem('ROTINAPET_UID', uid);
  statusSyncAtual='online';
  atualizarStatusSyncUI();
}
function getCaminhoFirebase(){
  return `rotinapet/familias/${codigoFamilia}/estado`;
}
// Criptografia e hashing seguro do PIN
// IMPORTANTE: o hash NÃO deve depender de codigoFamilia, pois esse valor pode
// mudar quando o usuário troca de família — isso fazia o PIN "parar de bater"
// (hash antigo calculado com o código antigo x hash novo calculado com o código novo).
async function hashPin(pin){
  const encoder=new TextEncoder();
  const data=encoder.encode(pin+":rotinapet:salt-fixo-v2");
  const hashBuffer=await crypto.subtle.digest('SHA-256',data);
  return Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
// Formato antigo (mantido só para migração de quem já tinha PIN salvo).
async function hashPinLegado(pin,codigo){
  const encoder=new TextEncoder();
  const data=encoder.encode(pin+":rotinapet:"+codigo);
  const hashBuffer=await crypto.subtle.digest('SHA-256',data);
  return Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
const hojeLocal=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const ontemLocal=()=>{const d=new Date();d.setDate(d.getDate()-1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
// Campos que pertencem a UM filho específico (progresso do pet, tarefas, moedas...).
// Tudo que NÃO está nessa lista é compartilhado pela família inteira (PIN, e-mails, taxa de câmbio).
const CAMPOS_CRIANCA=['personalizacao','gestosDesbloqueados','palcoAtual','palcosComprados','decoracaoItens','extraDiaRemovida','avisosMissao','miniPetsComprados','miniPetAtivo','bauDatasResgatadas','historicoRecompensas','avisosRecompensas','acessorios','conquistas','habilidades','desafiosMathAcertos','dinheiroAcumulado','mesadaAtiva','fundoAtual','fundosComprados','temaInterfaceAtual','historicoConclusoes','idadeCrianca','dificuldadeJogos','nomePet','lembreteEnviadoData','metaMoedas','moedas','onboardingVistoCrianca','pausaAte','petAtual','pets','recompensas','sonhos','registroDiario','solicitacoesPremios','streak','surpresaResgatadaData','tarefas','tarefasHojeCount','timerFim','totalSacado','ultimoDiaAcesso','ultimoDiaConcluido','ultimoStreakPremiado','vozSalva','ultimoAcaoPet','ultimoDecay','desafioDiarioData','desafioDiarioFeitoData','bauDiarioAbertoData','escudosOfensiva','eventoSemanalData','missaoFamilia','mensagensPais','historicoEngajamento'];
function valoresPadraoCrianca(){
  return {
    gestosDesbloqueados:[],decoracaoItens:[],extraDiaRemovida:null,miniPetsComprados:['passarinho'],miniPetAtivo:'passarinho',petAtual:'gato',moedas:15,dinheiroAcumulado:0,mesadaAtiva:true,idadeCrianca:7,dificuldadeJogos:'auto',nomePet:'Pipoca',
    palcoAtual:'cristal',palcosComprados:['cristal'],fundoAtual:'ceu',fundosComprados:['ceu'],temaInterfaceAtual:'classico',metaMoedas:50,totalSacado:0,
    ultimoDiaAcesso:hojeLocal(),ultimoDiaConcluido:null,streak:0,ultimoStreakPremiado:0,
    tarefasHojeCount:0,desafiosMathAcertos:0,timerFim:null,vozSalva:null,
    pets:{gato:{nivel:1,xp:0,felicidade:100,saude:100,faseConfirmada:1},axolote:{nivel:1,xp:0,felicidade:100,saude:100}},
    tarefas:[{id:1,texto:'Escovar os dentes',recompensa:5,xp:20,tipo:'obrigatoria',status:'pendente',foto:null,dias:[]},{id:2,texto:'Arrumar a cama',recompensa:5,xp:20,tipo:'obrigatoria',status:'pendente',foto:null,dias:[]}],
    recompensas:[],sonhos:[],personalizacao:{adquiridos:[],equipados:{}},
    solicitacoesPremios:[],conquistas:{},habilidades:{},acessorios:{comprados:[],ativo:null},pausaAte:null,
    historicoConclusoes:{},registroDiario:{},onboardingVistoCrianca:false,lembreteEnviadoData:null,
    surpresaResgatadaData:null,metasPersonalizadas:[],ultimoAcaoPet:{},ultimoDecay:null,desafioDiarioData:null,desafioDiarioFeitoData:null,bauDiarioAbertoData:null,bauDatasResgatadas:[],avisosRecompensas:[],historicoRecompensas:[],avisosMissao:[],escudosOfensiva:0,eventoSemanalData:null,missaoFamilia:{alvo:20,progresso:0,inicio:null},mensagensPais:[],historicoEngajamento:[]
  };
}
function capturarDadosCrianca(){
  const s={};
  CAMPOS_CRIANCA.forEach(k=>{s[k]=estado[k]});
  return JSON.parse(JSON.stringify(s));
}
function aplicarDadosCrianca(dados){
  const padrao=valoresPadraoCrianca();
  CAMPOS_CRIANCA.forEach(k=>{estado[k]=(dados&&dados[k]!==undefined)?dados[k]:padrao[k]});
}
function trocarCriancaAtiva(novoId){
  if(!estado.criancas[novoId]||novoId===estado.criancaAtivaId)return;
  estado.criancasDados=estado.criancasDados||{};
  estado.criancasDados[estado.criancaAtivaId]=capturarDadosCrianca();
  aplicarDadosCrianca(estado.criancasDados[novoId]);
  // Na troca de perfil, as tarefas do filho escolhido são a fonte correta.
  // Comparar apenas a quantidade misturava missões de irmãos diferentes.
  estado.criancaAtivaId=novoId;
  sincronizarListenerTarefasV2();
  salvar();
  atualizarTela();
  ultimoFundoParticulas=null;
  renderizarParticulasCenario(estado.fundoAtual);
  if(document.getElementById('modal-pais')?.classList.contains('mostrar'))renderizarPainelPais();
  mostrarToast(`🐾 Agora é a vez de ${estado.criancas[novoId].nome}!`);
}
function criarNovaCrianca(nome,emoji){
  const id='c_'+Date.now().toString(36);
  estado.criancas=estado.criancas||{};
  estado.criancas[id]={nome:(nome||'Criança').trim().slice(0,30),emoji:emoji||'🐾'};
  estado.criancasDados=estado.criancasDados||{};
  estado.criancasDados[id]=valoresPadraoCrianca();
  return id;
}
function garantirCriancaAtiva(){
  if(!estado.criancas||typeof estado.criancas!=='object'||!Object.keys(estado.criancas).length){
    estado.criancas={c1:{nome:'Minha Criança',emoji:'🐾'}};
    estado.criancaAtivaId='c1';
  }
  if(!estado.criancaAtivaId||!estado.criancas[estado.criancaAtivaId]){
    estado.criancaAtivaId=Object.keys(estado.criancas)[0];
  }
  estado.criancasDados=estado.criancasDados||{};
  // A coleção era familiar. Na migração, cada perfil existente recebe uma cópia
  // para ninguém perder itens; compras futuras passam a pertencer ao filho ativo.
  const antiga=estado.personalizacao&&typeof estado.personalizacao==='object'
    ? JSON.parse(JSON.stringify(estado.personalizacao)) : null;
  Object.keys(estado.criancas).forEach(id=>{
    const dados=estado.criancasDados[id]||(estado.criancasDados[id]={});
    if(!dados.personalizacao){
      dados.personalizacao=antiga
        ? JSON.parse(JSON.stringify(antiga))
        : {adquiridos:[],equipados:{}};
    }
  });
  const dadosAtivos=estado.criancasDados[estado.criancaAtivaId];
  if(!estado.personalizacao&&dadosAtivos?.personalizacao){
    estado.personalizacao=JSON.parse(JSON.stringify(dadosAtivos.personalizacao));
  }
}
const ICONES_PERFIL_CRIANCA=['🐾','🦁','🐱','🐶','🦊','🐼','🐸','🦄','🐬','⭐','🚀','🌈'];
let iconePerfilSelecionado='🐾';
function atualizarAtalhoPerfilCrianca(){
  const info=estado.criancas?.[estado.criancaAtivaId]||{nome:'Meu perfil',emoji:'🐾'};
  const nome=(info.nome||'Meu perfil').trim();
  document.getElementById('perfil-crianca-emoji').textContent=info.emoji||'🐾';
  document.getElementById('perfil-crianca-nome').textContent=nome;
  document.getElementById('btn-perfil-crianca').setAttribute('aria-label',`Perfil de ${nome}. Escolher ícone e apelido`);
}
function renderizarOpcoesIconeCrianca(){
  const c=document.getElementById('opcoes-icone-crianca');
  c.replaceChildren();
  ICONES_PERFIL_CRIANCA.forEach(emoji=>{
    const botao=document.createElement('button');
    botao.type='button';
    botao.className='opcao-icone-crianca'+(iconePerfilSelecionado===emoji?' selecionado':'');
    botao.textContent=emoji;
    botao.setAttribute('aria-label',`Escolher ${emoji}`);
    botao.setAttribute('aria-pressed',String(iconePerfilSelecionado===emoji));
    botao.onclick=()=>{iconePerfilSelecionado=emoji;renderizarOpcoesIconeCrianca()};
    c.appendChild(botao);
  });
}
function abrirPerfilCrianca(){
  if(perfilAtivo!=='crianca')return mostrarToast('Troque para o perfil da criança para personalizar.');
  const info=estado.criancas?.[estado.criancaAtivaId];
  if(!info)return;
  document.getElementById('input-apelido-crianca').value=info.nome==='Minha Criança'?'':info.nome;
  iconePerfilSelecionado=ICONES_PERFIL_CRIANCA.includes(info.emoji)?info.emoji:'🐾';
  renderizarOpcoesIconeCrianca();
  abrirModal('modal-perfil-crianca');
}
function salvarPerfilCrianca(){
  if(perfilAtivo!=='crianca')return;
  const info=estado.criancas?.[estado.criancaAtivaId];
  if(!info)return;
  const nome=document.getElementById('input-apelido-crianca').value.replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,18);
  if(!nome)return mostrarToast('Escreva seu nome ou apelido.');
  info.nome=nome;
  info.emoji=ICONES_PERFIL_CRIANCA.includes(iconePerfilSelecionado)?iconePerfilSelecionado:'🐾';
  salvar();
  atualizarAtalhoPerfilCrianca();
  fecharModal('modal-perfil-crianca');
  mostrarToast('🌟 Seu perfil foi atualizado!');
}
let estado={
  criancaAtivaId:'c1',criancas:{c1:{nome:'Minha Criança',emoji:'🐾'}},criancasDados:{},
  gestosDesbloqueados:[],decoracaoItens:[],extraDiaRemovida:null,miniPetsComprados:['passarinho'],miniPetAtivo:'passarinho',petAtual:'gato',moedas:15,taxaCambio:.01,pinHash:null,dinheiroAcumulado:0,mesadaAtiva:true,idadeCrianca:7,dificuldadeJogos:'auto',nomePet:'Pipoca',
  palcoAtual:'cristal',palcosComprados:['cristal'],fundoAtual:'ceu',fundosComprados:['ceu'],temaInterfaceAtual:'classico',metaMoedas:50,totalSacado:0,
  ultimoDiaAcesso:hojeLocal(),ultimoDiaConcluido:null,streak:0,ultimoStreakPremiado:0,
  tarefasHojeCount:0,desafiosMathAcertos:0,timerFim:null,vozSalva:null,
  pets:{gato:{nivel:1,xp:0,felicidade:100,saude:100,faseConfirmada:1},axolote:{nivel:1,xp:0,felicidade:100,saude:100}},
  tarefas:[{id:1,texto:'Escovar os dentes',recompensa:5,xp:20,tipo:'obrigatoria',status:'pendente',foto:null,dias:[]},{id:2,texto:'Arrumar a cama',recompensa:5,xp:20,tipo:'obrigatoria',status:'pendente',foto:null,dias:[]}],
  recompensas:[
    {id:1,texto:'15 min de tela',descricao:'Tempo de tela liberado pelos pais.',custo:10,tipo:'timer',minutos:15,icone:'📱',ativo:true},
    {id:2,texto:'30 min de tela',descricao:'Tempo de tela liberado pelos pais.',custo:18,tipo:'timer',minutos:30,icone:'🎮',ativo:true}
  ],
  solicitacoesPremios:[],
  conquistas:{},habilidades:{},
  pinBloqueadoAte:null,pinTentativasFalhas:0,pinPersonalizado:false,privacidadeAceita:false,onboardingVistoPais:false,
  acessorios:{comprados:[],ativo:null},
  pausaAte:null,
  historicoConclusoes:{},
  registroDiario:{},
  onboardingVistoCrianca:false,
  lembreteEnviadoData:null,
  notificacoesAtivas:false,
  surpresaResgatadaData:null,
  metasPersonalizadas:[],
  volumeSom:0.55,sonsAtivos:true,
  logAtividades:[],avisosMissao:[],
  ultimoAcaoPet:{},
  ultimoDecay:null
};
const estadoInicial=JSON.parse(JSON.stringify(estado));
try{
  const salvo=localStorage.getItem(`ROTINAPET_SAVE_${codigoFamilia}`);
  if(salvo){
    const d=JSON.parse(salvo);
    estado={...estado,...d};
    estado.pets={...estado.pets,...(d.pets||{})};
    for(const p of Object.keys(PETS))estado.pets[p]={nivel:1,xp:0,felicidade:100,saude:100,...(estado.pets[p]||{})};
    if(!Array.isArray(estado.fundosComprados))estado.fundosComprados=['ceu'];
    if(!Array.isArray(estado.tarefas))estado.tarefas=[];
    if(!Array.isArray(estado.recompensas))estado.recompensas=[];
    estado.recompensas=estado.recompensas.map(r=>({
      id:r.id??Date.now()+Math.random(),
      texto:r.texto||'Prêmio',
      descricao:r.descricao||'',
      custo:Math.max(1,Number(r.custo)||1),
      tipo:r.tipo||'premio',
      minutos:Number(r.minutos)||0,
      icone:r.icone||'🎁',
      ativo:r.ativo!==false
    }));
    if(!Array.isArray(estado.solicitacoesPremios))estado.solicitacoesPremios=[];
    estado.conquistas=estado.conquistas||{};
    estado.acessorios=estado.acessorios&&Array.isArray(estado.acessorios.comprados)?estado.acessorios:{comprados:[],ativo:null};
    estado.historicoConclusoes=estado.historicoConclusoes||{};
    estado.registroDiario=estado.registroDiario||{};
    normalizarEmailsRecuperacao();
    // Migração: quem já usava o app antes de existir múltiplos filhos não tinha
    // `criancas` nem `criancaAtivaId` — cria o primeiro perfil com o progresso
    // que já estava solto no estado, sem mexer em mais nada.
    garantirCriancaAtiva();
    if(d.pinPais&&!d.pinHash){
      hashPin(d.pinPais).then(h=>{estado.pinHash=h;delete estado.pinPais;salvar();});
    }
  }
}catch(e){}
estado.tarefas.forEach(t=>{if(!t.tipo)t.tipo='obrigatoria';if(!t.status)t.status='pendente';if(t.foto===undefined)t.foto=null;if(t.fotoUrl===undefined)t.fotoUrl=null;if(t.fotoPath===undefined)t.fotoPath=null;if(!Array.isArray(t.dias))t.dias=[];if(!Number(t.atualizadoEm))t.atualizadoEm=0});
prepararTarefasV2NoEstado();
if(!Number.isFinite(Number(estado.streak)))estado.streak=0;
function verificarResetDiario(){
  const hojeStr=hojeLocal();
  if(estado.ultimoDiaAcesso===hojeStr)return false;
  const emPausa=estado.pausaAte&&hojeStr<=estado.pausaAte;
  if(!emPausa&&estado.ultimoDiaConcluido!==ontemLocal()&&estado.ultimoDiaConcluido!==hojeStr){
    if(Number(estado.escudosOfensiva)>0){
      estado.escudosOfensiva=Math.max(0,Number(estado.escudosOfensiva)-1);
      if(typeof registrarEngajamento==='function')registrarEngajamento('Escudo da ofensiva consumido');
      if(typeof mostrarToast==='function')mostrarToast('🛡️ Seu escudo protegeu a sequência de hoje!');
    }else{
      estado.streak=0;
      estado.ultimoStreakPremiado=0;
    }
  }

  // NOVO: cada dia recebe um registro próprio. O histórico dos dias anteriores
  // permanece em t.registros, mas o dia atual SEMPRE começa pendente.
  estado.tarefas.forEach(t=>{
    if(t.extraRotativa&&t.dataSugerida!==hojeStr)return;
    t.registros=t.registros||{};
    t.registros[hojeStr]={
      status:'pendente',
      foto:null,
      fotoUrl:null,
      fotoPath:null,
      atualizadoEm:Date.now()
    };
    t.status='pendente';
    t.foto=null;
    t.fotoUrl=null;
    t.fotoPath=null;
    t.ultimoResetEm=hojeStr;
    // Importante para o merge V2: impede uma versão antiga/aprovada do Firebase
    // de vencer o reset recém-feito quando as tarefas individuais sincronizam.
    t.atualizadoEm=Date.now();
  });
  estado.tarefasHojeCount=0;
  estado.ultimoDiaAcesso=hojeStr;
  return true;
}
// Faz o reset imediatamente no estado local. A persistência definitiva também é
// repetida após a primeira carga do Firebase, evitando a nuvem desfazer o reset.
if(verificarResetDiario()){
  try{localStorage.setItem(`ROTINAPET_SAVE_${codigoFamilia}`,JSON.stringify(estado))}catch(e){}
}
function salvarLocalmente(){
  try{
    const estadoLocal=acessoFamiliar?.role==='child'?removerCamposPrivadosPais(estado):estado;
    localStorage.setItem(`ROTINAPET_SAVE_${codigoFamilia}`,JSON.stringify(estadoLocal));
  }catch(e){
    mostrarToast('⚠️ Memória cheia; foto não armazenada.');
  }
}
async function persistirNuvemAgora(){
  if(!sincronizacaoNuvemAtiva||!dbFirebase){
    marcarFilaSync(false);
    return;
  }
  if(cargaNuvemPendente||!navigator.onLine){
    marcarFilaSync(true);
    return;
  }
  const compartilhado=estadoCompartilhadoParaSincronizar();
  const baseSincronizada=acessoFamiliar?.role==='child'?estadoCompartilhadoParaSincronizar(ultimoEstadoSincronizado||{}):ultimoEstadoSincronizado;
  const mudancas=calcularDiffParaNuvem(baseSincronizada,compartilhado);
  const privados=acessoFamiliar?.role==='parent'?extrairCamposPrivadosPais(estado):null;
  const mudancasPrivadas=privados?calcularDiffParaNuvem(ultimoEstadoPrivadoPais,privados):{};
  if(!Object.keys(mudancas).length&&!Object.keys(mudancasPrivadas).length){marcarFilaSync(false);return}
  statusSyncAtual='syncing';marcarFilaSync(true);atualizarStatusSyncUI();
  const snapshot=JSON.parse(JSON.stringify(compartilhado));
  const gravacoes=[];
  if(Object.keys(mudancas).length)gravacoes.push(dbFirebase.ref(getCaminhoFirebase()).update(mudancas));
  if(Object.keys(mudancasPrivadas).length)gravacoes.push(dbFirebase.ref(`rotinapet/familias/${codigoFamilia}/pais/segredos`).update(mudancasPrivadas));
  await Promise.all(gravacoes);
  ultimoEstadoSincronizado=snapshot;
  if(privados)ultimoEstadoPrivadoPais=JSON.parse(JSON.stringify(privados));
  ultimaSyncOkEm=Date.now();
  statusSyncAtual='online';
  marcarFilaSync(false);
  atualizarStatusSyncUI();
}
function salvar(){
  salvarLocalmente();
  if(!sincronizacaoNuvemAtiva||!dbFirebase){
    marcarFilaSync(false);
    return Promise.resolve(false);
  }
  if(cargaNuvemPendente||!navigator.onLine){
    marcarFilaSync(true);
    return Promise.resolve(false);
  }
  filaEscritaNuvem=filaEscritaNuvem
    .then(()=>persistirNuvemAgora())
    .then(()=>true)
    .catch(err=>{
      console.warn('Erro na fila de sincronização:',err);
      statusSyncAtual='erro';
      marcarFilaSync(true);
      atualizarStatusSyncUI();
      return false;
    });
  return filaEscritaNuvem;
}
// Suporta até 2 responsáveis com e-mails próprios vinculados à mesma família.
// Migra o campo antigo (um único e-mail em string) para a lista nova.
function normalizarEmailsRecuperacao(){
  if(estado.emailRecuperacao&&!Array.isArray(estado.emailsRecuperacao)){
    estado.emailsRecuperacao=[estado.emailRecuperacao];
  }
  if(!Array.isArray(estado.emailsRecuperacao))estado.emailsRecuperacao=[];
  delete estado.emailRecuperacao;
}
async function carregarEstadoNuvem(){
  if(!sincronizacaoNuvemAtiva||!dbFirebase)return false;
  try{
    // Timeout de segurança: se a rede travar, não deixamos cargaNuvemPendente
    // preso para sempre (o que bloquearia salvar() indefinidamente).
    const timeoutMs=8000;
    const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout ao buscar dados da família')),timeoutMs));
    const snap=await Promise.race([dbFirebase.ref(getCaminhoFirebase()).once('value'),timeout]);
    const remoto=snap.val();
    if(!remoto||typeof remoto!=='object'){ultimoEstadoSincronizado=null;return false}
    const compartilhado=removerCamposPrivadosPais(remoto);
    ultimoEstadoSincronizado=JSON.parse(JSON.stringify(compartilhado));
    aplicarEstadoRemotoComMerge(compartilhado);
    if(acessoFamiliar?.role==='parent'){
      const privSnap=await dbFirebase.ref(`rotinapet/familias/${codigoFamilia}/pais/segredos`).once('value');
      ultimoEstadoPrivadoPais=extrairCamposPrivadosPais(privSnap.val()||{});
      aplicarPrivadosPaisLocal(ultimoEstadoPrivadoPais);
    }else{const padrao=extrairCamposPrivadosPais(estadoInicial);CAMPOS_PRIVADOS_PAIS.forEach(k=>{estado[k]=padrao[k]})}
    normalizarEmailsRecuperacao();
    garantirCriancaAtiva();
    localStorage.setItem(`ROTINAPET_SAVE_${codigoFamilia}`,JSON.stringify(estado));
    atualizarTela();
    return true;
  }catch(e){
    console.error('Falha ao carregar família:',e);
    return null;
  }
}
function aplicarTarefasDaCriancaSemPerderCadastro(tarefasBase,tarefasFilha){
  const base=Array.isArray(tarefasBase)?tarefasBase:[];
  const filha=Array.isArray(tarefasFilha)?tarefasFilha:[];
  // A lista mais completa vence: evita que os 2 exemplos padrão substituam
  // as tarefas reais cadastradas no painel dos responsáveis.
  if(filha.length>base.length)return filha;
  // Com a mesma quantidade, mescla por versão. Retornar sempre a lista base
  // aqui descartava mudanças recentes de status vindas de outro aparelho.
  if(filha.length===base.length&&base.length)return mergeTarefasPorVersao(base,filha);
  if(base.length)return base;
  return filha;
}
function aplicarEstadoRemotoComMerge(d){
  if(!d||typeof d!=='object')return;
  const tarefasRemotas=Array.isArray(d.tarefas)?d.tarefas:null;
  const idAtiva=d.criancaAtivaId||estado.criancaAtivaId;
  const dadosCriancaRemotos=d.criancasDados&&d.criancasDados[idAtiva];
  const tarefasDaCrianca=dadosCriancaRemotos&&Array.isArray(dadosCriancaRemotos.tarefas)?dadosCriancaRemotos.tarefas:null;
  const fonteTarefas=tarefasRemotas||tarefasDaCrianca;
  const tarefasMescladas=fonteTarefas?mergeTarefasPorVersao(estado.tarefas,fonteTarefas):estado.tarefas;
  estado={...estado,...d,pets:{...estado.pets,...(d.pets||{})},tarefas:tarefasMescladas};
  garantirCriancaAtiva();
  const tarefasAntesDosDados=estado.tarefas;
  if(dadosCriancaRemotos){
    const dadosAtuais=capturarDadosCrianca();
    const perfilRemoto={...dadosAtuais,...dadosCriancaRemotos};
    // O estado ativo no topo da família é a versão mais recente do filho ativo.
    if(d.personalizacao!==undefined)perfilRemoto.personalizacao=d.personalizacao;
    aplicarDadosCrianca(perfilRemoto);
    estado.tarefas=aplicarTarefasDaCriancaSemPerderCadastro(tarefasAntesDosDados,estado.tarefas);
  }
  if(!Array.isArray(estado.tarefas))estado.tarefas=[];
  estado.tarefas.forEach(prepararTarefaParaHoje);
}
async function iniciarSincronizacaoNuvem(){
  if(!sincronizacaoNuvemAtiva||!dbFirebase)return;
  cargaNuvemPendente=true;
  statusSyncAtual='syncing';
  atualizarStatusSyncUI();
  const ref=dbFirebase.ref(getCaminhoFirebase());
  ref.off();
  const cargaInicial=await carregarEstadoNuvem();
  if(cargaInicial===null||(!cargaInicial&&familiaDaConta(obterAuth()?.currentUser)===codigoFamilia)){
    cargaNuvemPendente=false;
    statusSyncAtual='erro';
    marcarFilaSync(true);
    atualizarStatusSyncUI();
    return false;
  }
  try{await carregarTarefasIndividuaisComFallback();}catch(e){console.warn('Tarefas individuais:',e)}
  cargaNuvemPendente=false;

  // CRÍTICO: a nuvem pode ter trazido ultimoDiaAcesso/status do dia anterior
  // depois do reset local. Por isso verificamos novamente SOMENTE após terminar
  // de carregar o estado e as tarefas V2.
  const resetouAposNuvem=verificarResetDiario();
  if(resetouAposNuvem){
    salvarLocalmente();
    // Atualiza também os nós individuais V2; sem isso um status antigo poderia
    // voltar no próximo merge entre aparelhos.
    try{
      await Promise.all((estado.tarefas||[]).map(t=>persistirTarefaIndividualV2(t)));
    }catch(e){console.warn('Reset diário: falha ao atualizar tarefas V2:',e)}
  }

  ultimaSyncOkEm=Date.now();
  statusSyncAtual='online';
  // Reenvia o estado já mesclado/resetado sem risco de sobrescrever a carga inicial.
  salvar();
  sincronizarListenerTarefasV2();
  atualizarStatusSyncUI();
  ref.on('value',s=>{
    if(ignorarProximoSyncNuvem){ignorarProximoSyncNuvem=false;return}
    const d=s.val();
    if(d&&typeof d==='object'){
      const moedasAntes=Number(estado.moedas)||0;
      const nivelAntes=Number(estado.pets?.[estado.petAtual]?.nivel)||1;
      const compartilhado=removerCamposPrivadosPais(d);
      ultimoEstadoSincronizado=JSON.parse(JSON.stringify(compartilhado));
      ultimaSyncOkEm=Date.now();
      statusSyncAtual='online';
      marcarFilaSync(false);
      if(d.criancaAtivaId&&estado.criancaAtivaId&&d.criancaAtivaId!==estado.criancaAtivaId){
        estado.criancas={...estado.criancas,...(d.criancas||{})};
        estado.criancasDados={...estado.criancasDados,...(d.criancasDados||{})};
        const dadosRecebidos={};
        CAMPOS_CRIANCA.forEach(k=>{if(d[k]!==undefined)dadosRecebidos[k]=d[k]});
        estado.criancasDados[d.criancaAtivaId]=dadosRecebidos;
        Object.keys(d).forEach(k=>{if(!CAMPOS_CRIANCA.includes(k)&&k!=='criancaAtivaId')estado[k]=d[k]});
      }else{
        aplicarEstadoRemotoComMerge(compartilhado);
      }
      sincronizarListenerTarefasV2();
      garantirCriancaAtiva();
      if(perfilAtivo==='crianca'){
        if((Number(estado.pets?.[estado.petAtual]?.nivel)||1)>nivelAntes)playSound('nivel');
        else if((Number(estado.moedas)||0)>moedasAntes)playSound('moedas');
      }
      try{localStorage.setItem(`ROTINAPET_SAVE_${codigoFamilia}`,JSON.stringify(estado))}catch(e){}
      atualizarTela();
      atualizarStatusSyncUI();
      mostrarToast('☁️ Sincronizado');
    }
  });
  return true;
}
const CONFIG_PARTICULAS={
  floresta:{emojis:['🍃','🍂','🌿'],modo:'cair',qtd:14},
  neve:{emojis:['❄️','❄'],modo:'cair',qtd:18},
  praia:{emojis:['🫧','✨'],modo:'subir',qtd:12},
  noite:{emojis:['✨','⭐'],modo:'piscar',qtd:20},
  astronauta:{emojis:['✨','⭐','🌟'],modo:'piscar',qtd:22},
  festa:{emojis:['🎊','🎉','✨'],modo:'cair',qtd:14},
  halloween:{emojis:['🦇','🎃'],modo:'lateral',qtd:7},
  chuva:{emojis:['💧'],modo:'cair',qtd:20},
  pirata:{emojis:['☁️'],modo:'lateral',qtd:6},
  fazenda:{emojis:['🌾','🌻'],modo:'cair',qtd:10},
  mario:{emojis:['⭐','🍄'],modo:'cair',qtd:10},
  dino:{emojis:['🍃','🦴'],modo:'cair',qtd:10},
  princesa:{emojis:['✨','💎'],modo:'piscar',qtd:16},
  arcoiris:{emojis:['✨','🌟'],modo:'piscar',qtd:12},
  estadio:{emojis:['⚽','🟡'],modo:'cair',qtd:8},
  ceu:{emojis:['☁️'],modo:'lateral',qtd:5},
  quarto:{emojis:['✨','💤'],modo:'piscar',qtd:10},
  aniversario:{emojis:['🎈','🎉','✨'],modo:'cair',qtd:14}
};
const DETALHES_CENARIO={
  estadio(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <!-- arquibancadas -->
    <rect x="0" y="210" width="48" height="320" fill="#1e293b"/><rect x="352" y="210" width="48" height="320" fill="#1e293b"/>
    <g fill="#334155">${[0,1,2,3,4,5,6,7].map(i=>`<rect x="4" y="${220+i*36}" width="40" height="14" rx="2"/><rect x="356" y="${220+i*36}" width="40" height="14" rx="2"/>`).join('')}</g>
    <g fill="#fbbf24" opacity=".7">${[0,1,2,3,4,5,6].map(i=>`<circle cx="12" cy="${228+i*36}" r="2.5"/><circle cx="36" cy="${228+i*36}" r="2.5"/><circle cx="364" cy="${228+i*36}" r="2.5"/><circle cx="388" cy="${228+i*36}" r="2.5"/>`).join('')}</g>
    <!-- gramado com faixas -->
    <rect x="48" y="240" width="304" height="360" fill="#16a34a"/>
    ${[0,1,2,3,4,5,6,7,8].map(i=>`<rect x="48" y="${240+i*40}" width="304" height="20" fill="${i%2?'#15803d':'#16a34a'}" opacity=".55"/>`).join('')}
    <!-- linhas do campo -->
    <rect x="58" y="255" width="284" height="320" fill="none" stroke="#fff" stroke-width="3" opacity=".9"/>
    <line x1="200" y1="255" x2="200" y2="575" stroke="#fff" stroke-width="2.5" opacity=".85"/>
    <circle cx="200" cy="415" r="42" fill="none" stroke="#fff" stroke-width="2.5"/>
    <circle cx="200" cy="415" r="4" fill="#fff"/>
    <!-- áreas -->
    <rect x="110" y="255" width="180" height="70" fill="none" stroke="#fff" stroke-width="2"/>
    <rect x="140" y="255" width="120" height="36" fill="none" stroke="#fff" stroke-width="2"/>
    <rect x="110" y="505" width="180" height="70" fill="none" stroke="#fff" stroke-width="2"/>
    <rect x="140" y="539" width="120" height="36" fill="none" stroke="#fff" stroke-width="2"/>
    <!-- traves -->
    <path d="M155 255 V230 H245 V255" fill="none" stroke="#f8fafc" stroke-width="5" stroke-linejoin="round"/>
    <path d="M155 575 V600 H245 V575" fill="none" stroke="#f8fafc" stroke-width="5" stroke-linejoin="round"/>
    <path d="M160 232 H240" stroke="#e2e8f0" stroke-width="2" opacity=".5"/>
    <path d="M160 598 H240" stroke="#e2e8f0" stroke-width="2" opacity=".5"/>
    <!-- bandeiras de escanteio -->
    <g class="anim-bandeira"><line x1="58" y1="255" x2="58" y2="235" stroke="#fff" stroke-width="2"/><path d="M58 235 L78 242 L58 249Z" fill="#ef4444"/></g>
    <g class="anim-bandeira" style="animation-delay:.4s"><line x1="342" y1="255" x2="342" y2="235" stroke="#fff" stroke-width="2"/><path d="M342 235 L322 242 L342 249Z" fill="#3b82f6"/></g>
    <!-- bola -->
    <g class="anim-bola"><circle cx="175" cy="390" r="14" fill="#fff"/><path d="M175 376 L182 388 L175 400 L168 388Z" fill="#0f172a"/><circle cx="175" cy="390" r="14" fill="none" stroke="#0f172a" stroke-width="1.5"/></g>
    <!-- holofotes -->
    <g fill="#e2e8f0"><rect x="14" y="150" width="10" height="34" rx="2"/><rect x="376" y="150" width="10" height="34" rx="2"/></g>
    <g fill="#fef9c3" opacity=".85"><circle cx="19" cy="146" r="7"/><circle cx="381" cy="146" r="7"/></g>
    <!-- plateia topo -->
    <rect x="48" y="180" width="304" height="60" fill="#0f172a"/>
    <g fill="#475569">${[0,1,2].map(r=>[0,1,2,3,4,5,6,7,8,9,10,11].map(c=>`<rect x="${56+c*24}" y="${188+r*16}" width="18" height="10" rx="1"/>`).join('')).join('')}</g>
  </svg>`},
  praia(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="rpSolPraia" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#fff8dc"/><stop offset="55%" stop-color="#fde047"/><stop offset="100%" stop-color="#f59e0b"/></radialGradient></defs>
    <circle cx="320" cy="90" r="58" fill="#fde047" opacity=".2"/><circle cx="320" cy="90" r="42" fill="url(#rpSolPraia)"/>
    <g class="anim-nuvem" opacity=".85"><ellipse cx="80" cy="70" rx="36" ry="18" fill="#fff"/><ellipse cx="105" cy="70" rx="24" ry="14" fill="#fff"/><ellipse cx="55" cy="72" rx="20" ry="12" fill="#fff"/></g>
    <path d="M0 420 Q100 400 200 420 T400 420 V700 H0Z" fill="#38bdf8" opacity=".55"/>
    <path class="anim-onda" d="M-40 440 Q40 420 120 440 T280 440 T440 440 V700 H-40Z" fill="#0ea5e9" opacity=".4"/>
    <path d="M0 500 Q150 480 300 505 T400 500 V700 H0Z" fill="#fbbf24"/>
    <path d="M0 560 Q200 540 400 565 V700 H0Z" fill="#f59e0b" opacity=".5"/>
    <!-- coqueiro -->
    <path d="M55 520 Q50 400 62 300" stroke="#78350f" stroke-width="10" fill="none"/>
    <g fill="#16a34a"><ellipse cx="40" cy="290" rx="28" ry="12" transform="rotate(-30 40 290)"/><ellipse cx="80" cy="288" rx="30" ry="12" transform="rotate(25 80 288)"/><ellipse cx="55" cy="275" rx="26" ry="11"/><ellipse cx="70" cy="300" rx="24" ry="10" transform="rotate(40 70 300)"/></g>
    <ellipse cx="300" cy="530" rx="22" ry="10" fill="#fff" opacity=".5"/>
    <circle cx="250" cy="545" r="8" fill="#ef4444"/><circle cx="270" cy="550" r="6" fill="#f97316"/>
    <circle cx="180" cy="560" r="16" fill="#f8fafc"/><path d="M180 544v32M164 560h32" stroke="#38bdf8" stroke-width="2"/><path d="M169 549l22 22M191 549l-22 22" stroke="#f87171" stroke-width="2"/>
  </svg>`},
  floresta(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <circle cx="330" cy="90" r="40" fill="#fde047" opacity=".7"/>
    <g fill="#14532d">${[[30,380,50],[90,360,60],[160,370,55],[240,350,70],[320,365,58],[370,380,45]].map(([x,y,s])=>`<path d="M${x} ${y+s*1.6} L${x-s} ${y} L${x+s} ${y}Z"/><path d="M${x} ${y+s} L${x-s*.75} ${y-s*.3} L${x+s*.75} ${y-s*.3}Z"/><rect x="${x-6}" y="${y+s}" width="12" height="${s*.5}" fill="#78350f"/>`).join('')}</g>
    <ellipse cx="200" cy="620" rx="180" ry="40" fill="#166534" opacity=".35"/>
    <g>${[[70,610,'#fca5a5'],[200,640,'#fde68a'],[300,600,'#f9a8d4']].map(([x,y,cor])=>`<circle cx="${x}" cy="${y}" r="9" fill="#fff"/><circle cx="${x}" cy="${y}" r="4" fill="${cor}"/>`).join('')}</g>
  </svg>`},
  noite(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="rpLuaNoite" cx="38%" cy="32%" r="70%"><stop offset="0%" stop-color="#ffffff"/><stop offset="70%" stop-color="#e2e8f0"/><stop offset="100%" stop-color="#cbd5e1"/></radialGradient></defs>
    <circle cx="310" cy="100" r="60" fill="#f8fafc" opacity=".14"/><circle cx="310" cy="100" r="48" fill="url(#rpLuaNoite)"/><circle cx="328" cy="90" r="42" fill="#0f172a"/>
    ${[[40,60],[80,120],[150,40],[200,90],[260,50],[100,200],[180,160],[340,180],[50,280]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${1+i%3}" fill="#fff" opacity="${.5+.5*(i%3)/3}"/>`).join('')}
    <path d="M70 130 L150 90" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/><path d="M150 90 L138 92M150 90 L145 78" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/>
  </svg>`},
  astronauta(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    ${[[30,80],[70,150],[120,40],[180,110],[250,70],[300,140],[350,50],[90,220],[200,200],[320,240]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${.8+(i%4)*.6}" fill="#e0e7ff"/>`).join('')}
    <ellipse cx="80" cy="500" rx="50" ry="18" fill="#a78bfa" opacity=".35"/>
    <circle cx="320" cy="420" r="28" fill="#6366f1" opacity=".4"/><circle cx="330" cy="412" r="8" fill="#c7d2fe" opacity=".5"/>
    <path d="M0 600 Q200 560 400 600 V700 H0Z" fill="#1e1b4b" opacity=".6"/>
    <ellipse cx="230" cy="130" rx="34" ry="10" fill="#fca5a5" opacity=".8" transform="rotate(-20 230 130)"/><circle cx="230" cy="130" r="16" fill="#fca5a5" transform="rotate(-20 230 130)"/>
  </svg>`},
  neve(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 480 Q100 450 200 480 T400 470 V700 H0Z" fill="#f8fafc"/>
    <path d="M0 560 Q200 530 400 555 V700 H0Z" fill="#e2e8f0" opacity=".7"/>
    <!-- árvore de natal -->
    <path d="M300 520 L260 580 H340Z" fill="#15803d"/><path d="M300 490 L270 545 H330Z" fill="#16a34a"/><path d="M300 465 L280 515 H320Z" fill="#22c55e"/>
    <rect x="294" y="580" width="12" height="20" fill="#78350f"/><circle cx="300" cy="460" r="8" fill="#fbbf24"/>
    <circle cx="100" cy="540" r="20" fill="#fff"/><circle cx="100" cy="505" r="15" fill="#fff"/><circle cx="100" cy="478" r="11" fill="#fff"/>
    <circle cx="96" cy="474" r="1.6" fill="#1c1917"/><circle cx="104" cy="474" r="1.6" fill="#1c1917"/><path d="M100 478 L108 481 L100 484Z" fill="#f97316"/>
    <circle cx="94" cy="502" r="1.6" fill="#1c1917"/><circle cx="106" cy="502" r="1.6" fill="#1c1917"/><circle cx="100" cy="510" r="1.6" fill="#1c1917"/>
  </svg>`},
  pirata(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 420 Q200 390 400 420 V700 H0Z" fill="#0369a1"/>
    <path d="M0 500 Q200 470 400 500 V700 H0Z" fill="#0c4a6e"/>
    <path d="M60 480 L200 300 L340 480 Z" fill="#78350f"/>
    <rect x="190" y="220" width="20" height="90" fill="#44403c"/>
    <path d="M210 230 L280 255 L210 280Z" fill="#dc2626"/>
    <ellipse cx="200" cy="490" rx="150" ry="25" fill="#1c1917" opacity=".4"/>
    <circle cx="320" cy="90" r="34" fill="#fde68a" opacity=".9"/>
    <path d="M60 130 Q90 110 120 130 Q90 118 60 130Z" fill="#f8fafc" opacity=".8"/>
  </svg>`},
  fazenda(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 400 Q200 370 400 400 V700 H0Z" fill="#4ade80"/>
    <path d="M0 500 Q200 470 400 505 V700 H0Z" fill="#22c55e"/>
    <rect x="240" y="380" width="100" height="70" fill="#b45309"/><path d="M230 380 L290 330 L350 380Z" fill="#dc2626"/>
    <rect x="280" y="410" width="24" height="40" fill="#78350f"/>
    <circle cx="70" cy="120" r="36" fill="#fde047"/>
    <g class="anim-nuvem" opacity=".85"><ellipse cx="180" cy="80" rx="30" ry="14" fill="#fff"/><ellipse cx="205" cy="78" rx="20" ry="10" fill="#fff"/></g>
    <g stroke="#78350f" stroke-width="4"><line x1="10" y1="430" x2="10" y2="470"/><line x1="34" y1="430" x2="34" y2="470"/><line x1="10" y1="440" x2="34" y2="440"/></g>
  </svg>`},
  halloween(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="rpLuaHall" cx="38%" cy="32%" r="70%"><stop offset="0%" stop-color="#fff8dc"/><stop offset="100%" stop-color="#fde68a"/></radialGradient></defs>
    <circle cx="300" cy="90" r="54" fill="#fde68a" opacity=".18"/><circle cx="300" cy="90" r="40" fill="url(#rpLuaHall)"/>
    <path d="M0 520 Q120 480 200 530 T400 510 V700 H0Z" fill="#1c1917"/>
    <path d="M40 520 L55 420 L70 520Z" fill="#365314"/><circle cx="55" cy="410" r="22" fill="#ea580c"/>
    <path d="M48 405 L55 395 L62 405" fill="#166534"/>
    <path d="M300 520 L320 400 L340 520Z" fill="#365314"/><circle cx="320" cy="390" r="26" fill="#c2410c"/>
    <g fill="#1c1917" opacity=".85">${[[150,150],[190,170],[230,140],[110,175]].map(([x,y])=>`<path d="M${x} ${y} Q${x-14} ${y-10} ${x-20} ${y} Q${x-10} ${y-2} ${x} ${y} Q${x+10} ${y-2} ${x+20} ${y} Q${x+14} ${y-10} ${x} ${y}Z"/>`).join('')}</g>
  </svg>`},
  ceu(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="rpSolCeu" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#fffbea"/><stop offset="55%" stop-color="#fde047"/><stop offset="100%" stop-color="#facc15"/></radialGradient>
    <linearGradient id="rpNuvemCeu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#e7edf7"/></linearGradient></defs>
    <circle cx="300" cy="90" r="60" fill="#fde047" opacity=".16"/><circle cx="300" cy="90" r="44" fill="url(#rpSolCeu)"/>
    <g class="anim-nuvem" opacity=".92"><ellipse cx="90" cy="130" rx="40" ry="20" fill="url(#rpNuvemCeu)"/><ellipse cx="120" cy="128" rx="28" ry="16" fill="url(#rpNuvemCeu)"/><ellipse cx="60" cy="132" rx="22" ry="14" fill="url(#rpNuvemCeu)"/></g>
    <g class="anim-nuvem" opacity=".55" style="animation-delay:-12s"><ellipse cx="220" cy="210" rx="34" ry="16" fill="url(#rpNuvemCeu)"/><ellipse cx="245" cy="208" rx="22" ry="12" fill="url(#rpNuvemCeu)"/></g>
    <g fill="#facc15" opacity=".5">${[[40,60],[350,190],[20,250]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.5"/>`).join('')}</g>
  </svg>`},
  chuva(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="rpNuvemChuva" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#64748b"/></linearGradient></defs>
    <g class="anim-nuvem" opacity=".92"><ellipse cx="100" cy="90" rx="50" ry="24" fill="url(#rpNuvemChuva)"/><ellipse cx="140" cy="86" rx="34" ry="18" fill="url(#rpNuvemChuva)"/><ellipse cx="65" cy="92" rx="26" ry="16" fill="url(#rpNuvemChuva)"/></g>
    <g class="anim-nuvem" opacity=".7" style="animation-delay:-9s"><ellipse cx="290" cy="150" rx="46" ry="20" fill="url(#rpNuvemChuva)"/><ellipse cx="322" cy="146" rx="28" ry="14" fill="url(#rpNuvemChuva)"/></g>
    <path d="M0 560 Q200 538 400 560 V700 H0Z" fill="#475569" opacity=".35"/>
    <g stroke="#cbd5e1" stroke-width="3" opacity=".4"><ellipse cx="120" cy="602" rx="46" ry="8" fill="none"/><ellipse cx="270" cy="632" rx="58" ry="9" fill="none"/></g>
  </svg>`},
  arcoiris(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke-width="15">
    <path d="M-40 350 Q200 60 440 350" stroke="#f87171"/>
    <path d="M-40 367 Q200 95 440 367" stroke="#fb923c"/>
    <path d="M-40 384 Q200 130 440 384" stroke="#fbbf24"/>
    <path d="M-40 401 Q200 165 440 401" stroke="#4ade80"/>
    <path d="M-40 418 Q200 200 440 418" stroke="#38bdf8"/>
    <path d="M-40 435 Q200 235 440 435" stroke="#a78bfa"/>
    </g>
    <g class="anim-nuvem" opacity=".92"><ellipse cx="60" cy="340" rx="34" ry="16" fill="#fff"/><ellipse cx="88" cy="336" rx="22" ry="12" fill="#fff"/></g>
    <g class="anim-nuvem" opacity=".85" style="animation-delay:-14s"><ellipse cx="330" cy="430" rx="30" ry="14" fill="#fff"/><ellipse cx="356" cy="426" rx="18" ry="10" fill="#fff"/></g>
  </svg>`},
  festa(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="rpDisco" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#fff"/><stop offset="60%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#64748b"/></radialGradient></defs>
    <line x1="200" y1="0" x2="200" y2="66" stroke="#94a3b8" stroke-width="2"/><circle cx="200" cy="88" r="26" fill="url(#rpDisco)"/>
    <g fill="#0f172a" opacity=".2">${Array.from({length:16}).map((_,i)=>`<rect x="${184+(i%4)*10}" y="${74+Math.floor(i/4)*10}" width="5" height="5"/>`).join('')}</g>
    <g opacity=".92"><ellipse cx="58" cy="200" rx="26" ry="32" fill="#f472b6"/><line x1="58" y1="232" x2="58" y2="272" stroke="#f472b6" stroke-width="2"/></g>
    <g opacity=".92"><ellipse cx="342" cy="240" rx="24" ry="30" fill="#22d3ee"/><line x1="342" y1="270" x2="342" y2="308" stroke="#22d3ee" stroke-width="2"/></g>
    <g opacity=".92"><ellipse cx="112" cy="120" rx="20" ry="25" fill="#facc15"/><line x1="112" y1="145" x2="112" y2="178" stroke="#facc15" stroke-width="2"/></g>
  </svg>`},
  quarto(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <rect x="130" y="60" width="140" height="150" rx="10" fill="#fff" opacity=".5" stroke="#e9d5ff" stroke-width="4"/>
    <line x1="200" y1="60" x2="200" y2="210" stroke="#e9d5ff" stroke-width="3"/><line x1="130" y1="135" x2="270" y2="135" stroke="#e9d5ff" stroke-width="3"/>
    <path d="M130 60Q118 140 130 210" fill="none" stroke="#f0abfc" stroke-width="10" opacity=".6"/>
    <path d="M270 60Q282 140 270 210" fill="none" stroke="#f0abfc" stroke-width="10" opacity=".6"/>
    <g fill="#fbbf24">${[[150,90],[175,105],[195,80],[220,100],[245,88]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>
    <rect x="30" y="480" width="130" height="14" rx="6" fill="#e9d5ff"/>
    <circle cx="55" cy="466" r="16" fill="#f9a8d4"/><rect x="90" y="455" width="24" height="28" rx="4" fill="#c4b5fd"/><circle cx="135" cy="470" r="12" fill="#fde68a"/>
  </svg>`},
  mario(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <g class="anim-nuvem" opacity=".92"><ellipse cx="90" cy="90" rx="38" ry="20" fill="#fff"/><ellipse cx="118" cy="88" rx="26" ry="15" fill="#fff"/></g>
    <rect x="40" y="480" width="60" height="60" fill="#16a34a" stroke="#78350f" stroke-width="6"/><rect x="34" y="460" width="72" height="22" fill="#22c55e" stroke="#78350f" stroke-width="6"/>
    <g>${[0,1,2].map(i=>`<rect x="${200+i*56}" y="380" width="44" height="44" fill="#f59e0b" stroke="#78350f" stroke-width="4"/><text x="${222+i*56}" y="410" font-size="24" font-weight="900" fill="#fff" text-anchor="middle">?</text>`).join('')}</g>
    <circle cx="332" cy="150" r="6" fill="#fde047"/><circle cx="348" cy="140" r="4" fill="#fde047"/>
  </svg>`},
  dino(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <path d="M300 220 L342 380 H258Z" fill="#78350f"/><path d="M300 220 L320 262 L280 262Z" fill="#f97316"/><circle cx="300" cy="215" r="6" fill="#fbbf24"/>
    <g fill="#166534">${[[60,380],[100,360],[150,390]].map(([x,y])=>`<path d="M${x} ${y}Q${x-10} ${y-60} ${x} ${y-90}Q${x+10} ${y-60} ${x} ${y}Z"/>`).join('')}</g>
    <g fill="#a3e635" opacity=".8"><ellipse cx="200" cy="560" rx="18" ry="12"/><ellipse cx="230" cy="565" rx="16" ry="11"/><ellipse cx="215" cy="545" rx="14" ry="10"/></g>
  </svg>`},
  princesa(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="rpTorre" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fbcfe8"/><stop offset="100%" stop-color="#f9a8d4"/></linearGradient></defs>
    <rect x="60" y="320" width="60" height="150" fill="url(#rpTorre)"/><path d="M60 320 L90 270 L120 320Z" fill="#e879f9"/><rect x="86" y="230" width="8" height="42" fill="#fff"/><g class="anim-bandeira"><path d="M94 230 L114 240 L94 250Z" fill="#f472b6"/></g>
    <rect x="280" y="300" width="70" height="170" fill="url(#rpTorre)"/><path d="M280 300 L315 245 L350 300Z" fill="#e879f9"/><rect x="310" y="200" width="8" height="46" fill="#fff"/><g class="anim-bandeira"><path d="M318 200 L340 211 L318 222Z" fill="#f472b6"/></g>
    <rect x="150" y="350" width="110" height="120" fill="#fdf2f8" stroke="#f9a8d4" stroke-width="4"/>
    <g fill="#fff" opacity=".9">${[[40,90,9],[340,140,7],[200,60,6]].map(([x,y,s])=>`<path d="M${x} ${y-s} L${x+s*.3} ${y-s*.3} L${x+s} ${y} L${x+s*.3} ${y+s*.3} L${x} ${y+s} L${x-s*.3} ${y+s*.3} L${x-s} ${y} L${x-s*.3} ${y-s*.3}Z"/>`).join('')}</g>
  </svg>`},
  aniversario(){return `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
    <linearGradient id="rpFaixaAniv" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#a78bfa"/></linearGradient>
    <linearGradient id="rpBoloAniv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>
    </defs>
    <path d="M10 46 Q200 10 390 46" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>
    <g>${Array.from({length:11}).map((_,i)=>{const t=i/10,x=10+t*380,yBase=46-Math.sin(t*Math.PI)*36,cores=['#f472b6','#fbbf24','#4ade80','#38bdf8','#a78bfa'],cor=cores[i%cores.length];return `<path d="M${x-8} ${yBase} L${x+8} ${yBase} L${x} ${yBase+16}Z" fill="${cor}"/>`;}).join('')}</g>
    <g class="anim-balao"><ellipse cx="55" cy="175" rx="24" ry="30" fill="#f472b6"/><path d="M55 205v70" stroke="#f472b6" stroke-width="1.5" fill="none"/><path d="M50 172a6 8 0 0 1 5 -10" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/></g>
    <g class="anim-balao" style="animation-delay:-1.4s"><ellipse cx="95" cy="152" rx="20" ry="26" fill="#fbbf24"/><path d="M95 178v60" stroke="#fbbf24" stroke-width="1.5" fill="none"/></g>
    <g class="anim-balao" style="animation-delay:-2.6s"><ellipse cx="32" cy="216" rx="17" ry="22" fill="#4ade80"/><path d="M32 238v54" stroke="#4ade80" stroke-width="1.5" fill="none"/></g>
    <g class="anim-balao" style="animation-delay:-.8s"><ellipse cx="345" cy="163" rx="24" ry="30" fill="#38bdf8"/><path d="M345 193v66" stroke="#38bdf8" stroke-width="1.5" fill="none"/></g>
    <g class="anim-balao" style="animation-delay:-2s"><ellipse cx="305" cy="142" rx="19" ry="25" fill="#a78bfa"/><path d="M305 167v58" stroke="#a78bfa" stroke-width="1.5" fill="none"/></g>
    <g class="anim-balao" style="animation-delay:-3.2s"><ellipse cx="370" cy="208" rx="16" ry="21" fill="#fb7185"/><path d="M370 229v50" stroke="#fb7185" stroke-width="1.5" fill="none"/></g>
    <g transform="translate(200,120)"><path d="M-150 -22 L150 -22 L136 0 L150 22 L-150 22 L-136 0Z" fill="url(#rpFaixaAniv)" opacity=".94"/>
    <text x="0" y="-2" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="900" fill="#fff" style="paint-order:stroke" stroke="#831843" stroke-width="1">FELIZ ANIVERSÁRIO</text>
    <text x="0" y="17" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="900" fill="#fef08a" style="paint-order:stroke" stroke="#831843" stroke-width="1">VIVA! 🎉</text></g>
    <g>${[[40,270,'#f472b6',0],[382,95,'#4ade80',30],[225,58,'#38bdf8',15],[132,258,'#fbbf24',45],[300,266,'#a78bfa',10],[70,64,'#fb7185',60],[360,248,'#fde047',20]].map(([x,y,cor,rot])=>`<rect x="${x}" y="${y}" width="8" height="8" rx="2" fill="${cor}" transform="rotate(${rot} ${x} ${y})"/>`).join('')}</g>
    <g transform="translate(200,0)">
    <ellipse cx="0" cy="650" rx="90" ry="14" fill="#000" opacity=".12"/>
    <rect x="-70" y="580" width="140" height="60" rx="10" fill="url(#rpBoloAniv)"/>
    <rect x="-52" y="540" width="104" height="46" rx="10" fill="#fda4af"/>
    <path d="M-70 580q17 -14 34 0t34 0 34 0 34 0" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    <path d="M-52 540q13 -12 26 0t26 0 26 0 26 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    <g>${[-30,0,30].map(x=>`<rect x="${x-2}" y="512" width="4" height="28" fill="#fef08a"/><g class="anim-vela" style="transform-origin:${x}px 512px"><path d="M${x} 512q-6 -10 0 -18q6 8 0 18Z" fill="#f97316"/></g>`).join('')}</g>
    </g>
    <g class="lingua-sogra" style="pointer-events:auto;cursor:pointer" onclick="soprarLinguaDeSogra(this)" transform="translate(90,600)">
    <circle r="28" fill="#fff" opacity="0"/>
    <path d="M0 0 L-12 22 L12 22Z" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/><circle cy="22" r="4" fill="#f472b6"/>
    <path class="tongue" d="M0 22 q14 -22 0 -42 q-14 20 0 42Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.5" style="transform-origin:0px 22px;transition:transform .4s cubic-bezier(.34,1.56,.64,1)"/>
    </g>
    <g class="lingua-sogra" style="pointer-events:auto;cursor:pointer" onclick="soprarLinguaDeSogra(this)" transform="translate(310,600) scale(-1,1)">
    <circle r="28" fill="#fff" opacity="0"/>
    <path d="M0 0 L-12 22 L12 22Z" fill="#4ade80" stroke="#166534" stroke-width="1.5"/><circle cy="22" r="4" fill="#38bdf8"/>
    <path class="tongue" d="M0 22 q14 -22 0 -42 q-14 20 0 42Z" fill="#f472b6" stroke="#9d174d" stroke-width="1.5" style="transform-origin:0px 22px;transition:transform .4s cubic-bezier(.34,1.56,.64,1)"/>
    </g>
    <text x="200" y="672" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#fff" opacity=".85">toque nas linguinhas de festa 🎈</text>
  </svg>`}
};
let ultimoFundoParticulas=null;
function renderizarDetalhesCenario(fundoId){
  const el=document.getElementById('cenario-detalhes');
  if(!el)return;
  const fn=DETALHES_CENARIO[fundoId];
  el.innerHTML=fn?fn():'';
}
function renderizarParticulasCenario(fundoId){
  if(fundoId===ultimoFundoParticulas)return;
  ultimoFundoParticulas=fundoId;
  const c=document.getElementById('particulas-cenario');
  if(!c)return;
  c.innerHTML='';
  renderizarDetalhesCenario(fundoId);
  const cfg=CONFIG_PARTICULAS[fundoId];
  if(!cfg)return;
  for(let i=0;i<cfg.qtd;i++){
    const el=document.createElement('div');
    el.className='particula modo-'+cfg.modo;
    el.textContent=cfg.emojis[Math.floor(Math.random()*cfg.emojis.length)];
    const tamanho=12+Math.random()*14;
    el.style.fontSize=tamanho+'px';
    const duracao=(cfg.modo==='piscar'?2:6)+Math.random()*(cfg.modo==='piscar'?3:8);
    el.style.animationDuration=duracao.toFixed(2)+'s';
    el.style.animationDelay=(-Math.random()*duracao).toFixed(2)+'s';
    if(cfg.modo==='piscar'){
      el.style.left=(Math.random()*96)+'%';
      el.style.top=(Math.random()*90)+'%';
    }else if(cfg.modo==='lateral'){
      el.style.top=(Math.random()*70)+'%';
    }else{
      el.style.left=(Math.random()*96)+'%';
      el.style.top='0';
    }
    c.appendChild(el);
  }
}
let camadaFundoAtiva='a';
function aplicarFundoTela(id){
  const cls='cenario-'+(id||'ceu');
  document.body.classList.forEach(c=>{if(c.startsWith('cenario-'))document.body.classList.remove(c)});
  document.body.classList.add(cls);
  const la=document.getElementById('bg-layer-a'),lb=document.getElementById('bg-layer-b');
  if(!la||!lb)return;
  const proxima=camadaFundoAtiva==='a'?lb:la,atual=camadaFundoAtiva==='a'?la:lb;
  proxima.className='bg-layer '+cls;
  requestAnimationFrame(()=>{
    proxima.classList.add('ativa');
    atual.classList.remove('ativa');
  });
  camadaFundoAtiva=camadaFundoAtiva==='a'?'b':'a';
  ultimoFundoParticulas=null;
  renderizarParticulasCenario(id||'ceu');
}
function aplicarTemaInterface(){
  const tema=TEMAS_INTERFACE.find(t=>t.id===estado.temaInterfaceAtual && (!t.fundo||(estado.fundosComprados||[]).includes(t.fundo)))||TEMAS_INTERFACE[0];
  document.body.classList.forEach(c=>{if(c.startsWith('tema-'))document.body.classList.remove(c)});
  document.body.classList.add('tema-'+tema.id);
  document.querySelectorAll('.bottom-buttons .btn-icon').forEach((el,i)=>{if(tema.icons[i])el.textContent=tema.icons[i]});
}
function obterDadosPetAtual(){
  if(!estado.pets[estado.petAtual])estado.pets[estado.petAtual]={nivel:1,xp:0,felicidade:100,saude:100};
  const dados=estado.pets[estado.petAtual];
  // Perfis anteriores já exibiam a fase 2 automaticamente. Preserve a forma alcançada.
  if(estado.petAtual==='gato' && dados.faseConfirmada==null)dados.faseConfirmada=(Number(dados.nivel)||1)>=21?2:1;
  return dados;
}
function nivelJogador(){return Math.max(...Object.keys(PETS).map(id=>Number(estado.pets?.[id]?.nivel)||1))}
function calcularFase(n){
  if(estado.petAtual==='axolote')return n>=41?3:n>=21?2:1;
  if(estado.petAtual==='gato'){
    const confirmou=Number(estado.pets?.gato?.faseConfirmada)||1;
    if(n<21 || confirmou<2)return 1;
    return n>=41?3:2;
  }
  return n>=81?5:n>=61?4:n>=41?3:n>=21?2:1;
}
function alternarDetalhesEvolucao(){
  const detalhes=document.getElementById('evo-progresso');
  const botao=document.getElementById('btn-nivel-evolucao');
  if(!detalhes || !botao)return;
  detalhes.hidden=!detalhes.hidden;
  botao.setAttribute('aria-expanded',String(!detalhes.hidden));
  botao.setAttribute('aria-label',detalhes.hidden?'Mostrar detalhes da próxima evolução':'Ocultar detalhes da próxima evolução');
}
function atualizarBotaoEvolucao(){
  const botao=document.getElementById('btn-evoluir-gato');
  if(!botao)return;
  botao.hidden=estado.petAtual!=='gato' || (Number(estado.pets?.gato?.nivel)||1)<21 || (Number(estado.pets?.gato?.faseConfirmada)||1)>=2;
}
let evolucaoEmAndamento=false;
function iniciarEvolucaoGato(){
  if(evolucaoEmAndamento || estado.petAtual!=='gato' || (Number(estado.pets?.gato?.nivel)||1)<21 || (Number(estado.pets?.gato?.faseConfirmada)||1)>=2)return;
  const overlay=document.getElementById('animacao-evolucao-gato');
  const imagem=document.getElementById('imagem-evolucao-gato');
  const botao=document.getElementById('btn-evoluir-gato');
  if(!overlay || !imagem)return;
  const criancaId=estado.criancaAtivaId;
  evolucaoEmAndamento=true;
  botao.disabled=true;
  overlay.hidden=false;
  imagem.hidden=false;
  imagem.alt='O ovo-gato se transformando no Gato Cavalheiro';
  let finalizado=false;
  function concluir(){
    if(finalizado)return;
    finalizado=true;
    overlay.hidden=true;
    imagem.onload=null;imagem.onerror=null;
    imagem.removeAttribute('src');
    evolucaoEmAndamento=false;
    botao.disabled=false;
    if(estado.criancaAtivaId!==criancaId || estado.petAtual!=='gato')return;
    const dados=estado.pets.gato;
    if((Number(dados.nivel)||1)<21 || (Number(dados.faseConfirmada)||1)>=2)return;
    dados.faseConfirmada=2;
    salvar();
    atualizarTela();
    celebrarEvolucaoPet(2);
  }
  imagem.onload=()=>setTimeout(concluir,4300);
  imagem.onerror=()=>{
    imagem.hidden=true;
    mostrarToast('Animação indisponível; evoluindo o pet.');
    setTimeout(concluir,1200);
  };
  imagem.src='animacoes/evolucao_fase1_fase2.webp?v=1';
}
function renderizarProgressoEvolucao(){
  const el=document.getElementById('evo-progresso');
  if(!el)return;
  const d=PETS[estado.petAtual],p=obterDadosPetAtual(),fase=calcularFase(p.nivel);
  const atual=d.evolucoes[fase-1];
  const prox=d.evolucoes[fase];
  if(!prox){
    el.innerHTML=`<div class="evo-progresso-top"><strong>👑 Evolução máxima</strong><span>Fase ${fase}/${d.evolucoes.length}</span></div><div class="evo-progresso-bar"><div class="evo-progresso-fill" style="width:100%"></div></div><small>${esc(atual.desc)} · continue cuidando para manter seu pet brilhando!</small>`;
    return;
  }
  const base=atual.nivel,alvo=prox.nivel;
  const perc=Math.max(0,Math.min(100,Math.round(((p.nivel-base)/(alvo-base))*100)));
  const falta=Math.max(0,alvo-p.nivel);
  el.innerHTML=`<div class="evo-progresso-top"><strong>✨ Próxima: ${esc(prox.nome)}</strong><span>Nv. ${p.nivel}/${alvo}</span></div><div class="evo-progresso-bar"><div class="evo-progresso-fill" style="width:${perc}%"></div></div><small>${falta?`Faltam ${falta} níveis`:'Evolução pronta!'} · ${esc(prox.desc)}</small>`;
}
function celebrarEvolucaoPet(fase){
  const d=PETS[estado.petAtual],ev=d.evolucoes[fase-1];
  if(!ev)return;
  const pet=document.getElementById('pet-principal');
  const aura=document.getElementById('evolucao-aura');
  if(pet){pet.classList.remove('pet-evolucao-pulse');void pet.offsetWidth;pet.classList.add('pet-evolucao-pulse');setTimeout(()=>pet.classList.remove('pet-evolucao-pulse'),1000)}
  if(aura){aura.classList.remove('ativa');void aura.offsetWidth;aura.classList.add('ativa');setTimeout(()=>aura.classList.remove('ativa'),1700)}
  let box=document.getElementById('evo-unlock');
  if(!box){box=document.createElement('div');box.id='evo-unlock';box.className='evo-unlock';document.body.appendChild(box)}
  box.innerHTML=`<span class="evo-emoji">🌟</span><b>Nova evolução!</b><strong>${esc(ev.nome)}</strong><span>${esc(ev.desc)} · Nível ${ev.nivel}</span>`;
  box.classList.remove('show');void box.offsetWidth;box.classList.add('show');
  dispararConfetes(180,CORES_CONFETE_PET[estado.petAtual]);
  navigator.vibrate?.([60,40,100,40,160]);
  mostrarToast(`🌟 ${ev.nome} desbloqueado!`);
}
function atualizarTela(){
  window.verificarMarcosGestos?.();
  aplicarPalcoPet();
  const def=PETS[estado.petAtual],p=obterDadosPetAtual(),fase=calcularFase(p.nivel);
  window.atualizarMiniPetCompanheiro?.();
  window.renderizarDecoracao?.();
  atualizarAtalhoPerfilCrianca();
  document.getElementById('txt-moedas').textContent=estado.moedas;
  const dinheiro=(estado.dinheiroAcumulado||0).toFixed(2).replace('.',',');
  document.getElementById('txt-dinheiro').textContent=dinheiro;
  const mesadaAtiva=estado.mesadaAtiva!==false;
  document.getElementById('topo-mesada').hidden=!mesadaAtiva;
  document.body.classList.toggle('mesada-desativada',!mesadaAtiva);
  document.getElementById('card-cofrinho').hidden=!mesadaAtiva;
  document.getElementById('txt-painel-disponivel').textContent=dinheiro;
  document.getElementById('txt-total-pago').textContent=(estado.totalSacado||0).toFixed(2).replace('.',',');
  document.getElementById('texto-taxa-atual').textContent=(estado.taxaCambio||.01).toFixed(2).replace('.',',');
  
  const streakVal=Number(estado.streak)||0;
  document.getElementById('txt-streak').textContent=streakVal;
  const btnStreak=document.getElementById('btn-pill-streak');
  if(btnStreak)btnStreak.classList.toggle('streak-fogo',streakVal>=3);
  document.getElementById('numero-nivel').textContent=p.nivel;
  const nivelHud=document.getElementById('hud-nivel');
  if(nivelHud)nivelHud.textContent=p.nivel;
  document.getElementById('texto-xp').textContent=`${p.xp}/100`;
  document.getElementById('barra-xp').style.width=p.xp+'%';
  document.getElementById('btn-pet-atual').textContent=def.emoji;
  document.getElementById('pet-svg-container').innerHTML=`<div class="camada-pet">${petSVG(estado.petAtual,fase)}</div><div class="camada-acessorio" id="camada-acessorio"></div>`;
  const petWrap=document.getElementById('pet-principal');
  if(petWrap)petWrap.className='cat-wrapper pet-tipo-'+estado.petAtual+(petWrap.classList.contains('gato-laranja-pronto')?' gato-laranja-pronto':'');
  
  document.getElementById('pet-evol-nome').textContent=`${def.nome} • ${def.evolucoes[fase-1].nome}`;
  renderizarProgressoEvolucao();
  atualizarBotaoEvolucao();
  const modalNome=document.getElementById('modal-pet-evol-nome');
  if(modalNome)modalNome.textContent=estado.nomePet||def.nome;
  document.getElementById('input-idade-crianca').value=estado.idadeCrianca||7;
  document.getElementById('input-dificuldade-jogos').value=estado.dificuldadeJogos||'auto';
  document.getElementById('input-taxa-cambio').value=estado.taxaCambio;
  
  document.querySelectorAll('.opcao-pet').forEach(el=>{
    const tipo=el.dataset.pet,ok=nivelJogador()>=PETS[tipo].desbloqueioNivel;
    el.classList.toggle('ativo',tipo===estado.petAtual);
    el.classList.toggle('bloqueado',!ok);
    el.querySelector('.lock-mini')?.remove();
    if(!ok){const s=document.createElement('span');s.className='lock-mini';s.textContent='🔒';el.appendChild(s)}
  });
  aplicarFundoTela(estado.fundoAtual);
  aplicarTemaInterface();
  atualizarHumorPet(p);
  renderizarAcessorioNoContainer();
  renderizarTarefas();
  renderizarEvolucoes();
  renderizarConquistas();
  atualizarEstatisticas();
  mostrarAprovacoesParaCrianca();
}
function mostrarAprovacoesParaCrianca(){
  if(perfilAtivo!=='crianca'||!Array.isArray(estado.avisosMissao)||!estado.avisosMissao.length)return;
  const avisos=estado.avisosMissao.splice(0);
  salvar();
  playSound('tarefa');
  window.acaoGatoLaranja?.('comemoracao');
  animarPetToque(null);
  dispararConfetes(100,CORES_CONFETE_PET[estado.petAtual]);
  const mensagem=avisos.length===1?`${avisos[0]} foi aprovada! Você ganhou sua recompensa!`:`${avisos.length} missões aprovadas! Suas recompensas chegaram!`;
  mostrarBalaoFala(mensagem,4200);
  mostrarToast(`🎉 ${mensagem}`);
}
function estaDormindoAgora(){
  const h=new Date().getHours();
  return h>=21||h<6;
}
function atualizarHumorPet(p){
  const wrap=document.getElementById('pet-principal');
  if(!wrap)return;
  wrap.classList.remove('mood-feliz','mood-triste','mood-doente','pet-dormindo');
  if(estaDormindoAgora()){
    wrap.classList.add('pet-dormindo');
    if(Math.random()<.5)criarTextoFlutuanteZzz();
  }else if(p.saude<40){
    wrap.classList.add('mood-doente');
  }else if(p.felicidade>=70){
    wrap.classList.add('mood-feliz');
  }else if(p.felicidade<35){
    wrap.classList.add('mood-triste');
  }
}
function criarTextoFlutuanteZzz(){
  const area=document.getElementById('pet-section-area');
  if(!area)return;
  const s=document.createElement('div');
  s.className='zzz-flutuante';
  s.textContent='💤';
  s.style.left='58%';
  s.style.top='20%';
  area.appendChild(s);
  setTimeout(()=>s.remove(),2700);
}
const FALAS_PET={
  geral:['Você consegue! 💜','Vamos fazer essa missão juntos?','Estou torcendo por você! ⭐','Que tal uma nova aventura? ⚡','Você está cuidando muito bem da sua rotina!','Vamos completar o desafio de hoje?'],
  carinho:['Adorei o carinho! 🥰','Meu coração ficou quentinho! 💕','Fiquei muito feliz!','Purr... que gostoso!'],
  alimentar:['Que delícia! 😋','Obrigado pelo lanchinho!','Estou cheio e feliz!','Energia recarregada! 🍖'],
  brincar:['Vamos brincar? 🎾','Essa aventura foi divertida!','De novo, de novo!','Sou o mais rápido!'],
  dormir:['Zzz... hora de descansar 😴','Boa noite! 🌙','Até amanhã, campeão!','Sonhando com novas aventuras!'],
  manha:['Bom dia! Vamos começar? ☀️','Acordei cheio de energia!','Hoje vai ser um dia incrível!'],
  noite:['Já está ficando tarde... 🌙','Vamos terminar e descansar?','Boa noite, campeão!'],
  triste:['Vamos tentar juntos?','Todo desafio fica mais fácil com carinho 💙','Estou aqui com você!'],
  doente:['Preciso de um cuidadinho... 🤢','Um remédio ajudaria','Cuide de mim, por favor'],
  aposTarefa:['Mandou bem na missão! 🏆','Que orgulho de você!','Missão concluída! Continue assim!','Uau, você caprichou! ⭐']
};
function escolherFalaContextual(tipo){
  const h=new Date().getHours();
  const p=obterDadosPetAtual();
  let pool=FALAS_PET.geral;
  if(tipo&&FALAS_PET[tipo])pool=FALAS_PET[tipo];
  else if(p.saude<40)pool=FALAS_PET.doente;
  else if(p.felicidade<35)pool=FALAS_PET.triste;
  else if(h>=21||h<6)pool=FALAS_PET.noite;
  else if(h>=6&&h<11)pool=FALAS_PET.manha;
  return pool[Math.floor(Math.random()*pool.length)];
}
let timerBalaoFala=null;
function mostrarBalaoFala(texto,duracaoMs=2600){
  const el=document.getElementById('balao-fala');
  if(!el)return;
  el.textContent=texto;
  el.classList.add('mostrar');
  clearTimeout(timerBalaoFala);
  timerBalaoFala=setTimeout(()=>el.classList.remove('mostrar'),duracaoMs);
}
function agendarFalaAleatoria(){
  const espera=28000+Math.random()*40000;
  setTimeout(()=>{
    if(document.getElementById('modal-selecao-perfil')?.classList.contains('mostrar')){agendarFalaAleatoria();return}
    if(document.querySelector('.modal-overlay.mostrar')){agendarFalaAleatoria();return}
    mostrarBalaoFala(escolherFalaContextual());
    agendarFalaAleatoria();
  },espera);
}
let debounceAcao=false;
function obterVolumeSom(){
  if(estado.sonsAtivos===false)return 0;
  const v=Number(estado.volumeSom);
  return Number.isFinite(v)?Math.max(0,Math.min(1,v)):0.55;
}
let audioPetEmReproducao=null;
function tocarAudioPet(url){
  const vol=obterVolumeSom();
  if(vol<=0.01)return;
  audioPetEmReproducao?.pause();
  if(estado.vozSalva){
    const a=new Audio(estado.vozSalva);
    audioPetEmReproducao=a;
    a.volume=vol;
    window.gatoLaranjaAudio?.(a);
    a.play().catch(()=>{});
    return;
  }
  if(!url){playSound('pet');return}
  try{const a=new Audio(url);audioPetEmReproducao=a;a.volume=vol;a.play().catch(()=>{})}catch(e){}
}
function registrarLogAtividade(texto){
  estado.logAtividades=Array.isArray(estado.logAtividades)?estado.logAtividades:[];
  estado.logAtividades.unshift({t:Date.now(),txt:String(texto).slice(0,120)});
  if(estado.logAtividades.length>40)estado.logAtividades.length=40;
}
function interagirComPet(e){
  if(debounceAcao)return;
  debounceAcao=true;
  setTimeout(()=>debounceAcao=false,280);
  const d=obterDadosPetAtual();
  d.felicidade=Math.min(100,d.felicidade+5);
  tocarAudioPet(PETS[estado.petAtual].som);
  navigator.vibrate?.(25);
  criarTextoFlutuante('❤️ +5',e);
  animarPetToque(e);
  if(Math.random()<.55)mostrarBalaoFala(escolherFalaContextual('carinho'));
  else mostrarToast(`❤️ ${PETS[estado.petAtual].nome} adorou!`);
  salvar();
  atualizarTela();
  animarMoedasBump();
}
function acaoPet(tipo){
  if(debounceAcao)return;
  const agora=Date.now();
  estado.ultimoAcaoPet=estado.ultimoAcaoPet||{};
  const ultimo=Number(estado.ultimoAcaoPet[tipo])||0;
  const cooldownMs={alimentar:45000,brincar:35000,dormir:90000}[tipo]||30000;
  if(agora-ultimo<cooldownMs){
    const seg=Math.ceil((cooldownMs-(agora-ultimo))/1000);
    return mostrarToast(`⏳ Aguarde ${seg}s para ${tipo} de novo`);
  }
  debounceAcao=true;
  setTimeout(()=>debounceAcao=false,400);
  const d=obterDadosPetAtual();
  const nome=estado.nomePet||PETS[estado.petAtual].nome;
  estado.ultimoAcaoPet[tipo]=agora;
  if(tipo==='alimentar'){
    d.felicidade=Math.min(100,d.felicidade+12);
    d.saude=Math.min(100,d.saude+8);
    criarTextoFlutuante('🍖 +12',null);
    mostrarBalaoFala(escolherFalaContextual('alimentar'));
    mostrarToast(`🍖 ${nome} comeu e ficou mais feliz!`);
  }else if(tipo==='brincar'){
    d.felicidade=Math.min(100,d.felicidade+15);
    ganharXP(2);
    criarTextoFlutuante('🎾 +15',null);
    mostrarBalaoFala(escolherFalaContextual('brincar'));
    mostrarToast(`🎾 ${nome} adorou brincar! +2 XP`);
  }else if(tipo==='dormir'){
    d.felicidade=Math.min(100,d.felicidade+6);
    d.saude=Math.min(100,d.saude+12);
    criarTextoFlutuante('😴 +saúde',null);
    mostrarBalaoFala(escolherFalaContextual('dormir'));
    mostrarToast(`😴 ${nome} descansou e recuperou saúde!`);
    const wrap=document.getElementById('pet-principal');
    if(wrap){wrap.classList.add('pet-dormindo');setTimeout(()=>wrap.classList.remove('pet-dormindo'),2500)}
    criarTextoFlutuanteZzz();
  }
  tocarAudioPet(PETS[estado.petAtual].som);
  navigator.vibrate?.(30);
  animarPetToque(null,tipo);
  salvar();
  atualizarTela();
}
function aplicarDecayPet(){
  const agora=Date.now();
  const ultimo=Number(estado.ultimoDecay)||agora;
  const horas=Math.min(12,(agora-ultimo)/3600000);
  if(horas<0.25)return;
  estado.ultimoDecay=agora;
  const p=obterDadosPetAtual();
  if(!p)return;
  // Decaimento suave: ~3 felicidade e ~1.5 saúde por hora (capado)
  const perdaFel=Math.floor(horas*3);
  const perdaSaude=Math.floor(horas*1.5);
  if(perdaFel>0)p.felicidade=Math.max(5,p.felicidade-perdaFel);
  if(perdaSaude>0)p.saude=Math.max(10,p.saude-perdaSaude);
  salvar();
  atualizarTela();
}
function animarPetToque(e,tipo='carinho'){
  const wrap=document.getElementById('pet-principal');
  const stage=document.querySelector('.pet-stage');
  if(wrap){
    wrap.classList.remove('pet-bounce');
    void wrap.offsetWidth;
    wrap.classList.add('pet-bounce');
    setTimeout(()=>wrap.classList.remove('pet-bounce'),600);
  }
  if(stage){
    stage.classList.remove('stage-react');
    void stage.offsetWidth;
    stage.classList.add('stage-react');
    setTimeout(()=>stage.classList.remove('stage-react'),750);
  }
  if(tipo==='carinho')dispararHeartsBurst(e);
  else dispararEfeitoPet(tipo);
}
function dispararEfeitoPet(tipo){
  const area=document.getElementById('pet-section-area');
  if(!area)return;
  const simbolos={
    brincar:['🎾','🐾','⭐','✨','🎾','🐾'],
    alimentar:['🍎','🍓','🍪','✨','🍏','💛'],
    dormir:['🌙','⭐','💤','✨','🌙','⭐'],
    comemoracao:['🎉','✨','⭐','🎊','💫','🎉'],
    giro:['🌀','✨','⭐','💫','🌀','✨'],
    espiar:['👀','❔','💭','✨','👀','❔'],
    brilho:['✨','💫','⭐','✨','🌟','💫'],
    risada:['😄','✨','💛','😄','⭐','✨']
  }[tipo];
  if(!simbolos)return;
  const host=document.createElement('div');
  host.className='pet-reaction-burst pet-reaction-'+tipo;
  host.setAttribute('aria-hidden','true');
  for(let i=0;i<simbolos.length;i++){
    const el=document.createElement('i');
    const ang=(-155+Math.random()*130)*Math.PI/180;
    const dist=38+Math.random()*58;
    el.textContent=simbolos[i];
    el.style.setProperty('--dx',Math.cos(ang)*dist+'px');
    el.style.setProperty('--dy',(-Math.abs(Math.sin(ang))*dist-12)+'px');
    el.style.setProperty('--rot',(-25+Math.random()*50)+'deg');
    el.style.setProperty('--delay',(Math.random()*.12)+'s');
    host.appendChild(el);
  }
  area.appendChild(host);
  setTimeout(()=>host.remove(),1250);
  if(tipo==='comemoracao'||tipo==='brilho'){
    const wrap=document.getElementById('pet-principal');
    if(wrap){wrap.classList.remove('pet-reacao-pulinho');void wrap.offsetWidth;wrap.classList.add('pet-reacao-pulinho');setTimeout(()=>wrap.classList.remove('pet-reacao-pulinho'),700)}
    dispararConfetes(48,CORES_CONFETE_PET[estado.petAtual]);
  }
}
function dispararHeartsBurst(e){
  const area=document.getElementById('pet-section-area');
  if(!area)return;
  const host=document.createElement('div');
  host.className='heart-burst';
  const areaRect=area.getBoundingClientRect();
  const petRect=document.getElementById('pet-principal')?.getBoundingClientRect();
  if(petRect){
    host.style.left=(petRect.left+petRect.width/2-areaRect.left)+'px';
    const beijoGato=estado?.petAtual==='gato';
    host.style.top=(petRect.top+petRect.height*(beijoGato?.94:.34)-areaRect.top)+'px';
  }else if(e&&Number.isFinite(e.clientX)&&Number.isFinite(e.clientY)){
    host.style.left=(e.clientX-areaRect.left)+'px';
    host.style.top=(e.clientY-areaRect.top)+'px';
  }
  const beijoGato=estado?.petAtual==='gato';
  const hearts=['❤️','💖','💕','💗','💜'];
  for(let i=0;i<(beijoGato?16:18);i++){
    const el=document.createElement('i');
    const ang=(-165+Math.random()*150)*Math.PI/180;
    const dist=beijoGato?38+Math.random()*22:70+Math.random()*95;
    el.textContent=hearts[i%hearts.length];
    el.style.setProperty('--dx',Math.cos(ang)*dist+'px');
    el.style.setProperty('--dy',(-Math.abs(Math.sin(ang))*dist-30)+'px');
    el.style.setProperty('--rot',(-35+Math.random()*70)+'deg');
    el.style.setProperty('--dur',(.95+Math.random()*.55)+'s');
    el.style.animationDelay=(Math.random()*.42)+'s';
    el.style.fontSize=(beijoGato?12+Math.random()*7:16+Math.random()*13)+'px';
    host.appendChild(el);
  }
  area.appendChild(host);
  setTimeout(()=>host.remove(),2200);
}
function animarMoedasBump(){
  const coin=document.querySelector('.coin-dot');
  const txt=document.getElementById('txt-moedas');
  if(coin){
    coin.classList.remove('spin');
    void coin.offsetWidth;
    coin.classList.add('spin');
    setTimeout(()=>coin.classList.remove('spin'),650);
  }
  if(txt){
    txt.classList.remove('bump');
    void txt.offsetWidth;
    txt.classList.add('bump');
    setTimeout(()=>txt.classList.remove('bump'),500);
  }
}
function abrirSurpresaDia(){
  const hoje=hojeLocal();
  if(estado.surpresaResgatadaData===hoje)return;
  const moedas=1+Math.floor(Math.random()*4);
  const xpBonus=Math.random()<.4?3:0;
  estado.surpresaResgatadaData=hoje;
  estado.moedas+=moedas;
  registrarNoRelatorioDiario(0,moedas);
  if(xpBonus)ganharXP(xpBonus);
  const p=obterDadosPetAtual();
  if(p)p.felicidade=Math.min(100,p.felicidade+8);
  salvar();
  atualizarTela();
  dispararConfetes();
  somConquista();
  const extra=xpBonus?` e +${xpBonus} XP`:'' ;
  mostrarAviso('🎁','Surpresa do dia!',`Você ganhou +${moedas} moeda(s)${extra}! O pet ficou mais feliz. Volte amanhã!`);
}

// ===== Eventos sazonais =====
const EVENTOS_SAZONAIS=[
  {id:'carnaval',nome:'Carnaval',emoji:'🎊',mesInicio:2,diaInicio:10,mesFim:3,diaFim:5,fundoId:'festa',desc:'É tempo de festa! Complete missões e ganhe bônus coloridos.',bonusMoedas:3,bonusXp:5},
  {id:'pascoa',nome:'Páscoa',emoji:'🐰',mesInicio:3,diaInicio:20,mesFim:4,diaFim:25,fundoId:'fazenda',desc:'Caça aos ovos virtual! Cuide do pet e ganhe recompensas especiais.',bonusMoedas:4,bonusXp:6},
  {id:'ferias_julho',nome:'Férias de Julho',emoji:'☀️',mesInicio:7,diaInicio:1,mesFim:7,diaFim:31,fundoId:'praia',desc:'Férias! Mantenha a rotina leve e resgate o bônus diário de verão.',bonusMoedas:3,bonusXp:4},
  {id:'halloween',nome:'Halloween',emoji:'🎃',mesInicio:10,diaInicio:20,mesFim:11,diaFim:2,fundoId:'halloween',desc:'Noite de travessuras! Desbloqueie fantasias de Esqueleto, Vampirinho e Abóbora e missões divertidas.',bonusMoedas:5,bonusXp:8},
  {id:'natal',nome:'Natal',emoji:'🎄',mesInicio:12,diaInicio:1,mesFim:12,diaFim:26,fundoId:'neve',desc:'Clima de Natal! Complete a ofensiva e ganhe neve de recompensas.',bonusMoedas:5,bonusXp:10},
  {id:'ano_novo',nome:'Ano Novo',emoji:'🎆',mesInicio:12,diaInicio:27,mesFim:1,diaFim:5,fundoId:'festa',desc:'Virada do ano! Comece a sequência com energia e bônus extra.',bonusMoedas:4,bonusXp:8}
];
function dataNoIntervaloEvento(ev,d=new Date()){
  const m=d.getMonth()+1,day=d.getDate();
  const atual=m*100+day;
  const ini=ev.mesInicio*100+ev.diaInicio;
  const fim=ev.mesFim*100+ev.diaFim;
  if(ini<=fim)return atual>=ini&&atual<=fim;
  // Cruza virada de ano (ex.: 27/12–05/01)
  return atual>=ini||atual<=fim;
}
function obterEventoAtivo(){
  return EVENTOS_SAZONAIS.find(ev=>dataNoIntervaloEvento(ev))||null;
}
function atualizarBannerEvento(){
  const el=document.getElementById('banner-evento');
  if(!el)return;
  const ev=obterEventoAtivo();
  if(!ev){el.classList.remove('mostrar');el.textContent='';return}
  el.textContent=`${ev.emoji} Evento: ${ev.nome} — toque para ver bônus`;
  el.classList.add('mostrar');
  // Ajusta top do banner offline se ambos visíveis
  const off=document.getElementById('banner-offline');
  if(off&&off.classList.contains('mostrar'))el.style.top='28px';
  else el.style.top='0';
}
function abrirModalEventoSazonal(){
  const ev=obterEventoAtivo();
  if(!ev)return mostrarToast('Nenhum evento ativo no momento.');
  document.getElementById('evento-emoji').textContent=ev.emoji;
  document.getElementById('evento-titulo').textContent=ev.nome;
  document.getElementById('evento-desc').textContent=ev.desc;
  document.getElementById('evento-recompensas').innerHTML=
    `• Bônus diário: <b>+${ev.bonusMoedas} 🪙</b> e <b>+${ev.bonusXp} XP</b><br>`+
    `• Fundo sugerido: <b>${ev.fundoId}</b> (se você já tiver na coleção)<br>`+
    `• Surpresa do dia continua valendo normalmente`;
  const ja=estado.eventoBonusData===hojeLocal()&&estado.eventoBonusId===ev.id;
  const btn=document.getElementById('btn-resgatar-evento');
  if(btn){
    btn.disabled=!!ja;
    btn.textContent=ja?'✅ Bônus de hoje já resgatado':'🎁 Resgatar bônus do dia';
  }
  abrirModal('modal-evento');
}
function resgatarBonusEvento(){
  const ev=obterEventoAtivo();
  if(!ev)return;
  if(estado.eventoBonusData===hojeLocal()&&estado.eventoBonusId===ev.id){
    return mostrarToast('Você já resgatou o bônus de hoje.');
  }
  estado.eventoBonusData=hojeLocal();
  estado.eventoBonusId=ev.id;
  estado.moedas+=ev.bonusMoedas;
  registrarNoRelatorioDiario(0,ev.bonusMoedas);
  ganharXP(ev.bonusXp);
  // Oferece aplicar fundo do evento se já comprado
  if((estado.fundosComprados||[]).includes(ev.fundoId)){
    estado.fundoAtual=ev.fundoId;
    aplicarFundoTela(ev.fundoId);
  }
  salvar();
  atualizarTela();
  dispararConfetes();
  somConquista();
  fecharModal('modal-evento');
  mostrarAviso(ev.emoji,`${ev.nome}!`,`+${ev.bonusMoedas} 🪙 e +${ev.bonusXp} XP de bônus do evento.`);
  registrarLogAtividade(`Bônus evento ${ev.nome}`);
}
// ===== Meta familiar =====
function obterProgressoMetaFamiliar(){
  const meta=Math.max(3,Math.min(30,Number(estado.metaFamiliarDias)||5));
  // Conta quantos dias recentes TODOS os filhos com dados tiveram ofensiva
  // Simplificação: usa o streak mínimo entre filhos com registro, ou o streak do ativo se só 1
  const ids=Object.keys(estado.criancas||{});
  let minStreak=Number(estado.streak)||0;
  if(ids.length>1&&estado.criancasDados){
    ids.forEach(id=>{
      if(id===estado.criancaAtivaId)return;
      const s=Number(estado.criancasDados[id]?.streak)||0;
      minStreak=Math.min(minStreak,s);
    });
  }
  const progresso=Math.min(meta,minStreak);
  return {meta,progresso,minStreak,pct:Math.round((progresso/meta)*100)};
}
function renderizarMetaFamiliar(){
  const {meta,progresso,pct}=obterProgressoMetaFamiliar();
  const st=document.getElementById('txt-meta-familiar-status');
  const barra=document.getElementById('barra-meta-familiar');
  const dica=document.getElementById('txt-meta-familiar-dica');
  const input=document.getElementById('input-meta-familiar-dias');
  if(input)input.value=meta;
  if(st)st.textContent=`${progresso}/${meta} dias`;
  if(barra)barra.style.width=`${pct}%`;
  const jaResgatou=(estado.metaFamiliarUltimoResgate||0)>=meta&&estado.metaFamiliarResgatadaEm;
  if(dica){
    if(progresso>=meta)dica.textContent=jaResgatou&&estado.metaFamiliarResgatadaStreak===progresso?'Baú já resgatado para esta meta.':'🎉 Meta atingida! Resgate o baú familiar.';
    else dica.textContent=`Faltam ${meta-progresso} dia(s) de ofensiva conjunta.`;
  }
}
function atualizarMetaFamiliarDias(v){
  estado.metaFamiliarDias=Math.max(3,Math.min(30,parseInt(v,10)||5));
  salvar();
  renderizarMetaFamiliar();
  mostrarToast(`Meta familiar: ${estado.metaFamiliarDias} dias`);
}
function resgatarBauFamiliar(){
  const {meta,progresso}=obterProgressoMetaFamiliar();
  if(progresso<meta)return mostrarToast(`Ainda faltam ${meta-progresso} dia(s) de ofensiva conjunta.`);
  if(estado.metaFamiliarResgatadaStreak===progresso&&estado.metaFamiliarResgatadaEm){
    return mostrarToast('Baú desta meta já foi resgatado.');
  }
  const moedas=20+Math.floor(Math.random()*15);
  const xp=40;
  estado.moedas+=moedas;
  estado.metaFamiliarResgatadaEm=Date.now();
  estado.metaFamiliarResgatadaStreak=progresso;
  estado.metaFamiliarUltimoResgate=meta;
  ganharXP(xp);
  salvar();
  atualizarTela();
  renderizarMetaFamiliar();
  dispararConfetes(120);
  somBauLendario();
  registrarLogAtividade(`Baú familiar resgatado (+${moedas}🪙)`);
  mostrarAviso('🎁','Baú familiar!',`A família completou a meta de ${meta} dias! +${moedas} 🪙 e +${xp} XP.`);
}
// ===== FCM / Push =====
// Cole aqui a chave pública VAPID gerada em:
// Firebase Console → Project settings → Cloud Messaging → Web Push certificates
// (pares de chaves → gerar par de chaves)
const FIREBASE_VAPID_KEY='BKI1F3y46HUD2RLIsdq5sWTPox-6FeUE3y7EnmhC6S5G8gLGqrQYkIoX_J5mEu9bDl3Aaze8diaThF38gqdcCVM';
let fcmMessaging=null;
let fcmTokenAtual=null;
function caminhoTokensFcm(){
  return `rotinapet/familias/${codigoFamilia}/fcmTokens`;
}
async function salvarTokenFcmNaFamilia(token){
  if(!token||!dbFirebase)return;
  const uid=localStorage.getItem('ROTINAPET_UID')||'anon';
  const perfil=acessoFamiliar?.role==='parent'?'pais':acessoFamiliar?.role==='child'?'crianca':'desconhecido';
  try{
    await dbFirebase.ref(caminhoTokensFcm()+'/'+uid).set({
      token,
      perfil,
      atualizadoEm:Date.now(),
      userAgent:(navigator.userAgent||'').slice(0,120)
    });
    fcmTokenAtual=token;
    console.info('FCM token salvo na família');
  }catch(e){
    console.warn('Não foi possível salvar token FCM:',e);
  }
}
async function registrarTokenFcm(){
  if(!window.firebase||!firebase.messaging){
    console.error('FCM indisponível: SDK Firebase Messaging não carregado.',{
      firebase:!!window.firebase,
      messaging:!!window.firebase?.messaging,
      firebaseVersion:window.firebase?.SDK_VERSION||null
    });
    return null;
  }
  if(!('Notification' in window)){
    console.error('FCM indisponível: este navegador não expõe a API Notification.');
    return null;
  }
  if(Notification.permission!=='granted'){
    console.warn('FCM não iniciado: permissão de notificações é',Notification.permission);
    mostrarAviso('🔔','Permissão necessária',`Permissão atual: ${Notification.permission}. Libere as notificações nas configurações do site e tente novamente.`);
    return null;
  }
  if(!FIREBASE_VAPID_KEY||FIREBASE_VAPID_KEY==='COLE_SUA_CHAVE_VAPID_AQUI'){
    console.warn('Defina FIREBASE_VAPID_KEY no HTML (Console Firebase → Cloud Messaging → Web Push certificates).');
    return null;
  }
  try{
    // 1. Registra o Service Worker no caminho do repositório.
    await navigator.serviceWorker.register('./sw.js');

    // 2. Aguarda o Service Worker ficar pronto e ativo.
    const reg=await navigator.serviceWorker.ready;

    fcmMessaging=firebase.messaging();

    // 3. Só chama o Firebase depois que o registro está ativo.
    const token=await fcmMessaging.getToken({
      vapidKey:FIREBASE_VAPID_KEY,
      serviceWorkerRegistration:reg
    });

    if(token)await salvarTokenFcmNaFamilia(token);
    fcmMessaging.onMessage(payload=>{
      const n=payload.notification||{};
      const d=payload.data||{};
      const titulo=n.title||d.title||'🐾 RotinaPet';
      const corpo=n.body||d.body||'Nova atividade na família';
      mostrarToast('🔔 '+titulo+': '+corpo);
      if(Notification.permission==='granted'){
        try{new Notification(titulo,{body:corpo,tag:d.tag||'rotinapet-fg'})}catch(e){}
      }
    });
    return token;
  }catch(e){
    const detalhes={
      code:e?.code||null,
      name:e?.name||null,
      message:e?.message||String(e),
      stack:e?.stack||null,
      permission:(('Notification' in window)?Notification.permission:'indisponivel'),
      online:navigator.onLine,
      url:location.href,
      serviceWorker:'serviceWorker' in navigator,
      firebaseVersion:window.firebase?.SDK_VERSION||null
    };
    console.error('FCM getToken falhou — diagnóstico completo:',detalhes,e);
    try{
      localStorage.setItem('ROTINAPET_ULTIMO_ERRO_FCM',JSON.stringify({
        ...detalhes,em:new Date().toISOString()
      }));
    }catch(storageError){
      console.warn('Não foi possível salvar diagnóstico FCM:',storageError);
    }
    const codigo=detalhes.code||detalhes.name||'erro-desconhecido';
    const mensagem=detalhes.message||'Não foi possível gerar o token.';
    mostrarAviso(
      '⚠️',
      'Erro detalhado do FCM',
      `${codigo}: ${mensagem}`
    );
    return null;
  }
}
function diagnosticoFcmAtual(){
  let ultimo=null;
  try{ultimo=JSON.parse(localStorage.getItem('ROTINAPET_ULTIMO_ERRO_FCM')||'null')}catch(e){}
  const resultado={
    sdk:window.firebase?.SDK_VERSION||null,
    messaging:typeof window.firebase?.messaging==='function',
    notification:('Notification' in window)?Notification.permission:'indisponivel',
    online:navigator.onLine,
    serviceWorker:'serviceWorker' in navigator,
    registrosServiceWorker:[],
    ultimoErro:ultimo
  };
  return navigator.serviceWorker?.getRegistrations?.()
    .then(regs=>{
      resultado.registrosServiceWorker=regs.map(r=>({scope:r.scope,active:!!r.active,script:r.active?.scriptURL||null}));
      console.table(resultado.registrosServiceWorker);
      console.log('Diagnóstico FCM:',resultado);
      return resultado;
    })||Promise.resolve(resultado);
}

async function inicializarPushBase(){
  if(!('Notification' in window)||!('serviceWorker' in navigator))return;
  try{
    if(Notification.permission==='granted'&&estado.notificacoesAtivas){
      await registrarTokenFcm();
    }
  }catch(e){}
}
async function ativarPushCompleto(){
  if(!('Notification' in window)){
    mostrarToast('Este aparelho não suporta notificações.');
    return false;
  }
  let perm=Notification.permission;
  if(perm==='default')perm=await Notification.requestPermission();
  if(perm!=='granted'){
    mostrarToast('Permissão de notificação negada no sistema.');
    return false;
  }
  estado.notificacoesAtivas=true;
  salvar();
  atualizarBotaoLembrete();
  const token=await registrarTokenFcm();
  if(token){
    mostrarAviso('🔔','Push ativado','Este aparelho receberá avisos da família mesmo com o app em segundo plano (após configurar a VAPID key).');
    return true;
  }
  mostrarAviso('🔔','Notificações locais ativas',
    FIREBASE_VAPID_KEY==='COLE_SUA_CHAVE_VAPID_AQUI'
      ?'Execute diagnosticoFcmAtual() no console e verifique se sw.js está publicado na raiz do app.'
      :'Token FCM não foi gerado. Verifique o Service Worker e o domínio autorizado no Firebase.');
  return false;
}
function darRemedio(){
  const p=obterDadosPetAtual();
  p.saude=100;
  p.felicidade=Math.min(100,p.felicidade+5);
  salvar();
  atualizarTela();
  mostrarBalaoFala(escolherFalaContextual('alimentar'));
  mostrarToast('💚 Saúde restaurada!');
  registrarLogAtividade('Remédio dado ao pet');
}
function criarTextoFlutuante(txt,e){const area=document.getElementById('pet-section-area'),s=document.createElement('div');s.className='floating-text';s.textContent=txt;const r=area.getBoundingClientRect();s.style.left=(e?.clientX?r.left<e.clientX?e.clientX-r.left:80:90)+'px';s.style.top='35%';area.appendChild(s);setTimeout(()=>s.remove(),900)}
const CORES_CONFETE_PET={gato:['#a78bfa','#1e293b','#f8fafc'],cachorra:['#f4a261','#e76f51','#fff7ed'],cabra:['#f5e6d3','#a0522d','#fefce8'],frango:['#fff9c4','#ff6b6b','#ffcc00'],unicornio:['#f9a8d4','#a78bfa','#67e8f9'],dinossauro:['#84cc16','#166534','#f59e0b'],capivara:['#c08457','#92400e','#fde68a'],axolote:['#f5a7c7','#7dd3d7','#e8faff']};
function ganharXP(qtd,e){
  const p=obterDadosPetAtual();
  const faseAntes=calcularFase(p.nivel);
  p.xp+=qtd;
  criarTextoFlutuante(`+${qtd} XP`,e);
  let subiu=false;
  while(p.xp>=100){
    p.xp-=100;
    p.nivel++;
    subiu=true;
    dispararConfetes(140,CORES_CONFETE_PET[estado.petAtual]);
    navigator.vibrate?.([70,40,70]);
  }
  if(subiu){
    playSound('nivel');
    const faseDepois=calcularFase(p.nivel);
    if(faseDepois>faseAntes){
      if(estado.petAtual==='axolote' && faseDepois===2 && typeof window.iniciarEvolucaoAxolote==='function')setTimeout(()=>window.iniciarEvolucaoAxolote(),180);
      else setTimeout(()=>celebrarEvolucaoPet(faseDepois),180);
    }
    if(estado.petAtual==='gato' && p.nivel>=21 && (Number(p.faseConfirmada)||1)<2)mostrarToast('✨ Evolução disponível! Toque em Evoluir.');
    mostrarToast(`🎉 Nível ${p.nivel}!`);
    const badge=document.querySelector('.level-badge');
    if(badge){
      badge.classList.remove('level-up-pop');
      void badge.offsetWidth;
      badge.classList.add('level-up-pop');
      setTimeout(()=>badge.classList.remove('level-up-pop'),800);
    }
  }
  salvar();
  atualizarTela();
}
function dispararConfetes(qtd=75,cores=null){try{window.confetti?.({particleCount:qtd,spread:65,origin:{y:.6},...(cores?{colors:cores}:{})})}catch(e){}}
let tarefaIdFoto=null;
document.getElementById('camera-input').addEventListener('change',processarFotoCapturada);
function dispararCamera(id){tarefaIdFoto=id;document.getElementById('camera-input').click()}
async function enviarFotoParaStorage(blob,t){
  if(!storageFirebase||!sincronizacaoNuvemAtiva||!navigator.onLine)return null;
  const dia=hojeLocal();
  const path=`familias/${codigoFamilia}/criancas/${idTarefaSeguro(estado.criancaAtivaId)}/tarefas/${idTarefaSeguro(t.id)}/${dia}.jpg`;
  const ref=storageFirebase.ref(path);
  await ref.put(blob,{contentType:'image/jpeg',cacheControl:'private,max-age=3600'});
  const url=await ref.getDownloadURL();
  return {url,path};
}
async function processarFotoCapturada(e){
  const f=e.target.files[0];
  if(!f||!tarefaIdFoto)return;
  const idAtual=tarefaIdFoto;
  const img=new Image();
  img.onload=async()=>{
    try{
      const canvas=document.createElement('canvas');
      const maxDim=320;
      let w=img.width,h=img.height;
      if(w>h){if(w>maxDim){h*=maxDim/w;w=maxDim}}
      else{if(h>maxDim){w*=maxDim/h;h=maxDim}}
      canvas.width=Math.max(1,Math.round(w));canvas.height=Math.max(1,Math.round(h));
      const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const miniDataUrl=canvas.toDataURL('image/jpeg',0.55);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.55));
      const t=estado.tarefas.find(item=>String(item.id)===String(idAtual));
      if(!t)return;
      // Fallback imediato: a foto continua disponível mesmo se Storage falhar.
      t.foto=miniDataUrl;t.fotoUrl=null;t.fotoPath=null;t.status='pendente';
      if(blob){
        try{
          const remoto=await enviarFotoParaStorage(blob,t);
          if(remoto){t.foto=null;t.fotoUrl=remoto.url;t.fotoPath=remoto.path;}
        }catch(storageError){
          console.warn('Upload da foto no Storage falhou; usando fallback local:',storageError);
          mostrarToast('📸 Foto salva localmente; Storage indisponível.');
        }
      }
      t.atualizadoEm=Date.now();
      copiarFotoParaRegistro(t);
      salvar();
      persistirTarefaIndividualV2(t).catch(err=>console.warn('Foto/tarefa:',err));
      renderizarTarefas();renderizarPainelPais();
      if(t.fotoUrl)mostrarToast('☁️ Foto enviada com segurança.');
      else mostrarToast('📸 Foto otimizada com sucesso!');
    }catch(error){
      console.error('Falha ao processar foto:',error);
      mostrarToast('⚠️ Não foi possível processar a foto.');
    }finally{
      URL.revokeObjectURL(img.src);
    }
  };
  img.onerror=()=>mostrarToast('⚠️ Imagem inválida ou não suportada.');
  img.src=URL.createObjectURL(f);
  e.target.value='';
}
async function dataUrlParaBlob(dataUrl){
  const resposta=await fetch(dataUrl);
  if(!resposta.ok)throw new Error('não foi possível ler a foto local');
  return await resposta.blob();
}
async function migrarFotoAntigaParaStorage(t){
  if(!t?.foto||!storageFirebase)throw new Error('foto ou Storage indisponível');
  const blob=await dataUrlParaBlob(t.foto);
  const path=`familias/${codigoFamilia}/criancas/${idTarefaSeguro(estado.criancaAtivaId)}/tarefas/${idTarefaSeguro(t.id)}/legado-${Date.now()}.jpg`;
  const ref=storageFirebase.ref(path);
  await ref.put(blob,{contentType:'image/jpeg',cacheControl:'private,max-age=3600'});
  const url=await ref.getDownloadURL();
  // A foto original só é removida depois do put + getDownloadURL concluírem.
  t.foto=null;t.fotoUrl=url;t.fotoPath=path;t.atualizadoEm=Date.now();
  await persistirTarefaIndividualV2(t);
  salvarLocalmente();
  return url;
}
async function iniciarMigracaoFotosStorage(){
  const botao=document.getElementById('btn-migrar-fotos');
  const status=document.getElementById('txt-status-migracao-fotos');
  const atualizar=(txt,cor)=>{if(status){status.textContent=txt;if(cor)status.style.color=cor}};
  const fotos=(estado.tarefas||[]).filter(t=>t.foto&&!t.fotoUrl);
  if(!fotos.length){atualizar('✅ Não há fotos antigas em Base64 para migrar.','#15803d');mostrarToast('✅ Todas as fotos já estão no Storage ou não existem.');return;}
  if(!storageFirebase||!sincronizacaoNuvemAtiva){atualizar('⚠️ Storage ainda não está disponível.','#dc2626');mostrarToast('⚠️ Configure o Firebase Storage antes de migrar.');return;}
  if(!navigator.onLine){atualizar('⚠️ Conecte-se à internet antes de migrar.','#dc2626');return;}
  const ok=window.confirm(`Será feito upload de ${fotos.length} foto(s). Baixe um backup antes. Continuar?`);
  if(!ok)return;
  if(botao){botao.disabled=true;botao.textContent='⏳ Migrando fotos...';}
  let sucesso=0,falhas=0;
  for(let i=0;i<fotos.length;i++){
    const t=fotos[i];
    atualizar(`⏳ Foto ${i+1}/${fotos.length}: ${t.texto||'tarefa'}...`,'#2563eb');
    try{await migrarFotoAntigaParaStorage(t);sucesso++;}
    catch(error){falhas++;console.warn('Falha na migração da foto:',t.id,error);}
  }
  salvar();renderizarPainelPais();atualizarTela();
  if(botao){botao.disabled=false;botao.textContent='☁️ Migrar fotos antigas para o Storage';}
  if(falhas){atualizar(`⚠️ ${sucesso} migrada(s), ${falhas} falhou/falharam. Tente novamente.`,'#b45309');mostrarAviso('⚠️','Migração parcial',`${sucesso} foto(s) foram enviadas. As que falharam continuam preservadas no aparelho.`);}
  else{atualizar(`✅ ${sucesso} foto(s) migrada(s) com confirmação.`,'#15803d');mostrarAviso('☁️','Migração concluída',`${sucesso} foto(s) agora estão no Firebase Storage. A cópia Base64 foi removida com segurança.`);}
}
function enfileirarPushFamilia(title,body,opts={}){
  if(!dbFirebase||!sincronizacaoNuvemAtiva)return;
  try{
    dbFirebase.ref(`rotinapet/familias/${codigoFamilia}/pushQueue`).push({
      title:title||'🐾 RotinaPet',
      body:body||'',
      tag:opts.tag||'rotinapet',
      onlyPerfil:opts.onlyPerfil||null,
      url:opts.url||(typeof location!=='undefined'?location.pathname+location.search:'/'),
      createdAt:Date.now()
    });
  }catch(e){console.warn('Fila push:',e)}
}
function caminhoTarefasV2(criancaId=estado.criancaAtivaId){
  return `rotinapet/familias/${codigoFamilia}/filhos/${criancaId}/tarefas`;
}
function novoIdTarefa(){
  return `t_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
}
function idTarefaSeguro(id){
  return String(id??novoIdTarefa()).replace(/[.#$[\]/]/g,'_').slice(0,80);
}
function registroTarefaHoje(t){
  t.registros=t.registros||{};
  const dia=hojeLocal();
  t.registros[dia]=t.registros[dia]||{status:'pendente',foto:null,fotoUrl:null,fotoPath:null};
  const r=t.registros[dia];
  if(r.fotoUrl===undefined)r.fotoUrl=null;
  if(r.fotoPath===undefined)r.fotoPath=null;
  return r;
}
function statusTarefaAtual(t){
  return t.registros?.[hojeLocal()]?.status||t.status||'pendente';
}
async function persistirTarefaIndividualV2(t){
  if(!t)return;
  const agora=Date.now();
  // O timestamp também fica no estado local para o merge entre aparelhos.
  t.atualizadoEm=Math.max(Number(t.atualizadoEm)||0,agora);
  if(!dbFirebase||!sincronizacaoNuvemAtiva||!navigator.onLine||cargaNuvemPendente)return false;
  const id=idTarefaSeguro(t.id);
  await dbFirebase.ref(`${caminhoTarefasV2()}/${id}`).set({...t,id,atualizadoEm:t.atualizadoEm});
  return true;
}
function mergeTarefasPorVersao(locais,remotas){
  const mapa=new Map();
  (Array.isArray(locais)?locais:[]).forEach(t=>{if(t&&t.id!=null)mapa.set(String(t.id),t)});
  (Array.isArray(remotas)?remotas:[]).forEach(r=>{
    if(!r||r.id==null)return;
    const chave=String(r.id),l=mapa.get(chave);
    const tl=Number(l?.atualizadoEm)||0,tr=Number(r.atualizadoEm)||0;
    if(!l||tr>=tl)mapa.set(chave,r);
  });
  return Array.from(mapa.values()).map(prepararTarefaParaHoje);
}
function prepararTarefaParaHoje(t){
  if(t.extraRotativa&&t.dataSugerida!==hojeLocal())return t;
  const r=t.registros?.[hojeLocal()];
  if(r){
    t.status=r.status||t.status||'pendente';
    // Só substitui quando o registro realmente contém o campo.
    // Assim uma sincronização antiga não apaga a foto recém-capturada.
    if(r.foto!==undefined&&r.foto!==null)t.foto=r.foto;
    if(r.fotoUrl!==undefined&&r.fotoUrl!==null)t.fotoUrl=r.fotoUrl;
    if(r.fotoPath!==undefined&&r.fotoPath!==null)t.fotoPath=r.fotoPath;
    if(r.foto===null&&r.fotoUrl===null&&r.fotoPath===null){t.foto=null;t.fotoUrl=null;t.fotoPath=null;}
  }else if(t.status==='aguardando_aprovacao'){
    t.registros=t.registros||{};
    t.registros[hojeLocal()]={status:t.status,foto:t.foto||null,fotoUrl:t.fotoUrl||null,fotoPath:t.fotoPath||null,atualizadoEm:Date.now()};
  }
  return t;
}
function copiarFotoParaRegistro(t){
  const r=registroTarefaHoje(t);
  r.foto=t.foto||null;
  r.fotoUrl=t.fotoUrl||null;
  r.fotoPath=t.fotoPath||null;
  r.fotoAtualizadaEm=Date.now();
  return r;
}
function prepararTarefasV2NoEstado(){
  if(!Array.isArray(estado.tarefas))estado.tarefas=[];
  estado.tarefas.forEach(prepararTarefaParaHoje);
}
async function migrarTarefasParaNosIndividuais(){
  if(!dbFirebase||!sincronizacaoNuvemAtiva)throw new Error('Firebase indisponível');
  prepararTarefasV2NoEstado();
  const updates={};
  const base=caminhoTarefasV2();
  for(const t of estado.tarefas){
    const id=idTarefaSeguro(t.id);
    t.id=id;
    updates[`${base}/${id}`]={...t,atualizadoEm:Date.now()};
  }
  updates[`rotinapet/familias/${codigoFamilia}/meta/schemaTarefas`]=SCHEMA_TAREFAS_V2;
  updates[`rotinapet/familias/${codigoFamilia}/meta/tarefasMigradasEm`]=Date.now();
  await dbFirebase.ref().update(updates);
  estado.schemaTarefas=SCHEMA_TAREFAS_V2;
  salvarLocalmente();
  return true;
}
async function iniciarMigracaoPeloPainel(){
  const botao=document.getElementById('btn-migrar-tarefas');
  const status=document.getElementById('txt-status-migracao-tarefas');
  const atualizar=(texto,cor)=>{
    if(status){status.textContent=texto;if(cor)status.style.color=cor;}
  };
  if(!sincronizacaoNuvemAtiva||!dbFirebase){
    atualizar('⚠️ Firebase ainda não está conectado. Aguarde o status online.', '#dc2626');
    mostrarToast('⚠️ Sincronização indisponível no momento.');
    return;
  }
  if(!navigator.onLine){
    atualizar('⚠️ Sem internet. Conecte-se e tente novamente.', '#dc2626');
    mostrarToast('⚠️ É necessário estar online para migrar.');
    return;
  }
  if(Number(estado.schemaTarefas)===SCHEMA_TAREFAS_V2){
    atualizar('✅ Tarefas já estão na sincronização avançada.', '#15803d');
    mostrarToast('✅ Migração já realizada.');
    return;
  }
  const confirmado=window.confirm('Antes de continuar, confirme que você já baixou um backup. Migrar agora?');
  if(!confirmado)return;
  try{
    if(botao){botao.disabled=true;botao.textContent='⏳ Migrando tarefas...';}
    atualizar('⏳ Enviando tarefas individuais para a nuvem...', '#2563eb');
    await migrarTarefasParaNosIndividuais();
    atualizar('✅ Migração concluída. O formato antigo foi preservado.', '#15803d');
    if(botao){botao.textContent='✅ Sincronização avançada ativa';botao.classList.remove('green-btn');botao.classList.add('blue-btn');}
    mostrarAviso('✅','Migração concluída','As tarefas agora também estão salvas em nós individuais no Firebase.');
  }catch(error){
    console.error('Falha na migração de tarefas:',error);
    atualizar(`⚠️ Falha: ${error?.message||'erro desconhecido'}`, '#dc2626');
    if(botao){botao.disabled=false;botao.textContent='🔄 Tentar migração novamente';}
    mostrarAviso('⚠️','Migração não concluída',error?.message||'Não foi possível migrar as tarefas.');
  }
}

async function carregarTarefasIndividuaisComFallback(){
  if(!dbFirebase||!sincronizacaoNuvemAtiva)return false;
  const snap=await dbFirebase.ref(caminhoTarefasV2()).once('value');
  const dados=snap.val();
  if(!dados||typeof dados!=='object')return false;
  const individuais=Object.values(dados);
  const dadosAtuais=estado.criancasDados?.[estado.criancaAtivaId];
  const tarefasFilhas=Array.isArray(dadosAtuais?.tarefas)?dadosAtuais.tarefas:[];
  const remotas=individuais.length?individuais:tarefasFilhas;
  const mescladas=mergeTarefasPorVersao(estado.tarefas,remotas);
  estado.tarefas=aplicarTarefasDaCriancaSemPerderCadastro(estado.tarefas,mescladas);
  salvarLocalmente();
  renderizarTarefas();
  return true;
}

function sincronizarListenerTarefasV2(){
  if(!dbFirebase||!sincronizacaoNuvemAtiva)return;
  const criancaId=String(estado.criancaAtivaId||'c1');
  if(tarefasV2ListenerCriancaId===criancaId&&tarefasV2ListenerRef)return;
  if(tarefasV2ListenerRef&&tarefasV2ListenerCallback){
    tarefasV2ListenerRef.off('value',tarefasV2ListenerCallback);
  }
  tarefasV2ListenerCriancaId=criancaId;
  tarefasV2ListenerRef=dbFirebase.ref(caminhoTarefasV2(criancaId));
  tarefasV2ListenerCallback=snap=>{
    if(String(estado.criancaAtivaId||'c1')!==criancaId)return;
    const dados=snap.val();
    if(!dados||typeof dados!=='object')return;
    const remotas=Object.values(dados);
    const mescladas=mergeTarefasPorVersao(estado.tarefas,remotas);
    estado.tarefas=aplicarTarefasDaCriancaSemPerderCadastro(estado.tarefas,mescladas);
    estado.criancasDados=estado.criancasDados||{};
    estado.criancasDados[criancaId]=estado.criancasDados[criancaId]||{};
    estado.criancasDados[criancaId].tarefas=JSON.parse(JSON.stringify(estado.tarefas));
    try{localStorage.setItem(`ROTINAPET_SAVE_${codigoFamilia}`,JSON.stringify(estado))}catch(e){}
    renderizarTarefas();
    if(perfilAtivo==='pais'&&document.getElementById('modal-pais')?.classList.contains('mostrar'))renderizarPainelPais();
  };
  tarefasV2ListenerRef.on('value',tarefasV2ListenerCallback);
}

async function enviarParaAprovacao(id){
  const t=estado.tarefas.find(t=>String(t.id)===String(id));
  if(!t)return;
  if(statusTarefaAtual(t)!=='pendente')return;
  const r=registroTarefaHoje(t);
  copiarFotoParaRegistro(t);
  t.motivoRecusa=null;
  r.motivoRecusa=null;
  r.status='aguardando_aprovacao';
  r.enviadaEm=Date.now();
  t.status='aguardando_aprovacao';
  salvarLocalmente();
  renderizarTarefas();
  if(!sincronizacaoNuvemAtiva||!dbFirebase||!navigator.onLine||cargaNuvemPendente){
    salvar();
    mostrarToast('📱 Pedido salvo neste aparelho. Ele será enviado quando a sincronização estiver online.');
    return;
  }
  try{
    const tarefaV2Gravada=await persistirTarefaIndividualV2(t);
    const estadoGravado=await salvar();
    if(!tarefaV2Gravada&&!estadoGravado)throw new Error('A tarefa não foi gravada na nuvem.');
    registrarLogAtividade(`Pedido de aprovação: ${t.texto}`);
    enviarNotificacaoLocal('📋 Tarefa para aprovar',`${t.texto} — abra o painel dos pais.`,'rotinapet-aprovacao');
    enfileirarPushFamilia('📋 Tarefa para aprovar',t.texto,{tag:'rotinapet-aprovacao',onlyPerfil:'pais'});
    mostrarToast('⏳ Missão enviada! Os pais vão conferir.');
  }catch(e){
    console.warn('Falha ao enviar tarefa para os pais:',e);
    if(statusTarefaAtual(t)==='aguardando_aprovacao'){
      r.status='pendente';
      t.status='pendente';
      salvarLocalmente();
      renderizarTarefas();
    }
    mostrarToast('⚠️ Não foi possível enviar. Confira a conexão e tente novamente.');
  }
}
let tarefaParaConfirmarId=null;
function pedirConfirmacaoMissao(id){
  const tarefa=estado.tarefas.find(t=>String(t.id)===String(id));
  if(!tarefa||statusTarefaAtual(tarefa)!=='pendente')return;
  tarefaParaConfirmarId=id;
  const temFoto=Boolean(tarefa.foto||tarefa.fotoUrl);
  document.getElementById('texto-confirmar-missao').textContent=`${tarefa.texto}${temFoto?' · 📸 Foto anexada':''}`;
  abrirModal('modal-confirmar-missao');
}
function confirmarEnvioMissao(){
  const id=tarefaParaConfirmarId;
  tarefaParaConfirmarId=null;
  fecharModal('modal-confirmar-missao');
  if(id!==null)enviarParaAprovacao(id);
}
function adicionarFotoAntesDeEnviar(){
  const id=tarefaParaConfirmarId;
  tarefaParaConfirmarId=null;
  fecharModal('modal-confirmar-missao');
  if(id!==null)dispararCamera(id);
}
const DIAS_LABEL=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
function diaSemanaHoje(){return new Date().getDay()}
function diasNormalizados(t){
  if(!t||t.dias==null||t.dias==='')return [];
  const bruto=Array.isArray(t.dias)?t.dias:[t.dias];
  const nomes={dom:0,domingo:0,seg:1,segunda:1,'segunda-feira':1,ter:2,terça:2,'terça-feira':2,qua:3,quarta:3,'quarta-feira':3,qui:4,quinta:4,'quinta-feira':4,sex:5,sexta:5,'sexta-feira':5,sab:6,sáb:6,sabado:6,'sábado':6};
  return bruto.map(v=>{
    if(typeof v==='number')return v;
    const texto=String(v).trim().toLowerCase();
    if(texto in nomes)return nomes[texto];
    const n=Number(texto);return Number.isFinite(n)?n:null;
  }).filter(n=>Number.isInteger(n)&&n>=0&&n<=6);
}
function tarefaEhHoje(t){
  const dias=diasNormalizados(t);
  return dias.length===0||dias.includes(diaSemanaHoje());
}
const SUGESTOES_EXTRAS=[
  'Ler uma história por 10 minutos',
  'Guardar os brinquedos depois de brincar',
  'Organizar a mochila para amanhã',
  'Desenhar uma coisa que aprendeu',
  'Separar papéis para reciclagem',
  'Ajudar a dobrar algumas roupas',
  'Regar uma planta com um responsável'
];
function garantirExtraDoDia(){
  const dia=hojeLocal(),id=`extra-dia-${dia}`;
  if(estado.extraDiaRemovida===dia||estado.tarefas.some(t=>String(t.id)===id))return;
  const numero=Math.floor(new Date(`${dia}T12:00:00`).getTime()/86400000);
  const perfil=String(estado.criancaAtivaId||'').split('').reduce((n,c)=>n+c.charCodeAt(0),0);
  estado.tarefas.push({id,texto:SUGESTOES_EXTRAS[(numero+perfil)%SUGESTOES_EXTRAS.length],recompensa:3,xp:10,tipo:'extra',status:'pendente',foto:null,dias:[],dataSugerida:dia,extraRotativa:true});
  salvar();
}
function tarefasDeHoje(){return (Array.isArray(estado.tarefas)?estado.tarefas:[]).filter(t=>t&&t.ativo!==false&&(!t.dataSugerida||t.dataSugerida===hojeLocal())&&tarefaEhHoje(t))}
function emPausaHoje(){return !!(estado.pausaAte&&hojeLocal()<=estado.pausaAte)}
function todasObrigatoriasConcluidas(){const o=tarefasDeHoje().filter(t=>t.tipo==='obrigatoria');return o.length>0&&o.every(t=>statusTarefaAtual(t)==='aprovada')}
function atualizarOfensiva(){
  const el=document.getElementById('status-ofensiva');
  if(!el)return;
  if(emPausaHoje()){
    const dias=Math.max(0,Math.ceil((new Date(estado.pausaAte+'T00:00:00')-new Date(hojeLocal()+'T00:00:00'))/86400000)+1);
    el.textContent=`🌴 Sequência em pausa (${dias} dia(s) restante(s)).`;
    el.style.background='#ecfeff';el.style.borderColor='#a5f3fc';el.style.color='#0e7490';
    return;
  }
  const o=tarefasDeHoje().filter(t=>t.tipo==='obrigatoria'),f=o.filter(t=>statusTarefaAtual(t)==='aprovada').length;
  if(!o.length){
    el.textContent='🔥 Defina missões obrigatórias no painel dos pais.';
    el.style.background='#fef2f2';el.style.borderColor='#fecaca';el.style.color='#b91c1c';
  }else if(todasObrigatoriasConcluidas()){
    el.textContent=`🔥 Dia completo! ${f}/${o.length} · Sequência: ${estado.streak||0} dia(s)`;
    el.style.background='#ecfdf5';el.style.borderColor='#bbf7d0';el.style.color='#047857';
  }else{
    el.textContent=`🔥 Progresso: ${f}/${o.length} · Complete todas para manter a sequência`;
    el.style.background='#fff7ed';el.style.borderColor='#fed7aa';el.style.color='#9a3412';
  }
}
function registrarConclusaoDoDia(){
  if(!todasObrigatoriasConcluidas())return false;
  const hoje=hojeLocal();
  if(estado.ultimoDiaConcluido===hoje)return false;
  const d=new Date();d.setDate(d.getDate()-1);
  const ontem=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  estado.streak=(estado.ultimoDiaConcluido===ontem||emPausaHoje())?(Number(estado.streak)||0)+1:1;
  estado.ultimoDiaConcluido=hoje;
  estado.historicoConclusoes=estado.historicoConclusoes||{};
  estado.historicoConclusoes[hoje]=true;
  salvar();
  dispararConfetes();
  return true;
}
let idTarefaRecemAprovada=null;
function obterProgressoMeta(meta){
  const hoje=new Date(),ano=hoje.getFullYear(),mes=hoje.getMonth();
  const inicio=new Date(ano,mes,1);
  const chave=(d)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const registro=(d)=>estado.registroDiario?.[chave(d)]||{tarefas:0,moedas:0};
  let valor=0;
  if(meta.tipo==='streak')valor=Number(estado.streak)||0;
  else if(meta.tipo==='tarefas'||meta.tipo==='moedas'||meta.tipo==='dias'){
    const fim=new Date(ano,mes+1,0);
    for(let i=1;i<=fim.getDate();i++){const r=registro(new Date(ano,mes,i));if(meta.tipo==='tarefas')valor+=Number(r.tarefas)||0;if(meta.tipo==='moedas')valor+=Number(r.moedas)||0;if(meta.tipo==='dias'&&(Number(r.tarefas)||0)>0)valor++;}
  }
  const alvo=Math.max(1,Number(meta.alvo)||1);
  return {valor,alvo,perc:Math.min(100,Math.round((valor/alvo)*100))};
}
function renderizarMetas(){
  const metas=Array.isArray(estado.metasPersonalizadas)?estado.metasPersonalizadas:[];
  const nomes={tarefas:'tarefas no mês',moedas:'moedas no mês',streak:'dias de ofensiva',dias:'dias ativos no mês'};
  const pais=document.getElementById('lista-metas-pais');
  const cri=document.getElementById('lista-metas-crianca');
  const montar=(modo)=>metas.length?metas.map(m=>{const p=obterProgressoMeta(m),ok=p.perc>=100;return modo==='pais'?`<div class="meta-pais-row"><button class="primary-btn red-btn" onclick="removerMetaPersonalizada('${m.id}')">Excluir</button><b>${esc(m.emoji||'🎯')} ${esc(m.titulo)}</b><br><span>${p.valor}/${p.alvo} ${nomes[m.tipo]||''} · ${p.perc}%</span></div>`:`<div class="meta-item"><div class="meta-top ${ok?'meta-concluida':''}"><span>${esc(m.emoji||'🎯')} ${esc(m.titulo)}</span><span>${ok?'✅ Concluída':`${p.valor}/${p.alvo}`}</span></div><div class="meta-bar"><div style="width:${p.perc}%"></div></div><div class="meta-sub">${ok?'Parabéns! Meta alcançada!':`Meta: ${p.alvo} ${nomes[m.tipo]||''}`}</div></div>`;}).join(''):'<span style="font-size:9px;color:#94a3b8">Nenhuma meta criada ainda.</span>';
  if(pais)pais.innerHTML=montar('pais');
  if(cri)cri.innerHTML=montar('crianca');
}
function adicionarMetaPersonalizada(){
  const titulo=window.prompt('Nome da meta:','Meta do mês');
  if(!titulo||!titulo.trim())return;
  const tipo=window.prompt('Tipo: tarefas, moedas, streak ou dias','tarefas');
  if(!['tarefas','moedas','streak','dias'].includes(tipo))return mostrarToast('⚠️ Tipo inválido. Use tarefas, moedas, streak ou dias.');
  const alvo=Number(window.prompt('Qual é o objetivo?','20'));
  if(!Number.isFinite(alvo)||alvo<1)return mostrarToast('⚠️ Objetivo inválido.');
  const emoji=window.prompt('Emoji da meta:','🎯')||'🎯';
  estado.metasPersonalizadas=Array.isArray(estado.metasPersonalizadas)?estado.metasPersonalizadas:[];
  estado.metasPersonalizadas.push({id:'m_'+Date.now().toString(36),titulo:titulo.trim().slice(0,45),tipo,alvo:Math.round(alvo),emoji:emoji.slice(0,2)});
  salvar();renderizarPainelPais();atualizarTela();mostrarToast('🎯 Meta criada!');
}
function removerMetaPersonalizada(id){
  estado.metasPersonalizadas=(estado.metasPersonalizadas||[]).filter(m=>m.id!==id);
  salvar();renderizarPainelPais();atualizarTela();mostrarToast('🗑️ Meta removida.');
}
function renderizarResumoCrianca(){ /* painel grande removido: resumo disponível no ícone Hoje */ }
function textoTarefaExibido(texto){
  return String(texto||'').replace(/arrumar a ꞩama/gi,'Arrumar a cama');
}
function renderizarTarefas(){
  garantirExtraDoDia();
  renderizarMetas();
  renderizarResumoCrianca();
  const c=document.getElementById('lista-tarefas');
  c.innerHTML='';
  const hojeLista=tarefasDeHoje();
  const o=hojeLista.filter(t=>t.tipo==='obrigatoria'),x=hojeLista.filter(t=>t.tipo!=='obrigatoria');
  document.getElementById('qtd-tarefas').textContent=`${o.length} fixas · ${x.length} ${x.length===1?'extra':'extras'}`;
  const pendentes=(estado.tarefas||[]).filter(t=>(!t.dataSugerida||t.dataSugerida===hojeLocal())&&statusTarefaAtual(t)==='aguardando_aprovacao');
  const bannerPend=document.getElementById('banner-aprovacoes-pendentes');
  const txtPend=document.getElementById('txt-aprovacoes-pendentes');
  if(bannerPend){
    const n=pendentes.length;
    if(n>0){
      bannerPend.style.display='flex';
      bannerPend.classList.remove('hidden');
      if(txtPend)txtPend.textContent=n===1?'1 tarefa aguardando aprovação dos pais':`${n} tarefas aguardando aprovação dos pais`;
    }else{
      bannerPend.style.display='none';
      bannerPend.classList.add('hidden');
    }
  }
  
  const bloco=(titulo,lista,icone)=>{
    if(!lista.length)return;
    const h=document.createElement('div');
    h.style.cssText="font-size:9px;font-weight:900;color:#475569;margin:7px 2px 4px";
    h.textContent=`${icone} ${titulo}`;
    c.appendChild(h);
    lista.forEach(t=>{
      const apr=statusTarefaAtual(t)==='aprovada',pend=statusTarefaAtual(t)==='aguardando_aprovacao';
      const badgeDias=t.dias&&t.dias.length?` • ${t.dias.map(x=>DIAS_LABEL[x]).join(',')}`:'';
      const animar=idTarefaRecemAprovada===t.id?' pop-anim':'';
      
      const row=document.createElement('div');
      row.className=`task-row${animar}`;
      row.innerHTML=`
        <div>
          <div class="task-name" style="${apr?'text-decoration:line-through;color:#94a3b8':''}">${esc(textoTarefaExibido(t.texto))}<span style="font-size:7px;color:#7c3aed;font-weight:900">${esc(badgeDias)}</span></div>
          <span class="task-reward">+${Number(t.xp)||20} XP • +${Number(t.recompensa)||5} 🪙 ${(t.fotoUrl||t.foto)?'• 📸':''}</span>
          ${t.motivoRecusa?`<div class="motivo-recusa">↩️ ${esc(t.motivoRecusa)}</div>`:''}
        </div>
        <div class="task-actions">
          ${apr?'<span style="font-size:9px;color:#10b981;font-weight:900">✓ Missão concluída!</span>':pend?'<span style="font-size:8px;color:#f59e0b;font-weight:900">Os pais estão conferindo</span>':`<button type="button" class="task-btn btn-photo" aria-label="Adicionar foto à missão">📷</button><button type="button" class="task-btn btn-ok">Concluí!</button>`}
        </div>
      `;
      row.querySelector('.btn-photo')?.addEventListener('click',()=>dispararCamera(t.id));
      row.querySelector('.btn-ok')?.addEventListener('click',()=>pedirConfirmacaoMissao(t.id));
      c.appendChild(row);
    });
  };
  bloco('Obrigatórias — liberam a ofensiva',o,'🔥');
  bloco('Extras — não afetam a ofensiva',x,'⭐');
  const preview=document.getElementById('missoes-preview');
  if(preview){
    preview.innerHTML=hojeLista.length?hojeLista.map(t=>{
      const status=statusTarefaAtual(t);
      const icone=status==='aprovada'?'✅':status==='aguardando_aprovacao'?'⏳':'○';
      return `<div class="missao-mini ${status==='aprovada'?'concluida':''}"><span class="missao-mini-estado" aria-hidden="true">${icone}</span><span class="missao-mini-nome">${esc(textoTarefaExibido(t.texto))}</span><span class="missao-mini-moedas">🪙 ${Number(t.recompensa)||5}</span></div>`;
    }).join(''):'<div class="missao-mini vazia">Nenhuma missão para hoje</div>';
  }
  if(!hojeLista.length){
    const aviso=document.createElement('div');
    aviso.style.cssText='padding:12px 10px;margin-top:8px;border-radius:12px;background:#eff6ff;border:1px solid #bfdbfe;color:#1e40af;font-size:9px;font-weight:800;text-align:center;line-height:1.4';
    aviso.innerHTML='📅 Nenhuma missão está programada para hoje.<br><small>Peça aos responsáveis para conferir os dias da missão.</small>';
    c.appendChild(aviso);
  }
  idTarefaRecemAprovada=null;
  atualizarOfensiva();
}
// O app abre sempre no perfil infantil; o perfil dos pais é acessado pelo botão próprio e continua protegido por PIN.
let CHAVE_PERFIL_LOCAL='ROTINAPET_PERFIL_'+codigoFamilia;
let perfilAtivo='crianca';
function verificarPrimeiroAcesso(){
  try{localStorage.setItem(CHAVE_PERFIL_LOCAL,'crianca')}catch(e){}
  const ids=Object.keys(estado.criancas||{});
  if(ids.length>1){
    abrirSelecaoCrianca();
  }else{
    entrarComoCrianca();
  }
}
function escolherPerfilInicial(tipo){
  perfilAtivo=tipo;
  try{localStorage.setItem(CHAVE_PERFIL_LOCAL,tipo)}catch(e){}
  fecharModal('modal-selecao-perfil');
  if(tipo==='pais'){
    abrirPainelPais();
  }else{
    const ids=Object.keys(estado.criancas||{});
    if(ids.length>1){
      abrirSelecaoCrianca();
    }else{
      entrarComoCrianca();
    }
  }
}
function abrirSelecaoCrianca(){
  const c=document.getElementById('lista-criancas-selecao');
  if(c){
    c.innerHTML='';
    Object.keys(estado.criancas).forEach(id=>{
      const info=estado.criancas[id];
      const btn=document.createElement('button');
      btn.className='primary-btn green-btn';
      btn.style.cssText='padding:12px;font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px';
      const icone=document.createElement('span');
      icone.style.fontSize='20px';
      icone.textContent=info.emoji||'🐾';
      btn.append(icone,document.createTextNode(' '+(info.nome||'')));
      btn.onclick=()=>{
        fecharModal('modal-selecao-crianca');
        trocarCriancaAtiva(id);
        entrarComoCrianca();
      };
      c.appendChild(btn);
    });
  }
  abrirModal('modal-selecao-crianca');
}
function entrarComoCrianca(){
  mostrarToast('🐾 Bem-vindo ao seu Pet!');
  setTimeout(()=>{atualizarCaixaConquistas()},850);
  if(!estado.onboardingVistoCrianca){
    setTimeout(()=>abrirModal('modal-onboarding'),450);
  }
}
function fecharOnboarding(iniciarTour){
  const nome=document.getElementById('input-nome-pet-inicial')?.value.trim().replace(/\s+/g,' ').slice(0,18);
  if(nome)estado.nomePet=nome;
  estado.onboardingVistoCrianca=true;
  salvar();
  atualizarTela();
  fecharModal('modal-onboarding');
  const palco=document.querySelector('.pet-stage');
  setTimeout(()=>{
    palco?.classList.add('eclosao-inicial');
    dispararConfetes(75);
    mostrarBalaoFala(`Olá! Eu sou ${estado.nomePet||'Pipoca'}!`);
    setTimeout(()=>palco?.classList.remove('eclosao-inicial'),1600);
  },300);
  if(iniciarTour){
    setTimeout(()=>iniciarTourGuiado(),1800);
  }
}
function alternarPerfil(){
  perfilAtivo=null;
  try{localStorage.removeItem(CHAVE_PERFIL_LOCAL)}catch(e){}
  abrirModal('modal-selecao-perfil');
}
let pinDigitado='';
  
 function obterAuth(){
  return window.firebase?.auth ? firebase.auth() : null;
}
function validarEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'').trim());
}
function mostrarErroRecuperacao(msg){
  mostrarAviso('⚠️','Não foi possível concluir',msg);
}
function abrirRecuperaPin(){
  const email=window.prompt('Digite o e-mail cadastrado dos responsáveis:');
  if(!email)return;
  enviarLinkRedefinir(email.trim());
}
async function enviarLinkRedefinir(email){
  const auth=obterAuth();
  if(!auth)return mostrarErroRecuperacao('O serviço de autenticação está indisponível.');
  if(!validarEmail(email))return mostrarErroRecuperacao('Digite um e-mail válido.');
  try{
    await auth.sendPasswordResetEmail(email);
    mostrarAviso('📧','E-mail enviado','Se esse endereço estiver cadastrado, você receberá um link para redefinir a senha. Verifique também o spam. Depois, volte ao app e use “Entrar com e-mail”.');
  }catch(error){
    // Mensagem genérica evita revelar se um email existe no sistema.
    console.warn('Falha ao enviar recuperação:',error);
    mostrarAviso('📧','Verifique seu e-mail','Se esse endereço estiver cadastrado, enviaremos instruções de recuperação.');
  }
}
function abrirLoginEmail(){
  fecharModal('modal-selecao-perfil');
  fecharModal('modal-pin');
  document.getElementById('telaLoginEmail').style.display='flex';
}
function fecharLoginEmail(){
  document.getElementById('telaLoginEmail').style.display='none';
  document.getElementById('inputLoginEmail').value='';
  document.getElementById('inputLoginSenha').value='';
}
async function entrarComEmail(){
  const email=document.getElementById('inputLoginEmail').value.trim();
  const senha=document.getElementById('inputLoginSenha').value;
  const auth=obterAuth();
  if(!auth)return mostrarErroRecuperacao('O serviço de autenticação está indisponível.');
  if(!validarEmail(email)||senha.length<6)return mostrarErroRecuperacao('Informe um e-mail válido e uma senha com pelo menos 6 caracteres.');
  try{
    await inicializacaoFirebase;
    await auth.signInWithEmailAndPassword(email,senha);
    const user=auth.currentUser;
    const codigoConta=familiaDaConta(user);
    if(!codigoConta&&!familiaExplicitaNesteAparelho){
      throw new Error('Esta conta ainda não tem uma família vinculada. Entre usando o convite ou o código da família e faça o vínculo pelo painel dos pais.');
    }
    const tokenResult=await user.getIdTokenResult(true);
    const familyClaim=tokenResult?.claims?.familyId;
    const familyRole=tokenResult?.claims?.familyRole;
    const destino=familyClaim||codigoConta||codigoFamilia;
    if(familyClaim!==destino||familyRole!=='parent')throw new Error('Esta conta ainda não foi aprovada como responsável. Abra o convite no aparelho e peça ao responsável para aprová-lo.');
    if(!dbFirebase)throw new Error('A nuvem está indisponível. Verifique a conexão e tente novamente.');
    codigoFamilia=destino;acessoFamiliar={familyId:destino,role:familyRole};perfilAtivo=familyRole==='parent'?'pais':'crianca';
    if(!codigoConta)await vincularFamiliaAConta(user);
    if(destino!==codigoFamilia){
      await filaEscritaNuvem.catch(()=>{});
      cargaNuvemPendente=true;
      dbFirebase.ref(getCaminhoFirebase()).off();
      codigoFamilia=destino;
      localStorage.setItem('ROTINAPET_FAMILIA_ID',codigoFamilia);
      CHAVE_PERFIL_LOCAL='ROTINAPET_PERFIL_'+codigoFamilia;
      estado=JSON.parse(JSON.stringify(estadoInicial));
      estado.tarefas=[];
      try{
        const salvo=localStorage.getItem(`ROTINAPET_SAVE_${codigoFamilia}`);
        if(salvo)estado={...estado,...JSON.parse(salvo)};
      }catch(e){console.warn('Cópia local indisponível:',e)}
      ultimoEstadoSincronizado=null;
      if(!await iniciarSincronizacaoNuvem())throw new Error('Não foi possível carregar a família. Tente novamente com internet.');
    }
    familiaExplicitaNesteAparelho=true;
    perfilAtivo='pais';
    localStorage.setItem(CHAVE_PERFIL_LOCAL,'pais');
    definirIdUsuario(user.uid);
    fecharLoginEmail();
    atualizarTela();
    // Login por e-mail autentica o responsável. Ainda exigimos privacidade e PIN personalizado se faltarem.
    if(!estado.privacidadeAceita){
      abrirPrivacidade(true);
      return;
    }
    if(!estado.pinPersonalizado){
      abrirDefinirPinObrigatorio(estado.pinHash?'trocar':'criar');
      return;
    }
    entrarPainelPaisPosAuth();
    mostrarAviso('✅','Acesso liberado','Bem-vindo(a) de volta! Se quiser, você pode alterar o PIN aqui no painel.');
  }catch(error){
    console.warn('Falha no login por email:',error);
    mostrarErroRecuperacao(error?.message&&!(error.code||'').startsWith('auth/')?error.message:'Não foi possível entrar. Confira e-mail e senha ou redefina sua senha pelo Firebase.');
  }
}
function restaurarBackupEstado(arquivo){
  const inputFile=document.getElementById('input-restaurar-backup');
  if(!arquivo)return;
  const leitor=new FileReader();
  leitor.onload=async ()=>{
    let dados;
    try{
      dados=JSON.parse(leitor.result);
    }catch(e){
      mostrarToast('⚠️ Arquivo inválido — não parece um backup do RotinaPet.');
      if(inputFile)inputFile.value='';
      return;
    }
    // Checagem mínima de que é mesmo um backup deste app.
    if(typeof dados!=='object'||dados===null||!Array.isArray(dados.tarefas)){
      mostrarToast('⚠️ Arquivo inválido — não parece um backup do RotinaPet.');
      if(inputFile)inputFile.value='';
      return;
    }
    const confirmado=window.confirm('Isso vai substituir TODOS os dados atuais desta família (moedas, tarefas, nível do pet...) pelo conteúdo do backup. Essa ação não pode ser desfeita. Deseja continuar?');
    if(inputFile)inputFile.value='';
    if(!confirmado)return;
    estado=dados;
    estado.pets={...{gato:{nivel:1,xp:0,felicidade:100,saude:100},cachorra:{nivel:1,xp:0,felicidade:100,saude:100},cabra:{nivel:1,xp:0,felicidade:100,saude:100},frango:{nivel:1,xp:0,felicidade:100,saude:100},unicornio:{nivel:1,xp:0,felicidade:100,saude:100},dinossauro:{nivel:1,xp:0,felicidade:100,saude:100},capivara:{nivel:1,xp:0,felicidade:100,saude:100}},...(estado.pets||{})};
    if(!Array.isArray(estado.tarefas))estado.tarefas=[];
    if(!Array.isArray(estado.recompensas))estado.recompensas=[];
    if(!Array.isArray(estado.solicitacoesPremios))estado.solicitacoesPremios=[];
    estado.conquistas=estado.conquistas||{};
    estado.historicoConclusoes=estado.historicoConclusoes||{};
    estado.registroDiario=estado.registroDiario||{};
    normalizarEmailsRecuperacao();
    garantirCriancaAtiva();
    salvar();
    renderizarPainelPais();
    atualizarTela();
    mostrarAviso('✅','Backup restaurado','Os dados foram restaurados com sucesso.');
  };
  leitor.onerror=()=>mostrarToast('⚠️ Não foi possível ler o arquivo.');
  leitor.readAsText(arquivo);
}
function baixarBackupEstado(){
  try{
    const conteudo=JSON.stringify(estado,null,2);
    const blob=new Blob([conteudo],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    const dataHoje=hojeLocal();
    a.href=url;
    a.download=`rotinapet-backup-${codigoFamilia}-${dataHoje}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    mostrarToast('💾 Backup baixado!');
  }catch(e){
    console.error('Falha ao gerar backup:',e);
    mostrarToast('⚠️ Não foi possível gerar o backup.');
  }
}
function atualizarBannerOffline(){
  if(!navigator.onLine){
    statusSyncAtual='offline';
    atualizarStatusSyncUI();
    return;
  }
  // Voltou online: tenta descarregar a fila
  if(filaSyncPendente||localStorage.getItem('ROTINAPET_FILA_SYNC_'+codigoFamilia)==='1'){
    statusSyncAtual='syncing';
    atualizarStatusSyncUI();
    if(sincronizacaoNuvemAtiva&&dbFirebase&&!cargaNuvemPendente)salvar();
  }else{
    statusSyncAtual=sincronizacaoNuvemAtiva?'online':'local';
    atualizarStatusSyncUI();
  }
}
window.addEventListener('online',atualizarBannerOffline);
window.addEventListener('offline',atualizarBannerOffline);
async function reiniciarVinculacaoEmail(){
  const auth=obterAuth();
  if(!auth)return mostrarErroRecuperacao('O serviço de autenticação não carregou. Recarregue a página.');
  const ok=window.confirm('Isso desvincula o e-mail de teste que já estava associado a este aparelho, para você cadastrar o e-mail correto do zero. Isso NÃO afeta o acesso à família (que depende só do código da família). Continuar?');
  if(!ok)return;
  try{
    await auth.signOut();
    const cred=await auth.signInAnonymously();
    const u=cred?.user||auth.currentUser;
    mostrarAviso('🔄','Sessão reiniciada',`Sessão nova criada (${u?.isAnonymous?'sem e-mail vinculado, pronto para cadastrar':'ainda com e-mail: '+u?.email}). Pode preencher o formulário e tocar em "Vincular E-mail".`);
  }catch(e){
    console.error('Falha ao reiniciar vinculação de e-mail:',e);
    mostrarErroRecuperacao(`Não foi possível reiniciar a sessão. Código técnico: ${e?.code||'desconhecido'} — ${e?.message||''}`);
  }
}
function abrirTelaEmailRecupera(){
  fecharModal('modal-pais');
  const inputEmail=document.getElementById('inputEmailRecupera');
  const inputEmailConfirma=document.getElementById('inputEmailRecuperaConfirma');
  const inputSenha=document.getElementById('inputSenhaRecupera');
  if(inputEmail)inputEmail.value='';
  if(inputEmailConfirma)inputEmailConfirma.value='';
  if(inputSenha)inputSenha.value='';
  document.getElementById('telaEmailRecupera').style.display='flex';
}
function fecharTelaEmail(){
  document.getElementById('telaEmailRecupera').style.display='none';
  document.getElementById('inputEmailRecupera').value='';
  document.getElementById('inputEmailRecuperaConfirma').value='';
  document.getElementById('inputSenhaRecupera').value='';
  renderizarPainelPais();
  abrirModal('modal-pais');
}
async function salvarEmailRecuperacao(){
  const email=document.getElementById('inputEmailRecupera').value.trim();
  const emailConfirma=document.getElementById('inputEmailRecuperaConfirma').value.trim();
  const senha=document.getElementById('inputSenhaRecupera').value;
  const auth=obterAuth();
  const user=auth?.currentUser;
  if(!auth)return mostrarErroRecuperacao('O serviço de autenticação não carregou (Código: auth-indisponivel). Verifique sua conexão e recarregue a página.');
  if(!user)return mostrarErroRecuperacao('Ainda não foi possível confirmar sua sessão neste aparelho (Código: sem-usuario). Aguarde alguns segundos e tente de novo; se persistir, recarregue a página.');
  if(familiaDaConta(user)&&familiaDaConta(user)!==codigoFamilia)return mostrarErroRecuperacao('Esta conta pertence a outra família. Abra a família vinculada antes de alterar o e-mail.');
  if(!validarEmail(email))return mostrarErroRecuperacao('Digite um e-mail válido.');
  if(email.toLowerCase()!==emailConfirma.toLowerCase())return mostrarErroRecuperacao('Os dois e-mails digitados são diferentes. Confira e tente de novo.');
  if(senha.length<6)return mostrarErroRecuperacao('A senha precisa ter pelo menos 6 caracteres.');
  try{
    if(user.isAnonymous){
      const cred=firebase.auth.EmailAuthProvider.credential(email,senha);
      await user.linkWithCredential(cred);
      await vincularFamiliaAConta(auth.currentUser);
    }else if(user.email!==email){
      // Firebase hoje exige confirmar o e-mail novo por link antes de trocar
      // (updateEmail() direto não é mais permitido). Isso envia o link e só
      // atualiza de fato quando a pessoa clicar nele.
      await user.verifyBeforeUpdateEmail(email);
      await user.updatePassword(senha).catch(()=>{});
      await vincularFamiliaAConta(user);
      normalizarEmailsRecuperacao();
      salvar();
      fecharTelaEmail();
      mostrarAviso('📩','Confirme por e-mail',`Enviamos um link de confirmação para ${email}. O e-mail só passa a valer para login depois que você clicar nesse link.`);
      return;
    }else{
      await user.updatePassword(senha);
    }
    await vincularFamiliaAConta(auth.currentUser);
    normalizarEmailsRecuperacao();
    const jaTinha=estado.emailsRecuperacao.some(e=>e.toLowerCase()===email.toLowerCase());
    if(!jaTinha){
      if(estado.emailsRecuperacao.length>=2)estado.emailsRecuperacao.shift();
      estado.emailsRecuperacao.push(email);
    }
    salvar();
    fecharTelaEmail();
    mostrarAviso('✅','E-mail vinculado','Agora você pode recuperar a senha por e-mail e entrar novamente nesta conta.');
  }catch(error){
    console.warn('Falha ao vincular email:',error);
    const msg=error?.code==='auth/email-already-in-use'?'Este e-mail já pertence a outra conta. Use outro endereço ou entre com ele.':error?.code==='auth/requires-recent-login'?'Por segurança, entre novamente com sua conta antes de trocar o e-mail.':`Não foi possível vincular. [sessão anônima: ${user?.isAnonymous};  e-mail atual: ${user?.email||'nenhum'}] Código: ${error?.code||'desconhecido'} — ${error?.message||''}`;
    mostrarErroRecuperacao(msg);
  }
}
function abrirPainelPais(){
  if(acessoFamiliar?.role==='child'){mostrarToast('🔒 Só um responsável pode abrir este painel.');return}
  // Primeiro acesso: criar PIN do zero (sem senha padrão 1234 em produção).
  if(!estado.pinPersonalizado&&!estado.pinHash){
    if(!estado.privacidadeAceita){
      abrirPrivacidade(true);
      return;
    }
    abrirDefinirPinObrigatorio('criar');
    return;
  }
  limparPin();
  montarTecladoPin();
  atualizarEstadoBloqueioPin();
  abrirModal('modal-pin');
}
function limparPin(){
  pinDigitado='';
  atualizarDots();
}
function montarTecladoPin(){
  const c=document.getElementById('pin-pad');
  if(!c)return;
  c.innerHTML='';
  const teclas=[1,2,3,4,5,6,7,8,9,'⌫',0,'✓'];
  teclas.forEach(k=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='pin-key';
    b.textContent=k;
    b.onclick=(e)=>{
      e.stopPropagation();
      if(estaPinBloqueado())return;
      if(k==='⌫'){
        pinDigitado=pinDigitado.slice(0,-1);
      }else if(k==='✓'){
        validarPin();
      }else if(pinDigitado.length<4){
        pinDigitado+=String(k);
      }
      atualizarDots();
      if(pinDigitado.length===4&&k!=='✓'){
        setTimeout(validarPin,150);
      }
    };
    c.appendChild(b);
  });
  atualizarDots();
}
function atualizarDots() {
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((dot, i) => {
    if (i < pinDigitado.length) {
      dot.classList.add('active', 'filled');
      dot.textContent = '•';
      dot.style.fontSize = '28px';
      dot.style.display = 'flex';
      dot.style.alignItems = 'center';
      dot.style.justifyContent = 'center';
      dot.style.color = '#7C3AED';
    } else {
      dot.classList.remove('active', 'filled');
      dot.textContent = '';
    }
  });
}
const PIN_MAX_TENTATIVAS=5;
const PIN_BLOQUEIO_MS=60000;
function estaPinBloqueado(){
  return !!(estado.pinBloqueadoAte&&Date.now()<estado.pinBloqueadoAte);
}
function atualizarEstadoBloqueioPin(){
  const erroEl=document.getElementById('pin-erro');
  const bloqueado=estaPinBloqueado();
  document.querySelectorAll('.pin-key').forEach(k=>k.disabled=bloqueado);
  if(!erroEl)return;
  if(bloqueado){
    const segundosRestantes=Math.ceil((estado.pinBloqueadoAte-Date.now())/1000);
    erroEl.textContent=`🔒 Aguarde ${segundosRestantes}s para tentar novamente.`;
    setTimeout(()=>{
      if(document.getElementById('modal-pin')?.classList.contains('mostrar'))atualizarEstadoBloqueioPin();
    },1000);
  }else{
    erroEl.textContent='';
  }
}
async function validarPin(){
  if(estaPinBloqueado())return;
  
  // Famílias antigas sem hash: não gravamos mais 1234 em silêncio.
  // Pedimos criação de PIN seguro.
  if(!estado.pinHash){
    fecharModal('modal-pin');
    limparPin();
    if(!estado.privacidadeAceita){
      abrirPrivacidade(true);
      return;
    }
    abrirDefinirPinObrigatorio('criar');
    return;
  }
  const hashDigitado=await hashPin(pinDigitado);
  let pinCorreto=hashDigitado===estado.pinHash;
  if(!pinCorreto){
    // Migração: pode ser um hash salvo no formato antigo (amarrado ao codigoFamilia
    // de quando o PIN foi criado). Testamos os códigos conhecidos e, se bater,
    // regravamos no formato novo para não depender mais do código da família.
    const codigosParaTestar=[codigoFamilia,localStorage.getItem('ROTINAPET_FAMILIA_ID')].filter(Boolean);
    for(const codigo of codigosParaTestar){
      if(await hashPinLegado(pinDigitado,codigo)===estado.pinHash){
        pinCorreto=true;
        break;
      }
    }
  }
  // Detecta PIN legado inseguro 1234 ainda em uso.
  const aindaPinPadrao=pinCorreto&&(await hashPin('1234'))===estado.pinHash;
  if(pinCorreto){
    estado.pinHash=hashDigitado;
    estado.pinTentativasFalhas=0;
    estado.pinBloqueadoAte=null;
    if(aindaPinPadrao)estado.pinPersonalizado=false;
    salvar();
    fecharModal('modal-pin');
    limparPin();
    // Obrigatório trocar PIN padrão / não personalizado antes do painel.
    if(!estado.pinPersonalizado||aindaPinPadrao){
      if(!estado.privacidadeAceita){
        abrirPrivacidade(true);
        return;
      }
      abrirDefinirPinObrigatorio('trocar');
      return;
    }
    if(!estado.privacidadeAceita){
      abrirPrivacidade(true);
      return;
    }
    entrarPainelPaisPosAuth();
  }else{
    estado.pinTentativasFalhas=(estado.pinTentativasFalhas||0)+1;
    limparPin();
    if(estado.pinTentativasFalhas>=PIN_MAX_TENTATIVAS){
      estado.pinBloqueadoAte=Date.now()+PIN_BLOQUEIO_MS;
      estado.pinTentativasFalhas=0;
      salvar();
      atualizarEstadoBloqueioPin();
    }else{
      salvar();
      const erroEl=document.getElementById('pin-erro');
      const restam=PIN_MAX_TENTATIVAS-estado.pinTentativasFalhas;
      if(erroEl)erroEl.textContent=`❌ PIN incorreto. ${restam} tentativa(s) restante(s).`;
      navigator.vibrate?.(120);
    }
  }
}
function renderizarListaCriancasPais(){
  const c=document.getElementById('lista-criancas-pais');
  if(!c)return;
  c.innerHTML='';
  const ids=Object.keys(estado.criancas||{});
  ids.forEach(id=>{
    const info=estado.criancas[id];
    const ativa=id===estado.criancaAtivaId;
    const row=document.createElement('div');
    row.style.cssText='display:flex;align-items:center;gap:6px;padding:6px;border-radius:10px;'+(ativa?'background:#ede9fe;border:1px solid #a78bfa':'background:#fff;border:1px solid #e5e7eb');
    const icone=document.createElement('span');
    icone.style.fontSize='18px';
    icone.textContent=info.emoji||'🐾';
    const nome=document.createElement('span');
    nome.style.cssText=`flex:1;font-size:11px;font-weight:${ativa?'800':'600'}`;
    nome.textContent=(info.nome||'')+(ativa?' (ativo agora)':'');
    row.append(icone,nome);
    if(!ativa){
      const btnTrocar=document.createElement('button');
      btnTrocar.className='primary-btn blue-btn';
      btnTrocar.style.cssText='padding:4px 8px;font-size:9px';
      btnTrocar.textContent='Trocar';
      btnTrocar.onclick=()=>trocarCriancaAtiva(id);
      row.appendChild(btnTrocar);
    }
    const btnRenomear=document.createElement('button');
    btnRenomear.className='primary-btn blue-btn botao-secundario';
    btnRenomear.style.cssText='padding:4px 8px;font-size:9px';
    btnRenomear.textContent='✏️';
    btnRenomear.onclick=()=>renomearCrianca(id);
    row.appendChild(btnRenomear);
    if(ids.length>1){
      const btnExcluir=document.createElement('button');
      btnExcluir.className='primary-btn botao-secundario';
      btnExcluir.style.cssText='padding:4px 8px;font-size:9px;color:#dc2626';
      btnExcluir.textContent='🗑️';
      btnExcluir.onclick=()=>excluirCrianca(id);
      row.appendChild(btnExcluir);
    }
    c.appendChild(row);
  });
}
function abrirNovoFilho(){
  const nome=window.prompt('Nome do novo filho:');
  if(!nome||!nome.trim())return;
  const emoji=window.prompt('Escolha um emoji para representar (ex: 🐱 🦁 🐶 🐸):','🐾')||'🐾';
  const id=criarNovaCrianca(nome,emoji);
  trocarCriancaAtiva(id);
  renderizarListaCriancasPais();
  mostrarToast(`👨‍👩‍👧‍👦 ${nome} adicionado(a)!`);
}
function renomearCrianca(id){
  if(!estado.criancas[id])return;
  const nome=window.prompt('Novo nome:',estado.criancas[id].nome);
  if(!nome||!nome.trim())return;
  const emoji=window.prompt('Emoji (deixe igual se não quiser trocar):',estado.criancas[id].emoji)||estado.criancas[id].emoji;
  estado.criancas[id]={...estado.criancas[id],nome:nome.trim().slice(0,30),emoji};
  salvar();
  renderizarListaCriancasPais();
  if(id===estado.criancaAtivaId)atualizarTela();
}
function excluirCrianca(id){
  if(!estado.criancas[id]||Object.keys(estado.criancas).length<=1)return;
  const ok=window.confirm(`Excluir ${estado.criancas[id].nome}? Todo o progresso desse filho (moedas, tarefas, pet) será apagado para sempre.`);
  if(!ok)return;
  const eraAtiva=id===estado.criancaAtivaId;
  delete estado.criancas[id];
  if(estado.criancasDados)delete estado.criancasDados[id];
  if(eraAtiva){
    const proximoId=Object.keys(estado.criancas)[0];
    aplicarDadosCrianca(estado.criancasDados&&estado.criancasDados[proximoId]);
    estado.criancaAtivaId=proximoId;
    salvar();
    atualizarTela();
    ultimoFundoParticulas=null;
    renderizarParticulasCenario(estado.fundoAtual);
  }else{
    salvar();
  }
  renderizarListaCriancasPais();
}
function renderizarResumoPainelPais(){
  const lista=tarefasDeHoje();
  const aprovadas=lista.filter(t=>statusTarefaAtual(t)==='aprovada').length;
  const pendentes=lista.filter(t=>statusTarefaAtual(t)==='aguardando_aprovacao').length;
  const total=lista.length;
  const perc=total?Math.round((aprovadas/total)*100):0;
  const elFeitas=document.getElementById('pais-feitas-hoje');
  const elPend=document.getElementById('pais-pendentes-hoje');
  const elStreak=document.getElementById('pais-streak-hoje');
  const elBadge=document.getElementById('pais-resumo-badge');
  const elSub=document.getElementById('pais-resumo-sub');
  const elProx=document.getElementById('pais-proxima-missao');
  if(elFeitas)elFeitas.textContent=`${aprovadas}/${total}`;
  if(elPend)elPend.textContent=pendentes;
  if(elStreak)elStreak.textContent=estado.streak||0;
  if(elBadge)elBadge.textContent=`${perc}%`;
  if(elSub)elSub.textContent=total?`${aprovadas} de ${total} missão(ões) concluída(s) hoje.`:'Nenhuma missão configurada para hoje.';
  if(elProx){
    const aguardando=lista.find(t=>statusTarefaAtual(t)==='aguardando_aprovacao');
    const proxima=lista.find(t=>statusTarefaAtual(t)!=='aprovada'&&statusTarefaAtual(t)!=='aguardando_aprovacao');
    if(aguardando)elProx.textContent=`⏳ Aguardando sua aprovação: ${aguardando.texto} · ${Number(aguardando.recompensa)||0} 🪙`;
    else if(proxima)elProx.textContent=`🎯 Próxima missão: ${proxima.texto} · ${Number(proxima.recompensa)||0} 🪙`;
    else if(total)elProx.textContent='🎉 Todas as missões de hoje foram concluídas!';
    else elProx.textContent='🎯 Nenhuma missão pendente hoje.';
  }
}
async function renderizarSolicitacoesAcesso(){
  if(acessoFamiliar?.role!=='parent'||!dbFirebase)return;
  const lista=document.getElementById('lista-aprovacao-pais');
  if(!lista?.parentElement)return;
  let box=document.getElementById('acesso-familiar-pendencias');
  if(!box){box=document.createElement('section');box.id='acesso-familiar-pendencias';box.style.cssText='margin:10px 0;padding:10px;border:1px solid #ddd6fe;border-radius:14px;background:#faf5ff';lista.parentElement.insertBefore(box,lista)}
  try{
    const resposta=await firebase.functions('us-central1').httpsCallable('listarSolicitacoesFamilia')({});
    const pendentes=Object.entries(resposta.data?.requests||{}).filter(([,r])=>r?.status==='pending');
    box.replaceChildren();const titulo=document.createElement('strong');titulo.textContent='📱 Aparelhos aguardando aprovação';box.appendChild(titulo);
    if(!pendentes.length){const vazio=document.createElement('div');vazio.textContent='Nenhuma solicitação pendente.';vazio.style.marginTop='6px';box.appendChild(vazio);return}
    pendentes.forEach(([uid])=>{
      const linha=document.createElement('div');linha.style.cssText='display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px';
      const texto=document.createElement('span');texto.textContent='Aparelho · '+uid.slice(0,8);
      const botao=document.createElement('button');botao.type='button';botao.className='primary-btn green-btn';botao.textContent='Aprovar como criança';botao.addEventListener('click',()=>aprovarAparelhoFamilia(uid,botao));
      linha.append(texto,botao);box.appendChild(linha);
    });
  }catch(error){console.warn('Solicitações de acesso indisponíveis:',error);box.replaceChildren()}
}
async function aprovarAparelhoFamilia(uid,botao){
  if(acessoFamiliar?.role!=='parent')return;
  botao.disabled=true;botao.textContent='Aprovando…';
  try{await firebase.functions('us-central1').httpsCallable('aprovarAcessoFamilia')({uid,role:'child'});mostrarToast('✅ Aparelho aprovado. No outro aparelho, atualize o app.');await renderizarSolicitacoesAcesso()}
  catch(error){console.error('Falha ao aprovar aparelho:',error);mostrarToast('⚠️ Não foi possível aprovar este aparelho.');botao.disabled=false;botao.textContent='Aprovar como criança'}
}
function renderizarPainelPais(){
  document.getElementById('input-taxa-cambio').value=estado.taxaCambio;
  document.getElementById('input-idade-crianca').value=estado.idadeCrianca||7;
  document.getElementById('input-dificuldade-jogos').value=estado.dificuldadeJogos||'auto';
  const opcaoMesada=document.getElementById('opcao-mesada');
  if(opcaoMesada)opcaoMesada.checked=estado.mesadaAtiva!==false;
  renderizarResumoPainelPais();
  renderizarMetas();
  renderizarListaCriancasPais();
  const stPin=document.getElementById('txt-status-pin');
  if(stPin)stPin.textContent=estado.pinPersonalizado?'✅ PIN personalizado ativo.':'⚠️ Defina um PIN personalizado o quanto antes.';
  const statusEmail=document.getElementById('txt-status-email-recupera');
  if(statusEmail){
    const lista=Array.isArray(estado.emailsRecuperacao)?estado.emailsRecuperacao:[];
    statusEmail.textContent=lista.length?`✅ Vinculado${lista.length>1?'s':''}: ${lista.join(', ')}`:'Nenhum e-mail vinculado ainda.';
  }
  const inputFam=document.getElementById('input-codigo-familia');
  if(inputFam)inputFam.value=codigoFamilia;
  montarPickerDiasNovaTarefa();
  atualizarBannerPausaPainel();
  atualizarBotaoLembrete();
  renderizarGerenciamentoPremiosPais();
  renderizarSolicitacoesPremiosPais();
  renderizarSolicitacoesAcesso();
  const ap=document.getElementById('lista-aprovacao-pais');
  const ps=estado.tarefas.filter(t=>(!t.dataSugerida||t.dataSugerida===hojeLocal())&&statusTarefaAtual(t)==='aguardando_aprovacao');
  const contador=document.getElementById('contador-aprovacoes-pais');
  if(contador)contador.textContent=ps.length?`(${ps.length})`:'';
  ap.innerHTML=ps.length?ps.map(t=>{
    const fotoSrc=t.fotoUrl||t.foto||'';
    const fotoHtml=fotoSrc?`<img class="approval-foto" src="${esc(fotoSrc)}" alt="Comprovante da missão">`:'';
    return `<div class="approval-row" data-task-id="${esc(String(t.id))}"><div class="approval-top"><span>${t.tipo==='obrigatoria'?'🔥':'⭐'} <b>${esc(t.texto)}</b> ${fotoSrc?'📸':''}</span><div style="display:flex;gap:4px"><button type="button" class="primary-btn red-btn" data-aprovacao="recusar">Recusar</button><button type="button" class="primary-btn green-btn" data-aprovacao="aprovar">Aprovar</button></div></div>${fotoHtml}</div>`;
  }).join(''):'<span style="font-size:9px;color:#94a3b8">Nenhuma pendente.</span>';
  ap.onclick=evento=>{
    const botao=evento.target.closest('[data-aprovacao]');
    if(botao){
      const id=botao.closest('.approval-row')?.dataset.taskId;
      if(id==null)return;
      if(botao.dataset.aprovacao==='aprovar')aprovarTarefaPais(id);
      else reprovarTarefaPais(id);
      return;
    }
    const foto=evento.target.closest('.approval-foto');
    if(foto)abrirVisualizadorFoto(foto.currentSrc||foto.src);
  };
  
  const ed=document.getElementById('lista-edicao-tarefas');
  ed.innerHTML='';
  estado.tarefas.filter(t=>!t.extraRotativa||t.dataSugerida===hojeLocal()).forEach(t=>{
    const diasTxt=t.dias&&t.dias.length?t.dias.map(i=>DIAS_LABEL[i]).join(','):'todo dia';
    const row=document.createElement('div');
    row.className='edit-row';
    row.style.cssText='gap:5px;flex-wrap:wrap';
    row.innerHTML=`
      <span style="flex:1">${t.tipo==='obrigatoria'?'🔥':'⭐'} ${esc(t.texto)} • ${Number(t.recompensa)||5}🪙 <br><small style="color:#94a3b8">📅 ${diasTxt}</small></span>
      <select class="field" style="width:100px;padding:5px">
        <option value="obrigatoria" ${t.tipo==='obrigatoria'?'selected':''}>Obrigatória</option>
        <option value="extra" ${t.tipo==='extra'?'selected':''}>Extra</option>
      </select>
      <button type="button" class="primary-btn blue-btn btn-dias-tarefa">📅</button>
      <button type="button" class="primary-btn red-btn btn-remover-tarefa">Excluir</button>
      <select class="field seletor-habilidade-tarefa" aria-label="Habilidade da tarefa" style="width:100%">
        <option value="" ${!t.habilidade?'selected':''}>Sem habilidade</option>
        ${EMBLEMAS_HABILIDADES.map(h=>`<option value="${h.id}" ${t.habilidade===h.id?'selected':''}>${h.emoji} ${h.nome}</option>`).join('')}
      </select>
    `;
    row.querySelector('select').addEventListener('change',evento=>alterarTipoTarefa(t.id,evento.target.value));
    row.querySelector('.btn-dias-tarefa').addEventListener('click',()=>editarDiasTarefa(t.id));
    row.querySelector('.btn-remover-tarefa').addEventListener('click',()=>removerTarefa(t.id));
    row.querySelector('.seletor-habilidade-tarefa').addEventListener('change',evento=>{
      t.habilidade=evento.target.value;
      persistirTarefaIndividualV2(t).catch(e=>console.warn('Tarefa individual:',e));
      salvar();
      mostrarToast('🌟 Habilidade da tarefa atualizada.');
    });
    ed.appendChild(row);
  });
  atualizarEstatisticas();
  renderizarVolumeSomPainel();
  renderizarHistoricoTarefas();
  renderizarLogAtividades();
  renderizarMetaFamiliar();
}
function atualizarVolumeSom(val){
  const n=Math.max(0,Math.min(100,parseInt(val,10)||0));
  estado.volumeSom=n/100;
  const txt=document.getElementById('txt-volume-som');
  if(txt)txt.textContent=n+'%';
  salvar();
}
function atualizarSonsAtivos(ativo){
  estado.sonsAtivos=!!ativo;
  if(!ativo){
    Object.values(sonsPrecarregados).forEach(audio=>{audio.pause();audio.currentTime=0});
    audioPetEmReproducao?.pause();
  }
  renderizarVolumeSomPainel();
  salvar();
}
function renderizarVolumeSomPainel(){
  const input=document.getElementById('input-volume-som');
  const txt=document.getElementById('txt-volume-som');
  const pct=Math.round(Math.max(0,Math.min(1,Number(estado.volumeSom)||0))*100);
  if(input)input.value=pct;
  if(txt)txt.textContent=pct+'%';
  const controle=document.getElementById('input-sons-ativos');
  const estadoEl=document.getElementById('txt-sons-ativos');
  if(controle)controle.checked=estado.sonsAtivos!==false;
  if(estadoEl)estadoEl.textContent=estado.sonsAtivos===false?'Desligados':'Ligados';
}
function limparTodasFotosTarefas(){
  const fotos=(estado.tarefas||[]).filter(t=>t.foto||t.fotoUrl||t.fotoPath);
  const qtd=fotos.length;
  if(!qtd)return mostrarToast('Nenhuma foto para apagar.');
  mostrarConfirmacao(`Apagar ${qtd} foto(s) de tarefas?`,async()=>{
    for(const t of fotos){
      if(t.fotoPath&&storageFirebase){try{await storageFirebase.ref(t.fotoPath).delete()}catch(e){console.warn('Falha ao apagar foto do Storage:',e)}}
      t.foto=null;t.fotoUrl=null;t.fotoPath=null;t.atualizadoEm=Date.now();
      persistirTarefaIndividualV2(t).catch(e=>console.warn('Limpeza de foto:',e));
    }
    registrarLogAtividade(`Fotos de tarefas apagadas (${qtd})`);
    salvar();renderizarPainelPais();atualizarTela();mostrarToast('🗑️ Fotos removidas.');
  });
}
function renderizarHistoricoTarefas(){
  const c=document.getElementById('lista-historico-tarefas');
  if(!c)return;
  const eventos=[];
  (estado.tarefas||[]).forEach(t=>(t.historicoAprovacoes||[]).forEach(h=>eventos.push({...h,texto:t.texto})));
  eventos.sort((a,b)=>(b.t||0)-(a.t||0));
  if(!eventos.length){c.innerHTML='<span style="font-size:9px;color:#94a3b8">Nenhuma aprovação ou recusa registrada ainda.</span>';return;}
  c.innerHTML=eventos.slice(0,20).map(h=>{
    const d=new Date(h.t||Date.now());
    const data=`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    const ok=h.status==='aprovada';
    return `<div class="historico-tarefa"><div class="hist-data">${data}</div><div class="${ok?'hist-ok':'hist-no'}">${ok?'✅ Aprovada':'↩️ Recusada'}: ${esc(h.texto)}</div>${!ok&&h.motivo?`<div class="hist-motivo">Motivo: ${esc(h.motivo)}</div>`:''}</div>`;
  }).join('');
}
function renderizarLogAtividades(){
  const c=document.getElementById('lista-log-atividades');
  if(!c)return;
  const logs=Array.isArray(estado.logAtividades)?estado.logAtividades:[];
  if(!logs.length){
    c.innerHTML='<span style="font-size:9px;color:#94a3b8">Nenhuma atividade registrada ainda.</span>';
    return;
  }
  c.innerHTML=logs.slice(0,20).map(l=>{
    const d=new Date(l.t||Date.now());
    const hora=`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    return `<div style="font-size:9px;padding:5px 0;border-bottom:1px solid #f1f5f9"><b style="color:#64748b">${hora}</b> — ${esc(l.txt)}</div>`;
  }).join('');
}
function limparLogAtividades(){
  estado.logAtividades=[];
  salvar();
  renderizarLogAtividades();
  mostrarToast('Log limpo.');
}
function abrirVisualizadorFoto(src){
  document.getElementById('foto-viewer-img').src=src;
  document.getElementById('foto-viewer').classList.add('mostrar');
}
function fecharVisualizadorFoto(){
  document.getElementById('foto-viewer').classList.remove('mostrar');
}
function reprovarTarefaPais(id){
  const t=estado.tarefas.find(x=>String(x.id)===String(id));
  if(!t||statusTarefaAtual(t)!=='aguardando_aprovacao')return;
  const motivo=window.prompt(`Por que a tarefa "${t.texto}" precisa ser refeita?`,t.motivoRecusa||'')
  if(motivo===null)return;
  const texto=motivo.trim().slice(0,180);
  mostrarConfirmacao(`Devolver a tarefa para a criança${texto?` com o motivo: "${texto}"`:''}?`,()=>{
    t.status='pendente';
    t.motivoRecusa=texto||'Confira a tarefa e tente novamente.';
    t.foto=null;
    const r=t.registros?.[hojeLocal()];
    if(r){r.status='pendente';r.foto=null;r.motivoRecusa=t.motivoRecusa;r.recusadaEm=Date.now();r.historico=r.historico||[];r.historico.push({status:'recusada',t:Date.now(),motivo:t.motivoRecusa});r.historico=r.historico.slice(-20);r.atualizadoEm=Date.now();}
    t.historicoAprovacoes=t.historicoAprovacoes||[];t.historicoAprovacoes.push({status:'recusada',t:Date.now(),motivo:t.motivoRecusa});t.historicoAprovacoes=t.historicoAprovacoes.slice(-20);
    registrarLogAtividade(`Tarefa recusada: ${t.texto} — ${t.motivoRecusa}`);
    persistirTarefaIndividualV2(t).catch(e=>console.warn('Tarefa individual:',e));
    salvar();
    renderizarPainelPais();
    atualizarTela();
    mostrarToast('↩️ Devolvida com orientação para a criança.');
  });
}
async function trocarFamiliaManualmente(){
  const input=document.getElementById('input-codigo-familia');
  const novoCodigo=(input?.value||'').trim().toLowerCase().replace(/[^a-z0-9_-]/g,'');
  if(!novoCodigo||novoCodigo.length<8){
    mostrarToast('⚠️ O código deve ter pelo menos 8 caracteres alfanuméricos.');
    return;
  }
  if(novoCodigo===codigoFamilia){
    mostrarToast('🏠 Você já está nesta família.');
    return;
  }
  const contaVinculada=familiaDaConta(obterAuth()?.currentUser);
  if(contaVinculada&&contaVinculada!==novoCodigo){
    mostrarToast('⚠️ Sua conta já pertence a outra família. Use a conta vinculada ao código desejado.');
    return;
  }
  if(dbFirebase)dbFirebase.ref(getCaminhoFirebase()).off();
  codigoFamilia=novoCodigo;
  familiaExplicitaNesteAparelho=true;
  localStorage.setItem('ROTINAPET_FAMILIA_ID',codigoFamilia);
  CHAVE_PERFIL_LOCAL='ROTINAPET_PERFIL_'+codigoFamilia;
  // Carrega o backup local específico da nova família antes da sincronização.
  try{
    const localNovo=localStorage.getItem(`ROTINAPET_SAVE_${codigoFamilia}`);
    if(localNovo){
      const d=JSON.parse(localNovo);
      estado={...estado,...d,pets:{...estado.pets,...(d.pets||{})}};
    }
  }catch(e){console.warn('Backup local inválido',e)}
  fecharModal('modal-pais');
  if(sincronizacaoNuvemAtiva){
    await iniciarSincronizacaoNuvem();
  }else{
    atualizarTela();
  }
  mostrarToast('🏠 Família alterada com sucesso.');
}
function alterarTipoTarefa(id,tipo){
  const t=estado.tarefas.find(x=>String(x.id)===String(id));
  if(!t)return;
  t.tipo=tipo==='extra'?'extra':'obrigatoria';
  salvar();
  renderizarPainelPais();
  renderizarTarefas();
  atualizarTela();
  mostrarToast(t.tipo==='obrigatoria'?'🔥 Tarefa obrigatória.':'⭐ Tarefa extra.');
}
function abrirBauSemanal(streakAtual){
  const moedasGanhas=15+Math.floor(Math.random()*16);
  const xpGanho=50;
  estado.moedas+=moedasGanhas;
  estado.ultimoStreakPremiado=streakAtual;
  ganharXP(xpGanho);
  salvar();
  atualizarTela();
  enfileirarRecompensaCrianca({tipo:'semanal',streak:streakAtual,moedas:moedasGanhas,xp:xpGanho});
}
function registrarNoRelatorioDiario(tarefasSomar,moedasSomar){
  const hoje=hojeLocal();
  estado.registroDiario=estado.registroDiario||{};
  const r=estado.registroDiario[hoje]||{tarefas:0,moedas:0};
  r.tarefas+=tarefasSomar;
  r.moedas+=moedasSomar;
  estado.registroDiario[hoje]=r;
  const chaves=Object.keys(estado.registroDiario).sort();
  if(chaves.length>60)delete estado.registroDiario[chaves[0]];
}
async function apagarFotoDepoisDaAprovacao(t,registro){
  const registrosAprovados=Object.values(t?.registros||{}).filter(r=>r&&r.status==='aprovada');
  if(registro&&!registrosAprovados.includes(registro))registrosAprovados.push(registro);
  const caminhos=new Set([t?.fotoPath,...registrosAprovados.map(r=>r.fotoPath)].filter(Boolean));
  if(storageFirebase&&caminhos.size){
    const resultados=await Promise.allSettled([...caminhos].map(caminho=>storageFirebase.ref(caminho).delete()));
    const falhas=resultados.filter(r=>r.status==='rejected');
    if(falhas.length){
      falhas.forEach(r=>console.warn('Foto aprovada não pôde ser apagada do Storage:',r.reason));
      registrarLogAtividade(`Aviso: ${falhas.length} foto(s) aprovada(s) não puderam ser apagadas do Storage para a tarefa ${t.texto}`);
    }
  }
  // Remove a foto atual e as cópias dos registros já aprovados. Fotos de
  // registros ainda pendentes ou recusados continuam disponíveis aos pais.
  t.foto=null;t.fotoUrl=null;t.fotoPath=null;
  registrosAprovados.forEach(r=>{
    r.foto=null;r.fotoUrl=null;r.fotoPath=null;r.fotoApagadaEm=Date.now();
  });
}
async function aprovarTarefaPais(id){
  const t=estado.tarefas.find(x=>String(x.id)===String(id));
  if(!t)return;
  const hoje=hojeLocal();
  const registroAprovacao=registroTarefaHoje(t);
  // Idempotência: a mesma tarefa só pode pagar uma vez por dia.
  // O marcador fica no registro diário e continua após recarregar ou sincronizar.
  if(t.status==='aprovada'||registroAprovacao.status==='aprovada'||registroAprovacao.recompensaPagaEm){
    mostrarToast('ℹ️ Esta tarefa já foi processada hoje.');
    return;
  }
  if(statusTarefaAtual(t)!=='aguardando_aprovacao'){
    mostrarToast('ℹ️ A missão não está aguardando aprovação.');
    return;
  }
  const agora=Date.now();
  const recompensa=Math.max(0,Number(t.recompensa)||0);
  const xp=Math.max(0,Number(t.xp)||20);
  t.status='aprovada';
  registroAprovacao.status='aprovada';
  registroAprovacao.aprovadaEm=agora;
  registroAprovacao.recompensaPagaEm=agora;
  registroAprovacao.pagamentoId=`tarefa:${String(t.id)}:${hoje}`;
  registroAprovacao.historico=registroAprovacao.historico||[];
  registroAprovacao.historico.push({status:'aprovada',t:agora,pagamentoId:registroAprovacao.pagamentoId});
  registroAprovacao.historico=registroAprovacao.historico.slice(-20);
  t.historicoAprovacoes=t.historicoAprovacoes||[];
  t.historicoAprovacoes.push({status:'aprovada',t:agora,pagamentoId:registroAprovacao.pagamentoId});
  t.historicoAprovacoes=t.historicoAprovacoes.slice(-20);
  // Comprovante só é necessário até a decisão dos pais.
  await apagarFotoDepoisDaAprovacao(t,registroAprovacao);
  // O marcador é salvo antes das atualizações visuais. Se o usuário tocar novamente,
  // a função retorna sem conceder moedas ou XP em duplicidade.
  estado.moedas=(Number(estado.moedas)||0)+recompensa;
  creditoMesada(recompensa);
  estado.tarefasHojeCount=(Number(estado.tarefasHojeCount)||0)+1;
  registrarNoRelatorioDiario(1,recompensa);
  registrarHabilidadeAprovada(t);
  if(typeof garantirEngajamento==='function'){
    garantirEngajamento();
    estado.missaoFamilia.progresso=Math.min(Number(estado.missaoFamilia.alvo)||20,(Number(estado.missaoFamilia.progresso)||0)+1);
    estado.eventoSemanalProgresso=(Number(estado.eventoSemanalProgresso)||0)+1;
  }
  persistirTarefaIndividualV2(t).catch(e=>console.warn('Tarefa individual:',e));
  salvar();
  idTarefaRecemAprovada=id;
  if(estado.tarefasHojeCount===1)enfileirarRecompensaCrianca({tipo:'bau',data:hoje});
  const liberouOfensiva=registrarConclusaoDoDia();
  if(liberouOfensiva){
    const s=estado.streak;
    if(s>0&&s%7===0&&(estado.ultimoStreakPremiado||0)<s){
      setTimeout(()=>abrirBauSemanal(s),600);
    }
  }
  const nivelAntes=obterDadosPetAtual().nivel;
  ganharXP(xp);
  if(obterDadosPetAtual().nivel===nivelAntes)playSound('moedas');
  estado.avisosMissao=Array.isArray(estado.avisosMissao)?estado.avisosMissao:[];
  estado.avisosMissao.push(t.texto);
  estado.avisosMissao=estado.avisosMissao.slice(-10);
  marcarConquistas();
  registrarLogAtividade(`Tarefa aprovada: ${t.texto} (+${recompensa}🪙)`);
  mostrarToast('✅ Aprovada! A criança verá suas recompensas ao entrar.');
  renderizarPainelPais();
  atualizarTela();
}
function ativarPausa(){
  const dias=Math.max(1,Math.min(30,parseInt(document.getElementById('input-dias-pausa').value)||3));
  const d=new Date();
  d.setDate(d.getDate()+dias-1);
  estado.pausaAte=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  salvar();
  atualizarBannerPausaPainel();
  atualizarTela();
  mostrarToast(`🌴 Pausa ativada por ${dias} dia(s).`);
}
function cancelarPausa(){
  if(!estado.pausaAte)return;
  estado.pausaAte=null;
  salvar();
  atualizarBannerPausaPainel();
  atualizarTela();
  mostrarToast('▶️ Pausa cancelada.');
}
function atualizarBannerPausaPainel(){
  const el=document.getElementById('pausa-banner-painel');
  if(!el)return;
  if(emPausaHoje()){
    const [ano,mes,dia]=estado.pausaAte.split('-');
    el.innerHTML=`<div class="pausa-banner">🌴 Pausa ativa até ${dia}/${mes}/${ano}.</div>`;
  }else{
    el.innerHTML='';
  }
}
function abrirRelatorioMensal(){
  const agora=new Date();
  const ano=agora.getFullYear(),mes=agora.getMonth();
  const inicio=new Date(ano,mes,1);
  const fim=new Date(ano,mes+1,0);
  const diasMes=fim.getDate();
  const chave=(d)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const registro=(d)=>estado.registroDiario?.[chave(d)]||{tarefas:0,moedas:0};
  let tarefas=0,moedas=0,ativos=0;
  for(let i=1;i<=diasMes;i++){const d=new Date(ano,mes,i),r=registro(d);tarefas+=Number(r.tarefas)||0;moedas+=Number(r.moedas)||0;if((Number(r.tarefas)||0)>0)ativos++;}
  const anterior=[];
  for(let i=30;i>=1;i--){const d=new Date(agora);d.setDate(d.getDate()-i);anterior.push(registro(d));}
  const antT=anterior.reduce((n,r)=>n+(Number(r.tarefas)||0),0);
  const antM=anterior.reduce((n,r)=>n+(Number(r.moedas)||0),0);
  const antA=anterior.filter(r=>(Number(r.tarefas)||0)>0).length;
  const conquistas=CONQUISTAS.filter(x=>estado.conquistas?.[x[0]]).length;
  const el=(id)=>document.getElementById(id);
  if(el('rel-mes-titulo'))el('rel-mes-titulo').textContent=agora.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  if(el('mes-total-tarefas'))el('mes-total-tarefas').textContent=tarefas;
  if(el('mes-total-moedas'))el('mes-total-moedas').textContent=moedas;
  if(el('mes-dias-ativos'))el('mes-dias-ativos').textContent=`${ativos}/${diasMes}`;
  if(el('mes-conquistas'))el('mes-conquistas').textContent=conquistas;
  const delta=(a,b)=>b===0?(a?`+${a}`:'—'):`${a>=b?'+':''}${a-b}`;
  if(el('mes-comparacao'))el('mes-comparacao').innerHTML=`<div class="mes-comp-item"><b>${delta(tarefas,antT)}</b><small>tarefas vs. 30 dias</small></div><div class="mes-comp-item"><b>${delta(moedas,antM)}</b><small>moedas vs. 30 dias</small></div><div class="mes-comp-item"><b>${delta(ativos,antA)}</b><small>dias ativos vs. 30 dias</small></div>`;
  if(el('mes-calendario')){
    const primeiro=fim.getDay()===6?0:new Date(ano,mes,1).getDay();
    let html='';
    for(let i=0;i<primeiro;i++)html+='<span class="mes-dia"></span>';
    for(let i=1;i<=diasMes;i++){const d=new Date(ano,mes,i),r=registro(d),ativo=(Number(r.tarefas)||0)>0;html+=`<span class="mes-dia${ativo?' ativo':''}${chave(d)===hojeLocal()?' hoje':''}" title="${Number(r.tarefas)||0} tarefa(s)">${i}</span>`;}
    el('mes-calendario').innerHTML=html;
  }
  if(el('mes-insight')){
    if(!tarefas)el('mes-insight').textContent='Ainda não há tarefas concluídas neste mês.';
    else if(ativos>=20)el('mes-insight').textContent='🔥 Excelente consistência! A rotina está presente na maior parte do mês.';
    else if(ativos>=10)el('mes-insight').textContent='👍 Bom ritmo. Continue mantendo dias ativos para fortalecer a rotina.';
    else el('mes-insight').textContent='🌱 Cada dia conta. Tente criar uma sequência de pequenos avanços.';
  }
  abrirModal('modal-relatorio-mensal');
}
function abrirRelatorioSemanal(){
  const hoje=new Date();
  const dias=[];
  const labelsCurto=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  for(let i=6;i>=0;i--){
    const d=new Date(hoje);
    d.setDate(d.getDate()-i);
    dias.push({
      data:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
      label:labelsCurto[d.getDay()],
      diaNum:String(d.getDate()).padStart(2,'0'),
      mes:String(d.getMonth()+1).padStart(2,'0')
    });
  }
  let totalTarefas=0,totalMoedas=0,diasAtivos=0;
  const valores=dias.map(d=>{
    const r=estado.registroDiario?.[d.data]||{tarefas:0,moedas:0};
    totalTarefas+=Number(r.tarefas)||0;
    totalMoedas+=Number(r.moedas)||0;
    if(Number(r.tarefas)>0)diasAtivos++;
    return {...d,tarefas:Number(r.tarefas)||0,moedas:Number(r.moedas)||0};
  });
  const melhor=valores.reduce((a,v)=>v.tarefas>a.tarefas?v:a,{tarefas:0,label:'—'});
  const pendentes=(estado.tarefas||[]).filter(t=>statusTarefaAtual(t)==='aguardando_aprovacao').length;
  const tarefasAtuais=(estado.tarefas||[]).filter(t=>t.ativo!==false).length;
  const ritmo=Math.min(100,Math.round((totalTarefas/Math.max(1,tarefasAtuais*7))*100));
  const maxT=Math.max(1,...valores.map(v=>v.tarefas));
  const barras=document.getElementById('rel-barras-semana');
  const labels=document.getElementById('rel-labels-semana');
  if(barras){
    barras.innerHTML=valores.map(v=>{
      const h=Math.max(6,Math.round((v.tarefas/maxT)*64));
      const cor=v.tarefas===0?'#e2e8f0':v.tarefas>=3?'#22c55e':'#a78bfa';
      return `<div title="${v.tarefas} tarefa(s) · ${v.moedas} moedas" style="flex:1;height:${h}px;background:${cor};border-radius:6px 6px 2px 2px;min-width:0"></div>`;
    }).join('');
  }
  if(labels)labels.innerHTML=valores.map(v=>`<span style="flex:1;text-align:center">${v.label}</span>`).join('');
  const c=document.getElementById('rel-lista-dias');
  if(c){
    c.innerHTML='';
    valores.forEach(v=>{
      const feito=!!estado.historicoConclusoes?.[v.data];
      c.innerHTML+=`<div class="relatorio-dia-row"><span>${v.diaNum}/${v.mes}</span><span>${v.tarefas} tarefa(s)${feito?' · 🔥':''}</span><span>${v.moedas} 🪙</span></div>`;
    });
  }
  document.getElementById('rel-total-tarefas').textContent=totalTarefas;
  document.getElementById('rel-total-moedas').textContent=totalMoedas;
  const elSt=document.getElementById('rel-streak-atual');
  if(elSt)elSt.textContent=estado.streak||0;
  const elMed=document.getElementById('rel-media-dia');
  if(elMed)elMed.textContent=(totalTarefas/7).toFixed(1).replace('.',',');
  const elMelhor=document.getElementById('rel-melhor-dia');
  if(elMelhor)elMelhor.textContent=melhor.tarefas?`${melhor.label} (${melhor.tarefas})`:'—';
  const elAtivos=document.getElementById('rel-dias-ativos');
  if(elAtivos)elAtivos.textContent=`${diasAtivos}/7`;
  const elPend=document.getElementById('rel-pendentes');
  if(elPend)elPend.textContent=pendentes;
  const elMeta=document.getElementById('rel-meta-semana');
  if(elMeta)elMeta.textContent=`${ritmo}%`;
  const insight=document.getElementById('rel-insight');
  if(insight){
    if(pendentes>0)insight.textContent=`⏳ Há ${pendentes} tarefa(s) aguardando sua aprovação.`;
    else if(totalTarefas===0)insight.textContent='Semana ainda sem registros — complete missões para ver o gráfico crescer!';
    else if(diasAtivos>=6)insight.textContent='🔥 Semana excelente! Quase todos os dias com atividade.';
    else if(diasAtivos>=3)insight.textContent='👍 Bom ritmo. Tente manter a ofensiva nos próximos dias.';
    else insight.textContent='Dá para melhorar: foque nas obrigatórias para subir a ofensiva.';
  }
  abrirModal('modal-relatorio');
}
function enviarNotificacaoLocal(titulo,corpo,tag){
  if(!estado.notificacoesAtivas)return false;
  if(!('Notification' in window)||Notification.permission!=='granted')return false;
  try{
    const n=new Notification(titulo||'🐾 RotinaPet',{
      body:corpo,
      tag:tag||'rotinapet',
      silent:false
    });
    setTimeout(()=>{try{n.close()}catch(e){}},8000);
    return true;
  }catch(e){return false}
}
function alternarLembretes(){
  if(!estado.notificacoesAtivas){
    ativarPushCompleto().then(ok=>{
      if(ok)enviarNotificacaoLocal('🐾 RotinaPet','Lembretes e push ligados.','rotinapet-on');
    });
  }else{
    estado.notificacoesAtivas=false;
    salvar();
    atualizarBotaoLembrete();
    mostrarToast('🔕 Lembretes desativados.');
  }
}
function atualizarBotaoLembrete(){
  const b=document.getElementById('btn-toggle-lembrete');
  if(!b)return;
  b.textContent=estado.notificacoesAtivas?'Desativar':'Ativar';
  b.classList.toggle('red-btn',estado.notificacoesAtivas);
}
function verificarLembreteNoturno(){
  if(!estado.notificacoesAtivas)return;
  const agora=new Date();
  if(agora.getHours()<20)return;
  const hoje=hojeLocal();
  if(estado.lembreteEnviadoData===hoje)return;
  if(emPausaHoje()||todasObrigatoriasConcluidas())return;
  estado.lembreteEnviadoData=hoje;
  salvar();
  const texto='Ainda faltam tarefas obrigatórias hoje! Bora terminar? 🌙';
  enviarNotificacaoLocal('🐾 Missões pendentes',texto,'rotinapet-noite');
  mostrarToast('🔔 '+texto);
}
function verificarLembreteTarde(){
  if(!estado.notificacoesAtivas)return;
  const agora=new Date();
  if(agora.getHours()<16||agora.getHours()>=20)return;
  const hoje=hojeLocal();
  if(estado.lembreteTardeData===hoje)return;
  if(emPausaHoje()||todasObrigatoriasConcluidas())return;
  const pend=estado.tarefas.filter(t=>t.tipo==='obrigatoria'&&t.status!=='aprovada'&&(!t.dias||!t.dias.length||t.dias.includes(new Date().getDay())));
  if(!pend.length)return;
  estado.lembreteTardeData=hoje;
  salvar();
  const texto=`Faltam ${pend.length} missão(ões) obrigatória(s). Ainda dá tempo! ⚡`;
  enviarNotificacaoLocal('🐾 Lembrete da tarde',texto,'rotinapet-tarde');
}
function alternarMesada(ativa){
  if(perfilAtivo!=='pais')return;
  estado.mesadaAtiva=!!ativa;
  salvar();
  atualizarTela();
  mostrarToast(ativa?'💰 Mesada ativada.':'🪙 Mesada desativada; moedas virtuais continuam.');
}
function creditoMesada(moedas){
  if(estado.mesadaAtiva===false)return;
  estado.dinheiroAcumulado=(Number(estado.dinheiroAcumulado)||0)+Number(moedas)*(Number(estado.taxaCambio)||.01);
}
function sacarDinheiro(){
  if(estado.mesadaAtiva===false)return;
  const v=Number(estado.dinheiroAcumulado)||0;
  if(v<=0)return mostrarAviso('💰','Sem saldo','Ainda não há saldo disponível.');
  mostrarConfirmacao(`Registrar pagamento de R$ ${v.toFixed(2).replace('.',',')}?`,()=>{
    estado.totalSacado=(estado.totalSacado||0)+v;
    estado.dinheiroAcumulado=0;
    salvar();
    renderizarPainelPais();
    atualizarTela();
    mostrarAviso('💸','Pagamento registrado','O saldo disponível foi zerado.');
  });
}
let diasSelecionadosNovaTarefa=[];
function montarPickerDiasNovaTarefa(){
  const c=document.getElementById('dias-nova-tarefa');
  if(!c||c.dataset.pronto)return;
  c.dataset.pronto='1';
  DIAS_LABEL.forEach((lbl,i)=>{
    const chip=document.createElement('div');
    chip.className='dia-chip';
    chip.textContent=lbl;
    chip.onclick=()=>{
      const idx=diasSelecionadosNovaTarefa.indexOf(i);
      if(idx>-1)diasSelecionadosNovaTarefa.splice(idx,1);else diasSelecionadosNovaTarefa.push(i);
      chip.classList.toggle('on');
    };
    c.appendChild(chip);
  });
}
function adicionarTarefa(){
  const txt=document.getElementById('nova-tarefa-texto').value.trim(),
        moedas=Math.max(1,parseInt(document.getElementById('nova-tarefa-moedas').value)||5),
        tipo=document.getElementById('nova-tarefa-tipo')?.value==='extra'?'extra':'obrigatoria',
        habilidade=document.getElementById('nova-tarefa-habilidade')?.value||'';
  if(!txt)return mostrarToast('Digite uma tarefa.');
  const id=estado.tarefas.length?Math.max(...estado.tarefas.map(t=>Number(t.id)||0))+1:1;
  estado.tarefas.push({id,texto:txt,recompensa:moedas,xp:20,tipo,habilidade,status:'pendente',foto:null,dias:[...diasSelecionadosNovaTarefa]});
  document.getElementById('nova-tarefa-texto').value='';
  diasSelecionadosNovaTarefa=[];
  document.querySelectorAll('#dias-nova-tarefa .dia-chip').forEach(c=>c.classList.remove('on'));
  salvar();
  renderizarPainelPais();
  atualizarTela();
  mostrarToast(tipo==='obrigatoria'?'🔥 Tarefa criada!':'⭐ Tarefa extra criada!');
}
function editarDiasTarefa(id){
  const t=estado.tarefas.find(x=>String(x.id)===String(id));
  if(!t)return;
  const atual=(t.dias||[]).map(i=>DIAS_LABEL[i]).join(',');
  const resp=window.prompt('Dias da semana (Dom,Seg,Ter,Qua,Qui,Sex,Sáb) ou vazio para todos:',atual);
  if(resp===null)return;
  const partes=resp.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  const novosDias=[];
  partes.forEach(p=>{
    const idx=DIAS_LABEL.findIndex(l=>l.toLowerCase().startsWith(p.slice(0,3)));
    if(idx>-1&&!novosDias.includes(idx))novosDias.push(idx);
  });
  t.dias=novosDias;
  salvar();
  renderizarPainelPais();
  atualizarTela();
  mostrarToast('📅 Recorrência atualizada.');
}
function removerTarefa(id){
  const removida=estado.tarefas.find(t=>String(t.id)===String(id));
  if(removida?.extraRotativa)estado.extraDiaRemovida=removida.dataSugerida;
  estado.tarefas=estado.tarefas.filter(t=>String(t.id)!==String(id));
  salvar();
  renderizarPainelPais();
  atualizarTela();
}
function pinEhFraco(p){
  return !/^\d{4}$/.test(p)||p==='1234'||p==='0000'||p==='1111'||p==='2222'||p==='4321'||/^(\d)\1{3}$/.test(p)||p==='0123'||p==='9876';
}
async function salvarNovoPin(){
  const input=document.getElementById('novo-pin-pais');
  const p=input.value.trim();
  if(!/^\d{4}$/.test(p))return mostrarToast('PIN precisa ter 4 dígitos.');
  if(pinEhFraco(p))return mostrarToast('⚠️ Evite senhas fáceis ou números repetidos.');
  
  estado.pinHash=await hashPin(p);
  estado.pinPersonalizado=true;
  input.value='';
  salvar();
  const st=document.getElementById('txt-status-pin');
  if(st)st.textContent='✅ PIN personalizado ativo.';
  mostrarToast('🔑 PIN seguro atualizado!');
}
let privacidadePosAceite=null;
function abrirPrivacidade(obrigatorio){
  const check=document.getElementById('check-privacidade');
  const btn=document.getElementById('btn-aceitar-privacidade');
  if(check){
    check.checked=!!estado.privacidadeAceita;
    check.disabled=false;
  }
  if(btn){
    btn.textContent=obrigatorio?'Aceitar e continuar':'Fechar';
  }
  privacidadePosAceite=obrigatorio?()=>{
    if(!estado.pinPersonalizado){
      abrirDefinirPinObrigatorio(estado.pinHash?'trocar':'criar');
    }else{
      entrarPainelPaisPosAuth();
    }
  }:null;
  abrirModal('modal-privacidade');
}
function aceitarPrivacidade(){
  const check=document.getElementById('check-privacidade');
  if(privacidadePosAceite){
    if(!check?.checked){
      mostrarToast('Marque a opção para continuar.');
      return;
    }
    estado.privacidadeAceita=true;
    salvar();
    fecharModal('modal-privacidade');
    const cb=privacidadePosAceite;
    privacidadePosAceite=null;
    cb();
    return;
  }
  if(check?.checked){
    estado.privacidadeAceita=true;
    salvar();
  }
  fecharModal('modal-privacidade');
}
function abrirDefinirPinObrigatorio(modo){
  const tit=document.getElementById('titulo-definir-pin');
  const desc=document.getElementById('desc-definir-pin');
  const erro=document.getElementById('erro-definir-pin');
  if(erro)erro.textContent='';
  document.getElementById('input-pin-obrigatorio').value='';
  document.getElementById('input-pin-obrigatorio-confirma').value='';
  if(tit)tit.textContent=modo==='trocar'?'Troque o PIN padrão':'Crie seu PIN';
  if(desc)desc.textContent=modo==='trocar'
    ?'Detectamos um PIN inseguro ou ainda não personalizado. Defina um PIN de 4 dígitos novo para proteger o painel.'
    :'Por segurança, defina um PIN de 4 dígitos para a área dos responsáveis. Não use 1234, 0000 ou números repetidos.';
  abrirModal('modal-definir-pin');
}
async function confirmarPinObrigatorio(){
  const p=document.getElementById('input-pin-obrigatorio')?.value.trim()||'';
  const c=document.getElementById('input-pin-obrigatorio-confirma')?.value.trim()||'';
  const erro=document.getElementById('erro-definir-pin');
  if(!/^\d{4}$/.test(p)){
    if(erro)erro.textContent='Digite exatamente 4 números.';
    return;
  }
  if(pinEhFraco(p)){
    if(erro)erro.textContent='PIN fraco. Evite 1234, 0000, sequências e dígitos iguais.';
    return;
  }
  if(p!==c){
    if(erro)erro.textContent='Os dois PINs não são iguais.';
    return;
  }
  estado.pinHash=await hashPin(p);
  estado.pinPersonalizado=true;
  estado.pinTentativasFalhas=0;
  estado.pinBloqueadoAte=null;
  salvar();
  fecharModal('modal-definir-pin');
  mostrarAviso('🔐','PIN definido','Seu PIN foi salvo. Guarde-o em local seguro. Você pode alterá-lo depois no painel.');
  setTimeout(()=>entrarPainelPaisPosAuth(),400);
}
function fecharOnboardingPais(){
  estado.onboardingVistoPais=true;
  salvar();
  fecharModal('modal-onboarding-pais');
  renderizarPainelPais();
  abrirModal('modal-pais');
  mostrarToast('👨‍👩‍👧 Painel pronto — bom uso em família!');
}
function entrarPainelPaisPosAuth(){
  if(!estado.onboardingVistoPais){
    abrirModal('modal-onboarding-pais');
    return;
  }
  renderizarPainelPais();
  abrirModal('modal-pais');
}
function atualizarTaxaCambio(v){
  const n=Number(v);
  estado.taxaCambio=Number.isFinite(n)&&n>=0?n:.01;
  salvar();
  atualizarTela();
}
function atualizarIdadeCrianca(v){
  estado.idadeCrianca=Math.max(3,Math.min(15,parseInt(v)||7));
  salvar();
  mostrarToast(`👶 Idade: ${estado.idadeCrianca} anos`);
}
function atualizarDificuldadeJogos(v){
  estado.dificuldadeJogos=['auto','facil','medio','dificil'].includes(v)?v:'auto';
  salvar();
  mostrarToast('🎮 Dificuldade dos jogos atualizada.');
}
function idadeEfetivaJogos(){
  return {facil:5,medio:8,dificil:11}[estado.dificuldadeJogos] || Number(estado.idadeCrianca)||7;
}
function alternarListaPets(e){
  e?.stopPropagation();
  document.getElementById('lista-pets').classList.toggle('abrir');
}
function escolherPet(tipo){
  if(!PETS[tipo])return;
  if(nivelJogador()<PETS[tipo].desbloqueioNivel)return mostrarToast(`🔒 Nível ${PETS[tipo].desbloqueioNivel} necessário.`);
  estado.petAtual=tipo;
  salvar();
  atualizarTela();
  document.getElementById('lista-pets').classList.remove('abrir');
}
document.addEventListener('click',e=>{
  const l=document.getElementById('lista-pets');
  if(l&&!l.contains(e.target)&&e.target.id!=='btn-pet-atual')l.classList.remove('abrir');
});
function renderizarEvolucoes(){
  const d=PETS[estado.petAtual],p=obterDadosPetAtual(),c=document.getElementById('lista-evolucoes');
  if(!c)return;
  c.innerHTML='';
  d.evolucoes.forEach(ev=>{
    const ok=p.nivel>=ev.nivel;
    c.innerHTML+=`<div class="achievement-row"><span style="font-size:18px">${ok?'⭐':'🔒'}</span><div style="flex:1"><b style="font-size:10px;color:${ok?'#6b21a8':'#475569'}">${esc(ev.nome)}</b><div style="font-size:8px;color:#64748b">${esc(ev.desc)} • Nível ${ev.nivel}</div></div><span style="font-size:8px;font-weight:900">${ok?'LIBERADO':'BLOQUEADO'}</span></div>`;
  });
}
function abrirColecao(){
  renderizarColecao();
  alternarAbaColecao('pets');
  abrirModal('modal-colecao');
}
function alternarAbaColecao(aba){
  ['pets','evos','fundos'].forEach(id=>{
    document.getElementById('painel-col-'+id)?.classList.toggle('hidden',id!==aba);
    document.getElementById('tab-col-'+id)?.classList.toggle('ativa',id===aba);
  });
}
function renderizarColecao(){
  const nivel=nivelJogador();
  const petsLiberados=Object.keys(PETS).filter(k=>nivel>=PETS[k].desbloqueioNivel).length;
  const totalPets=Object.keys(PETS).length;
  const fundosPossuidos=(estado.fundosComprados||[]).length;
  const totalFundos=BANCO_FUNDOS.length;
  const conquistasFeitas=CONQUISTAS.filter(x=>estado.conquistas?.[x[0]]).length;
  const obtidosColecao=petsLiberados+fundosPossuidos;
  const totalColecao=totalPets+totalFundos;
  const percColecao=totalColecao?Math.min(100,Math.round((obtidosColecao/totalColecao)*100)):0;
  const progTxt=document.getElementById('colecao-progresso-txt');
  const progBar=document.getElementById('colecao-progresso-barra');
  const progSub=document.getElementById('colecao-progresso-sub');
  if(progTxt)progTxt.textContent=percColecao+'%';
  if(progBar)progBar.style.width=percColecao+'%';
  if(progSub)progSub.textContent=`${obtidosColecao} de ${totalColecao} itens desbloqueados · continue suas aventuras!`;
  const resumo=document.getElementById('colecao-resumo');
  if(resumo){
    resumo.innerHTML=`
      <div class="stat"><b>${petsLiberados}/${totalPets}</b><span>pets</span></div>
      <div class="stat"><b>${fundosPossuidos}/${totalFundos}</b><span>fundos</span></div>
      <div class="stat"><b>${conquistasFeitas}/${CONQUISTAS.length}</b><span>conquistas</span></div>
      <div class="stat"><b>${obtidosColecao}/${totalColecao}</b><span>coleção</span></div>`;
  }
  // Pets
  const pPets=document.getElementById('painel-col-pets');
  if(pPets){
    pPets.innerHTML='<div class="colecao-grid"></div>';
    const grid=pPets.querySelector('.colecao-grid');
    Object.values(PETS).forEach(pet=>{
      const dados=estado.pets[pet.id]||{nivel:1,xp:0};
      const liberado=nivel>=pet.desbloqueioNivel;
      const ativo=estado.petAtual===pet.id;
      const fase=calcularFase(dados.nivel||1);
      const evoNome=pet.evolucoes[fase-1]?.nome||'';
      const card=document.createElement('div');
      card.className='colecao-card'+(liberado?'':' locked')+(ativo?' ativo-agora':'');
      card.innerHTML=`
        <span class="colecao-badge">${liberado?(ativo?'✓':'⭐'):'🔒'}</span>
        <div class="colecao-emoji">${pet.emoji}</div>
        <div class="colecao-nome">${esc(pet.nome)}</div>
        <div class="colecao-sub">${liberado?`Nv. ${dados.nivel} · ${esc(evoNome)}`:`Libera no nível ${pet.desbloqueioNivel}`}</div>
        ${liberado?`<div class="colecao-progress"><div style="width:${Math.min(100,dados.xp)}%"></div></div>`:''}
      `;
      if(liberado){
        card.style.cursor='pointer';
        card.onclick=()=>{escolherPet(pet.id);fecharModal('modal-colecao');mostrarToast(`${pet.emoji} ${pet.nome} está pronto para a aventura!`)};
      }
      grid.appendChild(card);
    });
  }
  // Evoluções de todos os pets
  const pEvos=document.getElementById('painel-col-evos');
  if(pEvos){
    pEvos.innerHTML='';
    Object.values(PETS).forEach(pet=>{
      const dados=estado.pets[pet.id]||{nivel:1};
      const liberadoPet=nivel>=pet.desbloqueioNivel;
      const bloco=document.createElement('div');
      bloco.className='section-card';
      bloco.style.marginBottom='8px';
      let html=`<b style="font-size:10px">${pet.emoji} ${esc(pet.nome)}</b>`;
      if(!liberadoPet){
        html+=`<div style="font-size:8px;color:#94a3b8;margin-top:4px">🔒 Desbloqueie no nível ${pet.desbloqueioNivel}</div>`;
      }else{
        html+='<div class="stack" style="margin-top:6px">';
        pet.evolucoes.forEach(ev=>{
          const ok=(dados.nivel||1)>=ev.nivel;
          html+=`<div class="achievement-row" style="opacity:${ok?1:.5}"><span>${ok?'⭐':'🔒'}</span><div style="flex:1"><b style="font-size:9px">${esc(ev.nome)}</b><div style="font-size:7px;color:#64748b">${esc(ev.desc)} · Nv. ${ev.nivel}</div></div></div>`;
        });
        html+='</div>';
      }
      bloco.innerHTML=html;
      pEvos.appendChild(bloco);
    });
  }
  // Fundos
  const pFundos=document.getElementById('painel-col-fundos');
  if(pFundos){
    pFundos.innerHTML='<div class="colecao-grid"></div>';
    const grid=pFundos.querySelector('.colecao-grid');
    BANCO_FUNDOS.forEach(f=>{
      const tem=(estado.fundosComprados||[]).includes(f.id)||f.preco===0;
      const ativo=estado.fundoAtual===f.id;
      const card=document.createElement('div');
      card.className='colecao-card'+(tem?'':' locked')+(ativo?' ativo-agora':'');
      card.style.background=tem?f.bg:'#f1f5f9';
      card.style.color=tem&&(f.id==='noite'||f.id==='halloween'||f.id==='astronauta'||f.id==='pirata'||f.id==='estadio')?'#fff':'#1e293b';
      card.innerHTML=`
        <span class="colecao-badge">${tem?(ativo?'✓':'🖼️'):'🔒'}</span>
        <div class="colecao-emoji">${f.emoji}</div>
        <div class="colecao-nome">${esc(f.nome)}</div>
        <div class="colecao-sub">${tem?(ativo?'Em uso':'Toque para usar'):(f.preco?f.preco+' 🪙':'Grátis')}</div>
      `;
      if(tem){
        card.style.cursor='pointer';
        card.onclick=()=>{
          estado.fundoAtual=f.id;
          salvar();
          aplicarFundoTela(f.id);
          atualizarTela();
          renderizarColecao();
          mostrarToast(`🖼️ ${f.nome}`);
        };
      }
      grid.appendChild(card);
    });
  }

}
const CONQUISTAS=[
  ['primeira','🥇','Primeiro Passo','Aprove sua primeira tarefa.',10],
  ['diaCheio','⚡','Super Produtivo','Conclua 5 tarefas no mesmo dia.',25],
  ['mestreMath','🧠','Gênio da Matemática','Acerte 10 desafios de matemática.',30],
  ['cem','🪙','Cofrinho Cheio','Junte 100 moedas.',30],
  ['streak7','🔥','Semana de Fogo','Atinja 7 dias seguidos de ofensiva.',50],
  ['nivel10','⭐','Veterano','Chegue ao nível 10 com um pet.',60],
  ['pet5','🐾','Colecionador','Desbloqueie todos os pets.',80],
  ['tarefas10','📋','Mão na Massa','Aprove 10 tarefas ao todo.',45],
  ['acessorio','🎀','Pet Fashion','Compre seu primeiro acessório.',20],
  ['objeto','🎪','Cantinho do Pet','Equipe um objeto animado ao lado do pet.',35],
  ['streak30','🏆','Lenda da Ofensiva','Atinja 30 dias seguidos de ofensiva.',100]
];
const EMBLEMAS_HABILIDADES=[
  {id:'organizacao',emoji:'🧺',nome:'Mestre da Organização',descricao:'Cuidar dos próprios espaços e pertences.'},
  {id:'leitura',emoji:'📚',nome:'Leitor Curioso',descricao:'Explorar histórias, ideias e perguntas.'},
  {id:'natureza',emoji:'🌱',nome:'Guardião da Natureza',descricao:'Cuidar das plantas e do ambiente.'}
];
function registrarHabilidadeAprovada(t){
  const habilidade=EMBLEMAS_HABILIDADES.find(h=>h.id===t.habilidade);
  if(!habilidade)return;
  estado.habilidades=estado.habilidades||{};
  const anterior=Math.max(0,Number(estado.habilidades[habilidade.id])||0);
  estado.habilidades[habilidade.id]=anterior+1;
  if(anterior<3 && estado.habilidades[habilidade.id]>=3){
    mostrarAviso(habilidade.emoji,'Emblema conquistado!',habilidade.nome+' — seu esforço fez a diferença!');
  }
}
function renderizarHabilidades(){
  const grid=document.getElementById('lista-habilidades');
  if(!grid)return;
  grid.replaceChildren();
  EMBLEMAS_HABILIDADES.forEach(h=>{
    const pontos=Math.max(0,Number(estado.habilidades?.[h.id])||0);
    const concluido=pontos>=3;
    const card=document.createElement('div');
    card.className='habilidade-card'+(concluido?' conquistado':'');
    card.innerHTML=`<span class="habilidade-icone">${h.emoji}</span><b>${esc(h.nome)}</b><small>${esc(h.descricao)}</small><strong>${concluido?'✓ Emblema conquistado':Math.min(3,pontos)+'/3 tarefas aprovadas'}</strong>`;
    grid.appendChild(card);
  });
}
function contarFeitas(){return estado.tarefas.filter(t=>statusTarefaAtual(t)==='aprovada').length}
function marcarConquistas(){
  estado.conquistas=estado.conquistas||{};
  let nova=false;
  const checar=(id,cond)=>{
    if(!estado.conquistas[id]&&cond){
      estado.conquistas[id]=true;
      nova=true;
      const c=CONQUISTAS.find(x=>x[0]===id);
      const premio=Number(c[4])||0;
      estado.moedas=(estado.moedas||0)+premio;
      mostrarAviso(c[1],'🏆 Nova Conquista!',`${c[2]} +${premio} moedas`);
      ganharXP(30);
    }
  };
  checar('primeira',contarFeitas()>=1);
  checar('diaCheio',(estado.tarefasHojeCount||0)>=5);
  checar('mestreMath',(estado.desafiosMathAcertos||0)>=10);
  checar('cem',estado.moedas>=100);
  checar('streak7',(estado.streak||0)>=7);
  checar('nivel10',nivelJogador()>=10);
  checar('pet5',nivelJogador()>=15);
  checar('tarefas10',contarFeitas()>=10);
  checar('acessorio',(estado.acessorios?.comprados||[]).length>=1);
  checar('objeto',(estado.acessorios?.comprados||[]).some(id=>OBJETOS_PET.some(o=>o.id===id)));
  checar('streak30',(estado.streak||0)>=30);
  salvar();
  renderizarConquistas();
  if(nova){
    somConquista();
    dispararConfetes();
  }
}
function renderizarHeatmap(){
  const g=document.getElementById('grid-heatmap');
  if(!g)return;
  g.innerHTML='';
  const hoje=new Date();
  const dias=[];
  for(let i=34;i>=0;i--){
    const d=new Date(hoje);
    d.setDate(d.getDate()-i);
    dias.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
  }
  dias.forEach(dataStr=>{
    const feito=!!estado.historicoConclusoes?.[dataStr];
    const div=document.createElement('div');
    div.className='heatmap-dia'+(feito?' feito':'');
    div.title=dataStr+(feito?' — concluído':'');
    g.appendChild(div);
  });
}
function renderizarPainelProgresso(){
  const p=obterDadosPetAtual();
  const nivel=Number(p.nivel)||1;
  const xp=Math.max(0,Number(p.xp)||0);
  const streak=Number(estado.streak)||0;
  const total=CONQUISTAS.length;
  const feitas=CONQUISTAS.filter(x=>estado.conquistas?.[x[0]]).length;
  const n=document.getElementById('rpd-nivel');
  const s=document.getElementById('rpd-streak');
  const x=document.getElementById('rpd-xp');
  const k=document.getElementById('rpd-conquistas');
  if(n)n.textContent=nivel;
  if(s)s.textContent=streak;
  if(x)x.textContent=`${xp}/100`;
  if(k)k.textContent=`${feitas}/${total}`;
  const marcos=[7,14,21,30,50,75,100];
  const proximo=marcos.find(m=>m>streak)||Math.ceil((streak+1)/25)*25;
  const anterior=marcos.filter(m=>m<=streak).pop()||0;
  const perc=proximo===anterior?100:Math.min(100,Math.round(((streak-anterior)/(proximo-anterior))*100));
  const titulo=document.getElementById('rpd-proxima-titulo');
  const meta=document.getElementById('rpd-proxima-meta');
  const barra=document.getElementById('rpd-proxima-barra');
  const texto=document.getElementById('rpd-proxima-texto');
  if(titulo)titulo.textContent=`🔥 Próximo marco: ${proximo} dias`;
  if(meta)meta.textContent=streak>=proximo?'🎉 Alcançado!':`${Math.max(0,proximo-streak)} dia(s)`;
  if(barra)barra.style.width=`${perc}%`;
  if(texto){
    if(streak===0)texto.textContent='Complete as tarefas obrigatórias para começar sua ofensiva.';
    else if(streak<proximo)texto.textContent=`Mais ${proximo-streak} dia(s) para chegar a ${proximo}!`;
    else texto.textContent='Marco alcançado!';
  }
}
function renderizarConquistas(){
  renderizarPainelProgresso();
  renderizarHabilidades();
  const c=document.getElementById('lista-conquistas');
  if(!c)return;
  renderizarHeatmap();
  const streak=Number(estado.streak)||0;
  const proximoMarco=streak===0?7:(Math.floor(streak/7)+1)*7;
  const diasRestantes=proximoMarco-streak;
  const perc=Math.round(((7-diasRestantes)/7)*100);
  const elContador=document.getElementById('bau-contador-dias');
  const elBarra=document.getElementById('bau-barra-progresso');
  const elSub=document.getElementById('bau-status-sub');
  const elIcone=document.getElementById('bau-icone');
  if(elContador)elContador.textContent=`${7-diasRestantes}/7 dias`;
  if(elBarra)elBarra.style.width=`${perc}%`;
  if(elSub){
    if(diasRestantes===1){
      elSub.textContent='🔥 Falta 1 dia para o baú!';
      if(elIcone)elIcone.textContent='✨🎁';
    }else{
      elSub.textContent=`Faltam ${diasRestantes} dias para o baú (${proximoMarco} dias)!`;
      if(elIcone)elIcone.textContent='🎁';
    }
  }
  c.innerHTML='';
  CONQUISTAS.forEach(x=>{
    const ok=!!estado.conquistas?.[x[0]];
    c.innerHTML+=`<div class="achievement-row" style="opacity:${ok?1:.55}"><span style="font-size:22px">${x[1]}</span><div style="flex:1"><b style="font-size:10px">${esc(x[2])}</b><div style="font-size:8px;color:#64748b">${esc(x[3])}</div></div><span>${ok?'✅':'🔒'}</span></div>`;
  });
}
function atualizarEstatisticas(){
  document.getElementById('stat-feitas').textContent=contarFeitas();
  if(document.getElementById('stat-ofensiva-pais'))document.getElementById('stat-ofensiva-pais').textContent=estado.streak||0;
  document.getElementById('stat-conquistas').textContent=CONQUISTAS.filter(x=>estado.conquistas?.[x[0]]).length;
}
function recompensarMiniJogo(moedas,xp,msg){
  estado.moedas+=moedas;
  registrarNoRelatorioDiario(0,moedas);
  ganharXP(xp);
  dispararConfetes();
  mostrarToast(`🎉 ${msg} +${moedas} 🪙 +${xp} XP`);
  marcarConquistas();
}
const TIPOS_JOGO_DESAFIO=['matematica','memoria','reacao','estrelas'];
function jogosLiberadosHoje(){
  return tarefasDeHoje().some(t=>['aguardando_aprovacao','aprovada'].includes(statusTarefaAtual(t)));
}
function abrirDesafio(){
  document.getElementById('area-jogo-matematica').classList.add('hidden');
  document.getElementById('area-jogo-memoria').classList.add('hidden');
  document.getElementById('area-jogo-reacao').classList.add('hidden');
  document.getElementById('area-jogo-estrelas').classList.add('hidden');
  if(!jogosLiberadosHoje()){mostrarToast('🔒 Envie uma missão para análise para liberar os jogos!');return;}
  const tipo=TIPOS_JOGO_DESAFIO[Math.floor(Math.random()*TIPOS_JOGO_DESAFIO.length)];
  if(tipo==='matematica'){
    document.getElementById('titulo-desafio').textContent='🧮 Desafio Matemático';
    document.getElementById('desc-desafio').textContent='Acertou? +1 🪙 e +1 XP';
    document.getElementById('area-jogo-matematica').classList.remove('hidden');
    abrirDesafioMatematica();
  }else if(tipo==='memoria'){
    document.getElementById('titulo-desafio').textContent='🧠 Sequência da Memória';
    document.getElementById('desc-desafio').textContent='Acertou tudo? +2 🪙 e +2 XP';
    document.getElementById('area-jogo-memoria').classList.remove('hidden');
    iniciarJogoMemoria();
  }else if(tipo==='reacao'){
    document.getElementById('titulo-desafio').textContent='⚡ Reação Rápida';
    document.getElementById('desc-desafio').textContent='Acertou rápido? +1 🪙 e +1 XP';
    document.getElementById('area-jogo-reacao').classList.remove('hidden');
    iniciarJogoReacao();
  }else{
    document.getElementById('titulo-desafio').textContent='⭐ Caça às Estrelas';
    document.getElementById('desc-desafio').textContent='Pegue as estrelas! +3 🪙 e +3 XP';
    document.getElementById('area-jogo-estrelas').classList.remove('hidden');
    iniciarJogoEstrelas();
  }
  abrirModal('modal-desafio');
}
let contaCorreta=0;
function abrirDesafioMatematica(){
  const idade=idadeEfetivaJogos();
  let a,b,op;
  if(idade<=5){a=1+Math.floor(Math.random()*5);b=1+Math.floor(Math.random()*5);op='+'}
  else if(idade<=7){a=1+Math.floor(Math.random()*10);b=1+Math.floor(Math.random()*10);op=Math.random()>.5?'+':'-';if(op==='-'&&b>a)[a,b]=[b,a]}
  else if(idade<=9){const r=Math.random();if(r<.4){a=5+Math.floor(Math.random()*20);b=5+Math.floor(Math.random()*20);op='+'}else if(r<.7){a=5+Math.floor(Math.random()*25);b=1+Math.floor(Math.random()*20);if(b>a)[a,b]=[b,a];op='-'}else{a=2+Math.floor(Math.random()*6);b=2+Math.floor(Math.random()*6);op='×'}}
  else{b=2+Math.floor(Math.random()*8);const q=2+Math.floor(Math.random()*8);a=b*q;op='÷'}
  contaCorreta=op==='+'?a+b:op==='-'?a-b:op==='×'?a*b:a/b;
  document.getElementById('conta-math').textContent=`${a} ${op} ${b} = ?`;
  const opts=[contaCorreta];
  while(opts.length<4){const f=Math.max(0,contaCorreta+(Math.floor(Math.random()*7)-3));if(!opts.includes(f))opts.push(f)}
  opts.sort(()=>Math.random()-.5);
  const c=document.getElementById('opcoes-math');
  c.innerHTML='';
  opts.forEach(o=>{const b=document.createElement('button');b.textContent=o;b.onclick=()=>testarMath(o);c.appendChild(b)});
}
function testarMath(v){
  if(v===contaCorreta){
    estado.desafiosMathAcertos=(estado.desafiosMathAcertos||0)+1;
    fecharModal('modal-desafio');
    recompensarMiniJogo(1,1,'Acertou!');
  }else mostrarToast('❌ Tente novamente!');
}
const EMOJIS_MEMORIA=['🐱','🐶','🐐','🐔'];
let sequenciaMemoria=[],progressoMemoria=0,memoriaTravada=true;
function iniciarJogoMemoria(){
  const idade=idadeEfetivaJogos();
  const tamanho=idade<=6?3:idade<=9?4:5;
  sequenciaMemoria=Array.from({length:tamanho},()=>Math.floor(Math.random()*4));
  progressoMemoria=0;
  memoriaTravada=true;
  const grid=document.getElementById('memoria-grid');
  grid.innerHTML='';
  EMOJIS_MEMORIA.forEach((emoji,i)=>{
    const btn=document.createElement('button');
    btn.className='jogo-tile';
    btn.textContent=emoji;
    btn.id='memoria-tile-'+i;
    btn.onclick=()=>tocarTileMemoria(i);
    grid.appendChild(btn);
  });
  document.getElementById('memoria-status').textContent='Observe a sequência...';
  setTimeout(reproduzirSequenciaMemoria,600);
}
function reproduzirSequenciaMemoria(){
  let i=0;
  const passo=()=>{
    if(!document.getElementById('modal-desafio')?.classList.contains('mostrar'))return;
    if(i>=sequenciaMemoria.length){
      memoriaTravada=false;
      const statusEl=document.getElementById('memoria-status');
      if(statusEl)statusEl.textContent='Sua vez!';
      return;
    }
    const idx=sequenciaMemoria[i];
    const tile=document.getElementById('memoria-tile-'+idx);
    if(!tile)return;
    tile.classList.add('ativo');
    tocarTom(440+idx*90,'sine',.25,0,.18);
    setTimeout(()=>{
      tile.classList.remove('ativo');
      i++;
      setTimeout(passo,230);
    },420);
  };
  passo();
}
function tocarTileMemoria(i){
  if(memoriaTravada)return;
  const tile=document.getElementById('memoria-tile-'+i);
  if(!tile)return;
  tile.classList.add('ativo');
  setTimeout(()=>tile.classList.remove('ativo'),200);
  if(sequenciaMemoria[progressoMemoria]===i){
    progressoMemoria++;
    if(progressoMemoria>=sequenciaMemoria.length){
      memoriaTravada=true;
      fecharModal('modal-desafio');
      recompensarMiniJogo(2,2,'Memória incrível!');
    }
  }else{
    memoriaTravada=true;
    tile.classList.add('errado');
    setTimeout(()=>tile.classList.remove('errado'),400);
    mostrarToast('❌ Ops! Vamos tentar de novo.');
    setTimeout(()=>{
      if(document.getElementById('modal-desafio')?.classList.contains('mostrar'))iniciarJogoMemoria();
    },900);
  }
}
const EMOJIS_REACAO=['🍎','🍌','🍇','🍊','🍉','🍓','🥕','🍒'];
let reacaoAlvoIndex=-1,reacaoTimer=null;
function iniciarJogoReacao(){
  const idade=idadeEfetivaJogos();
  const qtd=idade<=6?4:idade<=9?6:8;
  const escolhidos=[...EMOJIS_REACAO].sort(()=>Math.random()-.5).slice(0,qtd);
  reacaoAlvoIndex=Math.floor(Math.random()*qtd);
  document.getElementById('reacao-alvo-nome').textContent=escolhidos[reacaoAlvoIndex];
  const grid=document.getElementById('reacao-grid');
  grid.innerHTML='';
  escolhidos.forEach((emoji,i)=>{
    const btn=document.createElement('button');
    btn.className='jogo-tile';
    btn.textContent=emoji;
    btn.onclick=()=>testarReacao(i===reacaoAlvoIndex);
    grid.appendChild(btn);
  });
  clearTimeout(reacaoTimer);
  reacaoTimer=setTimeout(()=>{
    if(document.getElementById('modal-desafio')?.classList.contains('mostrar')){
      mostrarToast('⏰ Tempo esgotado!');
      fecharModal('modal-desafio');
    }
  },(idade<=6?8000:idade<=9?6500:5000));
}
function testarReacao(acertou){
  clearTimeout(reacaoTimer);
  fecharModal('modal-desafio');
  if(acertou)recompensarMiniJogo(1,1,'Reflexo rápido!');
  else mostrarToast('❌ Não era esse! Tente de novo.');
}
let estrelasPegas=0,estrelaTimer=null;
function iniciarJogoEstrelas(){
  clearTimeout(estrelaTimer);
  estrelasPegas=0;
  const idade=idadeEfetivaJogos(),alvo=idade<=6?3:idade<=9?4:5,tempo=idade<=6?18:idade<=9?15:12;
  const area=document.getElementById('estrelas-area'),status=document.getElementById('estrelas-status');
  if(!area||!status)return;
  area.replaceChildren();
  status.textContent=`Pegue ${alvo} estrelas em ${tempo} segundos!`;
  const colocar=()=>{
    const b=document.createElement('button');
    b.type='button';
    b.textContent='⭐';
    b.setAttribute('aria-label','Pegar estrela');
    b.style.cssText=`position:absolute;left:${5+Math.random()*78}%;top:${5+Math.random()*70}%;width:46px;height:46px;font-size:30px;line-height:1;background:transparent;border:0;cursor:pointer;z-index:2;touch-action:manipulation`;
    b.onclick=()=>{
      b.remove();
      estrelasPegas++;
      status.textContent=`⭐ ${estrelasPegas}/${alvo} estrelas`;
      if(estrelasPegas>=alvo){
        clearTimeout(estrelaTimer);
        fecharModal('modal-desafio');
        recompensarMiniJogo(3,3,'Caça às estrelas!');
        renderizarColecao();
      }else colocar();
    };
    area.appendChild(b);
  };
  // A primeira estrela é criada antes da abertura do modal.
  colocar();
  estrelaTimer=setTimeout(()=>{
    if(estrelasPegas<alvo && document.getElementById('modal-desafio')?.classList.contains('mostrar')){
      fecharModal('modal-desafio');
      mostrarToast('⏰ As estrelas escaparam. Tente novamente!');
    }
  },tempo*1000);
}
function abrirLojaFundos(){
  window.verificarMarcosGestos?.();
  renderizarGridFundos();
  window.renderizarLojaGestos?.();
  abrirModal('modal-fundos');
}
const PALCOS_PET=[
  {id:'cristal',nome:'Cristal',emoji:'💎',preco:0,descricao:'Uma superfície brilhante e delicada.'},
  {id:'floresta',nome:'Bosque',emoji:'🌿',preco:20,descricao:'Musgo macio para repousar as patinhas.'},
  {id:'nuvem',nome:'Nuvem',emoji:'☁️',preco:25,descricao:'Uma nuvem fofinha com sombra no chão.'},
  {id:'estrelas',nome:'Galáxia',emoji:'🌟',preco:35,descricao:'Um pedacinho do céu estrelado.'},
  {id:'doce',nome:'Doce',emoji:'🍬',preco:30,descricao:'Um palco cor de sobremesa.'},
  {id:'ouro',nome:'Campeão',emoji:'🏆',preco:40,descricao:'Um brilho de conquista para o pet.'}
];
function aplicarPalcoPet(){
  const palco=PALCOS_PET.find(p=>p.id===estado.palcoAtual && (p.preco===0||(estado.palcosComprados||[]).includes(p.id)))||PALCOS_PET[0];
  const stage=document.querySelector('.pet-stage');
  if(stage)stage.dataset.palco=palco.id;
}
function renderizarPalcosPet(){
  const grid=document.getElementById('grid-palcos');
  if(!grid)return;
  grid.replaceChildren();
  PALCOS_PET.forEach(p=>{
    const comprado=p.preco===0||(estado.palcosComprados||[]).includes(p.id);
    const ativo=(estado.palcoAtual||'cristal')===p.id;
    const botao=document.createElement('button');
    botao.type='button';
    botao.className='palco-card'+(ativo?' ativo':'');
    botao.setAttribute('aria-pressed',String(ativo));
    botao.innerHTML=`<span class="palco-icone">${p.emoji}</span><span class="palco-preview" data-palcopreview="${p.id}"><i></i></span><b>${p.nome}</b><small>${p.descricao}</small><strong>${ativo?'✓ Em uso':comprado?'Usar':p.preco+' 🪙'}</strong>`;
    botao.onclick=()=>selecionarOuComprarPalco(p);
    grid.appendChild(botao);
  });
}
function selecionarOuComprarPalco(p){
  const comprados=Array.isArray(estado.palcosComprados)?estado.palcosComprados:['cristal'];
  if(p.preco===0||comprados.includes(p.id)){
    estado.palcoAtual=p.id;
    salvar();aplicarPalcoPet();renderizarPalcosPet();
    return mostrarToast(`✨ Palco ${p.nome} aplicado!`);
  }
  if(estado.moedas<p.preco)return mostrarToast(`🪙 Faltam ${p.preco-estado.moedas} moedas.`);
  mostrarConfirmacao(`Comprar o palco ${p.nome} por ${p.preco} moedas?`,()=>{
    if((estado.palcosComprados||[]).includes(p.id)||estado.moedas<p.preco)return;
    estado.moedas-=p.preco;
    estado.palcosComprados=[...comprados,p.id];
    estado.palcoAtual=p.id;
    salvar();atualizarTela();renderizarPalcosPet();
    mostrarToast(`✨ Palco ${p.nome} desbloqueado!`);
  });
}
function renderizarGridFundos(){
  const c=document.getElementById('grid-fundos');
  c.innerHTML='';
  BANCO_FUNDOS.forEach(f=>{
    const comprado=estado.fundosComprados.includes(f.id)||f.preco===0,ativo=estado.fundoAtual===f.id,d=document.createElement('div');
    d.className='fundo-card '+(ativo?'ativo':'');
    d.style.background=f.bg;
    d.innerHTML=`<span style="font-size:25px">${f.emoji}</span><b style="font-size:10px;margin-top:3px">${esc(f.nome)}</b><span class="shop-tag">${ativo?'✓ Em uso':f.preco===0?'Grátis · Usar':comprado?'Usar':f.preco+' 🪙'}</span><small class="fundo-curiosidade">💡 ${esc(CURIOSIDADES_FUNDOS[f.id]||'Um cenário novo para explorar.')}</small>`;
    d.onclick=()=>selecionarOuComprarFundo(f);
    c.appendChild(d);
  });
  renderizarTemasInterface();
  renderizarPalcosPet();
}
function renderizarTemasInterface(){
  const grid=document.getElementById('grid-temas');
  if(!grid)return;
  grid.replaceChildren();
  TEMAS_INTERFACE.forEach(tema=>{
    const liberado=!tema.fundo||(estado.fundosComprados||[]).includes(tema.fundo);
    const ativo=(estado.temaInterfaceAtual||'classico')===tema.id;
    const botao=document.createElement('button');
    botao.type='button';
    botao.className=`tema-card tema-card-${tema.id}${ativo?' ativo':''}`;
    botao.innerHTML=`<span class="tema-card-icone">${tema.emoji}</span><b>${esc(tema.nome)}</b><small>${ativo?'✓ Em uso':liberado?'Aplicar':'🔒 Compre o cenário'}</small>`;
    botao.disabled=!liberado;
    botao.onclick=()=>{
      estado.temaInterfaceAtual=tema.id;
      salvar();
      aplicarTemaInterface();
      renderizarTemasInterface();
      mostrarToast(`🎨 Tema ${tema.nome} aplicado!`);
    };
    grid.appendChild(botao);
  });
}
function selecionarOuComprarFundo(f){
  if(f.preco===0 && !estado.fundosComprados.includes(f.id))estado.fundosComprados.push(f.id);
  if(estado.fundosComprados.includes(f.id)){
    estado.fundoAtual=f.id;
    salvar();
    aplicarFundoTela(f.id);
    renderizarGridFundos();
    return mostrarToast(`🎨 ${f.nome} aplicado!`);
  }
  if(estado.moedas<f.preco)return mostrarToast(`🪙 Faltam ${f.preco-estado.moedas} moedas.`);
  mostrarConfirmacao(`Comprar "${f.nome}" por ${f.preco} moedas?`,()=>{
    estado.moedas-=f.preco;
    estado.fundosComprados.push(f.id);
    estado.fundoAtual=f.id;
    salvar();
    atualizarTela();
    renderizarGridFundos();
    dispararConfetes();
    mostrarToast('🎉 Fundo desbloqueado!');
  });
}
function renderizarAcessorioNoContainer(){
  // Compras antigas ficam salvas, mas as sobreposições não servem aos novos pets.
  const camada=document.getElementById('camada-acessorio');
  const objetos=document.getElementById('objetos-pet-layer');
  if(camada)camada.replaceChildren();
  if(objetos)objetos.replaceChildren();
  const pet=document.getElementById('pet-principal');
  if(pet)pet.classList.remove('pet-acessorio-ativo','acessorio-coroa','acessorio-fone','acessorio-grinalda','acessorio-bone','acessorio-chapeu','acessorio-oculos','acessorio-laco','acessorio-cachecol','acessorio-gravata');
}

function celebrarNovoAcessorio(){
  const stage=document.querySelector('.pet-stage');
  if(!stage)return;
  stage.classList.remove('pet-stage-celebracao');
  void stage.offsetWidth;
  stage.classList.add('pet-stage-celebracao');
  setTimeout(()=>stage.classList.remove('pet-stage-celebracao'),1000);
}
function abrirLojaRecompensas(){
  renderizarLojaRecompensas();
  abrirModal('modal-recompensas');
}
function premioTemSolicitacaoPendente(id){
  return (estado.solicitacoesPremios||[]).some(s=>s.recompensaId===id&&s.status==='pendente');
}
function renderizarLojaRecompensas(){
  const c=document.getElementById('lista-itens-loja');
  if(!c)return;
  estado.sonhos=Array.isArray(estado.sonhos)?estado.sonhos:[];
  estado.solicitacoesPremios=Array.isArray(estado.solicitacoesPremios)?estado.solicitacoesPremios:[];
  const metaTotal=Math.max(1,Number(estado.metaMoedas)||50);
  const moedas=Math.max(0,Number(estado.moedas)||0);
  const percMeta=Math.min(100,Math.round((moedas/metaTotal)*100));
  const metaTxt=document.getElementById('texto-meta-progresso');
  const metaBar=document.getElementById('barra-meta-progresso');
  if(metaTxt)metaTxt.textContent=`${moedas} 🪙`;
  if(metaBar)metaBar.style.width=`${percMeta}%`;
  const sonhosAtivos=estado.sonhos.filter(s=>s.status==='precificado');
  const sonhosPendentes=estado.sonhos.filter(s=>s.status==='aguardando_preco');
  const sonhosRecusados=estado.sonhos.filter(s=>s.status==='recusado').slice(-1);
  c.innerHTML=`
    <div class="rp-shop-head"><div><div class="rp-shop-title">✨ Meu sonho</div><div class="rp-shop-sub">Conte aos seus pais o que você gostaria muito de ganhar ou fazer.</div></div><div class="rp-wallet">🪙 <b>${moedas}</b></div></div>
    <div class="rp-shop-progress"><div class="rp-progress-top"><span>Suas PetCoins</span><b>${moedas} 🪙</b></div><div class="rp-progress-track"><div style="width:${percMeta}%"></div></div><small>Complete missões para juntar PetCoins para o seu sonho.</small></div>
    <div class="section-card" style="margin:8px 0">
      <label for="input-sonho-novo" style="display:block;font-size:9px;font-weight:900;margin-bottom:5px">O que você gostaria muito?</label>
      <textarea class="field" id="input-sonho-novo" maxlength="120" rows="2" placeholder="Ex.: passear no zoológico ou ganhar um brinquedo"></textarea>
      <button class="primary-btn pink-btn" style="width:100%;margin-top:6px" onclick="criarSonhoCrianca()">💭 Enviar meu sonho aos pais</button>
    </div>
    ${sonhosPendentes.length?`<div class="rp-empty" style="margin:7px 0">⏳ Seus pais ainda vão escolher quantas PetCoins seu sonho vai custar.</div>`:''}
    ${sonhosRecusados.length?`<div class="rp-empty" style="margin:7px 0">💬 Seus pais responderam sobre “${esc(sonhosRecusados[0].texto)}”. Converse com eles para pensar em outro sonho.</div>`:''}
    ${sonhosAtivos.length?`<div class="rp-shop-section-title">🌟 Meus sonhos</div>`:''}
  `;
  sonhosAtivos.forEach(s=>{
    const custo=Math.max(1,Number(s.custo)||0),pode=moedas>=custo,pendente=sonhoTemSolicitacaoPendente(s.id);
    const pct=Math.min(100,Math.round((moedas/custo)*100)),faltam=Math.max(0,custo-moedas);
    const card=document.createElement('div');card.className='rp-prize-card'+(pode?' ready':'');
    card.innerHTML=`<div class="rp-prize-icon">💭</div><div class="rp-prize-name">${esc(s.texto)}</div><div class="rp-prize-desc">Um sonho escolhido por você e combinado com seus pais.</div><div class="rp-prize-cost">🪙 ${custo}</div>${pode?`<div class="rp-can-get">✨ Você já juntou o suficiente!</div><button class="rp-prize-btn" ${pendente?'disabled':''} onclick="solicitarRealizacaoSonho(${Number(s.id)})">${pendente?'⏳ Pedido enviado':'🎁 Pedir para realizar'}</button>`:`<div class="rp-missing">Faltam <b>${faltam} 🪙</b></div><div class="rp-mini-track"><div style="width:${pct}%"></div></div><button class="rp-prize-btn disabled" disabled>🔒 Continue juntando</button>`}`;
    c.appendChild(card);
  });
  if(!sonhosAtivos.length&&!sonhosPendentes.length)c.insertAdjacentHTML('beforeend','<div class="rp-empty">🌈<br><b>Seu próximo sonho começa aqui!</b><small>Escreva sua ideia e peça aos seus pais para colocar um valor em PetCoins.</small></div>');
  const meusPedidos=estado.solicitacoesPremios.slice().reverse().slice(0,5);
  if(meusPedidos.length){
    const history=document.createElement('div');history.className='rp-my-orders';history.innerHTML='<div class="rp-shop-section-title">🎟️ Pedidos recentes</div>';
    meusPedidos.forEach(s=>{const cls=s.status==='aprovado'?'ok':s.status==='recusado'?'no':'wait',label=s.status==='aprovado'?'Aprovado':s.status==='recusado'?'Converse com os pais':'Aguardando';history.innerHTML+=`<div class="rp-order ${cls}"><span>${esc(s.texto)}</span><span><b>${Number(s.custo)||0} 🪙</b> · ${label}</span></div>`;});
    c.appendChild(history);
  }
}
function sonhoTemSolicitacaoPendente(id){
  return (estado.solicitacoesPremios||[]).some(s=>String(s.sonhoId)===String(id)&&s.status==='pendente');
}
function criarSonhoCrianca(){
  if(perfilAtivo!=='crianca')return;
  estado.sonhos=Array.isArray(estado.sonhos)?estado.sonhos:[];
  if(estado.sonhos.some(s=>s.status==='aguardando_preco'))return mostrarToast('⏳ Espere seus pais responderem ao sonho que você já enviou.');
  const input=document.getElementById('input-sonho-novo'),texto=String(input?.value||'').trim().replace(/\s+/g,' ').slice(0,120);
  if(texto.length<3)return mostrarToast('Escreva um pouco mais sobre o seu sonho.');
  const sonho={id:Date.now()+Math.floor(Math.random()*1000),texto,status:'aguardando_preco',criadoEm:Date.now(),data:hojeLocal()};
  estado.sonhos.push(sonho);salvar();renderizarLojaRecompensas();renderizarSolicitacoesPremiosPais();
  mostrarToast('💭 Sonho enviado! Seus pais vão escolher o valor em PetCoins.');
  registrarLogAtividade(`Novo sonho enviado: ${texto}`);
  enviarNotificacaoLocal('💭 Novo sonho',texto,'rotinapet-sonho');
  enfileirarPushFamilia('💭 Novo sonho',texto,{tag:'rotinapet-sonho',onlyPerfil:'pais'});
}
function solicitarRealizacaoSonho(id){
  if(perfilAtivo!=='crianca')return;
  const s=(estado.sonhos||[]).find(x=>String(x.id)===String(id));
  if(!s||s.status!=='precificado'||sonhoTemSolicitacaoPendente(id))return;
  const custo=Math.max(1,Number(s.custo)||0);
  if((Number(estado.moedas)||0)<custo)return mostrarToast(`🔒 Junte mais ${custo-(Number(estado.moedas)||0)} PetCoins para pedir esse sonho.`);
  const solicitacao={id:Date.now()+Math.floor(Math.random()*1000),sonhoId:s.id,texto:s.texto,custo,tipo:'sonho',status:'pendente',data:hojeLocal(),dataHora:Date.now()};
  estado.solicitacoesPremios.push(solicitacao);salvar();atualizarTela();renderizarLojaRecompensas();renderizarSolicitacoesPremiosPais();
  mostrarToast('🎟️ Pedido enviado aos seus pais!');
  registrarLogAtividade(`Pedido para realizar sonho: ${s.texto}`);
  enviarNotificacaoLocal('🎟️ Pedido de sonho',`${s.texto} — ${custo}🪙`,'rotinapet-premio');
  enfileirarPushFamilia('🎟️ Pedido de sonho',`${s.texto} (${custo}🪙)`,{tag:'rotinapet-premio',onlyPerfil:'pais'});
}
function resgatarRecompensa(id){
  // Mantida apenas para compatibilidade com links de versões antigas.
  const r=(estado.recompensas||[]).find(x=>x.id===id);
  if(!r||r.ativo===false||Number(estado.moedas)<Number(r.custo)||premioTemSolicitacaoPendente(id))return;
  const solicitacao={id:Date.now()+Math.floor(Math.random()*1000),recompensaId:r.id,texto:r.texto,custo:Number(r.custo)||0,tipo:r.tipo||'premio',minutos:Number(r.minutos)||0,status:'pendente',data:hojeLocal(),dataHora:Date.now()};
  estado.solicitacoesPremios.push(solicitacao);salvar();atualizarTela();renderizarSolicitacoesPremiosPais();
}
function aprovarSolicitacaoPremio(id){
  const s=(estado.solicitacoesPremios||[]).find(x=>x.id===id);
  if(!s||s.status!=='pendente')return;
  const sonho=s.sonhoId?(estado.sonhos||[]).find(x=>String(x.id)===String(s.sonhoId)):null;
  if(s.sonhoId&&(!sonho||sonho.status!=='precificado'))return mostrarToast('⚠️ Este sonho não está mais disponível.');
  if((Number(estado.moedas)||0)<(Number(s.custo)||0)){mostrarToast('⚠️ Saldo insuficiente.');return;}
  estado.moedas-=Number(s.custo)||0;s.status='aprovado';s.aprovadoEm=Date.now();s.mensagem='Pedido aprovado pelos pais.';
  if(sonho){sonho.status='realizado';sonho.realizadoEm=Date.now();}
  registrarLogAtividade(`Pedido aprovado: ${s.texto} (−${Number(s.custo)||0}🪙)`);
  salvar();atualizarTela();renderizarPainelPais();renderizarLojaRecompensas();
  const r=(estado.recompensas||[]).find(x=>x.id===s.recompensaId);
  if((s.tipo==='timer'||r?.tipo==='timer')&&s.minutos){iniciarTimerTela(s.minutos);}
  else{dispararConfetes();somConquista();mostrarAviso(sonho?'💭':'🎁',sonho?'Sonho realizado!':'Prêmio aprovado!',sonho?`Combinado realizado: ${s.texto}`:`Liberado: ${s.texto}`);}
}
function recusarSolicitacaoPremio(id){
  const s=(estado.solicitacoesPremios||[]).find(x=>x.id===id);
  if(!s||s.status!=='pendente')return;
  s.status='recusado';
  s.recusadoEm=Date.now();
  s.mensagem='Converse com os pais para combinar outra recompensa.';
  registrarLogAtividade(`Prêmio recusado: ${s.texto}`);
  salvar();
  renderizarPainelPais();
  renderizarLojaRecompensas();
  mostrarToast('💬 Solicitação recusada. Converse com a criança.');
}
function adicionarPremioPais(){mostrarToast('💭 Agora a criança cria um sonho e os pais definem o valor em PetCoins.');}
function editarPremioPais(id){
  const r=estado.recompensas.find(x=>x.id===id);
  if(!r)return;
  const texto=window.prompt('Nome:',r.texto);
  if(!texto||!texto.trim())return;
  const custo=Number(window.prompt('Moedas:',String(r.custo)));
  if(!Number.isFinite(custo)||custo<1)return mostrarToast('⚠️ Custo inválido.');
  const descricao=window.prompt('Descrição:',r.descricao||'')??'';
  const icone=window.prompt('Emoji:',r.icone||'🎁')||'🎁';
  r.texto=texto.trim();
  r.custo=custo;
  r.descricao=descricao.trim();
  r.icone=icone.trim()||'🎁';
  if(r.tipo==='timer'){
    const minutos=Number(window.prompt('Minutos:',String(r.minutos||20)));
    if(!Number.isFinite(minutos)||minutos<1)return mostrarToast('⚠️ Minutos inválidos.');
    r.minutos=minutos;
  }
  salvar();
  renderizarPainelPais();
  renderizarLojaRecompensas();
  mostrarToast('✏️ Atualizado!');
}
function alternarPremioPais(id){
  const r=estado.recompensas.find(x=>x.id===id);
  if(!r)return;
  r.ativo=r.ativo===false;
  salvar();
  renderizarPainelPais();
  renderizarLojaRecompensas();
  mostrarToast(r.ativo?'👁️ Ativado.':'🙈 Ocultado.');
}
function excluirPremioPais(id){
  const r=estado.recompensas.find(x=>x.id===id);
  if(!r)return;
  mostrarConfirmacao(`Excluir "${r.texto}"?`,()=>{
    estado.recompensas=estado.recompensas.filter(x=>x.id!==id);
    estado.solicitacoesPremios=(estado.solicitacoesPremios||[]).filter(s=>s.recompensaId!==id||s.status!=='pendente');
    salvar();
    renderizarPainelPais();
    renderizarLojaRecompensas();
    mostrarToast('🗑️ Excluído.');
  });
}
function renderizarGerenciamentoPremiosPais(){
  const c=document.getElementById('lista-gerenciar-premios');if(!c)return;
  estado.sonhos=Array.isArray(estado.sonhos)?estado.sonhos:[];
  const ativos=estado.sonhos.filter(s=>s.status==='precificado');
  c.innerHTML=ativos.length?ativos.map(s=>`<div class="edit-row" style="gap:5px;align-items:center;flex-wrap:wrap"><span style="font-size:20px">💭</span><span style="flex:1;min-width:120px"><b>${esc(s.texto)}</b> • ${Number(s.custo)||0}🪙<small style="display:block;color:#64748b">Sonho ativo da criança</small></span><button class="primary-btn red-btn" onclick="removerSonhoPais(${Number(s.id)})">🗑️</button></div>`).join(''):'<span style="font-size:9px;color:#94a3b8">Ainda não há sonhos com preço definido.</span>';
}
function definirPrecoSonho(id,valor){
  if(perfilAtivo!=='pais')return;
  const s=(estado.sonhos||[]).find(x=>String(x.id)===String(id));
  const custo=Number(valor);
  if(!s||s.status!=='aguardando_preco')return;
  if(!Number.isInteger(custo)||custo<1||custo>100000)return mostrarToast('Informe um valor inteiro de 1 a 100.000 PetCoins.');
  s.custo=custo;s.status='precificado';s.precificadoEm=Date.now();
  salvar();renderizarPainelPais();renderizarLojaRecompensas();
  mostrarToast('✅ Valor definido. O sonho já está disponível para a criança.');
}
function recusarSonhoCrianca(id){
  if(perfilAtivo!=='pais')return;
  const s=(estado.sonhos||[]).find(x=>String(x.id)===String(id));
  if(!s||s.status!=='aguardando_preco')return;
  s.status='recusado';s.respondidoEm=Date.now();salvar();renderizarPainelPais();renderizarLojaRecompensas();
  mostrarToast('Sonho recusado. A criança pode enviar outra ideia.');
}
function removerSonhoPais(id){
  if(perfilAtivo!=='pais')return;
  const s=(estado.sonhos||[]).find(x=>String(x.id)===String(id));
  if(!s||s.status!=='precificado')return;
  mostrarConfirmacao(`Remover o sonho “${s.texto}” da loja?`,()=>{estado.sonhos=estado.sonhos.filter(x=>String(x.id)!==String(id));salvar();renderizarPainelPais();renderizarLojaRecompensas();});
}
function renderizarSolicitacoesPremiosPais(){
  const c=document.getElementById('lista-solicitacoes-premios');if(!c)return;
  estado.sonhos=Array.isArray(estado.sonhos)?estado.sonhos:[];
  const todos=(estado.solicitacoesPremios||[]).slice().sort((a,b)=>(Number(b.dataHora)||Number(b.id)||0)-(Number(a.dataHora)||Number(a.id)||0));
  const ideias=estado.sonhos.filter(s=>s.status==='aguardando_preco').sort((a,b)=>(Number(a.criadoEm)||0)-(Number(b.criadoEm)||0));
  c.innerHTML='';
  if(ideias.length){
    c.innerHTML+='<div style="font-size:9px;font-weight:900;color:#7c3aed;margin-bottom:5px">💭 Sonhos aguardando seu valor</div>';
    ideias.forEach(s=>{c.innerHTML+=`<div class="approval-row"><div class="approval-top"><span>💭 <b>${esc(s.texto)}</b></span><small>${esc(s.data||'')}</small></div><div style="display:flex;gap:5px;align-items:center;margin-top:6px"><label for="preco-sonho-${Number(s.id)}" style="font-size:8px">PetCoins</label><input class="field" id="preco-sonho-${Number(s.id)}" type="number" min="1" max="100000" step="1" value="50" style="width:85px"><button class="primary-btn green-btn" onclick="definirPrecoSonho(${Number(s.id)},document.getElementById('preco-sonho-${Number(s.id)}').value)">Definir valor</button><button class="primary-btn red-btn" onclick="recusarSonhoCrianca(${Number(s.id)})">Recusar</button></div></div>`;});
  }
  const pendentes=todos.filter(s=>s.status==='pendente');
  if(pendentes.length)c.innerHTML+='<div style="font-size:9px;font-weight:900;color:#7c3aed;margin:10px 0 5px">🎟️ Pedidos para realizar</div>';
  if(!ideias.length&&!pendentes.length)c.innerHTML='<span style="font-size:9px;color:#94a3b8">Nenhum sonho ou resgate aguardando.</span>';
  pendentes.forEach(s=>{c.innerHTML+=`<div class="approval-row"><div class="approval-top"><span>${s.sonhoId?'💭':'🎁'} <b>${esc(s.texto)}</b> • ${Number(s.custo)||0}🪙</span><div style="display:flex;gap:4px"><button class="primary-btn red-btn" onclick="recusarSolicitacaoPremio(${Number(s.id)})">Recusar</button><button class="primary-btn green-btn" onclick="aprovarSolicitacaoPremio(${Number(s.id)})">Aprovar</button></div></div><small style="display:block;color:#64748b;margin-top:4px">Pedido em ${esc(s.data||hojeLocal())} · as PetCoins são descontadas na aprovação</small></div>`;});
  const historico=todos.filter(s=>s.status!=='pendente').slice(0,5);
  if(historico.length){c.innerHTML+='<div style="font-size:9px;font-weight:900;color:#475569;margin:10px 0 5px">🗂️ Histórico recente</div>';historico.forEach(s=>{const ok=s.status==='aprovado';c.innerHTML+=`<div style="font-size:8px;padding:6px 8px;margin-bottom:4px;border-radius:9px;background:${ok?'#f0fdf4':'#fef2f2'};color:${ok?'#166534':'#991b1b'}">${ok?'✅':'❌'} ${esc(s.texto)} · ${ok?'aprovado':'recusado'} · ${esc(s.data||'')}</div>`;});}
}
let intervaloTimer=null;
function iniciarTimerTela(minutos){
  estado.timerFim=Date.now()+(minutos*60*1000);
  salvar();
  atualizarDisplayTimer();
  abrirModal('modal-timer');
  clearInterval(intervaloTimer);
  intervaloTimer=setInterval(atualizarDisplayTimer,1000);
}
function atualizarDisplayTimer(){
  if(!estado.timerFim)return;
  const restante=Math.max(0,Math.floor((estado.timerFim-Date.now())/1000));
  const m=String(Math.floor(restante/60)).padStart(2,'0');
  const s=String(restante%60).padStart(2,'0');
  const el=document.getElementById('relogio-timer');
  if(el)el.textContent=`${m}:${s}`;
  if(restante<=0){
    clearInterval(intervaloTimer);
    estado.timerFim=null;
    salvar();
    tocarTom(300,'sawtooth',.4,0,.3);
    setTimeout(()=>tocarTom(250,'sawtooth',.6,0,.3),450);
    mostrarAviso('⏰','Tempo Esgotado!','O tempo de tela acabou.');
    fecharModal('modal-timer');
  }
}
function pausarFecharTimer(){
  clearInterval(intervaloTimer);
  estado.timerFim=null;
  salvar();
  fecharModal('modal-timer');
}
let mediaRecorder=null,pedacosAudio=[],bufferGravado=null,audioBlobFinal=null,blobGravacaoOriginal=null;
function alternarGravador(){
  abrirModal('modal-gravador');
}
async function iniciarGravacao(){
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    pedacosAudio=[];
    mediaRecorder=new MediaRecorder(stream);
    mediaRecorder.ondataavailable=e=>{if(e.data.size>0)pedacosAudio.push(e.data)};
    mediaRecorder.onstop=async ()=>{
      const blob=new Blob(pedacosAudio,{type:'audio/webm'});
      const arrayBuf=await blob.arrayBuffer();
      const ctx=obterAudioContext();
      bufferGravado=await ctx.decodeAudioData(arrayBuf);
      blobGravacaoOriginal=blob;audioBlobFinal=blob;
      document.getElementById('audio-original').src=URL.createObjectURL(blob);
      document.getElementById('grav-result').classList.remove('hidden');
    };
    mediaRecorder.start();
    document.getElementById('btn-iniciar-grav').style.display='none';
    document.getElementById('btn-parar-grav').style.display='inline-block';
  }catch(err){
    mostrarToast('❌ Permissão de microfone negada ou indisponível.');
  }
}
function pararGravacao(){
  if(mediaRecorder&&mediaRecorder.state!=='inactive'){
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t=>t.stop());
  }
  document.getElementById('btn-iniciar-grav').style.display='inline-block';
  document.getElementById('btn-parar-grav').style.display='none';
}
async function aplicarEfeitoVoz(tipo,btnEl){
  if(!bufferGravado)return;
  document.querySelectorAll('#modal-gravador .task-btn').forEach(b=>b.style.background='');
  btnEl.style.background='#c7d2fe';
  
  if(tipo==='normal'){
    audioBlobFinal=blobGravacaoOriginal;
    document.getElementById('audio-original').src=URL.createObjectURL(audioBlobFinal);
    return;
  }
  
  const aviso=document.getElementById('efeito-processando');
  aviso.classList.remove('hidden');
  
  const taxas={fininha:1.5,grossa:.75,robo:.92,fantasma:.78,eco:1};
  const taxa=taxas[tipo]||1;
  const ctxOff=new OfflineAudioContext(
    bufferGravado.numberOfChannels,
    Math.ceil(bufferGravado.length/taxa+bufferGravado.sampleRate*(tipo==='eco'?.7:tipo==='fantasma'?.3:0)),
    bufferGravado.sampleRate
  );
  
  const src=ctxOff.createBufferSource();
  src.buffer=bufferGravado;
  src.playbackRate.value=taxa;
  let saida=src;
  if(tipo==='robo'){
    const filtro=ctxOff.createBiquadFilter();filtro.type='bandpass';filtro.frequency.value=1100;filtro.Q.value=.65;
    const modulador=ctxOff.createGain();modulador.gain.value=.55;
    const oscilador=ctxOff.createOscillator();oscilador.frequency.value=42;
    const profundidade=ctxOff.createGain();profundidade.gain.value=.4;
    oscilador.connect(profundidade);profundidade.connect(modulador.gain);oscilador.start(0);
    src.connect(filtro);filtro.connect(modulador);saida=modulador;
  }else if(tipo==='fantasma'){
    const filtro=ctxOff.createBiquadFilter();filtro.type='lowpass';filtro.frequency.value=1500;src.connect(filtro);saida=filtro;
  }
  saida.connect(ctxOff.destination);
  if(tipo==='fantasma'||tipo==='eco'){
    const atraso=ctxOff.createDelay(1);atraso.delayTime.value=tipo==='eco'?.28:.18;
    const retorno=ctxOff.createGain();retorno.gain.value=tipo==='eco'?.38:.23;
    saida.connect(atraso);atraso.connect(retorno);retorno.connect(ctxOff.destination);
    if(tipo==='eco'){const atraso2=ctxOff.createDelay(1);atraso2.delayTime.value=.55;const retorno2=ctxOff.createGain();retorno2.gain.value=.18;saida.connect(atraso2);atraso2.connect(retorno2);retorno2.connect(ctxOff.destination)}
  }
  src.start(0);
  
  const renderizado=await ctxOff.startRendering();
  const wavBlob=audioBufferParaWavBlob(renderizado);
  audioBlobFinal=wavBlob;
  document.getElementById('audio-original').src=URL.createObjectURL(wavBlob);
  aviso.classList.add('hidden');
}
function audioBufferParaWavBlob(buffer){
  const numCanais=buffer.numberOfChannels,taxaAmostragem=buffer.sampleRate,formato=1,profundidadeBits=16;
  const bytesAmostra=profundidadeBits/8,tamanhoBloco=numCanais*bytesAmostra;
  const numAmostras=buffer.length;
  const tamanhoDados=numAmostras*tamanhoBloco;
  const arrayBuf=new ArrayBuffer(44+tamanhoDados);
  const v=new DataView(arrayBuf);
  
  const escreverString=(offset,str)=>{for(let i=0;i<str.length;i++)v.setUint8(offset+i,str.charCodeAt(i))};
  escreverString(0,'RIFF');
  v.setUint32(4,36+tamanhoDados,true);
  escreverString(8,'WAVE');
  escreverString(12,'fmt ');
  v.setUint32(16,16,true);
  v.setUint16(20,formato,true);
  v.setUint16(22,numCanais,true);
  v.setUint32(24,taxaAmostragem,true);
  v.setUint32(28,taxaAmostragem*tamanhoBloco,true);
  v.setUint16(32,tamanhoBloco,true);
  v.setUint16(34,profundidadeBits,true);
  escreverString(36,'data');
  v.setUint32(40,tamanhoDados,true);
  
  let offset=44;
  for(let i=0;i<numAmostras;i++){
    for(let canal=0;canal<numCanais;canal++){
      let s=buffer.getChannelData(canal)[i];
      s=Math.max(-1,Math.min(1,s));
      v.setInt16(offset,s<0?s*0x8000:s*0x7FFF,true);
      offset+=2;
    }
  }
  return new Blob([arrayBuf],{type:'audio/wav'});
}
function salvarVoz(){
  if(!audioBlobFinal)return;
  const leitor=new FileReader();
  leitor.onloadend=()=>{
    estado.vozSalva=leitor.result;
    salvar();
    fecharModal('modal-gravador');
    mostrarToast('💾 Som do pet atualizado!');
  };
  leitor.readAsDataURL(audioBlobFinal);
}
function comViewTransition(fn){
  if(typeof document.startViewTransition==='function'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    try{return document.startViewTransition(fn)}catch(e){fn()}
  }else{fn()}
}
function abrirModal(id){
  comViewTransition(()=>{
    // O último modal aberto sempre fica acima do painel dos pais e dos demais.
    document.querySelectorAll('.modal-overlay.modal-top').forEach(el=>el.classList.remove('modal-top'));
    document.getElementById(id)?.classList.add('mostrar','modal-top');
  });
}
function fecharModal(id){
  comViewTransition(()=>{
    const el=document.getElementById(id);
    el?.classList.remove('mostrar','modal-top');
  });
}
function abrirModalAjuda(){
  alternarAbaAjuda(perfilAtivo==='pais'?'pais':'crianca');
  abrirModal('modal-ajuda');
}
function alternarAbaAjuda(aba){
  const crianca=aba==='crianca';
  document.getElementById('painel-ajuda-crianca')?.classList.toggle('hidden',!crianca);
  document.getElementById('painel-ajuda-pais')?.classList.toggle('hidden',crianca);
  document.getElementById('tab-ajuda-crianca')?.classList.toggle('ativa',crianca);
  document.getElementById('tab-ajuda-pais')?.classList.toggle('ativa',!crianca);
}
let demoRodando=false;
let tourRodando=false;
function setDemoHud(txt){
  const el=document.getElementById('demo-hud');
  if(!el)return;
  el.textContent=txt;
  el.classList.add('mostrar');
}
function hideDemoHud(){
  document.getElementById('demo-hud')?.classList.remove('mostrar');
  document.getElementById('demo-spotlight')?.classList.remove('mostrar');
}
function apontarSpotlight(el){
  const spot=document.getElementById('demo-spotlight');
  if(!spot||!el)return;
  const r=el.getBoundingClientRect();
  spot.style.setProperty('--sx',(r.left+r.width/2)+'px');
  spot.style.setProperty('--sy',(r.top+r.height/2)+'px');
  spot.classList.add('mostrar');
}
async function iniciarTourGuiado(){
  if(tourRodando||demoRodando)return;
  tourRodando=true;
  document.getElementById('modal-ajuda')?.classList.remove('mostrar','modal-top');
  document.getElementById('modal-onboarding')?.classList.remove('mostrar','modal-top');
  await esperar(100);
  const passos=[
    {texto:'1/5 · Toque no pet para dar carinho ❤️',alvo:'#pet-principal'},
    {texto:'2/5 · Aqui você brinca, faz carinho e comemora 🎾',alvo:'#pet-actions'},
    {texto:'3/5 · Envie uma missão para os pais conferirem ✅',alvo:'.tasks-section'},
    {texto:'4/5 · Encontre jogos e outras aventuras aqui ⚡',alvo:'.bottom-buttons'},
    {texto:'5/5 · Acompanhe suas moedas e sua sequência ✨',alvo:'.top-row'}
  ];
  const hud=document.getElementById('demo-hud');
  try{
    hud?.classList.add('tour-interativo');
    for(let i=0;i<passos.length;i++){
      const passo=passos[i];
      apontarSpotlight(document.querySelector(passo.alvo));
      const escolha=await new Promise(resolve=>{
        hud.replaceChildren();
        const texto=document.createElement('div');texto.textContent=passo.texto;
        const acoes=document.createElement('div');acoes.className='tour-hud-actions';
        const pular=document.createElement('button');pular.type='button';pular.className='tour-pular';pular.textContent='Pular';pular.onclick=()=>resolve('pular');
        const proximo=document.createElement('button');proximo.type='button';proximo.className='tour-proximo';proximo.textContent=i===passos.length-1?'Terminar':'Próximo';proximo.onclick=()=>resolve('proximo');
        acoes.append(pular,proximo);hud.append(texto,acoes);
        hud.classList.add('mostrar');
        proximo.focus({preventScroll:true});
      });
      if(escolha==='pular')return;
    }
    mostrarAviso('🚀','Tour concluído!','Agora é com você: complete uma missão e cuide do seu pet.');
  }finally{
    tourRodando=false;
    hideDemoHud();
    hud?.classList.remove('tour-interativo');
    hud?.replaceChildren();
  }
}
async function iniciarDemoAnimacoes(){
  if(demoRodando)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    mostrarToast('Animações reduzidas neste aparelho.');
    return;
  }
  demoRodando=true;
  fecharModal('modal-ajuda');
  await esperar(350);
  const passos=[
    async()=>{
      setDemoHud('1/6 · Bounce do pet + corações');
      const pet=document.getElementById('pet-principal');
      apontarSpotlight(pet);
      animarPetToque({clientX:window.innerWidth/2,clientY:window.innerHeight*0.38});
      await esperar(1100);
    },
    async()=>{
      setDemoHud('2/6 · Moedas e contador');
      apontarSpotlight(document.querySelector('.top-pill'));
      animarMoedasBump();
      await esperar(900);
    },
    async()=>{
      setDemoHud('3/6 · Level-up pop');
      apontarSpotlight(document.querySelector('.level-badge'));
      const badge=document.querySelector('.level-badge');
      if(badge){
        badge.classList.remove('level-up-pop');
        void badge.offsetWidth;
        badge.classList.add('level-up-pop');
        setTimeout(()=>badge.classList.remove('level-up-pop'),800);
      }
      dispararConfetes(90);
      await esperar(1000);
    },
    async()=>{
      setDemoHud('4/6 · Aura do palco');
      apontarSpotlight(document.querySelector('.pet-stage'));
      const stage=document.querySelector('.pet-stage');
      if(stage){
        stage.classList.remove('stage-react');
        void stage.offsetWidth;
        stage.classList.add('stage-react');
        setTimeout(()=>stage.classList.remove('stage-react'),750);
      }
      await esperar(900);
    },
    async()=>{
      setDemoHud('5/6 · Brilho nos botões');
      apontarSpotlight(document.querySelector('.bottom-buttons'));
      document.querySelectorAll('.bottom-btn').forEach((b,i)=>{
        setTimeout(()=>{
          b.classList.remove('shine-once');
          void b.offsetWidth;
          b.classList.add('shine-once');
          setTimeout(()=>b.classList.remove('shine-once'),750);
        },i*120);
      });
      await esperar(1100);
    },
    async()=>{
      setDemoHud('6/6 · View Transition no modal');
      hideDemoHud();
      await esperar(200);
      abrirModal('modal-aviso');
      document.getElementById('aviso-emoji').textContent='✨';
      document.getElementById('aviso-titulo').textContent='Demo concluída!';
      document.getElementById('aviso-texto').textContent='View Transitions, bounce, partículas CSS, shimmer e confetes — tudo no RotinaPet.';
      await esperar(400);
    }
  ];
  try{
    for(const passo of passos)await passo();
  }finally{
    demoRodando=false;
    setTimeout(hideDemoHud,500);
  }
}
function esperar(ms){return new Promise(r=>setTimeout(r,ms))}
let toastTimer=null;
function mostrarToast(txt){
  const el=document.getElementById('toast');
  if(!el)return;
  el.textContent=txt;
  el.classList.add('mostrar');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('mostrar'),2500);
}
function mostrarAviso(emoji,titulo,texto){
  document.getElementById('aviso-emoji').textContent=emoji;
  document.getElementById('aviso-titulo').textContent=titulo;
  document.getElementById('aviso-texto').textContent=texto;
  abrirModal('modal-aviso');
}
function mostrarConfirmacao(msg,cb){
  if(window.confirm(msg))cb();
}
function esc(str){
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
let disparoInstalacao=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  disparoInstalacao=e;
  const btn=document.getElementById('btn-instalar-pwa');
  if(btn)btn.classList.remove('hidden');
});
document.getElementById('btn-instalar-pwa')?.addEventListener('click',async ()=>{
  if(!disparoInstalacao)return;
  disparoInstalacao.prompt();
  const res=await disparoInstalacao.userChoice;
  if(res.outcome==='accepted'){
    document.getElementById('btn-instalar-pwa')?.classList.add('hidden');
  }
  disparoInstalacao=null;
});
setInterval(()=>{
  const agora=new Date();
  if(agora.getSeconds()===0){
    verificarLembreteNoturno();
    verificarLembreteTarde();
    if(estado.timerFim)atualizarDisplayTimer();
  }
},1000);
window.addEventListener('DOMContentLoaded',()=>{
  prepararSons();
  prepararClique();
  const tocarNoBotao=evento=>{
    const botao=evento.target.closest?.('button');
    if(!botao||botao.disabled||botao.matches('.btn-ok,[data-aprovacao="aprovar"],#input-sons-ativos'))return;
    tocarClique();
  };
  document.addEventListener('pointerdown',tocarNoBotao,true);
  document.addEventListener('click',evento=>{if(evento.detail===0||!window.PointerEvent)tocarNoBotao(evento)},true);
  if(typeof estado.volumeSom!=='number')estado.volumeSom=0.55;
  if(!Array.isArray(estado.logAtividades))estado.logAtividades=[];
  if(!estado.ultimoAcaoPet||typeof estado.ultimoAcaoPet!=='object')estado.ultimoAcaoPet={};
  if(!estado.metaFamiliarDias)estado.metaFamiliarDias=5;
  try{
    filaSyncPendente=localStorage.getItem('ROTINAPET_FILA_SYNC_'+codigoFamilia)==='1';
  }catch(e){}
  aplicarDecayPet();
  atualizarTela();
  atualizarBannerEvento();
  atualizarStatusSyncUI();
  verificarPrimeiroAcesso();
  agendarFalaAleatoria();
  atualizarBannerOffline();
  inicializarPushBase();
  if(estado.timerFim&&estado.timerFim>Date.now()){
    iniciarTimerTela(Math.ceil((estado.timerFim-Date.now())/60000));
  }
  // Banner de evento no primeiro acesso do dia
  const ev=obterEventoAtivo();
  if(ev&&estado.eventoAvisoData!==hojeLocal()&&estado.onboardingVistoCrianca){
    estado.eventoAvisoData=hojeLocal();
    salvar();
    setTimeout(()=>abrirModalEventoSazonal(),1200);
  }
  function checarEAplicarResetDiario(){
    if(verificarResetDiario()){
      salvar();
      atualizarTela();
      atualizarBannerEvento();
    }
  }
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible'){
      checarEAplicarResetDiario();
      aplicarDecayPet();
      atualizarBannerEvento();
      if(navigator.onLine&&filaSyncPendente)atualizarBannerOffline();
    }
  });
  setInterval(checarEAplicarResetDiario,60000);
  setInterval(aplicarDecayPet,5*60*1000);
});
