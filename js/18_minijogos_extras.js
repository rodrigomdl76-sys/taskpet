/* Minijogos adicionais do TaskPet.
 * Mantém a liberação ligada ao envio de uma tarefa e usa a recompensa de PetCoins/XP já existente.
 */
(() => {
  const EXTRAS = ['lanche', 'intruso', 'padrao'];
  const AREAS_BASE = ['area-jogo-matematica', 'area-jogo-memoria', 'area-jogo-reacao', 'area-jogo-estrelas'];
  let sessao = null;

  function idadeJogo() {
    return typeof idadeEfetivaJogos === 'function'
      ? Number(idadeEfetivaJogos()) || 7
      : Number(estado?.idadeCrianca) || 7;
  }

  function embaralhar(lista) {
    const itens = [...lista];
    for (let i = itens.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [itens[i], itens[j]] = [itens[j], itens[i]];
    }
    return itens;
  }

  function garantirArea() {
    let area = document.getElementById('area-jogo-extras');
    if (area) return area;
    const modal = document.querySelector('#modal-desafio .modal');
    if (!modal) return null;
    area = document.createElement('div');
    area.id = 'area-jogo-extras';
    area.className = 'hidden';
    area.setAttribute('aria-live', 'polite');
    modal.appendChild(area);
    return area;
  }

  function esconderAreas() {
    AREAS_BASE.forEach(id => document.getElementById(id)?.classList.add('hidden'));
    garantirArea()?.classList.add('hidden');
  }

  function abrir(tipo) {
    if (typeof jogosLiberadosHoje !== 'function' || !jogosLiberadosHoje()) {
      abrirDesafioOriginal();
      return;
    }
    esconderAreas();
    const area = garantirArea();
    if (!area) {
      abrirDesafioOriginal();
      return;
    }
    sessao = { tipo, concluidos: 0, alvo: 0 };
    const idade = idadeJogo();
    let titulo = '', descricao = '', premio = '', conteudo = '';

    if (tipo === 'lanche') {
      const grade = idade <= 6 ? 12 : idade <= 9 ? 16 : 20;
      const alvo = idade <= 6 ? 4 : idade <= 9 ? 6 : 8;
      const comida = ['🐟','🍓','🧀','🥕'];
      const certa = comida[Math.floor(Math.random() * comida.length)];
      const distratores = ['🧸','🧦','⚽','🪁','🍄','🪨'];
      const cartas = embaralhar([
        ...Array(alvo).fill(certa),
        ...Array(grade - alvo).fill(0).map(() => distratores[Math.floor(Math.random() * distratores.length)])
      ]);
      sessao.alvo = alvo;
      sessao.resposta = certa;
      titulo = '🍽️ Lanche do Pet';
      descricao = `Toque nos ${certa} para preparar o lanche! ${alvo} itens.`;
      premio = '+2 🪙 e +2 XP';
      conteudo = `<div class="rp-mini-grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">${cartas.map((item, i) =>
        `<button type="button" class="rp-mini-choice" data-jogo="lanche" data-item="${item}" aria-label="Item ${i + 1}" style="font-size:27px;min-height:52px">${item}</button>`
      ).join('')}</div><p class="rp-mini-progress" id="rp-mini-progress">0/${alvo} itens</p>`;
    } else if (tipo === 'intruso') {
      const grupos = [
        ['🐱','🐱','🐱','🐱','🐱','🐱','🐶'],
        ['🍎','🍎','🍎','🍎','🍎','🍐','🍎','🍎','🍎'],
        ['🔵','🔵','🟣','🔵','🔵','🔵','🔵','🔵','🔵','🔵','🔵','🔵']
      ];
      const nivel = idade <= 6 ? 0 : idade <= 9 ? 1 : 2;
      const cartas = embaralhar(grupos[nivel]);
      const diferente = nivel === 0 ? '🐶' : nivel === 1 ? '🍐' : '🟣';
      titulo = '🕵️ Ache o Intruso';
      descricao = 'Um item é diferente dos outros. Encontre-o!';
      premio = '+2 🪙 e +2 XP';
      conteudo = `<div class="rp-mini-grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">${cartas.map(item =>
        `<button type="button" class="rp-mini-choice" data-jogo="intruso" data-item="${item}" aria-label="Escolher item" style="font-size:27px;min-height:52px">${item}</button>`
      ).join('')}</div>`;
      sessao.resposta = diferente;
    } else {
      const sequencias = idade <= 6
        ? { itens:['🐾','⭐','🐾','⭐','🐾','?'], certa:'🐾', opcoes:['🐾','⭐','❤️'] }
        : idade <= 9
          ? { itens:['🍎','🍌','🍌','🍎','🍌','🍌','?'], certa:'🍎', opcoes:['🍎','🍌','🍇'] }
          : { itens:['🔵','🔵','🟡','🔵','🔵','🟡','🔵','🔵','?'], certa:'🟡', opcoes:['🔵','🟡','🟣'] };
      titulo = '✨ Padrão Mágico';
      descricao = 'Observe a ordem e escolha o próximo símbolo.';
      premio = '+2 🪙 e +2 XP';
      conteudo = `<div class="rp-mini-sequence">${sequencias.itens.map(item =>
        `<span>${item}</span>`
      ).join('')}</div><div class="rp-mini-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${sequencias.opcoes.map(item =>
        `<button type="button" class="rp-mini-choice" data-jogo="padrao" data-item="${item}" aria-label="Escolher ${item}" style="font-size:27px;min-height:52px">${item}</button>`
      ).join('')}</div>`;
      sessao.resposta = sequencias.certa;
    }

    document.getElementById('titulo-desafio').textContent = titulo;
    document.getElementById('desc-desafio').textContent = `${descricao} ${premio}`;
    area.innerHTML = `<style>
      .rp-mini-grid{display:grid;gap:8px;margin:10px 0}
      .rp-mini-choice{border:1px solid #cbd5e1;border-radius:14px;background:#fff;color:#1e293b;box-shadow:0 3px 8px #0f172a12;cursor:pointer;font-weight:900;touch-action:manipulation}
      .rp-mini-choice:active{transform:scale(.95)}
      .rp-mini-choice.acertou{background:#dcfce7;border-color:#22c55e}
      .rp-mini-choice.errou{background:#fee2e2;border-color:#ef4444}
      .rp-mini-sequence{display:flex;justify-content:center;gap:5px;flex-wrap:wrap;margin:16px 0}
      .rp-mini-sequence span{display:grid;place-items:center;min-width:37px;height:40px;border-radius:12px;background:#f1f5f9;font-size:21px;font-weight:900;color:#1e293b}
      .rp-mini-progress{text-align:center;font-size:10px;font-weight:900;color:#475569;margin:8px 0}
    </style>${conteudo}`;
    area.classList.remove('hidden');
    area.onclick = tratarEscolha;
    abrirModal('modal-desafio');
  }

  function tratarEscolha(event) {
    const botao = event.target.closest('button[data-jogo]');
    if (!botao || !sessao || botao.disabled) return;
    const item = botao.dataset.item;

    if (sessao.tipo === 'lanche') {
      if (item === sessao.resposta) {
        botao.classList.add('acertou');
        botao.disabled = true;
        sessao.concluidos++;
        const progresso = document.getElementById('rp-mini-progress');
        if (progresso) progresso.textContent = `${sessao.concluidos}/${sessao.alvo} itens`;
        if (sessao.concluidos >= sessao.alvo) concluir('Lanche preparado!');
      } else {
        botao.classList.add('errou');
        setTimeout(() => botao.classList.remove('errou'), 350);
        mostrarToast('Esse não é o petisco! Tente outro.');
      }
      return;
    }

    if (item === sessao.resposta) {
      botao.classList.add('acertou');
      document.querySelectorAll('#area-jogo-extras [data-jogo]').forEach(el => el.disabled = true);
      concluir(sessao.tipo === 'intruso' ? 'Intruso encontrado!' : 'Padrão completo!');
    } else {
      botao.classList.add('errou');
      setTimeout(() => botao.classList.remove('errou'), 350);
      mostrarToast(sessao.tipo === 'intruso' ? 'Ainda não! Procure o diferente.' : 'Quase! Observe o padrão mais uma vez.');
    }
  }

  function concluir(mensagem) {
    sessao = null;
    fecharModal('modal-desafio');
    if (typeof recompensarMiniJogo === 'function') recompensarMiniJogo(2, 2, mensagem);
    else mostrarToast(`🎉 ${mensagem} +2 🪙 +2 XP`);
    document.getElementById('area-jogo-extras')?.classList.add('hidden');
  }

  const abrirDesafioOriginal = window.abrirDesafio;
  if (typeof abrirDesafioOriginal !== 'function') return;

  window.abrirDesafio = function() {
    esconderAreas();
    if (typeof jogosLiberadosHoje !== 'function' || !jogosLiberadosHoje()) {
      abrirDesafioOriginal();
      return;
    }
    const todas = ['base','base','base','base', ...EXTRAS];
    const escolha = todas[Math.floor(Math.random() * todas.length)];
    if (escolha === 'base') abrirDesafioOriginal();
    else abrir(escolha);
  };
})();

