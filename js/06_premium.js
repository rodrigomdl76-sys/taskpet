
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

const ALBUM_FIGURINHAS=[
{id:'missao_cuidado',emoji:'💚',nome:'Coração do Cuidado',raridade:'Comum',grupo:'Cuidado'},
{id:'missao_energia',emoji:'⚡',nome:'Raio de Energia',raridade:'Comum',grupo:'Rotina'},
{id:'missao_estudo',emoji:'📚',nome:'Mestre da Rotina',raridade:'Rara',grupo:'Aprendizado'},
{id:'missao_ajuda',emoji:'🤝',nome:'Mão Amiga',raridade:'Rara',grupo:'Gentileza'},
{id:'missao_criativa',emoji:'🎨',nome:'Artista Pet',raridade:'Rara',grupo:'Criatividade'},
{id:'missao_saude',emoji:'🥕',nome:'Pet Saudável',raridade:'Épica',grupo:'Cuidado'},
{id:'missao_ordem',emoji:'✨',nome:'Tudo no Lugar',raridade:'Comum',grupo:'Rotina'},
{id:'missao_foco',emoji:'🎯',nome:'Foco Total',raridade:'Épica',grupo:'Concentração'},
{id:'missao_alegria',emoji:'🌈',nome:'Arco-íris da Alegria',raridade:'Épica',grupo:'Alegria'},
{id:'missao_coragem',emoji:'🦁',nome:'Coragem',raridade:'Lendária',grupo:'Conquistas'},
{id:'missao_paz',emoji:'🌿',nome:'Momento Zen',raridade:'Rara',grupo:'Bem-estar'},
{id:'missao_familia',emoji:'🏠',nome:'Time Família',raridade:'Lendária',grupo:'Família'}
];

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
  if(botao)botao.style.display=perfilAtivo==='crianca'&&n?'flex':'none';
  const contador=document.getElementById('contador-caixa-conquistas');if(contador)contador.textContent=n;
  const txt=document.getElementById('texto-caixa-conquistas');if(txt)txt.textContent=n===1?'Você tem 1 conquista para descobrir':`Você tem ${n} conquistas para descobrir`;
  const menu=document.getElementById('menu-caixa-contagem');if(menu)menu.textContent=n?`${n} para descobrir`:'Ver histórico';
}
function descricaoConquista(a){
  if(a.tipo==='figurinha'){const f=ALBUM_FIGURINHAS.find(x=>x.id===a.idFigurinha);return {emoji:f?.emoji||'📒',titulo:f?.nome||'Nova figurinha',texto:f?`${f.raridade} · ${f.grupo}`:'Confira seu álbum'};}
  if(aviso.tipo==='bau')return {emoji:'🎁',titulo:'Baú do dia',texto:a.premio||'Uma surpresa pela missão concluída'};
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
  if(aviso.tipo==='figurinha'){fecharModal('modal-caixa-conquistas');abrirAlbumFigurinhas(true)}
  else {fecharModal('modal-caixa-conquistas');somBauLendario();mostrarAviso(d.emoji,d.titulo,d.texto)}
  dispararConfetes();
}
function mostrarRecompensasCrianca(){atualizarCaixaConquistas()}
let albumFiltroAtual='Todos';
function ganharFigurinhaPorMissao(){
 if(!Array.isArray(estado.adesivos))estado.adesivos=[];
 const f=ALBUM_FIGURINHAS.find(x=>!estado.adesivos.includes(x.id));
 if(!f)return null;
 estado.adesivos.push(f.id);
 enfileirarRecompensaCrianca({tipo:'figurinha',idFigurinha:f.id});
 return f;
}
/* Versão base do álbum (grade simples por raridade). Fica inativa na prática: logo
   abaixo, rotinapet-map-v1-script substitui window.renderizarAlbumFigurinhas por uma
   versão paginada por região ("P"). Mantida só como fallback de segurança —
   se for mexer no álbum, edite a versão de baixo, que é a que realmente roda. */
