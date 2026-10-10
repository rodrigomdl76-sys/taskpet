// As compras antigas continuam no estado para compatibilidade, sem sobrepor acessórios aos novos pets.
(() => {
  window.salvarNomePet = () => {
    if(perfilAtivo!=='crianca')return;
    const input=document.getElementById('input-nome-pet');
    const nome=input?.value.trim().replace(/\s+/g,' ').slice(0,18);
    if(!nome){mostrarToast('Digite um nome para o pet.');return}
    estado.nomePet=nome;
    salvar();
    atualizarTela();
    window.abrirMeuPet();
    mostrarToast('🐾 Nome do pet salvo!');
  };
  window.abrirMeuPet = () => {
    const nome = estado.nomePet || 'Pipoca';
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
    document.getElementById('meupet-conteudo').innerHTML = `<div class="meupet-hero"><div class="meupet-avatar">🐾</div><div class="meupet-title">${esc(nome)}</div><div class="meupet-sub">Nível ${nivel} · ${aprovadas} tarefas aprovadas</div></div>${perfilAtivo==='crianca'?'<label class="field-label" for="input-nome-pet" style="display:block;margin-top:12px">Dê um nome ao seu pet</label><div style="display:flex;gap:6px"><input class="field" id="input-nome-pet" maxlength="18" autocomplete="off" placeholder="Nome do pet"><button type="button" class="primary-btn" onclick="salvarNomePet()">Salvar</button></div>':''}<button class="primary-btn" style="width:100%;margin-top:10px" onclick="fecharModal('modal-meu-pet');abrirColecao()">Ver evoluções e fundos</button>`;
    window.verificarMarcosGestos?.();
    window.renderizarGestosMeuPet?.(document.getElementById('meupet-conteudo'));
    const input=document.getElementById('input-nome-pet');if(input)input.value=nome;
    abrirModal('modal-meu-pet');
  };
})();
