
(()=>{
const P=[
{id:'p1',n:'Primeiros Passos',i:'🌱',s:['missao_cuidado','missao_energia','missao_estudo'],r:'🌟 Moldura do Aventureiro'},
{id:'p2',n:'Pequeno Ajudante',i:'🤝',s:['missao_ajuda','missao_criativa','missao_saude'],r:'🏅 Medalha do Ajudante'},
{id:'p3',n:'Dia Brilhante',i:'✨',s:['missao_ordem','missao_foco','missao_alegria'],r:'🎨 Tema Dia Brilhante'},
{id:'p4',n:'Grande Aventura',i:'🗺️',s:['missao_coragem','missao_paz','missao_familia'],r:'👑 Mestre da Aventura'}
];
let pg='p1';
window.definirPaginaAlbum=id=>{pg=id;window.renderizarAlbumFigurinhas()};
const old=window.renderizarAlbumFigurinhas;
window.renderizarAlbumFigurinhas=()=>{
 const c=document.getElementById('album-figurinhas-conteudo');
 if(!c){if(old)old();return;}
 const a=Array.isArray(estado.adesivos)?estado.adesivos:[];
 const cat=window.ALBUM_FIGURINHAS||[];
 const own=id=>a.includes(id);
 const p=P.find(x=>x.id===pg)||P[0];
 const total=cat.length||12;
 const n=a.filter(x=>cat.some(z=>z.id===x)).length;
 const tabs=P.map(x=>`<button class="album-page-tab ${x.id===p.id?'active ':''}${x.s.every(own)?'complete':''}" onclick="definirPaginaAlbum('${x.id}')">${x.i} ${x.n}${x.s.every(own)?' ✓':''}</button>`).join('');
 const cards=p.s.map(id=>{
  const f=cat.find(x=>x.id===id); if(!f)return '';
  const ok=own(id);
  return `<button class="sticker-card ${ok?'unlocked':'locked'}" onclick="mostrarDetalheFigurinha('${id}')"><span class="sticker-art">${ok?f.emoji:'❔'}</span><strong>${ok?(f.nome||'Figurinha'):'Figurinha secreta'}</strong><small>${ok?(f.raridade||'Comum'):'Complete missões'}</small></button>`;
 }).join('');
 c.innerHTML=`<div class="album-pages-wrap"><div class="album-page-tabs">${tabs}</div><div class="album-page"><div class="album-page-head"><div><div class="album-page-title">${p.i} ${p.n}</div><small>${p.s.filter(own).length}/${p.s.length} figurinhas</small></div><div class="album-page-reward">Recompensa<br><b>${p.r}</b></div></div><div class="adesivos-grade">${cards}</div>${p.s.every(own)?`<div class="album-page-complete">🎉 Página completa!<br><small>${p.r}</small></div>`:''}</div><div style="margin-top:12px;font-size:.82rem;opacity:.8">Álbum: <b>${n}/${total}</b> • ${Math.round(n/total*100)}%</div></div>`;
};
window.mostrarDetalheFigurinha=id=>{const f=(window.ALBUM_FIGURINHAS||[]).find(x=>x.id===id);if(!f)return;if(!(estado.adesivos||[]).includes(id)){mostrarToast('🔒 Complete mais missões para revelar.');return;}if(typeof mostrarAviso==='function')mostrarAviso(f.emoji,f.nome,f.raridade||'Comum');};
/* Fonte única das áreas do Mapa Aventura — antes esses dados viviam duplicados
   (um array simples aqui + um array "areas" mais completo em mapa-vivo-v2-script,
   que reprocessava e re-renderizava tudo de novo por cima). Consolidado num só lugar. */
const MAPA_AREAS=[
 {id:'n1',name:'Começo',emoji:'🏡',need:0,x:12,y:67,desc:'A casinha do pet. Aqui começa a sua aventura!',reward:'✨ Primeiro passo'},
 {id:'n2',name:'Bosque',emoji:'🌳',need:3,x:32,y:54,desc:'Um bosque tranquilo cheio de pequenas descobertas.',reward:'🌿 Medalha do Explorador'},
 {id:'n3',name:'Vale',emoji:'🏞️',need:7,x:52,y:43,desc:'Um vale aberto onde os desafios ficam maiores.',reward:'⚡ Energia Extra'},
 {id:'n4',name:'Castelo',emoji:'🏰',need:12,x:72,y:31,desc:'O grande castelo das conquistas da família.',reward:'🏅 Brasão do Castelo'},
 {id:'n5',name:'Grande Meta',emoji:'⭐',need:18,x:89,y:18,desc:'O ponto mais alto da jornada. Uma conquista especial!',reward:'👑 Mestre da Aventura'}
];
window.abrirMapaAventura=()=>{
 const menu=document.getElementById('modal-menu-mais');
 if(menu)menu.classList.remove('mostrar','modal-top');
 let m=document.getElementById('modal-mapa-aventura');
 if(!m){
  m=document.createElement('div');m.id='modal-mapa-aventura';m.className='modal-overlay';
  m.innerHTML=`<div class="modal" style="max-width:620px;padding:10px;background:transparent;box-shadow:none"><div class="mapa-aventura"><div class="mapa-topo"><div><div class="mapa-titulo">🗺️ Jornada do Pet</div><div class="mapa-subtitulo">Cada missão leva vocês mais longe.</div></div><button class="close-btn" onclick="fecharModal('modal-mapa-aventura')">×</button></div><div class="mapa-trilha" id="mapa-trilha"><div class="mapa-caminho"><i id="mapa-caminho-progresso"></i></div><div class="mapa-pet" id="mapa-pet">🐾</div>${MAPA_AREAS.map(a=>`<button class="mapa-node locked" data-node="${a.id}" style="left:${a.x}%;top:${a.y}%"><span class="emoji">${a.emoji}</span><small>${a.name}</small></button>`).join('')}</div><div class="mapa-progresso">Progresso: <span id="mapa-pct">0%</span><div class="mapa-barra"><i id="mapa-barra-fill"></i></div></div><div class="mapa-dica" id="mapa-dica">Complete 3 missões para chegar ao Bosque. ✨</div></div></div>`;
  document.body.appendChild(m);
 }
 abrirModal('modal-mapa-aventura');
 document.querySelectorAll('#mapa-trilha .mapa-node').forEach((el,i)=>{el.onclick=()=>window.abrirAreaMapa(MAPA_AREAS[i].id)});
 window.renderizarMapaAventura();
};
window.renderizarMapaAventura=()=>{
 const n=(estado.tarefas||[]).filter(t=>t.status==='aprovada').length,pct=Math.min(100,Math.round(n/18*100));
 document.querySelectorAll('#mapa-trilha .mapa-node').forEach((e,i)=>{const a=MAPA_AREAS[i],u=n>=a.need,d=i<4&&n>=MAPA_AREAS[i+1].need;e.classList.toggle('locked',!u);e.classList.toggle('current',u&&!d);e.classList.toggle('done',d)});
 let i=0;for(let j=0;j<MAPA_AREAS.length;j++)if(n>=MAPA_AREAS[j].need)i=j;
 const pet=document.getElementById('mapa-pet');if(pet){pet.style.left=MAPA_AREAS[i].x+'%';pet.style.top=MAPA_AREAS[i].y+'%'}
 const b=document.getElementById('mapa-caminho-progresso'),f=document.getElementById('mapa-barra-fill'),q=document.getElementById('mapa-pct');if(b)b.style.width=pct+'%';if(f)f.style.width=pct+'%';if(q)q.textContent=pct+'%';
 const d=document.getElementById('mapa-dica');
 if(d)d.textContent=n>=18?'👑 Grande meta alcançada! Explore novamente e complete novas missões.':`📍 ${MAPA_AREAS[i].name}: ${MAPA_AREAS[i].desc} ${i<4?'Próxima área em '+(MAPA_AREAS[i+1].need-n)+' missões.':''}`;
 const tr=document.getElementById('mapa-trilha');
 if(tr){let c=tr.querySelector('.mapa-area-card');if(!c){c=document.createElement('div');c.className='mapa-area-card';tr.appendChild(c)}c.innerHTML='<b>'+MAPA_AREAS[i].emoji+' '+MAPA_AREAS[i].name+'</b> · '+MAPA_AREAS[i].reward}
};
window.abrirAreaMapa=id=>{
 const a=MAPA_AREAS.find(x=>x.id===id),n=(estado.tarefas||[]).filter(t=>t.status==='aprovada').length;
 if(!a)return;
 if(n<a.need){mostrarAviso&&mostrarAviso('🔒','Área bloqueada',`Complete ${a.need-n} missão(ões) para desbloquear ${a.name}.`);return}
 mostrarAviso&&mostrarAviso(a.emoji,a.name,a.desc+' '+a.reward)
};
const au=window.atualizarTela;if(typeof au==='function'&&!au.__map){const w=function(){const r=au.apply(this,arguments);try{window.renderizarMapaAventura()}catch(e){}return r};w.__map=true;window.atualizarTela=w;}
})();