function renderizarAlbumFigurinhas(novo){
 const c=document.getElementById('album-figurinhas-conteudo');if(!c)return;
 const found=new Set(estado.adesivos||[]),n=ALBUM_FIGURINHAS.filter(f=>found.has(f.id)).length,p=Math.round(n/ALBUM_FIGURINHAS.length*100);
 const grupos=['Todos','Comum','Rara','Épica','Lendária'];
 const lista=albumFiltroAtual==='Todos'?ALBUM_FIGURINHAS:ALBUM_FIGURINHAS.filter(f=>f.raridade===albumFiltroAtual);
 const ultima=ALBUM_FIGURINHAS.findIndex(f=>found.has(f.id)&&f.id===((ALBUM_FIGURINHAS.filter(f=>found.has(f.id)).at(-1)||{}).id));
 c.innerHTML=`<div class="album-hero premium">
   <div class="album-topline"><div><small>MINHA COLEÇÃO</small><b>${n}/${ALBUM_FIGURINHAS.length}</b><span>figurinhas</span></div><div class="album-badge">${n===ALBUM_FIGURINHAS.length?'🏆 COMPLETO':'📒 EM PROGRESSO'}</div></div>
   <div class="album-progress"><i style="width:${p}%"></i></div><div class="album-progress-meta"><span>${p}% completo</span><span>${ALBUM_FIGURINHAS.length-n} restantes</span></div>
   <p>Complete missões, descubra novas raridades e monte sua coleção. Cada figurinha registra uma conquista. ✨</p>
 </div>
 <div class="album-filters">${grupos.map(g=>`<button class="album-filter ${albumFiltroAtual===g?'ativo':''}" onclick="albumFiltroAtual='${g}';renderizarAlbumFigurinhas()">${g}</button>`).join('')}</div>
 <div class="album-grid premium-grid">${lista.map((f)=>{const ok=found.has(f.id),fresh=novo&&ok&&f.id===ALBUM_FIGURINHAS[ultima]?.id;return `<button class="sticker-card ${ok?'unlocked':'locked'} rar-${f.raridade.toLowerCase()} ${fresh?'new':''}" onclick="mostrarDetalheFigurinha('${f.id}')" title="${ok?f.nome:'Figurinha secreta'}"><span class="sticker-emoji">${ok?f.emoji:'?'}</span><span class="sticker-name">${ok?esc(f.nome):'Figurinha secreta'}</span><span class="sticker-rarity">${ok?f.raridade:'???'}</span></button>`}).join('')}</div>
 <div class="album-footer">${n===ALBUM_FIGURINHAS.length?'🌟 Você completou o álbum!':'💡 Dica: missões concluídas desbloqueiam novas figurinhas.'}</div>`;
}
function mostrarDetalheFigurinha(id){const f=ALBUM_FIGURINHAS.find(x=>x.id===id),ok=(estado.adesivos||[]).includes(id);if(!f)return;mostrarAviso(ok?f.emoji:'🔒',ok?f.nome:'Figurinha secreta',ok?`${f.raridade} · ${f.grupo}`:'Continue completando missões para descobrir esta figurinha.');}
function abrirAlbumFigurinhas(novo){let m=document.getElementById('modal-album-figurinhas');if(!m){m=document.createElement('div');m.id='modal-album-figurinhas';m.className='modal-overlay';m.innerHTML=`<div class="modal album-modal"><div class="modal-title"><h3>📒 Álbum de figurinhas</h3><button class="close-btn" onclick="fecharModal('modal-album-figurinhas')">×</button></div><div id="album-figurinhas-conteudo"></div><button class="primary-btn album-close-btn" onclick="fecharModal('modal-album-figurinhas')">Continuar missão 🚀</button></div>`;document.body.appendChild(m)}renderizarAlbumFigurinhas(!!novo);abrirModal('modal-album-figurinhas')}
