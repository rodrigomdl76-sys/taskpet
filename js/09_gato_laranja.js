/* WebP originais do pet, organizados por fase e ação na pasta animacoes/. */
(() => {
  const pasta = 'animacoes/';
  const arquivos = {
    2:{idle:'01_parado.webp',carinho:'02_carinho.webp',dormir:'03_dormir.webp',comemoracao:'04_comemorar.webp'},
    1:{idle:'01_parado.webp',carinho:'02_carinho.webp',dormir:'03_dormir.webp',comemoracao:'04_comemorar.webp'},
    3:{idle:'01_parado.webp',carinho:'02_carinho.webp',dormir:'03_dormir.webp',comemoracao:'04_comemorar.webp'}
  };
  const acoes = [{id:'carinho',nome:'💛 Carinho'},{id:'comemoracao',nome:'🎉 Comemorar'}];
  let img, volta, faseVisivel=0, faseTeste=0, acao='', chave='', token=0, audioAtivo=0;
  const nivel = () => Number(estado?.pets?.gato?.nivel)||1;
  const faseReal = () => nivel()>=41?3:nivel()>=21?2:1;
  const fase = () => perfilAtivo==='pais' && faseTeste ? faseTeste : faseReal();
  function voltar(){clearTimeout(volta);volta=null;acao='';mostrar();}
  function caminho(f,a,n){
    return `${pasta}fase${f}/${arquivos[f][a]}`;
  }
  function garantirImagem(){
    const pet=document.getElementById('pet-principal');if(!pet)return false;
    if(!img || img.parentNode!==pet){
      chave='';img=document.createElement('img');img.className='gato-laranja-img';img.alt='Gato animado';img.draggable=false;
      img.onerror=()=>{pet.classList.remove('gato-laranja-pronto');img.alt='Imagem do pet indisponível'};
      img.onload=()=>pet.classList.add('gato-laranja-pronto');pet.appendChild(img);
    }
    return true;
  }
  function mostrar(){
    if(!garantirImagem())return;
    const f=fase();const pedido=acao || ((new Date().getHours()>=21 || new Date().getHours()<7)?'dormir':'idle');
    const a=arquivos[f][pedido]?pedido:'idle';
    const novaChave=`${f}/${a}`;
    if(chave===novaChave)return;
    chave=novaChave;faseVisivel=f;
    img.src=caminho(f,a);
    atualizarBotoes();
  }
  function tocar(a){
    if(!arquivos[fase()]?.[a] || a==='idle')return;
    clearTimeout(volta);acao=a;chave='';mostrar();
    const atual=++token;
    const duracao={carinho:1300,comemoracao:2100,rolar:2200,brincar:2600,explorar:2800}[a]||2300;
    volta=setTimeout(()=>{if(token===atual)voltar()},fase()===2?duracao:2300);
  }
  function atualizarBotoes(){
    const area=document.getElementById('acoes-gato-laranja');if(!area)return;
    const f=fase();
    area.innerHTML=acoes.filter(a=>(!a.fase || a.fase===f) && arquivos[f][a.id]).map(a=>`<button type="button" onclick="window.acaoGatoLaranja('${a.id}')">${a.nome}</button>`).join('');
    if(perfilAtivo==='pais')area.innerHTML+=[1,2,3].map(n=>`<button type="button" onclick="window.testarFaseGato(${n})" ${n===f?'disabled':''}>Testar fase ${n}</button>`).join('');
    const nomes=['','Ovo-gato','Gato Cavalheiro','Gato Real'];
    const label=document.getElementById('pet-evol-nome');if(label)label.textContent=`Pipoca • ${nomes[f]}${faseTeste?' (teste)':''}`;
  }
  window.testarFaseGato=n=>{if(perfilAtivo!=='pais')return;faseTeste=n;chave='';mostrar()};
  window.acaoGatoLaranja=tocar;
  window.gatoLaranjaAudio=audio=>{
    if(!audio?.addEventListener)return;
    audio.addEventListener('playing',()=>{audioAtivo++;tocar('comemoracao')});
    for(const evento of ['ended','pause'])audio.addEventListener(evento,()=>{if(audioAtivo){audioAtivo=0;voltar()}});
  };
  const anterior=window.atualizarTela;
  if(typeof anterior==='function')window.atualizarTela=function(){
    const resultado=anterior.apply(this,arguments);
    if(perfilAtivo!=='pais')faseTeste=0;
    mostrar();atualizarBotoes();return resultado;
  };
  const interagir=window.interagirComPet;
  if(typeof interagir==='function')window.interagirComPet=function(){
    const resultado=interagir.apply(this,arguments);tocar('carinho');return resultado;
  };
  const renderEvolucoes=window.renderizarEvolucoes;
  if(typeof renderEvolucoes==='function')window.renderizarEvolucoes=function(){
    const resultado=renderEvolucoes.apply(this,arguments);
    atualizarBotoes();return resultado;
  };
  setInterval(()=>{if(faseVisivel!==fase())chave='';mostrar()},30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){chave='';mostrar()}});
  setTimeout(mostrar,300);
})();
