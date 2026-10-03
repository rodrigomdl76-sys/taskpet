
function abrirMenuMais(){
  const e=document.getElementById('menu-mais-bau-emoji'),a=document.getElementById('atalho-bau-emoji');
  if(e&&a)e.textContent=a.textContent||'🎁';
  abrirModal('modal-menu-mais');
}


// O botão Voltar do Android fecha primeiro a tela aberta. Na tela inicial,
// pede dois toques rápidos antes de permitir sair do app.
(()=>{
  const intervaloSaida=2200;
  let ultimoVoltar=0;
  let limparAviso=null;

  function fecharTelaAtual(){
    const foto=document.querySelector('.foto-viewer');
    if(foto&&getComputedStyle(foto).visibility==='visible'){
      window.fecharVisualizadorFoto?.();
      return true;
    }

    const modais=[...document.querySelectorAll('.modal-overlay.mostrar')];
    if(modais.length){
      const modal=modais.find(el=>el.classList.contains('modal-top'))||modais[modais.length-1];
      if(modal.id==='modal-pin')window.limparPin?.();
      if(modal.id&&typeof window.fecharModal==='function')window.fecharModal(modal.id);
      else modal.classList.remove('mostrar','modal-top');
      return true;
    }

    const dropdown=document.getElementById('lista-pets');
    if(dropdown?.classList.contains('abrir')){dropdown.classList.remove('abrir');return true}
    const app=document.querySelector('.app');
    if(app?.classList.contains('nav-tarefas')){window.navegarHome?.('inicio');return true}
    return false;
  }

  function instalarProtecaoVoltar(){
    if(!history.state?.rotinapetBackGuard){
      history.pushState({...history.state,rotinapetBackGuard:true},'',location.href);
    }
  }

  window.addEventListener('popstate',()=>{
    if(fecharTelaAtual()){
      ultimoVoltar=0;
      clearTimeout(limparAviso);
      instalarProtecaoVoltar();
      return;
    }

    const agora=Date.now();
    if(agora-ultimoVoltar<=intervaloSaida){
      clearTimeout(limparAviso);
      ultimoVoltar=0;
      return; // deixa o segundo Voltar sair do app
    }

    ultimoVoltar=agora;
    window.mostrarToast?.('Toque em Voltar novamente para sair');
    limparAviso=setTimeout(()=>{ultimoVoltar=0},intervaloSaida);
    instalarProtecaoVoltar();
  });

  window.addEventListener('keydown',evento=>{
    if(evento.key!=='Escape'&&evento.key!=='Backspace')return;
    // Backspace deve continuar editando campos (ex.: valor por moeda),
    // em vez de ser interpretado como o botão Voltar do app.
    if(evento.key==='Backspace'&&evento.target?.matches?.('input, textarea, select, [contenteditable="true"]'))return;
    if(fecharTelaAtual()){
      evento.preventDefault();
      ultimoVoltar=0;
    }
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',instalarProtecaoVoltar,{once:true});
  else instalarProtecaoVoltar();
})();
