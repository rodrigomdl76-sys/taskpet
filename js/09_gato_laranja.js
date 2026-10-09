/* WebP originais do pet, organizados por fase e ação na pasta animacoes/. */
(() => {
  const pasta = 'animacoes/';
  const versaoAnimacoes = 'ovo-animacoes-v18';
  const arquivos = {
    2:{idle:'01_parado.webp',carinho:'02_carinho.webp',dormir:'03_dormir.webp',comemoracao:'04_comemorar.webp'},
    1:{idle:'01_parado.webp',carinho:'02_carinho.webp',brincar:'05_brincar.webp',dormir:'03_dormir.webp',comemoracao:'04_comemorar.webp'},
    3:{idle:'01_parado.webp',carinho:'02_carinho.webp',dormir:'03_dormir.webp',comemoracao:'04_comemorar.webp'}
  };
  const gestos = {1:{pulinho:'gestos/ovo_gato_pulinho.webp',giro:'gestos/ovo_gato_giro_final.webp'}};
  const acoes = [{id:'carinho',icone:'💖',nome:'Dar Carinho'},{id:'comemoracao',icone:'🎉',nome:'Comemorar'}];
  let img, volta, faseVisivel=0, faseTeste=0, acao='', chave='', token=0, audioAtivo=0;
  let fasePrecarregada=0, imagensPrecarregadas=[], acoesPersonalizadas=null;
  const acoesPersonalizadasProntas=fetch(`${pasta}fase1/acoes_personalizadas.json?v=${versaoAnimacoes}`).then(r=>r.ok?r.json():null).then(d=>{acoesPersonalizadas=d;return d}).catch(()=>null);
  const nivel = () => Number(estado?.pets?.gato?.nivel)||1;
  const faseReal = () => calcularFase(nivel());
  const fase = () => perfilAtivo==='pais' && faseTeste ? faseTeste : faseReal();
  function voltar(){token++;clearTimeout(volta);volta=null;img?.classList.remove('gesto-css-pulinho','gesto-css-giro');acao='';mostrar();}
  function caminho(f,a){
    if(a==='carinho'&&acoesPersonalizadas?.carinho)return acoesPersonalizadas.carinho;
    if(f===1&&acoesPersonalizadas?.[a])return acoesPersonalizadas[a];
    const arquivo = gestos[f]?.[a] ? `${pasta}${gestos[f][a]}` : `${pasta}fase${f}/${arquivos[f][a]}`;
    return `${arquivo}?v=${versaoAnimacoes}`;
  }
  function precarregarFase(f){
    if(fasePrecarregada===f || !arquivos[f])return;
    const carregar=()=>{
      if(fase()!==f || fasePrecarregada===f)return;
      fasePrecarregada=f;
      imagensPrecarregadas=[];
      const disponiveis=[...Object.keys(arquivos[f]),...Object.keys(gestos[f]||{}).filter(id=>window.gestoPetLiberado?.(id))];
      for(const acao of disponiveis){
        const imagem=new Image();
        imagem.decoding='async';
        imagem.src=caminho(f,acao);
        imagensPrecarregadas.push(imagem);
      }
    };
    if('requestIdleCallback' in window)requestIdleCallback(carregar,{timeout:1200});
    else setTimeout(carregar,150);
  }
  function alinharSprite(){
    if(!img?.naturalWidth)return;
    const largura=img.clientWidth,altura=img.clientHeight;
    if(!largura||!altura)return;
    try{
      const escalaAmostra=Math.min(1,128/img.naturalWidth,128/img.naturalHeight);
      const amostraL=Math.max(1,Math.round(img.naturalWidth*escalaAmostra));
      const amostraA=Math.max(1,Math.round(img.naturalHeight*escalaAmostra));
      const canvas=document.createElement('canvas');canvas.width=amostraL;canvas.height=amostraA;
      const contexto=canvas.getContext('2d',{willReadFrequently:true});
      contexto.drawImage(img,0,0,amostraL,amostraA);
      const pixels=contexto.getImageData(0,0,amostraL,amostraA).data;
      let minX=amostraL,minY=amostraA,maxX=-1,maxY=-1;
      for(let y=0;y<amostraA;y++)for(let x=0;x<amostraL;x++){
        if(pixels[(y*amostraL+x)*4+3]<=32)continue;
        if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
      }
      if(maxX<minX||maxY<minY)return;
      const escalaConteudo=Math.min(largura/img.naturalWidth,altura/img.naturalHeight);
      const esquerda=(largura-img.naturalWidth*escalaConteudo)/2;
      const topo=altura-img.naturalHeight*escalaConteudo;
      const escalaX=img.naturalWidth/amostraL,escalaY=img.naturalHeight/amostraA;
      const centro=esquerda+((minX+maxX+1)/2)*escalaX*escalaConteudo;
      const base=topo+(maxY+1)*escalaY*escalaConteudo;
      img.style.setProperty('--pet-shift-x',`${((largura/2-centro)/largura*100).toFixed(2)}%`);
      img.style.setProperty('--pet-shift-y',`${((altura-base)/altura*100).toFixed(2)}%`);
    }catch(erro){
      img.style.setProperty('--pet-shift-x','0%');img.style.setProperty('--pet-shift-y','0%');
      console.warn('Não foi possível alinhar a imagem do pet:',erro);
    }
  }
  function garantirImagem(){
    const pet=document.getElementById('pet-principal');if(!pet)return false;
    if(!img || img.parentNode!==pet){
      chave='';img=document.createElement('img');img.className='gato-laranja-img';img.alt='Gato animado';img.draggable=false;
      img.onerror=()=>{pet.classList.remove('gato-laranja-pronto');img.style.display='none';img.alt='Imagem do pet indisponível'};
      img.onload=()=>{img.style.display='';pet.classList.add('gato-laranja-pronto');alinharSprite();precarregarFase(faseVisivel)};pet.appendChild(img);
    }
    return true;
  }
  function mostrar(){
    if(estado?.petAtual!=='gato'){if(img)img.style.display='none';document.getElementById('pet-principal')?.classList.remove('gato-laranja-animado');chave='';return}
    if(!garantirImagem())return;
    document.getElementById('pet-principal')?.classList.add('gato-laranja-animado');
    img.style.display='';
    const f=fase();const pedido=acao || ((new Date().getHours()>=21 || new Date().getHours()<7)?'dormir':'idle');
    const a=(arquivos[f][pedido]||gestos[f]?.[pedido])?pedido:'idle';
    img.dataset.acaoPet=a;
    const novaChave=`${f}/${a}`;
    if(chave===novaChave)return;
    chave=novaChave;faseVisivel=f;
    img.src=caminho(f,a);
    atualizarBotoes();
  }
  async function aguardarImagem(src){
    const imagem=new Image();imagem.decoding='async';imagem.src=src;
    if(typeof imagem.decode==='function'){
      try{await imagem.decode()}catch(erro){if(!imagem.complete||!imagem.naturalWidth)throw erro}
    }else if(!imagem.complete){
      await new Promise((resolve,reject)=>{imagem.onload=resolve;imagem.onerror=()=>reject(new Error('Não foi possível carregar a animação do pet.'))});
    }
    if(!imagem.naturalWidth)throw new Error('A animação do pet não carregou.');
  }
  async function tocar(a){
    const atual=++token;
    clearTimeout(volta);volta=null;
    if(a==='comemoracao')window.dispararEfeitoPet?.('comemoracao');
    else if(a==='pulinho')window.dispararEfeitoPet?.('brincar');
    else if(a==='giro')window.dispararEfeitoPet?.('giro');
    let f=fase();
    if(f===1&&(a==='carinho'||a==='brincar')&&!acoesPersonalizadas){
      img?.classList.remove('gesto-css-pulinho','gesto-css-giro');
      acao='';chave='';mostrar();
      await acoesPersonalizadasProntas;
      if(token!==atual)return;
      f=fase();
    }
    if(estado?.petAtual!=='gato')return;
    const gestoLiberado=window.gestoPetLiberado?.(a) && (a==='pulinho'||a==='giro');
    if(a==='idle'||(!arquivos[f]?.[a]&&!gestoLiberado))return;
    img?.classList.remove('gesto-css-pulinho','gesto-css-giro');
    const gestoPorCss=gestoLiberado&&!gestos[f]?.[a];
    if(!gestoPorCss){
      const src=caminho(f,a);
      try{await aguardarImagem(src)}catch(erro){if(token===atual)console.warn('Não foi possível preparar a animação do pet:',erro);return}
      if(token!==atual||estado?.petAtual!=='gato')return;
      if(f!==fase())return;
    }
    if(gestoPorCss){
      acao='';mostrar();
      if(img){void img.offsetWidth;img.classList.add(`gesto-css-${a}`)}
    }else{acao=a;chave='';mostrar()}
    const duracao={carinho:8200,brincar:10800,comemoracao:2100,pulinho:3000,giro:8600}[a]||2300;
    volta=setTimeout(()=>{if(token===atual)voltar()},gestoLiberado||f===2||(f===1&&(a==='carinho'||a==='brincar'))?duracao:2300);
  }
  function atualizarRolagem(){
    const faixa=document.getElementById('pet-actions');if(!faixa)return;
    const anterior=document.getElementById('acoes-anterior');
    const proximo=document.getElementById('acoes-proximo');
    if(anterior)anterior.disabled=faixa.scrollLeft<4;
    if(proximo)proximo.disabled=faixa.scrollLeft+faixa.clientWidth>=faixa.scrollWidth-4;
  }
  function instalarRolagem(){
    const faixa=document.getElementById('pet-actions');if(!faixa||faixa.dataset.rolagemInstalada)return;
    faixa.dataset.rolagemInstalada='1';
    faixa.addEventListener('scroll',atualizarRolagem,{passive:true});
    for(const [id,direcao] of [['acoes-anterior',-1],['acoes-proximo',1]]){
      document.getElementById(id)?.addEventListener('click',()=>faixa.scrollBy({left:direcao*faixa.clientWidth*.86,behavior:'smooth'}));
    }
    window.addEventListener('resize',atualizarRolagem,{passive:true});
  }
  function atualizarBotoes(){
    const area=document.getElementById('acoes-gato-laranja');if(!area)return;
    if(estado?.petAtual!=='gato'){
      const faixa=document.getElementById('pet-actions'),brincar=document.getElementById('btn-brincar');
      if(faixa&&brincar&&brincar.parentNode!==faixa)faixa.insertBefore(brincar,area);
      area.replaceChildren();area.hidden=true;area.dataset.modoBotoes='';return;
    }
    area.hidden=false;
    const f=fase();
    const acoesVisiveis=acoes.filter(a=>arquivos[f][a.id]);
    const extras=window.obterGestosPet?.()||[];
    const modo=`${perfilAtivo==='pais'?'pais':'crianca'}:${[...acoesVisiveis,...extras].map(a=>a.id).join(',')}`;
    const recriou=area.dataset.modoBotoes!==modo;
    if(recriou){
      const brincar=document.getElementById('btn-brincar');
      area.replaceChildren();
      for(const a of [...acoesVisiveis,...extras]){
        if(a.id==='comemoracao'&&brincar)area.appendChild(brincar);
        const botao=document.createElement('button');
        botao.type='button';botao.dataset.acaoPet=a.id;
        if(extras.includes(a))botao.classList.add('gesto-acao-btn');
        const icone=document.createElement('span');
        icone.className='action-icon';icone.setAttribute('aria-hidden','true');icone.textContent=a.icone;
        const nome=document.createElement('span');nome.textContent=a.nome;
        botao.append(icone,nome);
        botao.addEventListener('click',()=>{
          if(extras.includes(a)&&!window.gestoPetLiberado?.(a.id)){window.abrirLojaFundos?.();return}
          if(a.id==='carinho'){window.interagirComPet?.();return}
          tocar(a.id);
        });
        area.appendChild(botao);
      }
      if(perfilAtivo==='pais')for(const n of [1,2,3]){
        const botao=document.createElement('button');
        botao.type='button';botao.dataset.faseTeste=String(n);botao.textContent=`Testar fase ${n}`;
        botao.addEventListener('click',()=>window.testarFaseGato(n));
        area.appendChild(botao);
      }
      area.dataset.modoBotoes=modo;
    }
    for(const a of extras){
      const botao=area.querySelector(`[data-acao-pet="${a.id}"]`);if(!botao)continue;
      const liberado=!!window.gestoPetLiberado?.(a.id);
      botao.classList.toggle('gesto-bloqueado',!liberado);
      botao.setAttribute('aria-label',liberado?`${a.nome}. Ativar gesto`:`${a.nome} bloqueado. Abrir loja`);
      botao.title=liberado?`Ativar ${a.nome}`:`Desbloqueie ${a.nome} na loja ou pela ofensiva`;
    }
    instalarRolagem();requestAnimationFrame(()=>{
      if(recriou)document.getElementById('pet-actions').scrollLeft=0;
      atualizarRolagem();
    });
    area.querySelectorAll('[data-fase-teste]').forEach(botao=>{botao.disabled=Number(botao.dataset.faseTeste)===f});
    const nomes=['','Ovo-gato','Gato Cavalheiro','Gato Real'];
    const label=document.getElementById('pet-evol-nome');if(label)label.textContent=`${estado.nomePet||'Pipoca'} • ${nomes[f]}${faseTeste?' (teste)':''}`;
  }
  window.testarFaseGato=n=>{if(perfilAtivo!=='pais')return;faseTeste=n;chave='';mostrar()};
  window.acaoGatoLaranja=a=>{if(estado?.petAtual==='gato')tocar(a)};
  window.atualizarAcoesGato=atualizarBotoes;
  window.gatoLaranjaAudio=audio=>{
    if(!audio?.addEventListener)return;
    audio.addEventListener('playing',()=>{audioAtivo++;if(estado?.petAtual==='gato')tocar('comemoracao')});
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
    const resultado=interagir.apply(this,arguments);if(estado?.petAtual==='gato')tocar('carinho');return resultado;
  };
  const acaoPrincipal=window.acaoPet;
  if(typeof acaoPrincipal==='function')window.acaoPet=function(tipo){
    const resultado=acaoPrincipal.apply(this,arguments);
    if(tipo==='brincar'&&estado?.petAtual==='gato')tocar('brincar');
    return resultado;
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
