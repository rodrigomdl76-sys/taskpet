(() => {
  const storageKey = 'rotinapet_passarinho_posicao_v1';

  function iniciarPassarinho() {
    const app = document.querySelector('.app');
    const palco = document.querySelector('.pet-stage');
    const passarinho = document.getElementById('pet-companheiro');
    if (!app || !palco || !passarinho) return;

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
    function mover(x, y) {
      const maximo = limites();
      const esquerda = Math.min(maximo.x, Math.max(0, x));
      const topo = Math.min(maximo.y, Math.max(0, y));
      passarinho.style.left = `${esquerda}px`;
      passarinho.style.top = `${topo}px`;
      posicao = { x: maximo.x ? esquerda / maximo.x : 0, y: maximo.y ? topo / maximo.y : 0 };
    }
    function posicionar() {
      if (arraste) return;
      if (posicao) {
        const maximo = limites();
        mover(posicao.x * maximo.x, posicao.y * maximo.y);
      } else {
        const area = app.getBoundingClientRect();
        const pet = palco.getBoundingClientRect();
        mover(pet.right - area.left - passarinho.offsetWidth * .55, pet.top - area.top + pet.height * .18);
      }
    }
    function guardar() {
      try { localStorage.setItem(storageKey, JSON.stringify(posicao)); } catch (_) { /* Sem armazenamento, mantém a posição durante a sessão. */ }
    }

    passarinho.addEventListener('pointerdown', evento => {
      if (evento.pointerType === 'mouse' && evento.button !== 0) return;
      evento.preventDefault();
      const area = passarinho.getBoundingClientRect();
      arraste = { id: evento.pointerId, offsetX: evento.clientX - area.left, offsetY: evento.clientY - area.top };
      passarinho.setPointerCapture(evento.pointerId);
      passarinho.classList.add('arrastando');
    });
    passarinho.addEventListener('pointermove', evento => {
      if (!arraste || evento.pointerId !== arraste.id) return;
      const area = app.getBoundingClientRect();
      mover(evento.clientX - area.left - arraste.offsetX, evento.clientY - area.top - arraste.offsetY);
    });
    function terminarArraste(evento) {
      if (!arraste || evento.pointerId !== arraste.id) return;
      arraste = null;
      passarinho.classList.remove('arrastando');
      guardar();
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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarPassarinho, { once: true });
  else iniciarPassarinho();
})();
