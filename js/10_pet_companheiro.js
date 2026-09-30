(() => {
  const storageKey = 'rotinapet_passarinho_posicao_v1';
  const miniPets = [
    { id: 'passarinho', nome: 'Passarinho', preco: 0, descricao: 'Seu primeiro amigo voador.' },
    { id: 'abelha', nome: 'Abelha', preco: 25, conquista: 'natureza', descricao: 'Ganhe com o emblema Guardião da Natureza.' },
    { id: 'drone', nome: 'Drone', preco: 45, conquista: 'mestreMath', descricao: 'Ganhe com a conquista Gênio da Matemática.' },
    { id: 'disco', nome: 'Disco voador', preco: 60, conquista: 'streak7', descricao: 'Ganhe com 7 dias de ofensiva.' },
    { id: 'balao', nome: 'Balão', preco: 20, conquista: 'primeira', descricao: 'Ganhe após a primeira tarefa aprovada.' },
    { id: 'sapo', nome: 'Sapinho', preco: 80, descricao: 'Pula de um lado para o outro.' },
    { id: 'pato', nome: 'Patinho com boia', preco: 95, descricao: 'Balança tranquilamente na boia.' },
    { id: 'tartaruga', nome: 'Tartaruguinha', preco: 120, descricao: 'Passeia devagar pelo cenário.' },
    { id: 'vagalumes', nome: 'Vaga-lumes', preco: 60, descricao: 'Piscam e voam pelo cenário.' },
    { id: 'coelho', nome: 'Coelhinho', preco: 110, descricao: 'Fica saltitando de um lado para o outro.' }
  ];
  const desenhos = {
    sapo: `<svg viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="24" cy="29" rx="16" ry="11" fill="#83d957" stroke="#365b3c" stroke-width="2"/><circle cx="16" cy="17" r="8" fill="#9bea65" stroke="#365b3c" stroke-width="2"/><circle cx="32" cy="17" r="8" fill="#9bea65" stroke="#365b3c" stroke-width="2"/><circle cx="16" cy="17" r="3" fill="#fff"/><circle cx="32" cy="17" r="3" fill="#fff"/><circle cx="17" cy="18" r="1.5" fill="#263b2e"/><circle cx="33" cy="18" r="1.5" fill="#263b2e"/><path d="M18 30q6 6 12 0" fill="none" stroke="#365b3c" stroke-width="2" stroke-linecap="round"/><ellipse cx="11" cy="37" rx="7" ry="3" fill="#9bea65"/><ellipse cx="37" cy="37" rx="7" ry="3" fill="#9bea65"/></svg>`,
    pato: `<svg viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="24" cy="31" rx="19" ry="9" fill="#56c8ef" stroke="#27627a" stroke-width="2"/><ellipse cx="24" cy="30" rx="10" ry="5" fill="#b9f3ff"/><ellipse cx="24" cy="21" rx="11" ry="12" fill="#ffe66d" stroke="#8a7040" stroke-width="2"/><circle cx="20" cy="18" r="1.6" fill="#26374a"/><circle cx="28" cy="18" r="1.6" fill="#26374a"/><path d="m21 23 3 2 3-2-3-2z" fill="#ff9c43" stroke="#ad6030"/><path d="M16 26q-5 5-7 1m23-1q5 5 7 1" fill="none" stroke="#e7c84e" stroke-width="2"/></svg>`,
    tartaruga: `<svg viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="23" cy="25" rx="15" ry="12" fill="#68bd72" stroke="#365b3c" stroke-width="2"/><path d="M10 25q13-19 26 0-13 18-26 0Z" fill="#86d47a" stroke="#365b3c" stroke-width="2"/><path d="M18 17 23 25l8-7m-8 7-7 7m7-7 9 7" fill="none" stroke="#4e985b" stroke-width="1.5"/><circle cx="40" cy="25" r="6" fill="#9bea80" stroke="#365b3c" stroke-width="2"/><circle cx="41" cy="24" r="1.2" fill="#26374a"/><ellipse cx="12" cy="37" rx="4" ry="3" fill="#9bea80"/><ellipse cx="31" cy="37" rx="4" ry="3" fill="#9bea80"/></svg>`,
    vagalumes: `<svg viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="mini-vagalume"><circle cx="10" cy="13" r="5" fill="#fff28a"/><ellipse cx="7" cy="9" rx="4" ry="2.5" fill="#d8f8ff"/><ellipse cx="13" cy="9" rx="4" ry="2.5" fill="#d8f8ff"/><circle cx="10" cy="13" r="2" fill="#354054"/></g><g class="mini-vagalume"><circle cx="35" cy="12" r="5" fill="#fff28a"/><ellipse cx="32" cy="8" rx="4" ry="2.5" fill="#d8f8ff"/><ellipse cx="38" cy="8" rx="4" ry="2.5" fill="#d8f8ff"/><circle cx="35" cy="12" r="2" fill="#354054"/></g><g class="mini-vagalume"><circle cx="22" cy="31" r="5" fill="#fff28a"/><ellipse cx="19" cy="27" rx="4" ry="2.5" fill="#d8f8ff"/><ellipse cx="25" cy="27" rx="4" ry="2.5" fill="#d8f8ff"/><circle cx="22" cy="31" r="2" fill="#354054"/></g><g class="mini-vagalume"><circle cx="40" cy="34" r="4" fill="#fff28a"/><ellipse cx="37" cy="31" rx="3" ry="2" fill="#d8f8ff"/><ellipse cx="43" cy="31" rx="3" ry="2" fill="#d8f8ff"/><circle cx="40" cy="34" r="1.6" fill="#354054"/></g></svg>`,
    coelho: `<svg viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="18" cy="11" rx="5" ry="11" transform="rotate(-14 18 11)" fill="#fff0df" stroke="#8b6b61" stroke-width="2"/><ellipse cx="30" cy="11" rx="5" ry="11" transform="rotate(12 30 11)" fill="#fff0df" stroke="#8b6b61" stroke-width="2"/><ellipse cx="24" cy="28" rx="14" ry="12" fill="#fff3e5" stroke="#8b6b61" stroke-width="2"/><circle cx="19" cy="26" r="1.5" fill="#344054"/><circle cx="29" cy="26" r="1.5" fill="#344054"/><path d="m22 30 2 2 2-2z" fill="#f08d9e"/><path d="M24 32q-3 4-6 1m6-1q3 4 6 1" fill="none" stroke="#8b6b61" stroke-width="1.5"/><ellipse cx="14" cy="38" rx="5" ry="3" fill="#fff3e5"/><ellipse cx="34" cy="38" rx="5" ry="3" fill="#fff3e5"/></svg>`,
    abelha: `<svg viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse class="passarinho-asa" cx="18" cy="14" rx="8" ry="10" fill="#d8faff" stroke="#27334b" stroke-width="1.5"/><ellipse class="passarinho-asa" cx="29" cy="14" rx="8" ry="10" fill="#d8faff" stroke="#27334b" stroke-width="1.5"/><ellipse cx="24" cy="26" rx="16" ry="12" fill="#ffdd55" stroke="#27334b" stroke-width="2"/><path d="M17 15v22m11-22v22" stroke="#27334b" stroke-width="5"/><circle cx="34" cy="23" r="2" fill="#27334b"/><path d="m10 23-6 3 6 3" fill="#27334b"/></svg>`,
    drone: `<svg viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 17 18 24m22-7L30 24" stroke="#39465e" stroke-width="3"/><ellipse class="passarinho-asa" cx="8" cy="15" rx="8" ry="2.5" fill="#99e8f2" stroke="#39465e"/><ellipse class="passarinho-asa" cx="40" cy="15" rx="8" ry="2.5" fill="#99e8f2" stroke="#39465e"/><rect x="14" y="19" width="20" height="18" rx="8" fill="#8c9bff" stroke="#39465e" stroke-width="2"/><circle cx="24" cy="28" r="5" fill="#d9faff"/><circle cx="24" cy="28" r="2" fill="#39465e"/><path d="M17 36v4m14-4v4" stroke="#39465e" stroke-width="2"/></svg>`,
    disco: `<svg viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17 20c0-9 14-9 14 0" fill="#b4a0ff" stroke="#35436b" stroke-width="2"/><ellipse cx="24" cy="25" rx="22" ry="9" fill="#8d74ec" stroke="#35436b" stroke-width="2"/><ellipse cx="24" cy="22" rx="14" ry="5" fill="#d8cfff"/><circle cx="9" cy="27" r="2" fill="#ffdb6d"/><circle cx="24" cy="30" r="2" fill="#7cfcda"/><circle cx="39" cy="27" r="2" fill="#ffdb6d"/><path d="M15 33 10 43h28l-5-10" fill="#b3fce0" opacity=".5"/></svg>`,
    balao: `<svg viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M24 3C12 3 8 12 11 21c2 6 9 11 13 14 4-3 11-8 13-14C40 12 36 3 24 3Z" fill="#ff8aa9" stroke="#864668" stroke-width="2"/><path d="M24 4v29M13 9c6-5 10-5 11-5m11 5c-6-5-10-5-11-5" fill="none" stroke="#ffd477" stroke-width="3"/><path d="m21 35 1 5h4l1-5" fill="#af8051" stroke="#864668" stroke-width="1.5"/></svg>`
  };
  let desenhoPassarinho;
  function ganho(item) {
    if (item.id === 'passarinho') return true;
    if (item.conquista === 'natureza') return Number(estado.habilidades?.natureza) >= 3;
    return Boolean(estado.conquistas?.[item.conquista]);
  }
  function liberado(item) {
    return ganho(item) || (Array.isArray(estado.miniPetsComprados) && estado.miniPetsComprados.includes(item.id));
  }
  function atualizarCompanheiro() {
    const botao = document.getElementById('pet-companheiro');
    if (!botao) return;
    if (!desenhoPassarinho) desenhoPassarinho = botao.querySelector('.passarinho-flutua')?.innerHTML;
    const id = estado.miniPetAtivo === undefined ? 'passarinho' : estado.miniPetAtivo;
    const item = miniPets.find(p => p.id === id);
    botao.hidden = !item || !liberado(item);
    if (botao.hidden || botao.dataset.miniPet === id) return;
    botao.dataset.miniPet = id;
    botao.querySelector('.passarinho-flutua').innerHTML = desenhos[id] || desenhoPassarinho;
    botao.setAttribute('aria-label', `${item.nome} companheiro. Arraste para mudar de lugar; use as setas do teclado para mover.${id === 'passarinho' ? ' Toque para ver notas musicais e voltar à órbita.' : ''}`);
    botao.title = id === 'passarinho' ? 'Toque para ver notas musicais ou arraste' : `Arraste: ${item.nome}`;
  }
  function renderizarLoja() {
    const grid = document.getElementById('grid-mini-pets');
    if (!grid) return;
    document.getElementById('saldo-mini-pets').textContent = `Você tem ${Number(estado.moedas) || 0} 🪙`;
    grid.replaceChildren();
    for (const item of miniPets) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'mini-pet-card' + (estado.miniPetAtivo === item.id ? ' em-uso' : '');
      const titulo = document.createElement('b');
      titulo.textContent = item.nome;
      const descricao = document.createElement('small');
      descricao.textContent = item.descricao;
      const preco = document.createElement('strong');
      preco.textContent = estado.miniPetAtivo === item.id ? '✓ Em uso' : liberado(item) ? 'Usar' : item.conquista ? `${item.preco} 🪙 ou conquiste` : `Comprar por ${item.preco} 🪙`;
      const amostra = document.createElement('span');
      amostra.innerHTML = desenhos[item.id] || desenhoPassarinho;
      card.append(amostra, titulo, descricao, preco);
      card.onclick = () => {
        if (estado.miniPetAtivo === item.id) return;
        if (!liberado(item)) {
          const saldo = Number(estado.moedas) || 0;
          if (saldo < item.preco) return mostrarToast(`🪙 Faltam ${item.preco - saldo} moedas.`);
          if (!window.confirm(`Comprar ${item.nome} por ${item.preco} moedas virtuais?`)) return;
          // Checagem repetida no momento da compra para evitar gastos duplicados.
          if (liberado(item) || Number(estado.moedas) < item.preco) return renderizarLoja();
          estado.moedas -= item.preco;
          estado.miniPetsComprados = Array.isArray(estado.miniPetsComprados) ? estado.miniPetsComprados : ['passarinho'];
          estado.miniPetsComprados.push(item.id);
        }
        estado.miniPetAtivo = item.id;
        salvar();
        atualizarTela();
        renderizarLoja();
        mostrarToast(`🐾 ${item.nome} vai acompanhar seu pet!`);
      };
      grid.appendChild(card);
    }
    document.querySelector('.mini-pets-guardar').hidden = estado.miniPetAtivo === null;
  }
  window.atualizarMiniPetCompanheiro = atualizarCompanheiro;
  window.abrirLojaMiniPets = () => { atualizarCompanheiro(); renderizarLoja(); abrirModal('modal-mini-pets'); };
  window.guardarMiniPet = () => {
    estado.miniPetAtivo = null;
    salvar();
    atualizarCompanheiro();
    renderizarLoja();
    mostrarToast('Seu companheiro está descansando.');
  };

  function iniciarPassarinho() {
    const app = document.querySelector('.app');
    const palco = document.querySelector('.pet-stage');
    const passarinho = document.getElementById('pet-companheiro');
    if (!app || !palco || !passarinho) return;
    atualizarCompanheiro();

    let posicao = null;
    let arraste = null;
    try {
      const salva = JSON.parse(localStorage.getItem(storageKey));
      if (salva && Number.isFinite(salva.x) && Number.isFinite(salva.y)) {
        posicao = { x: Math.min(1, Math.max(0, salva.x)), y: Math.min(1, Math.max(0, salva.y)) };
      }
    } catch (_) { /* O app também funciona sem armazenamento local. */ }

    const limites = () => ({
      x: Math.max(0, app.clientWidth - passarinho.offsetWidth),
      y: Math.max(0, app.clientHeight - passarinho.offsetHeight)
    });
    function mover(x, y, salvarPosicao = true) {
      const maximo = limites();
      const esquerda = Math.min(maximo.x, Math.max(0, x));
      const topo = Math.min(maximo.y, Math.max(0, y));
      passarinho.style.left = `${esquerda}px`;
      passarinho.style.top = `${topo}px`;
      if (salvarPosicao) {
        posicao = { x: maximo.x ? esquerda / maximo.x : 0, y: maximo.y ? topo / maximo.y : 0 };
        app.classList.remove('passarinho-orbitando');
        passarinho.style.zIndex = '12';
      }
    }
    function posicionarOrbita(tempo) {
      const ativo = !posicao && !passarinho.hidden && passarinho.dataset.miniPet === 'passarinho';
      app.classList.toggle('passarinho-orbitando', ativo);
      if (!ativo || arraste) return;
      const area = app.getBoundingClientRect();
      const pet = document.getElementById('pet-principal')?.getBoundingClientRect();
      if (!pet) return;
      const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const angulo = reduzido ? 0 : tempo * .0007;
      const centroX = pet.left - area.left + pet.width / 2;
      const centroY = pet.top - area.top + pet.height * .34;
      mover(centroX + Math.cos(angulo) * pet.width * .57 - passarinho.offsetWidth / 2,
        centroY + Math.sin(angulo) * 18 - passarinho.offsetHeight / 2, false);
      passarinho.style.zIndex = Math.sin(angulo) < 0 ? '2' : '12';
    }
    function posicionar() {
      if (arraste) return;
      if (posicao) {
        const maximo = limites();
        mover(posicao.x * maximo.x, posicao.y * maximo.y);
      } else {
        posicionarOrbita(performance.now());
        if (passarinho.dataset.miniPet !== 'passarinho') {
          const area = app.getBoundingClientRect();
          const pet = palco.getBoundingClientRect();
          mover(pet.right - area.left - passarinho.offsetWidth * .55, pet.top - area.top + pet.height * .18, false);
        }
      }
    }
    function guardar() {
      try { localStorage.setItem(storageKey, JSON.stringify(posicao)); } catch (_) { /* Sem armazenamento, mantém a posição durante a sessão. */ }
    }

    function mostrarNotasPassarinho(){
      const area=app.getBoundingClientRect();
      const centro=passarinho.getBoundingClientRect();
      ['♪','♫','♬'].forEach((nota,i)=>{
        const el=document.createElement('span');
        el.className='nota-passaro';
        el.textContent=nota;
        el.setAttribute('aria-hidden','true');
        el.style.left=`${centro.left-area.left+centro.width/2+(i-1)*16}px`;
        el.style.top=`${centro.top-area.top+(i%2)*7-10}px`;
        el.style.setProperty('--nota-desvio',`${(i-1)*20}px`);
        el.style.animationDelay=`${i*75}ms`;
        el.addEventListener('animationend',()=>el.remove(),{once:true});
        app.appendChild(el);
      });
    }

    passarinho.addEventListener('pointerdown', evento => {
      if (evento.pointerType === 'mouse' && evento.button !== 0) return;
      evento.preventDefault();
      const area = passarinho.getBoundingClientRect();
      arraste = { id: evento.pointerId, offsetX: evento.clientX - area.left, offsetY: evento.clientY - area.top, inicioX: evento.clientX, inicioY: evento.clientY, moveu: false };
      passarinho.setPointerCapture(evento.pointerId);
      passarinho.classList.add('arrastando');
    });
    passarinho.addEventListener('pointermove', evento => {
      if (!arraste || evento.pointerId !== arraste.id) return;
      if (Math.hypot(evento.clientX - arraste.inicioX, evento.clientY - arraste.inicioY) < 6 && !arraste.moveu) return;
      arraste.moveu = true;
      const area = app.getBoundingClientRect();
      mover(evento.clientX - area.left - arraste.offsetX, evento.clientY - area.top - arraste.offsetY);
    });
    function terminarArraste(evento) {
      if (!arraste || evento.pointerId !== arraste.id) return;
      const moveu = arraste.moveu;
      arraste = null;
      passarinho.classList.remove('arrastando');
      if (moveu) guardar();
      else if (evento.type==='pointerup' && passarinho.dataset.miniPet === 'passarinho') {
        mostrarNotasPassarinho();
        posicao = null;
        try { localStorage.removeItem(storageKey); } catch (_) { /* Sem armazenamento, continua orbitando. */ }
      }
    }
    passarinho.addEventListener('pointerup', terminarArraste);
    passarinho.addEventListener('pointercancel', terminarArraste);
    passarinho.addEventListener('lostpointercapture', terminarArraste);
    passarinho.addEventListener('keydown', evento => {
      if ((evento.key==='Enter'||evento.key===' ') && passarinho.dataset.miniPet==='passarinho'){
        evento.preventDefault();
        mostrarNotasPassarinho();
        posicao=null;
        try { localStorage.removeItem(storageKey); } catch (_) {}
        return;
      }
      const direcoes = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
      const passo = direcoes[evento.key];
      if (!passo) return;
      evento.preventDefault();
      mover(passarinho.offsetLeft + passo[0], passarinho.offsetTop + passo[1]);
      guardar();
    });
    window.addEventListener('resize', posicionar);
    posicionar();
    let ultimoFrame = 0;
    function animar(tempo) {
      if (!posicao && tempo - ultimoFrame > 32) {
        ultimoFrame = tempo;
        posicionarOrbita(tempo);
      }
      requestAnimationFrame(animar);
    }
    requestAnimationFrame(animar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarPassarinho, { once: true });
  else iniciarPassarinho();
})();
