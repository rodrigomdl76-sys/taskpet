
(()=>{
const P=[
{id:'p1',n:'Primeiros Passos',i:'🌱',s:['missao_cuidado','missao_energia','missao_estudo'],r:'🌟 Moldura do Aventureiro'},
{id:'p2',n:'Pequeno Ajudante',i:'🤝',s:['missao_ajuda','missao_criativa','missao_saude'],r:'🏅 Medalha do Ajudante'},
{id:'p3',n:'Dia Brilhante',i:'✨',s:['missao_ordem','missao_foco','missao_alegria'],r:'🎨 Tema Dia Brilhante'},
{id:'p4',n:'Grande Aventura',i:'🗺️',s:['missao_coragem','missao_paz','missao_familia'],r:'👑 Mestre da Aventura'},
{id:'p5',n:'Gato-ovo 1',i:'🐱',s:["arte_ovo_01","arte_ovo_02","arte_ovo_03","arte_ovo_04","arte_ovo_05","arte_ovo_06"],r:'🎨 Página completa'},
{id:'p6',n:'Gato-ovo 2',i:'🐱',s:["arte_ovo_07","arte_ovo_08","arte_ovo_09","arte_ovo_10","arte_ovo_11","arte_ovo_12"],r:'🎨 Página completa'},
{id:'p7',n:'Gato-ovo 3',i:'🐱',s:["arte_ovo_13","arte_ovo_14","arte_ovo_15","arte_ovo_16","arte_ovo_17","arte_ovo_18"],r:'🎨 Página completa'},
{id:'p8',n:'Gatos cinza 1',i:'👑',s:["arte_cinza_01","arte_cinza_02","arte_cinza_03","arte_cinza_04","arte_cinza_05","arte_cinza_06"],r:'🎨 Página completa'},
{id:'p9',n:'Gatos cinza 2',i:'👑',s:["arte_cinza_07","arte_cinza_08","arte_cinza_09"],r:'⭐ Colecionador de Figurinhas'}
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
  return `<button class="sticker-card ${ok?'unlocked':'locked'}" onclick="mostrarDetalheFigurinha('${id}')"><span class="sticker-art">${ok?(f.imagem?`<img src="${f.imagem}" alt="${f.nome}" loading="lazy">`:f.emoji):'❔'}</span><strong>${ok?(f.nome||'Figurinha'):'Figurinha secreta'}</strong><small>${ok?(f.raridade||'Comum'):'Complete missões'}</small></button>`;
 }).join('');
 c.innerHTML=`<div class="album-pages-wrap"><div class="album-page-tabs">${tabs}</div><div class="album-page"><div class="album-page-head"><div><div class="album-page-title">${p.i} ${p.n}</div><small>${p.s.filter(own).length}/${p.s.length} figurinhas</small></div><div class="album-page-reward">Recompensa<br><b>${p.r}</b></div></div><div class="adesivos-grade">${cards}</div>${p.s.every(own)?`<div class="album-page-complete">🎉 Página completa!<br><small>${p.r}</small></div>`:''}</div><div style="margin-top:12px;font-size:.82rem;opacity:.8">Álbum: <b>${n}/${total}</b> • ${Math.round(n/total*100)}%</div></div>`;
};
window.mostrarDetalheFigurinha=id=>{const f=(window.ALBUM_FIGURINHAS||[]).find(x=>x.id===id);if(!f)return;if(!(estado.adesivos||[]).includes(id)){mostrarToast('🔒 Complete mais missões para revelar.');return;}if(typeof mostrarAviso==='function')mostrarAviso(f.emoji,f.nome,f.raridade||'Comum');};
})();
