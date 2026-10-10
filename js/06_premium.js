
(function(){
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;let raf=0;
 function move(x,y){if(reduced())return;const dx=(x/innerWidth-.5)*2,dy=(y/innerHeight-.5)*2;document.documentElement.style.setProperty('--bgx',Math.max(-12,Math.min(12,dx*9))+'px');document.documentElement.style.setProperty('--bgy',Math.max(-9,Math.min(9,dy*7))+'px');document.documentElement.style.setProperty('--glowx',(50+dx*20)+'%');document.documentElement.style.setProperty('--glowy',(40+dy*20)+'%')}
 addEventListener('pointermove',e=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>move(e.clientX,e.clientY))},{passive:true});
 addEventListener('touchmove',e=>{const t=e.touches[0];if(t)move(t.clientX,t.clientY)},{passive:true});
 addEventListener('deviceorientation',e=>{if(!reduced())move(innerWidth*(.5+(e.gamma||0)/90),innerHeight*(.5+(e.beta||0)/180))},{passive:true});
 document.addEventListener('click',e=>{const pet=e.target.closest?.('#pet-principal');if(!pet||reduced())return;const s=document.querySelector('.pet-stage');if(s){s.classList.remove('stage-react');void s.offsetWidth;s.classList.add('stage-react');setTimeout(()=>s.classList.remove('stage-react'),750)}});
 // Ritmo visual do cenário ao longo do dia, sem alterar a lógica do app.
 function cicloDia(){const h=new Date().getHours();document.body.classList.toggle('rp-manha',h>=6&&h<12);document.body.classList.toggle('rp-tarde',h>=12&&h<18);document.body.classList.toggle('rp-noite',h>=18||h<6)}
 cicloDia();setInterval(cicloDia,60000);
})();

function enfileirarRecompensaCrianca(aviso){
  estado.avisosRecompensas=Array.isArray(estado.avisosRecompensas)?estado.avisosRecompensas:[];
  aviso.id=aviso.idAviso||('r_'+Date.now()+'_'+Math.random().toString(36).slice(2));
  aviso.criadaEm=Date.now();
  estado.avisosRecompensas.push(aviso);
  salvar();atualizarCaixaConquistas();
}
function atualizarCaixaConquistas(){
  const n=Array.isArray(estado.avisosRecompensas)?estado.avisosRecompensas.length:0;
  const botao=document.getElementById('atalho-caixa-conquistas');
  if(botao){botao.style.display=perfilAtivo==='crianca'&&n?'grid':'none';botao.setAttribute('aria-label',n===1?'1 conquista para descobrir':'Caixa de Conquistas');}
  const contador=document.getElementById('contador-caixa-conquistas');if(contador)contador.textContent=n;
  const txt=document.getElementById('texto-caixa-conquistas');if(txt){txt.textContent=n===1?'1 conquista para descobrir':`${n} conquistas para descobrir`;txt.hidden=true;}
  const menu=document.getElementById('menu-caixa-contagem');if(menu)menu.textContent=n?`${n} para descobrir`:'Ver histórico';
}
function descricaoConquista(a){
  if(a.tipo==='bau')return {emoji:'🎁',titulo:'Baú do dia',texto:a.premio||'Uma surpresa pela missão concluída'};
  if(a.tipo==='semanal')return {emoji:'🏆',titulo:`Baú dos ${Number(a.streak)||7} dias`,texto:`+${Number(a.moedas)||0} moedas e +${Number(a.xp)||0} XP`};
  return {emoji:'⭐',titulo:'Conquista',texto:'Missão concluída'};
}
function renderizarCaixaConquistas(){
  const c=document.getElementById('conteudo-caixa-conquistas');if(!c)return;
  const fila=Array.isArray(estado.avisosRecompensas)?estado.avisosRecompensas:[];
  const historico=Array.isArray(estado.historicoRecompensas)?estado.historicoRecompensas:[];
  c.innerHTML=`<p style="font-size:10px;color:#64748b;margin:0 0 10px">${fila.length?`Você tem ${fila.length} surpresa(s) para descobrir!`:'Todas as surpresas foram descobertas.'}</p>`+
    fila.map((a,i)=>{const d=descricaoConquista(a);return `<button class="caixa-conquistas-linha" onclick="abrirConquistaDaCaixa(${i})"><span>${d.emoji}</span><span><b>${esc(d.titulo)}</b><small>${esc(d.texto)}</small></span><strong>Descobrir ✨</strong></button>`}).join('')+
    (historico.length?'<h4 style="margin:13px 0 6px;font-size:11px">Já descobertas</h4>'+historico.slice().reverse().slice(0,25).map(a=>{const d=descricaoConquista(a);return `<div class="caixa-conquistas-linha descoberta"><span>${d.emoji}</span><span><b>${esc(d.titulo)}</b><small>${esc(d.texto)} · ${new Date(a.abertaEm).toLocaleDateString('pt-BR')}</small></span></div>`}).join(''):'');
}
function abrirCaixaConquistas(){if(perfilAtivo!=='crianca')return;renderizarCaixaConquistas();abrirModal('modal-caixa-conquistas')}
function abrirConquistaDaCaixa(indice){
  if(perfilAtivo!=='crianca')return;
  const fila=estado.avisosRecompensas;if(!Array.isArray(fila)||!fila[indice])return;
  const aviso=fila[indice];
  if(aviso.tipo==='bau'){
    if(bauJaResgatado(aviso.data)){
      fila.splice(indice,1);salvar();atualizarCaixaConquistas();renderizarCaixaConquistas();return;
    }
    fecharModal('modal-caixa-conquistas');abrirBauDiario(aviso.data);return;
  }
  fila.splice(indice,1);
  estado.historicoRecompensas=Array.isArray(estado.historicoRecompensas)?estado.historicoRecompensas:[];
  estado.historicoRecompensas.push({...aviso,abertaEm:Date.now()});
  estado.historicoRecompensas=estado.historicoRecompensas.slice(-40);
  salvar();atualizarCaixaConquistas();renderizarCaixaConquistas();
  const d=descricaoConquista(aviso);
  fecharModal('modal-caixa-conquistas');somBauLendario();mostrarAviso(d.emoji,d.titulo,d.texto)
  dispararConfetes();
}
function mostrarRecompensasCrianca(){atualizarCaixaConquistas()}
