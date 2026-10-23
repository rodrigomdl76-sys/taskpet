Warning: truncated output (original token count: 79883)
Total output lines: 5792


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
      const duracao=.014,n=Math.ceil(ctx.sampleRate*duracao);
      bufferClique=ctx.createBuffer(1,n,ctx.sampleRate);
      const dados=bufferClique.getChannelData(0);
      for(let i=0;i<n;i++){
        const t=i/ctx.sampleRate;
        const envelope=Math.exp(-t/.0024);
        dados[i]=((Math.random()*2-1)*.68+Math.sin(2*Math.PI*1850*t)*.20)*envelope;
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
    fonte.buffer=bufferClique;
    ganho.gain.value=Math.min(.30,volume*.30);
    fonte.connect(ganho);ganho.connect(ctx.destination);
    fonte.start(ctx.currentTime);
    return true;
  }catch(e){return false}
}
function tocarNotaCartoon(fInicial,fFinal,duracao,atraso=0,volume=.1,forma='sine'){
  try{
    const ctx=obterAudioContext(),inicio=ctx.currentTime+atraso,vol=obterVolumeSom();
    if(vol<=.01)return;
    const osc=ctx.createOscillator(),ganho=ctx.createGain();
    osc.type=forma;
    osc.frequency.setValueAtTime(fInicial,inicio);
    osc.frequency.exponentialRampToValueAtTime(fFinal,inicio+duracao);
    ganho.gain.setValueAtTime(.0001,inicio);
    ganho.gain.exponentialRampToValueAtTime(Math.max(.001,volume*vol),inicio+.008);
    ganho.gain.exponentialRampToValueAtTime(.0001,inicio+duracao);
    osc.connect(ganho);ganho.connect(ctx.destination);
    osc.start(inicio);osc.stop(inicio+duracao+.01);
  }catch(e){}
}
function prepararSons(){try{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});prepararClique()}catch(e){prepararClique()}}
function playSound(tipo){
  if(tipo==='ui')return tocarClique();
  if(!ARQUIVOS_SOM[tipo]||obterVolumeSom()<=.01)return false;
  const agora=Date.now();
  if(agora-(ultimoSomPorTipo[tipo]||0)<95)return false;
  ultimoSomPorTipo[tipo]=agora;
  const notas={
    pet:[[520,250,.16,0,.13,'sine'],[380,560,.10,.09,.06,'triangle']],
    tarefa:[[560,760,.09,0,.10,'triangle'],[760,1040,.11,.075,.08,'sine']],
    moedas:[[880,1120,.11,0,.09,'sine'],[1120,1480,.14,.085,.075,'sine'],[1480,1260,.16,.17,.06,'triangle']],
    nivel:[[523,523,.13,0,.08,'sine'],[659,659,.13,.10,.08,'sine'],[784,784,.15,.20,.09,'sine'],[1046,1046,.24,.31,.10,'sine']]
  }[tipo];
  if(!notas)return false;
  notas.forEach(n=>tocarNotaCartoon(...n));
  return true;
}
const MELODIA_CANTINHO_PET=[
  349.23,440,523.25,698.46,659.25,523.25,440,523.25,
  293.66,349.23,440,587.33,523.25,440,349.23,440,
  233.08,293.66,349.23,466.16,440,349.23,293.66,349.23,
  261.63,329.63,392,523.25,698.46,659.25,523.25,392
];
const BAIXOS_CANTINHO_PET=[174.61,146.83,116.54,130.81];
let musicaAmbienteTimer=null,indiceNotaAmbiente=0,proximaNotaAmbiente=0,ganhoMusicaAmbiente=null,musicaAmbienteLiberada=false;
function tocarNotaAmbiente(freq,inicio,duracao,volume=.13){
  try{
    const ctx=obterAudioContext(),osc=ctx.createOscillator(),brilho=ctx.createOscillator(),ganho=ctx.createGain(),ganhoBrilho=ctx.createGain();
    osc.type='sine';osc.frequency.setValueAtTime(freq,inicio);
    brilho.type='triangle';brilho.frequency.setValueAtTime(freq*2,inicio);
    ganho.gain.setValueAtTime(.0001,inicio);
    ganho.gain.exponentialRampToValueAtTime(Math.max(.001,volume),inicio+.025);
    ganho.gain.setTargetAtTime(.0001,inicio+duracao-.08,.065);
    ganhoBrilho.gain.setValueAtTime(.0001,inicio);
    ganhoBrilho.gain.exponentialRampToValueAtTime(Math.max(.001,volume*.22),inicio+.025);
    ganhoBrilho.gain.setTargetAtTime(.0001,inicio+duracao-.08,.055);
    osc.connect(ganho);brilho.connect(ganhoBrilho);
    ganho.connect(ganhoMusicaAmbiente);ganhoBrilho.connect(ganhoMusicaAmbiente);
    osc.start(inicio);brilho.start(inicio);
    osc.stop(inicio+duracao);brilho.stop(inicio+duracao);
  }catch(e){}
}
function programarMusicaAmbiente(){
  if(!musicaAmbienteLiberada||estado.musicaAmbienteAtiva===false||document.hidden){pausarMusicaAmbiente();return}
  try{
    const ctx=obterAudioContext(),agora=ctx.currentTime;
    if(!ganhoMusicaAmbiente){ganhoMusicaAmbiente=ctx.createGain();ganhoMusicaAmbiente.gain.value=0;ganhoMusicaAmbiente.connect(ctx.destination)}
    const volume=Math.max(0,Math.min(.40,(Number(estado.volumeMusicaAmbiente)||0)*1.35));
    ganhoMusicaAmbiente.gain.setTargetAtTime(volume,agora,.25);
    if(!proximaNotaAmbiente)proximaNotaAmbiente=agora+.08;
    while(proximaNotaAmbiente<agora+1.1){
      const passo=indiceNotaAmbiente%MELODIA_CANTINHO_PET.length;
      const nota=MELODIA_CANTINHO_PET[passo];
      tocarNotaAmbiente(nota,proximaNotaAmbiente,.34,.13);
      if(passo%4===0)tocarNotaAmbiente(BAIXOS_CANTINHO_PET[Math.floor(passo/8)%BAIXOS_CANTINHO_PET.length],proximaNotaAmbiente,.72,.045);
      if(passo%4===2)tocarNotaAmbiente(MELODIA_CANTINHO_PET[(passo+2)%MELODIA_CANTINHO_PET.length]*.5,proximaNotaAmbiente+.17,.34,.032);
      const ritmoSaltitante=[.20,.20,.28,.20,.20,.38,.20,.24];
      proximaNotaAmbiente+=ritmoSaltitante[passo%ritmoSaltitante.length];indiceNotaAmbiente++;
    }
  }catch(e){console.warn('Música ambiente indisponível:',e)}
}
function iniciarMusicaAmbiente(){
  if(estado.musicaAmbienteAtiva===false||document.hidden||!musicaAmbienteLiberada)return false;
  try{
    const ctx=obterAudioContext();
    if(!ganhoMusicaAmbiente){ganhoMusicaAmbiente=ctx.createGain();ganhoMusicaAmbiente.gain.value=0;ganhoMusicaAmbiente.connect(ctx.destination)}
    if(!proximaNotaAmbiente)proximaNotaAmbiente=ctx.currentTime+.08;
    ganhoMusicaAmbiente.gain.setTargetAtTime(Math.max(0,Math.min(.40,(Number(estado.volumeMusicaAmbiente)||0)*1.35)),ctx.currentTime,.25);
    if(!musicaAmbienteTimer)musicaAmbienteTimer=setInterval(programarMusicaAmbiente,250);
    programarMusicaAmbiente();
    return true;
  }catch(e){return false}
}
function pausarMusicaAmbiente(){
  if(musicaAmbienteTimer){clearInterval(musicaAmbienteTimer);musicaAmbienteTimer=null}
  if(ganhoMusicaAmbiente&&audioCtx){
    const agora=audioCtx.currentTime;
    ganhoMusicaAmbiente.gain.cancelScheduledValues(agora);
    ganhoMusicaAmbiente.gain.setTargetAtTime(0,agora,.08);
  }
}
function sincronizarMusicaAmbienteComEstado(){
  if(estado.musicaAmbienteAtiva===false){pausarMusicaAmbiente();renderizarMusicaAmbientePainel();return}
  if(musicaAmbienteLiberada&&!document.hidden&&!musicaAmbienteTimer)iniciarMusicaAmbiente();
  if(ganhoMusicaAmbiente&&audioCtx&&estado.musicaAmbienteAtiva!==false){
    ganhoMusicaAmbiente.gain.setTargetAtTime(Math.max(0,Math.min(.40,(Number(estado.volumeMusicaAmbiente)||0)*1.35)),audioCtx.currentTime,.2);
  }
  renderizarMusicaAmbientePainel();
}
function atualizarMusicaAmbiente(ativa){
  estado.musicaAmbienteAtiva=!!ativa;
  musicaAmbienteLiberada=true;
  if(estado.musicaAmbienteAtiva)iniciarMusicaAmbiente();else pausarMusicaAmbiente();
  renderizarMusicaAmbientePainel();
  salvar();
}
function atualizarVolumeMusicaAmbiente(valor){
  const n=Math.max(0,Math.min(30,parseInt(valor,10)||0));
  estado.volumeMusicaAmbiente=n/100;
  if(ganhoMusicaAmbiente&&audioCtx)ganhoMusicaAmbiente.gain.setTargetAtTime(Math.max(0,Math.min(.40,estado.volumeMusicaAmbiente*1.35)),audioCtx.currentTime,.12);
  const texto=document.getElementById('txt-volume-musica');
  if(texto)texto.textContent=n+'%';
  salvar();
}
function renderizarMusicaAmbientePainel(){
  const input=document.getElementById('input-musica-ambiente');
  const texto=document.getElementById('txt-musica-ambiente');
  const volume=document.getElementById('input-volume-musica');
  const volumeTexto=document.getElementById('txt-volume-musica');
  const ativa=estado.musicaAmbienteAtiva!==false;
  const pct=Math.round(Math.max(0,Math.min(.40,(Number(estado.volumeMusicaAmbiente)||0)*1.35))*100);
  if(input)input.checked=ativa;
  if(texto)texto.textContent=ativa?'Ligada':'Desligada';
  if(volume)volume.value=pct;
  if(volumeTexto)volumeTexto.textContent=pct+'%';
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
 axolote:{id:'axolote',nome:'Axolote',emoji:'🦎',desbloqueioNivel:10,som:'',evolucoes:[{nivel:1,nome:'Axolote no Ovo',desc:'Fase 1 · dentro do ovo'},{nivel:21,nome:'Axolote Desabrochado',desc:'Saiu do ovo e começou uma nova aventura'},{nivel:41,nome:'Axolote Radiante',desc:'Fase 3 · uma nova forma cheia de energia'}]}
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
{id:'ceu',nome:'Céu de Verão',emoji:'☀️',preco:0,bg:'linear-gradient(180deg,#38bdf8,#e0f2fe,#fef9c3)'},{id:'chuva',nome:'Chuva Suave',emoji:'🌧️',preco:12,bg:'linear-gradient(180deg,#334155,#94a3b8)'},{id:'noite',nome:'Noite Estrelada',emoji:'🌙',preco:20,bg:'radial-gradient(ellipse at 70% 20%,#1e3a8a,#020617)'},{id:'arcoiris',nome:'Arco-Íris',emoji:'🌈',preco:30,bg:'linear-gradient(180deg,#f87171,#fbbf24,#4ade80,#38bdf8,#a78bfa)'},{id:'praia',nome:'Praia Tropical',emoji:'🏖️',preco:25,bg:'linear-gradient(180deg,#7dd3fc,#38bdf8,#fde68a,#fbbf24)'},{id:'floresta',nome:'Floresta Mágica',emoji:'🌲',preco:22,bg:'linear-gradient(180deg,#86efac,#166534)'},{id:'floresta_luminosa',nome:'Floresta Luminosa',emoji:'🍄',preco:0,bg:"url('assets/fundos/floresta_luminosa.webp') center / cover no-repeat"},{id:'reino_submarino',nome:'Reino Submarino',emoji:'🐠',preco:0,bg:"url('assets/fundos/reino_submarino.webp') center / cover no-repeat"},{id:'arena_galactica',nome:'Arena Galáctica',emoji:'🛸',preco:55,bg:"url('assets/fundos/arena_galactica.webp') center / cover no-repeat"},{id:'estadio_lunar',nome:'Estádio Lunar',emoji:'⚽',preco:45,bg:"url('assets/fundos/estadio_lunar.webp') center / cover no-repeat"},{id:'reino_dos_doces',nome:'Reino dos Doces',emoji:'🍭',preco:40,bg:"url('assets/fundos/reino_dos_doces.webp') center / cover no-repeat"},{id:'festa',nome:'Balada Neon',emoji:'🎉',preco:35,bg:'linear-gradient(160deg,#f472b6,#a78bfa,#22d3ee)'},{id:'halloween',nome:'Noite de Halloween',emoji:'🎃',preco:40,bg:'linear-gradient(180deg,#1a1033,#7c2d12)'},{id:'halloween_castelo',nome:'Castelo Assombrado',emoji:'🏰',preco:45,bg:"url('assets/fundos/castelo_halloween.webp?v=castelo-halloween-v1') center / cover no-repeat"},{id:'estadio',nome:'Campo de Futebol',emoji:'⚽',preco:45,bg:'linear-gradient(180deg,#0c4a6e,#16a34a,#14532d)'},{id:'quarto',nome:'Quarto Fofo',emoji:'🛏️',preco:35,bg:'linear-gradient(180deg,#faf5ff,#e9d5ff)'},{id:'mario',nome:'Mundo Aventura',emoji:'🍄',preco:50,bg:'linear-gradient(180deg,#67e8f9,#4ade80)'},{id:'dino',nome:'Era dos Dinos',emoji:'🦖',preco:45,bg:'linear-gradient(180deg,#fef3c7,#84cc16,#166534)'},{id:'princesa',nome:'Castelo Real',emoji:'👑',preco:40,bg:'linear-gradient(180deg,#fdf2f8,#f9a8d4)'},{id:'astronauta',nome:'Espaço Sideral',emoji:'🚀',preco:50,bg:'radial-gradient(ellipse at 50% 30%,#312e81,#020617)'},{id:'pirata',nome:'Mar dos Piratas',emoji:'🏴‍☠️',preco:45,bg:'linear-gradient(180deg,#0ea5e9,#78350f,#1c1917)'},{id:'fazenda',nome:'Fazenda Feliz',emoji:'🐄',preco:35,bg:'linear-gradient(180deg,#7dd3fc,#fde68a,#4ade80)'},{id:'neve',nome:'Natal Nevado',emoji:'🎄',preco:40,bg:'linear-gradient(180deg,#e0f2fe,#fff)'},{id:'aniversario',nome:'Festa de Aniversário',emoji:'🎂',preco:0,bg:'linear-gradient(180deg,#c4b5fd,#f9a8d4,#fde68a)'},{id:'castelo_noturno',nome:'Vila do Castelo',emoji:'🏰',preco:40,bg:"url('assets/fundos/castelo_noturno.webp') center / cover no-repeat"},{id:'deserto_cactos',nome:'Deserto dos Cactos',emoji:'🌵',preco:30,bg:"url('assets/fundos/deserto_cactos.webp') center / cover no-repeat"},{id:'quarto_gamer',nome:'Quarto Gamer',emoji:'🎮',preco:50,bg:"url('assets/fundos/quarto_gamer.webp') center / cover no-repeat"},{id:'floresta_blocos',nome:'Floresta de Blocos',emoji:'🧱',preco:45,bg:"url('assets/fundos/floresta_blocos.webp') center / cover no-repeat"},{id:'floresta_encantada',nome:'Floresta Encantada',emoji:'🌲',preco:40,bg:"url('assets/fundos/floresta_encantada.webp') center / cover no-repeat"},{id:'cachoeira_florida',nome:'Vale da Cachoeira',emoji:'🌼',preco:35,bg:"url('assets/fundos/cachoeira_florida.webp') center / cover no-repeat"}];
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
Object.assign(CURIOSIDADES_FUNDOS,{halloween_castelo:'A lua cheia ilumina o castelo e as abóboras nesta noite de Halloween.',castelo_noturno:'As lanternas ajudam a iluminar as ruas mesmo durante a noite.',deserto_cactos:'Os cactos guardam água para sobreviver ao clima seco.',quarto_gamer:'A luz colorida dos monitores cria um clima de aventura.',floresta_blocos:'Um mundo de blocos com cabana, rio e cachoeira para explorar.',floresta_encantada:'Árvores altas formam um refúgio cheio de vida.',cachoeira_florida:'A água da cachoeira mantém o vale verde e florido.'});

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
let ultimoPerfilCriancaSincronizado={};
let ultimoPerfilInfoSincronizado={};
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
let petAtualPendenteSync=null;
const CAMPOS_PRIVADOS_PAIS=['pinHash','pinBloqueadoAte','pinTentativasFalhas','pinPersonalizado','privacidadeAceita','onboardingVistoPais','emailsRecuperacao','emailRecuperacao','pinPais'];
function extrairCamposPrivadosPais(origem){const dados={};CAMPOS_PRIVADOS_PAIS.forEach(k=>{if(Object.prototype.hasOwnProperty.call(origem||{},k))dados[k]=origem[k]});return dados}
function removerCamposPrivadosPais(origem){const dados={...(origem||{})};CAMPOS_PRIVADOS_PAIS.forEach(k=>{delete dados[k]});return dados}
function estadoCompartilhadoParaSincronizar(origem=estado){
  const base=removerCamposPrivadosPais(origem);
  if(acessoFamiliar?.role!=='child')return base;
  const permitidos=new Set([...(typeof CAMPOS_CRIANCA!=='undefined'?CAMPOS_CRIANCA.filter(k=>k!=='tarefas'):[]),'pets','criancaAtivaId']);
  return Object.fromEntries(Object.entries(base).filter(([k])=>permitidos.has(k)));
}
function perfisCriancaParaSincronizar(origem=estado){
  const perfis=JSON.parse(JSON.stringify(origem?.criancasDados||{}));
  const ativa=String(origem?.criancaAtivaId||'');
  if(ativa&&origem?.criancas?.[ativa]){
    const dados={...(perfis[ativa]||{})};
    CAMPOS_CRIANCA.forEach(k=>{if(k!=='tarefas'&&origem[k]!==undefined)dados[k]=origem[k]});
    perfis[ativa]=dados;
  }
  return perfis;
}
function perfisInfoParaSincronizar(origem=estado){return JSON.parse(JSON.stringify(origem?.criancas||{}))}
function restaurarPetEscolhidoDuranteSync(){
  if(!petAtualPendenteSync)return;
  if(estado.petAtual===petAtualPendenteSync){petAtualPendenteSync=null;return}
  estado.petAtual=petAtualPendenteSync;
  salvarLocalmente();
}
function aplicarPrivadosPaisLocal(dados){CAMPOS_PRIVADOS_PAIS.forEach(k=>{if(Object.prototype.hasOwnProperty.call(dados||{},k))estado[k]=dados[k]})}
async function verificarMembroFamilia(user){
  const token=await user.getIdTokenResult(true);
  const claims=token?.claims||{};
  if(claims.familyId===codigoFamilia&&['parent','child'].includes(claims.familyRole)){
    acessoFamiliar={familyId:claims.familyId,role:claims.familyRole,childScope:claims.familyRole==='child'&&claims.childScope&&typeof claims.childScope==='object'?claims.childScope:{}};
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
const CAMPOS_CRIANCA=['tarefasExcluidas','personalizacao','gestosDesbloqueados','palcoAtual','palcosComprados','decoracaoItens','extraDiaRemovida','avisosMissao','miniPetsComprados','miniPetAtivo','bauDatasResgatadas','historicoRecompensas','avisosRecompensas','acessorios','conquistas','habilidades','desafiosMathAcertos','dinheiroAcumulado','mesadaAtiva','fundoAtual','fundosComprados','temaInterfaceAtual','historicoConclusoes','idadeCrianca','dificuldadeJogos','nomePet','lembreteEnviadoData','metaMoedas','moedas','onboardingVistoCrianca','pausaAte','petAtual','pets','recompensas','sonhos','registroDiario','solicitacoesPremios','streak','surpresaResgatadaData','tarefas','tarefasHojeCount','timerFim','totalSacado','ultimoDiaAcesso','ultimoDiaConcluido','ultimoStreakPremiado','vozSalva','ultimoAcaoPet','ultimoDecay','desafioDiarioData','desafioDiarioFeitoData','bauDiarioAbertoData','escudosOfensiva','eventoSemanalData','missaoFamilia','mensagensPais','historicoEngajamento'];
function valoresPadraoCrianca(){
  return {
    tarefasExcluidas:[],gestosDesbloqueados:[],decoracaoItens:[],extraDiaRemovida:null,miniPetsComprados:['passarinho'],miniPetAtivo:'passarinho',petAtual:'gato',moedas:15,dinheiroAcumulado:0,mesadaAtiva:true,idadeCrianca:7,dificuldadeJogos:'auto',nomePet:'Pipoca',
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
function garantirPerfilPermitidoNoAparelho(){
  if(acessoFamiliar?.role!=='child')return true;
  const permitidos=Object.keys(acessoFamiliar.childScope||{}).filter(id=>acessoFamiliar.childScope[id]===true&&estado.criancas?.[id]);
  if(!permitidos.length)return false;
  if(!permitidos.includes(String(estado.criancaAtivaId))){
    const id=permitidos[0];
    estado.criancaAtivaId=id;
    aplicarDadosCrianca(estado.criancasDados?.[id]);
  }
  return true;
}
function trocarCriancaAtiva(novoId){
  if(!estado.criancas[novoId]||novoId===estado.criancaAtivaId)return;
  if(acessoFamiliar?.role==='child'&&acessoFamiliar.childScope?.[novoId]!==true){mostrarToast('🔒 Este aparelho não tem acesso a esse perfil.');return}
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
  if(document.getElementById('modal-pais')?.classList.contains('mostrar')){
    renderizarPainelPais();
    atualizarTarefasAprovacaoDaNuvem();
  }
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
…49883 tokens truncated…ked')+(ativo?' ativo-agora':'');
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
      nova=true;
      const c=CONQUISTAS.find(x=>x[0]===id);
      window.operacaoCarteiraSegura('claim-reward',{rewardId:'achievement',reference:id}).then(pagamento=>{
        estado.conquistas[id]=true;
        if(pagamento.alreadyClaimed){salvar();renderizarConquistas();return;}
        const premio=Number(pagamento.reward)||0,xp=Number(pagamento.xp)||0;
        ganharXP(xp);salvar();atualizarTela();
        mostrarAviso(c[1],'🏆 Nova Conquista!',`${c[2]} +${premio} moedas`);
      }).catch(error=>{
        console.warn('Prêmio de conquista não confirmado:',error);
        mostrarToast('📡 Conecte e sincronize para receber o prêmio da conquista.');
      });
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
async function recompensarMiniJogo(gameId,xp,msg){
  try{
    const pagamento=await window.operacaoCarteiraSegura('game-reward',{gameId});
    const moedas=Math.max(0,Number(pagamento.reward)||0);
    if(pagamento.alreadyClaimed){mostrarToast('🎮 A recompensa deste minijogo já foi recebida hoje.');return;}
    ganharXP(Math.max(0,Number(xp)||0));
    dispararConfetes();
    mostrarToast(`🎉 ${msg} +${moedas} 🪙 +${xp} XP`);
    marcarConquistas();
  }catch(error){
    console.warn('Recompensa de minijogo não confirmada:',error);
    mostrarToast(error?.code==='functions/failed-precondition'?'🪙 Saldo indisponível. Tente novamente.':'📡 Conecte e sincronize para receber a recompensa.');
  }
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
    recompensarMiniJogo('matematica',1,'Acertou!');
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
      recompensarMiniJogo('memoria',2,'Memória incrível!');
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
  if(acertou)recompensarMiniJogo('reacao',1,'Reflexo rápido!');
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
        recompensarMiniJogo('estrelas',3,'Caça às estrelas!');
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
async function selecionarOuComprarPalco(p){
  const comprados=Array.isArray(estado.palcosComprados)?estado.palcosComprados:['cristal'];
  if(p.preco===0||comprados.includes(p.id)){
    estado.palcoAtual=p.id;
    salvar();aplicarPalcoPet();renderizarPalcosPet();
    return mostrarToast(`✨ Palco ${p.nome} aplicado!`);
  }
  if(estado.moedas<p.preco)return mostrarToast(`🪙 Faltam ${p.preco-estado.moedas} moedas.`);
  mostrarConfirmacao(`Comprar o palco ${p.nome} por ${p.preco} moedas?`,async()=>{
    if((estado.palcosComprados||[]).includes(p.id)||estado.moedas<p.preco)return;
    try{await window.operacaoCarteiraSegura('purchase',{category:'palco',itemId:p.id});}
    catch(error){return mostrarToast(error?.code==='functions/failed-precondition'?'🪙 Saldo insuficiente.':'📡 Conecte e sincronize para concluir a compra.');}
    estado.palcosComprados=[...new Set([...comprados,p.id])];
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
async function selecionarOuComprarFundo(f){
  if(f.preco===0 && !estado.fundosComprados.includes(f.id))estado.fundosComprados.push(f.id);
  if(estado.fundosComprados.includes(f.id)){
    estado.fundoAtual=f.id;
    salvar();
    aplicarFundoTela(f.id);
    renderizarGridFundos();
    return mostrarToast(`🎨 ${f.nome} aplicado!`);
  }
  if(estado.moedas<f.preco)return mostrarToast(`🪙 Faltam ${f.preco-estado.moedas} moedas.`);
  mostrarConfirmacao(`Comprar "${f.nome}" por ${f.preco} moedas?`,async()=>{
    try{await window.operacaoCarteiraSegura('purchase',{category:'fundo',itemId:f.id});}
    catch(error){return mostrarToast(error?.code==='functions/failed-precondition'?'🪙 Saldo insuficiente.':'📡 Conecte e sincronize para concluir a compra.');}
    if(!estado.fundosComprados.includes(f.id))estado.fundosComprados.push(f.id);
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
async function aprovarSolicitacaoPremio(id){
  if(perfilAtivo!=='pais')return;
  const s=(estado.solicitacoesPremios||[]).find(x=>String(x.id)===String(id));
  if(!s||s.status!=='pendente')return;
  const sonho=s.sonhoId?(estado.sonhos||[]).find(x=>String(x.id)===String(s.sonhoId)):null;
  if(s.sonhoId&&(!sonho||sonho.status!=='precificado'))return mostrarToast('⚠️ Este sonho não está mais disponível.');
  let pagamento;
  try{pagamento=await window.operacaoCarteiraSegura('approve-redemption',{requestId:String(id)});}
  catch(error){console.warn('Aprovação de resgate não confirmada:',error);return mostrarToast(error?.code==='functions/failed-precondition'?'⚠️ Pedido inválido ou saldo insuficiente.':'📡 Conecte e sincronize para aprovar o resgate.');}
  const jaProcessado=!!pagamento.alreadyRedeemed;
  s.status='aprovado';s.aprovadoEm=s.aprovadoEm||Date.now();s.mensagem='Pedido aprovado pelos pais.';
  if(sonho){sonho.status='realizado';sonho.realizadoEm=Date.now();}
  const custo=Number(pagamento.cost)||0;
  registrarLogAtividade(`Pedido aprovado: ${s.texto} (−${custo}🪙)`);
  salvar();atualizarTela();renderizarPainelPais();renderizarLojaRecompensas();
  if(jaProcessado)return mostrarToast('ℹ️ Este pedido já foi processado.');
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
    {texto:'1/4 · Toque no pet para dar carinho ❤️',alvo:'#pet-principal'},
    {texto:'2/4 · Envie uma missão para os pais conferirem ✅',alvo:'.tasks-section'},
    {texto:'3/4 · Encontre jogos e outras aventuras aqui ⚡',alvo:'.bottom-buttons'},
    {texto:'4/4 · Acompanhe suas moedas e sua sequência ✨',alvo:'.top-row'}
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
  document.addEventListener('pointerdown',()=>{musicaAmbienteLiberada=true;iniciarMusicaAmbiente()},{once:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pausarMusicaAmbiente();else if(estado.musicaAmbienteAtiva!==false&&musicaAmbienteLiberada)iniciarMusicaAmbiente()});
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
