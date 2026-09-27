// As compras antigas continuam no estado para compatibilidade, sem sobrepor acessórios aos novos pets.
(() => {
  window.verificarRecompensasMapa = () => false;
  window.abrirMeuPet = () => {
    const nome = estado.petAtual && PETS[estado.petAtual] ? PETS[estado.petAtual].nome : 'Meu Pet';
    const nivel = estado.pets?.[estado.petAtual]?.nivel || 1;
    const aprovadas = (estado.tarefas || []).filter(t => t.status === 'aprovada').length;
    let modal = document.getElementById('modal-meu-pet');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-meu-pet';
      modal.className = 'modal-overlay';
      modal.innerHTML = '<div class="modal meupet-modal"><div class="modal-title"><h3>🐾 Meu Pet</h3><button class="close-btn" onclick="fecharModal(\'modal-meu-pet\')">×</button></div><div id="meupet-conteudo"></div></div>';
      document.body.appendChild(modal);
    }
    document.getElementById('meupet-conteudo').innerHTML = `<div class="meupet-hero"><div class="meupet-avatar">🐾</div><div class="meupet-title">${esc(nome)}</div><div class="meupet-sub">Nível ${nivel} · ${aprovadas} tarefas aprovadas</div></div><button class="primary-btn" style="width:100%;margin-top:10px" onclick="fecharModal('modal-meu-pet');abrirColecao()">Ver evoluções e fundos</button>`;
    abrirModal('modal-meu-pet');
  };
})();
