(() => {
  const storageKey = 'rotinapet_passarinho_posicao_v1';
  const miniPets = [
    { id: 'passarinho', nome: 'Passarinho', preco: 0, descricao: 'Seu primeiro amigo voador.' },
    { id: 'abelha', nome: 'Abelha', preco: 25, conquista: 'natureza', descricao: 'Ganhe com o emblema Guardião da Natureza.' },
    { id: 'drone', nome: 'Drone', preco: 45, conquista: 'mestreMath', descricao: 'Ganhe com a conquista Gênio da Matemática.' },
    { id: 'disco', nome: 'Disco voador', preco: 60, conquista: 'streak7', descricao: 'Ganhe com 7 dias de ofensiva.' },
    { id: 'balao', nome: 'Balão', preco: 20, conquista: 'primeira', descricao: 'Ganhe após a primeira tarefa aprovada.' }
  ];
  const desenhos = {
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
    botao.setAttribute('aria-label', `${item.nome} companheiro. Arraste para mudar de lugar; use as setas do teclado para mover.`);
    botao.title = `Arraste: ${item.nome}`;
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
      preco.textContent = estado.miniPetAtivo === item.id ? '✓ Em uso' : liberado(item) ? 'Usar' : `${item.preco} 🪙 ou conquiste`;
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
      else if (passarinho.dataset.miniPet === 'passarinho') {
        posicao = null;
        try { localStorage.removeItem(storageKey); } catch (_) { /* Sem armazenamento, continua orbitando. */ }
      }
    }
    passarinho.addEventListener('pointerup', terminarArraste);
    passarinho.addEventListener('pointercancel', terminarArraste);
    passarinho.addEventListener('lostpointercapture', terminarArraste);
    passarinho.addEventListener('keydown', evento => {
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
