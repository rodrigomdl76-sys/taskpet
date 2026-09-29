/* A navegação usa as telas e funções existentes; só Tarefas muda a composição da Home. */
function navegarHome(destino){
  const app=document.querySelector('.app');
  if(!app)return;
  const tarefas=destino==='tarefas';
  app.classList.toggle('nav-tarefas',tarefas);
  const secao=document.getElementById('secao-missoes');
  if(secao && secao.classList.contains('recolhida') && tarefas && typeof alternarMissoes==='function')alternarMissoes();
  if(secao && !secao.classList.contains('recolhida') && destino==='inicio' && typeof alternarMissoes==='function')alternarMissoes();
  document.querySelectorAll('[data-home-tab]').forEach(botao=>{
    const ativo=botao.dataset.homeTab===(tarefas?'tarefas':'inicio');
    botao.classList.toggle('ativa',ativo);
    if(ativo)botao.setAttribute('aria-current','page');else botao.removeAttribute('aria-current');
  });
  if(destino==='jogar')abrirDesafio();
  if(destino==='loja')abrirLojaFundos();
  if(destino==='voz')alternarGravador();
}

function moverCarrosselMissoes(direcao){
  const lista=document.getElementById('missoes-preview');
  const item=lista?.firstElementChild;
  if(!item)return;
  const passo=item.getBoundingClientRect().width+(parseFloat(getComputedStyle(lista).columnGap)||0);
  lista.scrollBy({left:Math.sign(direcao)*passo,behavior:'smooth'});
}
