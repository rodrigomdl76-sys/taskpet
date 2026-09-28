(() => {
  const catalogo = [
    { id:'planta', nome:'Planta', emoji:'🪴' },
    { id:'tv', nome:'TV', emoji:'📺' },
    { id:'sofa', nome:'Sofá', emoji:'🛋️' },
    { id:'mesa', nome:'Mesa', emoji:'🪑' },
    { id:'luminaria', nome:'Luminária', emoji:'💡' },
    { id:'tapete', nome:'Tapete', emoji:'🧶' }
  ];
  const maximoItens = 12;
  let editando = false;
  let arraste = null;

  function itens() {
    if (!Array.isArray(estado.decoracaoItens)) estado.decoracaoItens = [];
    return estado.decoracaoItens;
  }
  function disponiveis() {
    const comprados = Array.isArray(estado.acessorios?.comprados) ? estado.acessorios.comprados : [];
    const antigos = (typeof OBJETOS_PET === 'undefined' ? [] : OBJETOS_PET)
      .filter(objeto => comprados.includes(objeto.id))
      .map(({id,nome,emoji}) => ({id,nome,emoji}));
    return [...catalogo,...antigos];
  }
  const limitar = (valor,min,max) => Math.min(max,Math.max(min,valor));
  function dimensoes(area,el) {
    return {x:Math.max(0,area.clientWidth-el.offsetWidth),y:Math.max(0,area.clientHeight-el.offsetHeight)};
  }
  function posicionar(el,item,area) {
    const max=dimensoes(area,el);
    el.style.left=`${limitar(Number(item.x)||0,0,1)*max.x}px`;
    el.style.top=`${limitar(Number(item.y)||0,0,1)*max.y}px`;
  }
  function mover(el,item,area,x,y) {
    const max=dimensoes(area,el);
    const esquerda=limitar(x,0,max.x),topo=limitar(y,0,max.y);
    el.style.left=`${esquerda}px`;
    el.style.top=`${topo}px`;
    item.x=max.x?esquerda/max.x:0;
    item.y=max.y?topo/max.y:0;
  }
  function remover(uid) {
    if(!editando)return;
    estado.decoracaoItens=itens().filter(item=>item.uid!==uid);
    salvar();
    renderizar();
    renderizarCatalogo();
    mostrarToast('Objeto guardado.');
  }
  function criarElemento(item,modelo,area) {
    const el=document.createElement('div');
    el.className='decor-item';
    el.dataset.uid=item.uid;
    el.setAttribute('role','button');
    el.setAttribute('aria-label',`${modelo.nome}. Arraste para mover; use as setas do teclado no modo de decoração.`);
    const emoji=document.createElement('span');emoji.className='decor-emoji';emoji.textContent=modelo.emoji;
    const excluir=document.createElement('button');excluir.type='button';excluir.className='decor-remover';excluir.textContent='×';excluir.setAttribute('aria-label',`Guardar ${modelo.nome}`);
    excluir.addEventListener('pointerdown',evento=>evento.stopPropagation());
    excluir.addEventListener('click',evento=>{evento.stopPropagation();remover(item.uid)});
    el.append(emoji,excluir);
    el.addEventListener('pointerdown',evento=>{
      if(!editando||arraste||(evento.pointerType==='mouse'&&evento.button!==0))return;
      evento.preventDefault();
      const caixa=el.getBoundingClientRect();
      arraste={id:evento.pointerId,uid:item.uid,dx:evento.clientX-caixa.left,dy:evento.clientY-caixa.top};
      el.setPointerCapture(evento.pointerId);
      el.classList.add('arrastando');
    });
    el.addEventListener('pointermove',evento=>{
      if(!arraste||arraste.id!==evento.pointerId||arraste.uid!==item.uid)return;
      const caixa=area.getBoundingClientRect();
      const atual=itens().find(objeto=>objeto.uid===item.uid);
      if(atual)mover(el,atual,area,evento.clientX-caixa.left-arraste.dx,evento.clientY-caixa.top-arraste.dy);
    });
    function terminar(evento){
      if(!arraste||arraste.id!==evento.pointerId||arraste.uid!==item.uid)return;
      arraste=null;
      el.classList.remove('arrastando');
      salvar();
    }
    el.addEventListener('pointerup',terminar);
    el.addEventListener('pointercancel',terminar);
    el.addEventListener('lostpointercapture',terminar);
    el.addEventListener('keydown',evento=>{
      if(!editando)return;
      if(['Delete','Backspace'].includes(evento.key)){evento.preventDefault();remover(item.uid);return}
      const passos={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]};
      const delta=passos[evento.key];
      if(!delta)return;
      evento.preventDefault();
      const atual=itens().find(objeto=>objeto.uid===item.uid);
      if(!atual)return;
      mover(el,atual,area,el.offsetLeft+delta[0],el.offsetTop+delta[1]);
      salvar();
    });
    return el;
  }
  function renderizar(){
    const area=document.getElementById('decoracao-area');
    if(!area)return;
    const modelos=new Map(disponiveis().map(modelo=>[modelo.id,modelo]));
    const atuais=new Map([...area.querySelectorAll('.decor-item')].map(el=>[el.dataset.uid,el]));
    for(const item of itens()){
      if(!item||typeof item.uid!=='string'||!modelos.has(item.tipo))continue;
      let el=atuais.get(item.uid);
      if(!el){el=criarElemento(item,modelos.get(item.tipo),area);area.appendChild(el)}
      atuais.delete(item.uid);
      el.tabIndex=editando?0:-1;
      if(!arraste||arraste.uid!==item.uid)posicionar(el,item,area);
    }
    for(const el of atuais.values())el.remove();
  }
  function renderizarCatalogo(){
    const grade=document.getElementById('catalogo-decoracao');
    if(!grade)return;
    grade.replaceChildren();
    for(const modelo of disponiveis()){
      const botao=document.createElement('button');botao.type='button';
      botao.disabled=itens().length>=maximoItens;
      const icone=document.createElement('span');icone.textContent=modelo.emoji;
      botao.append(icone,document.createTextNode(modelo.nome));
      botao.addEventListener('click',()=>adicionar(modelo.id));
      grade.appendChild(botao);
    }
  }
  function ativar(){
    editando=true;
    document.body.classList.add('decorando');
    document.getElementById('barra-decoracao').hidden=false;
    renderizar();
  }
  function adicionar(tipo){
    if(itens().length>=maximoItens)return mostrarToast('Você pode colocar até 12 objetos.');
    if(!disponiveis().some(modelo=>modelo.id===tipo))return;
    const n=itens().length;
    itens().push({uid:`decor_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,tipo,x:n%2?.72:.12,y:limitar(.27+Math.floor(n/2)*.12,0,.85)});
    salvar();
    fecharModal('modal-decoracao');
    ativar();
    mostrarToast('✋ Arraste o objeto para escolher o lugar.');
  }
  window.renderizarDecoracao=renderizar;
  window.abrirCatalogoDecoracao=()=>{renderizarCatalogo();abrirModal('modal-decoracao')};
  window.iniciarModoDecoracao=()=>{fecharModal('modal-decoracao');ativar()};
  window.finalizarDecoracao=()=>{
    if(arraste)return;
    editando=false;
    document.body.classList.remove('decorando');
    document.getElementById('barra-decoracao').hidden=true;
    renderizar();
    salvar();
    mostrarToast('🎨 Decoração salva!');
  };
  function iniciar(){
    const area=document.getElementById('decoracao-area');
    if(!area)return;
    renderizar();
    if('ResizeObserver' in window)new ResizeObserver(renderizar).observe(area);
    else window.addEventListener('resize',renderizar);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar,{once:true});
  else iniciar();
})();
