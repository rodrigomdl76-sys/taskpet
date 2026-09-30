/* Gestos cosméticos do gato: mantidos entre as evoluções. */
(() => {
  const catalogo = [
    {id:'pulinho',nome:'Pulinho',icone:'🐾',preco:45,marco:7,arquivo:'animacoes/gestos/ovo_gato_pulinho.webp'},
    {id:'giro',nome:'Giro divertido',icone:'🌀',preco:75,marco:14,arquivo:'animacoes/gestos/ovo_gato_giro_final.webp'}
  ];
  const preloads=new Map();
  function aquecerImagem(g){
    if(preloads.has(g.id))return;
    const imagem=new Image();imagem.decoding='async';imagem.src=g.arquivo;preloads.set(g.id,imagem);
  }
  const adquiridos=()=>Array.isArray(estado.gestosDesbloqueados)?estado.gestosDesbloqueados:[];
  const petGato=()=>estado.petAtual==='gato';
  const saldo=()=>Math.max(0,Number(estado.moedas)||0);
  const itemPorId=id=>catalogo.find(g=>g.id===id);
  window.gestoPetLiberado=id=>adquiridos().includes(id);
  window.obterGestosPet=()=>catalogo.map(({id,nome,icone})=>({id,nome,icone}));

  window.verificarMarcosGestos=()=>{
    const maiorMarco=Math.max(0,Number(estado.streak)||0,Number(estado.ultimoStreakPremiado)||0);
    const novos=catalogo.filter(g=>maiorMarco>=g.marco&&!adquiridos().includes(g.id));
    if(!novos.length)return;
    estado.gestosDesbloqueados=[...adquiridos(),...novos.map(g=>g.id)];
    novos.forEach(aquecerImagem);
    salvar();
    if(perfilAtivo==='crianca')mostrarToast(`🔥 ${novos.map(g=>g.nome).join(' e ')} liberado${novos.length>1?'s':''} pela ofensiva!`);
    window.atualizarAcoesGato?.();
    window.renderizarLojaGestos?.();
  };

  function abrirPrevia(g){
    let modal=document.getElementById('modal-previa-gesto');
    if(!modal){
      modal=document.createElement('div');
      modal.id='modal-previa-gesto';modal.className='modal-overlay';
      modal.innerHTML='<div class="modal gesto-previa-modal"><div class="modal-title"><h3 id="gesto-previa-titulo"></h3><button type="button" class="close-btn" aria-label="Fechar prévia">×</button></div><img id="gesto-previa-imagem" alt="Prévia animada do gesto"><p>Prévia com o Ovo-gato. O gesto acompanha as próximas evoluções.</p></div>';
      modal.querySelector('.close-btn').addEventListener('click',()=>fecharModal(modal.id));
      document.body.appendChild(modal);
    }
    document.getElementById('gesto-previa-titulo').textContent=`${g.icone} ${g.nome}`;
    const imagem=document.getElementById('gesto-previa-imagem');
    imagem.alt=`Prévia de ${g.nome}`;
    imagem.src=g.arquivo;
    abrirModal(modal.id);
  }

  function comprar(g){
    if(window.gestoPetLiberado(g.id))return;
    if(!petGato())return;
    if(saldo()<g.preco)return mostrarToast(`🪙 Faltam ${g.preco-saldo()} PetCoins.`);
    mostrarConfirmacao(`Desbloquear ${g.nome} por ${g.preco} PetCoins? A mesada acumulada não muda.`,()=>{
      if(window.gestoPetLiberado(g.id)||!petGato()||saldo()<g.preco)return;
      estado.moedas=saldo()-g.preco;
      estado.gestosDesbloqueados=[...adquiridos(),g.id];
      aquecerImagem(g);
      salvar();atualizarTela();window.renderizarLojaGestos();
      mostrarToast(`✨ ${g.nome} liberado! Deslize as ações na tela inicial.`);
    });
  }

  window.renderizarLojaGestos=()=>{
    const grid=document.getElementById('grid-gestos-loja');
    if(!grid)return;
    grid.replaceChildren();
    for(const g of catalogo){
      const liberado=window.gestoPetLiberado(g.id);
      const card=document.createElement('div');card.className='gesto-card';
      const titulo=document.createElement('strong');titulo.textContent=`${g.icone} ${g.nome}`;
      const desc=document.createElement('small');desc.textContent=liberado?'✓ Desbloqueado':`🔥 ${g.marco} dias de ofensiva ou 🪙 ${g.preco} PetCoins`;
      const botoes=document.createElement('div');botoes.className='gesto-card-botoes';
      const ver=document.createElement('button');ver.type='button';ver.textContent='▶ Ver gesto';ver.addEventListener('click',()=>abrirPrevia(g));
      botoes.appendChild(ver);
      if(!liberado){
        const comprarBotao=document.createElement('button');comprarBotao.type='button';comprarBotao.textContent=`Comprar · ${g.preco} 🪙`;
        comprarBotao.disabled=!petGato();
        comprarBotao.title=petGato()?'': 'Disponível para o gato';
        comprarBotao.addEventListener('click',()=>comprar(g));
        botoes.appendChild(comprarBotao);
      }
      card.append(titulo,desc,botoes);grid.appendChild(card);
    }
  };

  window.renderizarGestosMeuPet=conteudo=>{
    if(!conteudo)return;
    catalogo.filter(g=>window.gestoPetLiberado(g.id)).forEach(aquecerImagem);
    const secao=document.createElement('section');secao.className='meupet-gestos';
    const titulo=document.createElement('h4');titulo.textContent=`✨ Gestos de ${estado.nomePet||'Pipoca'}`;secao.appendChild(titulo);
    const sub=document.createElement('p');sub.textContent=`${adquiridos().filter(id=>itemPorId(id)).length}/${catalogo.length} gestos desbloqueados · todas as evoluções do gato`;secao.appendChild(sub);
    for(const g of catalogo){
      const botao=document.createElement('button');botao.type='button';botao.className='meupet-gesto-btn';
      const liberado=window.gestoPetLiberado(g.id);
      botao.textContent=liberado?`${g.icone} ${g.nome} · Mostrar`:`🔒 ${g.nome} · Loja ou ${g.marco} dias de ofensiva`;
      botao.disabled=!liberado||!petGato();
      botao.addEventListener('click',()=>{
        if(!window.gestoPetLiberado(g.id)||!petGato())return;
        fecharModal('modal-meu-pet');
        window.acaoGatoLaranja?.(g.id);
      });
      secao.appendChild(botao);
    }
    if(!petGato()){
      const aviso=document.createElement('p');aviso.textContent='Estes gestos estão disponíveis para as evoluções do gato.';secao.appendChild(aviso);
    }
    const loja=document.createElement('button');loja.type='button';loja.className='gesto-ir-loja';loja.textContent='🏪 Ver gestos na loja';
    loja.addEventListener('click',()=>{fecharModal('modal-meu-pet');abrirLojaFundos()});
    secao.appendChild(loja);conteudo.appendChild(secao);
  };
})();
