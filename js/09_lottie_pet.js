/* Reações experimentais para o gato. Mantém o SVG quando Lottie não estiver disponível. */
(() => {
  const arquivos={carinho:'animacoes/gato_carinho.json',risada:'animacoes/gato_risada.json'};
  const dados={};let animacao=null,temporizador=null,geracao=0;
  Object.entries(arquivos).forEach(([nome,url])=>{
    fetch(url).then(r=>{if(!r.ok)throw new Error('Lottie '+r.status);return r.json()})
      .then(json=>{dados[nome]=json}).catch(()=>{});
  });
  function encerrar(){
    if(temporizador){clearTimeout(temporizador);temporizador=null}
    if(animacao){animacao.destroy();animacao=null}
    const pet=document.getElementById('pet-principal');
    pet?.classList.remove('rp-lottie-ativa');pet?.querySelector('.rp-lottie-reacao')?.remove();
  }
  function tocar(nome){
    if(estado.petAtual!=='gato'||!dados[nome]||!window.lottie||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const pet=document.getElementById('pet-principal');if(!pet)return;
    const id=++geracao;encerrar();
    const area=document.createElement('div');area.className='rp-lottie-reacao';
    area.setAttribute('aria-hidden','true');pet.appendChild(area);
    const finalizar=()=>{if(id===geracao){geracao++;encerrar()}};
    try{
      animacao=lottie.loadAnimation({container:area,renderer:'svg',loop:false,autoplay:true,
        animationData:JSON.parse(JSON.stringify(dados[nome])),rendererSettings:{preserveAspectRatio:'xMidYMid meet'}});
      animacao.addEventListener('DOMLoaded',()=>{if(id===geracao)pet.classList.add('rp-lottie-ativa')});
      animacao.addEventListener('complete',finalizar);
      animacao.addEventListener('data_failed',finalizar);
      animacao.addEventListener('error',finalizar);
      temporizador=setTimeout(finalizar,8500);
    }catch(e){finalizar()}
  }
  const toqueOriginal=window.interagirComPet;
  if(typeof toqueOriginal==='function')window.interagirComPet=function(evento){
    const emCooldown=debounceAcao;
    const retorno=toqueOriginal.apply(this,arguments);
    if(!emCooldown)tocar('carinho');
    return retorno;
  };
  const recompensaOriginal=window.recompensarMiniJogo;
  if(typeof recompensaOriginal==='function')window.recompensarMiniJogo=function(){
    const retorno=recompensaOriginal.apply(this,arguments);
    tocar('risada');return retorno;
  };
  window.testarReacaoGato=tocar;
})();
