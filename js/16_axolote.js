/* Reações animadas da Axolote fase 1: compradas na loja e ativas apenas com o pet selecionado. */
(() => {
  const sprites={idle:'01_ocioso.webp',giro:'02_giro_ovo.webp',brilho:'03_brilho_magico.webp',risada:'04_risada.webp',espiar:'05_espiar.webp',carinho:'06_coracoes.webp'};
  const spritesFase2={idle:'01_parado.webp',giro:'02_giro.webp',carinho:'03_carinho.webp',risada:'04_brincar.webp',brilho:'05_comemorar.webp',espiar:'06_pulinho.webp'};
  const reacoes=[
    {id:'giro',sprite:'giro',nome:'Giro',icone:'🌀',preco:30,duracao:1500,duracaoFase2:1720,acaoDireta:true},
    {id:'carinho',sprite:'carinho',nome:'Carinho',icone:'💖',preco:25,duracao:1500,duracaoFase2:1140},
    {id:'risada',sprite:'risada',nome:'Risada feliz',icone:'😂',preco:25,duracao:1250,duracaoFase2:1400},
    {id:'brilho',sprite:'brilho',nome:'Brilho mágico',icone:'✨',preco:30,duracao:1750,duracaoFase2:900,acaoDireta:true},
    {id:'espiar',sprite:'espiar',nome:'Espiar / virar',icone:'👀',preco:25,duracao:1450,duracaoFase2:640,acaoDireta:true}
  ];
  const pasta='animacoes/axolote/fase1/';
  const pastaFase2='animacoes/axolote/fase2/';
  const versaoAnimacoes='ovo-animacoes-v2';
  const faseAtual=()=>Number(estado.pets?.axolote?.nivel||1)>=21?2:1;
  let img=null,acao='idle',timer=null,token=0,srcAtual='',timerDesbloqueio=null,animandoDesbloqueio=false;
  const ativa=()=>estado?.petAtual==='axolote';
  function compras(){
    if(!Array.isArray(estado.axoloteReacoesCompradas))estado.axoloteReacoesCompradas=[];
    const legado=estado.axoloteReacoes;
    if(legado&&typeof legado==='object'){
      const mapa={giro:'giro',magia:'brilho',risada:'risada',espiar:'espiar',carinho:'carinho'};
      for(const [oldId,newId] of Object.entries(mapa)){
        if(legado[oldId]&&!estado.axoloteReacoesCompradas.includes(newId))estado.axoloteReacoesCompradas.push(newId);
      }
    }
    return estado.axoloteReacoesCompradas;
  }
  const comprado=id=>compras().includes(id);
  function garantirImagem(){
    const pet=document.getElementById('pet-principal');if(!pet)return false;
    if(!ativa()){
      pet.classList.remove('axolote-ativo');
      if(img&&img.parentNode===pet)img.remove();
      img=null;srcAtual='';return false;
    }
    pet.classList.add('axolote-ativo');
    if(!img||img.parentNode!==pet){
      img=document.createElement('img');img.className='axolote-img';img.alt=faseAtual()===1?'Axolote dentro do ovo':'Axolote fora do ovo, fase 2';img.draggable=false;
      img.onload=()=>pet.classList.add('axolote-pronto');
      img.onerror=()=>{pet.classList.remove('axolote-pronto');img.alt='Animação da Axolote indisponível'};
      pet.appendChild(img);
    }
    return true;
  }
  function exibir(id='idle',reiniciar=false){
    if(!garantirImagem())return;
    const nome=sprites[id]?id:'idle';
    img.alt=faseAtual()===1?'Axolote dentro do ovo':'Axolote fora do ovo, fase 2';
    const arquivo=faseAtual()>=2?pastaFase2+spritesFase2[nome]:pasta+sprites[nome];
    const src=arquivo+'?v='+versaoAnimacoes;
    if(reiniciar||src!==srcAtual){srcAtual=src;img.src=src}
  }
  function tocar(id){
    if(!ativa())return;
    const r=reacoes.find(x=>x.id===id);if(!r)return;
    if(!comprado(id)){
      if(r.acaoDireta){window.abrirLojaFundos?.();mostrarToast('🔒 Compre “'+r.nome+'” na loja para usar esta reação.')}
      return;
    }
    if(id==='brilho')window.dispararEfeitoPet?.('brilho');
    else if(id==='giro')window.dispararEfeitoPet?.('giro');
    else if(id==='espiar')window.dispararEfeitoPet?.('espiar');
    clearTimeout(timer);acao=r.sprite;const meuToken=++token;
    exibir(r.sprite,true);
    timer=setTimeout(()=>{if(token===meuToken){acao='idle';exibir('idle',true)}},faseAtual()>=2?r.duracaoFase2:r.duracao);
  }
  function iniciarEvolucao(){
    if(!ativa()||faseAtual()<2||!garantirImagem())return;
    clearTimeout(timer);clearTimeout(timerDesbloqueio);
    const meuToken=++token;
    acao='unlock';animandoDesbloqueio=true;
    const intro=new Image();
    const concluir=()=>{
      if(meuToken!==token)return;
      animandoDesbloqueio=false;acao='idle';exibir('idle',true);
      window.celebrarEvolucaoPet?.(2);
    };
    intro.onload=()=>{
      if(meuToken!==token||!ativa())return;
      srcAtual=pastaFase2+'00_desbloqueio.webp?v='+versaoAnimacoes;img.src=srcAtual;
      timerDesbloqueio=setTimeout(concluir,5250);
    };
    intro.onerror=()=>{
      if(meuToken!==token)return;
      animandoDesbloqueio=false;acao='idle';exibir('idle',true);
      mostrarToast('A Axolote evoluiu! A animação de abertura do ovo não carregou.');
      window.celebrarEvolucaoPet?.(2);
    };
    intro.src=pastaFase2+'00_desbloqueio.webp?v='+versaoAnimacoes;
  }
  function criarBotao(r,label){
    const b=document.createElement('button');b.type='button';b.className='axolote-acao-btn';
    const ok=comprado(r.id);b.classList.toggle('axo-bloqueada',!ok);
    b.innerHTML='<span class="action-icon" aria-hidden="true">'+r.icone+'</span><span>'+label+(ok?'':' 🔒')+'</span>';
    b.title=ok?r.nome:'Compre '+r.nome+' por '+r.preco+' PetCoins na loja';
    b.setAttribute('aria-label',b.title);
    b.addEventListener('click',()=>{
      if(r.id==='carinho'){window.interagirComPet?.();return}
      if(r.id==='risada'){window.acaoPet?.('brincar');return}
      tocar(r.id);
    });
    return b;
  }
  function desenharBotoes(){
    const area=document.getElementById('acoes-gato-laranja');if(!area)return;
    if(!ativa()){area.hidden=true;return}
    area.hidden=false;area.dataset.modoBotoes='axolote';
    const brincar=document.getElementById('btn-brincar');
    area.replaceChildren();
    for(const r of reacoes){
      if(r.id==='risada'&&brincar){
        brincar.classList.add('axolote-acao-btn');
        brincar.classList.toggle('axo-bloqueada',!comprado('risada'));
        brincar.title=comprado('risada')?'Brincar · Risada feliz':'Brincar. Compre Risada feliz por '+r.preco+' PetCoins na loja';
        brincar.setAttribute('aria-label',brincar.title);
        area.appendChild(brincar);
      }else area.appendChild(criarBotao(r,r.id==='brilho'?'Comemorar':r.id==='espiar'?'Pulinho':r.nome));
    }
  }
  function sincronizar(){
    if(ativa()){
      compras();garantirImagem();
      if(!acao||acao==='idle')exibir('idle');
      desenharBotoes();return;
    }
    clearTimeout(timer);clearTimeout(timerDesbloqueio);animandoDesbloqueio=false;acao='idle';token++;
    garantirImagem();window.atualizarAcoesGato?.();
  }
  window.acaoAxolote=tocar;
  window.iniciarEvolucaoAxolote=iniciarEvolucao;
  window.renderizarLojaAxolote=()=>{
    const grid=document.getElementById('grid-reacoes-axolote');if(!grid)return;
    grid.replaceChildren();
    for(const r of reacoes){
      const card=document.createElement('article');card.className='gesto-card axolote-reacao-card';
      const imgPrev=document.createElement('img');imgPrev.src=faseAtual()>=2?pastaFase2+spritesFase2[r.sprite]:pasta+sprites[r.sprite];imgPrev.alt='';imgPrev.loading='lazy';
      const title=document.createElement('strong');title.textContent=r.icone+' '+r.nome;
      const desc=document.createElement('small');desc.textContent=comprado(r.id)?'✓ Comprado':'Reação da Axolote · '+r.preco+' PetCoins';
      const button=document.createElement('button');button.type='button';button.className='axolote-comprar-btn';
      button.disabled=comprado(r.id);button.textContent=comprado(r.id)?'✓ Comprado':'Comprar · '+r.preco+' 🪙';
      button.addEventListener('click',()=>{
        if(comprado(r.id))return;
        const saldo=Number(estado.moedas)||0;
        if(saldo<r.preco)return mostrarToast('🪙 Faltam '+(r.preco-saldo)+' PetCoins.');
        mostrarConfirmacao('Comprar “'+r.nome+'” por '+r.preco+' PetCoins?',()=>{
          if(comprado(r.id)||(Number(estado.moedas)||0)<r.preco)return;
          estado.moedas=Number(estado.moedas)-r.preco;compras().push(r.id);salvar();atualizarTela();
          window.renderizarLojaGestos?.();mostrarToast('✨ Reação “'+r.nome+'” liberada para a Axolote!');
        });
      });
      card.append(imgPrev,title,desc,button);grid.appendChild(card);
    }
  };
  const lojaAnterior=window.renderizarLojaGestos;
  if(typeof lojaAnterior==='function')window.renderizarLojaGestos=function(){
    const resultado=lojaAnterior.apply(this,arguments);window.renderizarLojaAxolote();return resultado;
  };
  const atualizarAnterior=window.atualizarTela;
  if(typeof atualizarAnterior==='function')window.atualizarTela=function(){
    const resultado=atualizarAnterior.apply(this,arguments);sincronizar();return resultado;
  };
  const carinhoAnterior=window.interagirComPet;
  if(typeof carinhoAnterior==='function')window.interagirComPet=function(){
    const resultado=carinhoAnterior.apply(this,arguments);
    if(ativa()&&comprado('carinho'))tocar('carinho');
    return resultado;
  };
  const acaoAnterior=window.acaoPet;
  if(typeof acaoAnterior==='function')window.acaoPet=function(tipo){
    const resultado=acaoAnterior.apply(this,arguments);
    if(ativa()&&tipo==='brincar'&&comprado('risada'))tocar('risada');
    return resultado;
  };
  const acaoGatoAnterior=window.acaoGatoLaranja;
  window.acaoGatoLaranja=id=>{
    if(ativa()){if(id==='comemoracao'&&comprado('brilho'))tocar('brilho');return}
    acaoGatoAnterior?.(id);
  };
  setTimeout(sincronizar,350);
})();
