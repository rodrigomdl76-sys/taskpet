/* Ateliê do Pet — personalização persistente do pet, falas, toques e cenário. */
(() => {
  'use strict';

  const catalogo = [
    {id:'oculos-sol',aba:'pet',slot:'pet:eyes',nome:'Óculos de sol',emoji:'🕶️',preco:55,desc:'Um visual descolado para qualquer aventura.'},
    {id:'coroa',aba:'pet',slot:'pet:crown',nome:'Coroinha',emoji:'👑',preco:55,desc:'Um toque de realeza no topo da cabeça.'},
    {id:'laco',aba:'pet',slot:'pet:neck',nome:'Laço colorido',emoji:'🎀',preco:40,desc:'Um acessório fofo para o pescoço.'},
    {id:'fala-quadrinhos',aba:'falas',slot:'fala:balao',nome:'Balão de quadrinhos',emoji:'💬',preco:25,desc:'Contorno marcante e jeitinho de gibi.'},
    {id:'fala-nuvem',aba:'falas',slot:'fala:balao',nome:'Balão de nuvem',emoji:'☁️',preco:30,desc:'Uma nuvem suave para as conversas.'},
    {id:'toque-estrelas',aba:'toques',slot:'toque:efeito',nome:'Estrelinhas',emoji:'✨',preco:35,desc:'Estrelas aparecem quando você dá carinho.'},
    {id:'toque-bolhas',aba:'toques',slot:'toque:efeito',nome:'Bolhas de sabão',emoji:'🫧',preco:35,desc:'Bolhinhas coloridas sobem a cada carinho.'},
    {id:'tapete-arcoiris',aba:'cenario',slot:'cenario:chao',nome:'Tapete arco-íris',emoji:'🌈',preco:45,desc:'Um cantinho macio para o pet descansar.'},
    {id:'bola-cenario',aba:'cenario',slot:'cenario:esquerda',nome:'Bola saltitante',emoji:'⚽',preco:25,desc:'Toque na bola para ela dar um pulinho.'},
    {id:'ursinho-cenario',aba:'cenario',slot:'cenario:direita',nome:'Ursinho de pelúcia',emoji:'🧸',preco:35,desc:'Um amiguinho para enfeitar o palco.'},
    {id:'moldura-dourada',aba:'perfil',slot:'perfil:moldura',nome:'Moldura dourada',emoji:'🌟',preco:40,desc:'Um brilho especial no ícone do perfil.'},
    {id:'tiara-flores',aba:'pet',slot:'pet:crown',nome:'Tiara de flores',emoji:'🌼',preco:45,desc:'Flores delicadas para enfeitar a cabeça.'},
    {id:'curativo-estrelas',aba:'pet',slot:'pet:face',nome:'Curativo de estrela',emoji:'🩹',preco:30,desc:'Um adesivo fofo para o rostinho.'},
    {id:'bochechas-rosadas',aba:'pet',slot:'pet:cheeks',nome:'Bochechas rosadas',emoji:'🌸',preco:35,desc:'Um toque corado e divertido no rosto.'},
    {id:'fala-neon',aba:'falas',slot:'fala:balao',nome:'Balão neon',emoji:'💜',preco:40,desc:'Uma borda brilhante para as conversas.'},
    {id:'fala-pixel',aba:'falas',slot:'fala:balao',nome:'Balão gamer',emoji:'👾',preco:40,desc:'Balão em estilo pixel para fãs de jogos.'},
    {id:'fonte-redonda',aba:'falas',slot:'fala:fonte',nome:'Fonte redondinha',emoji:'🔤',preco:30,desc:'Letras suaves e arredondadas nas falas.'},
    {id:'fonte-pixel',aba:'falas',slot:'fala:fonte',nome:'Fonte pixel',emoji:'🕹️',preco:35,desc:'Letras com clima de videogame retrô.'},
    {id:'toque-arcoiris',aba:'toques',slot:'toque:efeito',nome:'Arco-íris',emoji:'🌈',preco:40,desc:'Um arco-íris aparece quando você toca no pet.'},
    {id:'toque-confetes',aba:'toques',slot:'toque:efeito',nome:'Confetes',emoji:'🎊',preco:45,desc:'Uma chuva de confetes acompanha o carinho.'},
    {id:'clima-manha',aba:'cenario',slot:'cenario:clima',nome:'Sol da manhã',emoji:'🌤️',preco:45,desc:'Uma luz dourada e tranquila no palco.'},
    {id:'clima-entardecer',aba:'cenario',slot:'cenario:clima',nome:'Luz de entardecer',emoji:'🌇',preco:45,desc:'Tons quentinhos para o fim do dia.'},
    {id:'clima-vagalumes',aba:'cenario',slot:'cenario:clima',nome:'Vaga-lumes',emoji:'🌟',preco:50,desc:'Pontinhos de luz brilham ao redor do pet.'},
    {id:'clima-neve',aba:'cenario',slot:'cenario:clima',nome:'Neve suave',emoji:'❄️',preco:50,desc:'Flocos leves caem pelo cenário.'},
    {id:'planta-cenario',aba:'cenario',slot:'cenario:centro',nome:'Plantinha',emoji:'🪴',preco:30,desc:'Uma planta alegre para decorar o palco.'},
    {id:'almofada-cenario',aba:'cenario',slot:'cenario:frente',nome:'Almofada macia',emoji:'🛋️',preco:35,desc:'Um lugar fofinho para o pet descansar.'},
    {id:'moldura-prateada',aba:'perfil',slot:'perfil:moldura',nome:'Moldura prateada',emoji:'❄️',preco:40,desc:'Um contorno brilhante em tom prateado.'},
    {id:'moldura-arcoiris',aba:'perfil',slot:'perfil:moldura',nome:'Moldura arco-íris',emoji:'🌈',preco:50,desc:'Cores alegres em volta do ícone do perfil.'}
  ];
  const abas = [
    {id:'pet',emoji:'🐾',nome:'Pet'},
    {id:'falas',emoji:'💬',nome:'Falas'},
    {id:'toques',emoji:'✨',nome:'Toques'},
    {id:'cenario',emoji:'🏡',nome:'Cenário'},
    {id:'perfil',emoji:'🌟',nome:'Perfil'}
  ];
  let abaAtual = 'pet';

  function obterEstado() {
    if (typeof estado !== 'undefined' && estado) return estado;
    return null;
  }
  function personalizacao() {
    const atual = obterEstado();
    if (!atual) return {adquiridos:[], equipados:{}};
    const p = atual.personalizacao || (atual.personalizacao = {});
    if (!Array.isArray(p.adquiridos)) p.adquiridos = [];
    if (!p.equipados || typeof p.equipados !== 'object') p.equipados = {};
    return p;
  }
  function item(id) { return catalogo.find(x => x.id === id); }
  function equip(slot) { return personalizacao().equipados[slot] || ''; }
  window.obterIdlePersonalizadoGato = function() {
    const visual = item(equip('pet:visual'));
    return visual?.idleWebp || '';
  };
  function avisar(msg) {
    if (typeof window.mostrarToast === 'function') window.mostrarToast(msg);
    else if (typeof window.exibirToast === 'function') window.exibirToast(msg);
    else {
      const t = document.getElementById('toast');
      if (t) { t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); }
    }
  }
  function salvarEstado() {
    try {
      const atual = obterEstado();
      if (atual && atual.criancaAtivaId) {
        atual.criancasDados = atual.criancasDados || {};
        const dados = atual.criancasDados[atual.criancaAtivaId] || (atual.criancasDados[atual.criancaAtivaId] = {});
        dados.personalizacao = JSON.parse(JSON.stringify(personalizacao()));
      }
      if (typeof window.salvar === 'function') window.salvar();
    } catch (e) { console.warn('Ateliê: não foi possível salvar agora.', e); }
  }
  function atualizar() {
    renderizar();
    renderizarVisuais();
    try { window.atualizarIdleGatoPersonalizado?.(); } catch (_) {}
    try { if (typeof window.atualizarTela === 'function') window.atualizarTela(); } catch (_) {}
  }
  function abrir() {
    const modal = document.getElementById('modal-atelie-pet');
    if (!modal) return;
    renderizar();
    if (typeof window.abrirModal === 'function') window.abrirModal('modal-atelie-pet');
    else modal.classList.add('aberto');
  }
  window.abrirAteliePet = abrir;
  function criarModal() {
    if (document.getElementById('modal-atelie-pet')) return;
    const el = document.createElement('div');
    el.id = 'modal-atelie-pet';
    el.className = 'modal-overlay';
    el.innerHTML = '<div class="modal atelier-modal" role="dialog" aria-modal="true" aria-labelledby="atelier-title">' +
      '<div class="modal-title"><h3 id="atelier-title">🎨 Ateliê do Pet</h3><button type="button" class="close-btn" data-atelier-close aria-label="Fechar">×</button></div>' +
      '<div class="atelier-intro"><div><strong>Deixe o cantinho com a sua cara!</strong><span>Personalize o pet, as falas e o cenário.</span></div><span class="atelier-balance">🪙 <b data-atelier-balance>0</b></span></div>' +
      '<div class="atelier-tabs" role="tablist" aria-label="Categorias do ateliê"></div><div data-atelier-content></div></div>';
    document.body.appendChild(el);
    el.addEventListener('click', e => {
      if (e.target === el || e.target.closest('[data-atelier-close]')) {
        if (typeof window.fecharModal === 'function') window.fecharModal(el.id);
        else el.classList.remove('aberto');
      }
      const tab = e.target.closest('[data-atelier-tab]');
      if (tab) { abaAtual = tab.dataset.atelierTab; renderizar(); }
      const action = e.target.closest('[data-atelier-action]');
      if (action) executarAcao(action.dataset.atelierAction, action.dataset.itemId);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && el.classList.contains('aberto')) {
        if (typeof window.fecharModal === 'function') window.fecharModal(el.id);
        else el.classList.remove('aberto');
      }
    });
  }
  function renderizar() {
    const el = document.getElementById('modal-atelie-pet');
    if (!el) return;
    const balance = el.querySelector('[data-atelier-balance]');
    if (balance) balance.textContent = String(Math.max(0, Number(obterEstado()?.moedas) || 0));
    el.querySelector('.atelier-tabs').innerHTML = abas.map(a =>
      '<button type="button" class="atelier-tab' + (abaAtual === a.id ? ' ativo' : '') + '" role="tab" aria-selected="' + (abaAtual === a.id) + '" data-atelier-tab="' + a.id + '"><span>' + a.emoji + '</span>' + a.nome + '</button>'
    ).join('');
    const p = personalizacao();
    const lista = catalogo.filter(x => x.aba === abaAtual);
    const cards = lista.map(x => {
      const possui = p.adquiridos.includes(x.id);
      const equipado = p.equipados[x.slot] === x.id;
      const outro = p.equipados[x.slot] && !equipado ? item(p.equipados[x.slot]) : null;
      let botao;
      if (equipado) botao = '<button type="button" class="secundario" data-atelier-action="remove" data-item-id="' + x.id + '">Guardar</button>';
      else if (possui) botao = '<button type="button" data-atelier-action="equip" data-item-id="' + x.id + '">Usar</button>';
      else botao = '<button type="button" data-atelier-action="buy" data-item-id="' + x.id + '">Comprar · ' + x.preco + ' 🪙</button>';
      return '<article class="atelier-card' + (equipado ? ' ativo' : '') + '"><span class="atelier-card-emoji">' + x.emoji + '</span><strong>' + x.nome + (equipado ? ' ✓' : '') + '</strong><small>' + x.desc + (outro ? '<br>Substitui: ' + outro.nome : '') + '</small>' + botao + '</article>';
    }).join('');
    const coleção = p.adquiridos.length + ' de ' + catalogo.length + ' itens';
    el.querySelector('[data-atelier-content]').innerHTML = '<h4 class="atelier-section-title">' + abas.find(a => a.id === abaAtual).emoji + ' ' + abas.find(a => a.id === abaAtual).nome + ' · ' + coleção + '</h4><div class="atelier-items">' + (cards || '<div class="atelier-empty">Novas ideias chegam em breve!</div>') + '</div>';
  }
  function executarAcao(acao, id) {
    const x = item(id);
    if (!x) return;
    const p = personalizacao();
    if (acao === 'buy') {
      const saldo = Math.max(0, Number(obterEstado()?.moedas) || 0);
      if (saldo < x.preco) { avisar('Faltam ' + (x.preco - saldo) + ' PetCoins para esse item.'); return; }
      obterEstado().moedas = saldo - x.preco;
      if (!p.adquiridos.includes(id)) p.adquiridos.push(id);
      p.equipados[x.slot] = id;
      salvarEstado();
      atualizar();
      avisar(x.nome + ' já está com você! ✨');
    } else if (acao === 'equip') {
      if (!p.adquiridos.includes(id)) return;
      p.equipados[x.slot] = id;
      salvarEstado();
      atualizar();
      avisar(x.nome + ' equipado!');
    } else if (acao === 'remove') {
      if (p.equipados[x.slot] === id) delete p.equipados[x.slot];
      salvarEstado();
      atualizar();
      avisar('Item guardado.');
    }
  }

  const posicoes = {
    crown:{top:'12%',left:'50%'}, eyes:{top:'41%',left:'50%'}, neck:{top:'68%',left:'50%'}, face:{top:'55%',left:'63%'}
  };
  function renderizarVisuais() {
    const pet = document.querySelector('.cat-wrapper');
    if (pet) {
      let layer = pet.querySelector('.rp-pet-cosmetic-layer');
      if (!layer) {
        layer = document.createElement('div');
        layer.className = 'rp-pet-cosmetic-layer';
        layer.setAttribute('aria-hidden', 'true');
        pet.appendChild(layer);
      }
      const partes = ['crown','eyes','neck','face'].map(tipo => {
        const x = item(equip('pet:' + tipo));
        if (!x) return '';
        const pos = posicoes[tipo];
        return '<span class="rp-pet-accessory ' + tipo + '" style="top:' + pos.top + ';left:' + pos.left + '">' + x.emoji + '</span>';
      });
      const bochechas = item(equip('pet:cheeks'));
      if (bochechas) {
        partes.push('<span class="rp-pet-accessory cheek left" aria-hidden="true">' + bochechas.emoji + '</span>');
        partes.push('<span class="rp-pet-accessory cheek right" aria-hidden="true">' + bochechas.emoji + '</span>');
      }
      layer.innerHTML = partes.join('');
    }
    const fala = document.getElementById('balao-fala');
    if (fala) {
      ['atelier-bubble-comic','atelier-bubble-cloud','atelier-bubble-neon','atelier-bubble-pixel'].forEach(c => fala.classList.remove(c));
      const skin = equip('fala:balao');
      if (skin === 'fala-quadrinhos') fala.classList.add('atelier-bubble-comic');
      if (skin === 'fala-nuvem') fala.classList.add('atelier-bubble-cloud');
      if (skin === 'fala-neon') fala.classList.add('atelier-bubble-neon');
      if (skin === 'fala-pixel') fala.classList.add('atelier-bubble-pixel');
      fala.classList.toggle('atelier-font-round', equip('fala:fonte') === 'fonte-redonda');
      fala.classList.toggle('atelier-font-pixel', equip('fala:fonte') === 'fonte-pixel');
    }
    const botaoPerfil = document.getElementById('btn-perfil-crianca');
    if (botaoPerfil) {
      ['atelier-frame-gold','atelier-frame-silver','atelier-frame-rainbow'].forEach(c => botaoPerfil.classList.remove(c));
      const moldura = equip('perfil:moldura');
      if (moldura === 'moldura-dourada') botaoPerfil.classList.add('atelier-frame-gold');
      if (moldura === 'moldura-prateada') botaoPerfil.classList.add('atelier-frame-silver');
      if (moldura === 'moldura-arcoiris') botaoPerfil.classList.add('atelier-frame-rainbow');
    }
    renderizarCenario();
  }
  function renderizarCenario() {
    const palco = document.querySelector('.pet-stage');
    if (!palco) return;
    let layer = document.getElementById('atelier-scene-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'atelier-scene-layer';
      layer.setAttribute('aria-label', 'Enfeites do cenário');
      palco.appendChild(layer);
      layer.addEventListener('click', e => {
        const prop = e.target.closest('[data-atelier-prop]');
        if (!prop) return;
        prop.classList.remove('jumpy');
        void prop.offsetWidth;
        prop.classList.add('jumpy');
        const mensagens = {bola:'A bola deu um pulinho! ⚽',ursinho:'O ursinho acenou para você! 🧸',planta:'A plantinha balançou! 🪴',almofada:'Uma almofada bem macia! 🛋️'};
        avisar(mensagens[prop.dataset.atelierProp] || 'Que cantinho aconchegante! ✨');
      });
    }
    const clima = equip('cenario:clima');
    const climas = {'clima-manha':'morning','clima-entardecer':'sunset','clima-vagalumes':'fireflies','clima-neve':'snow'};
    const overlay = climas[clima] ? '<div class="atelier-weather weather-' + climas[clima] + '" aria-hidden="true"></div>' : '';
    const tapete = equip('cenario:chao') === 'tapete-arcoiris' ? '<div class="atelier-rug" aria-hidden="true"></div>' : '';
    const props = [
      ['cenario:esquerda','bola-cenario','ball','⚽','bola','Brincar com a bola'],
      ['cenario:direita','ursinho-cenario','teddy','🧸','ursinho','Brincar com o ursinho'],
      ['cenario:centro','planta-cenario','plant','🪴','planta','Olhar a plantinha'],
      ['cenario:frente','almofada-cenario','pillow','🛋️','almofada','Tocar na almofada']
    ].map(([slot,id,classe,emoji,nome,aria]) => equip(slot) === id
      ? '<button type="button" class="atelier-scene-prop ' + classe + '" data-atelier-prop="' + nome + '" aria-label="' + aria + '">' + emoji + '</button>' : '').join('');
    layer.innerHTML = overlay + tapete + props;
  }
  function mostrarEfeitoToque(tipo) {
    const root = document.getElementById('pet-section-area');
    if (!root) return;
    let fx = root.querySelector('.rp-tap-fx');
    if (!fx) { fx = document.createElement('div'); fx.className = 'rp-tap-fx'; root.appendChild(fx); }
    const efeitos = {
      'toque-bolhas':['🫧','🫧','💙'],
      'toque-arcoiris':['🌈','✨','💖'],
      'toque-confetes':['🎊','🎉','⭐']
    };
    const emoji = efeitos[tipo] || ['✨','⭐','🌟'];
    fx.innerHTML = emoji.map((e,i) => '<i style="--x:' + (35+i*15) + '%;--y:56%;--size:' + (18+i*3) + 'px;--delay:' + (i*.06) + 's;--dx:' + ((i-1)*24) + 'px;--dy:-62px;--rot:' + ((i-1)*24) + 'deg">' + e + '</i>').join('');
    setTimeout(() => { if (fx.isConnected) fx.innerHTML = ''; }, 1200);
  }

  function instalarIntegracoes() {
    if (typeof window.atualizarTela === 'function' && !window.atualizarTela.__atelierWrapped) {
      const originalAtualizar = window.atualizarTela;
      const atualizarComAtelie = function(...args) {
        const resultado = originalAtualizar.apply(this, args);
        renderizarVisuais();
        return resultado;
      };
      atualizarComAtelie.__atelierWrapped = true;
      window.atualizarTela = atualizarComAtelie;
    }
    const hub = document.querySelector('.loja-hub-grid');
    if (hub && !document.getElementById('btn-abrir-atelie')) {
      const btn = document.createElement('button');
      btn.id = 'btn-abrir-atelie';
      btn.type = 'button';
      btn.className = 'loja-hub-card atelier-hub-card';
      btn.setAttribute('onclick', 'abrirAteliePet()');
      btn.innerHTML = '<span>🎨</span><b>Ateliê do Pet</b><small>Acessórios, falas e cenário</small>';
      hub.appendChild(btn);
    }
    if (typeof window.mostrarBalaoFala === 'function' && !window.mostrarBalaoFala.__atelierWrapped) {
      const original = window.mostrarBalaoFala;
      const wrapped = function(...args) {
        const result = original.apply(this, args);
        const fala = document.getElementById('balao-fala');
        if (fala) {
          const humor = String(obterEstado()?.humor || '').toLowerCase();
          const reacao = /feliz|alegr|animad/.test(humor) ? '💖' : /trist|cansad/.test(humor) ? '💤' : '✨';
          fala.setAttribute('data-atelier-reaction', reacao);
          setTimeout(() => fala.removeAttribute('data-atelier-reaction'), Number(args[1]) || 2600);
        }
        renderizarVisuais();
        return result;
      };
      wrapped.__atelierWrapped = true;
      window.mostrarBalaoFala = wrapped;
    }
    if (typeof window.animarPetToque === 'function' && !window.animarPetToque.__atelierWrapped) {
      const original = window.animarPetToque;
      const wrapped = function(event, tipo='carinho') {
        const fx = equip('toque:efeito');
        if (tipo === 'carinho' && fx) {
          const result = original.call(this, event, 'atelier-custom');
          mostrarEfeitoToque(fx);
          return result;
        }
        return original.apply(this, arguments);
      };
      wrapped.__atelierWrapped = true;
      window.animarPetToque = wrapped;
    }
    renderizarVisuais();
  }

  function iniciar() {
    criarModal();
    instalarIntegracoes();
    if (!document.getElementById('btn-abrir-atelie')) {
      const tentar = () => {
        instalarIntegracoes();
        if (!document.getElementById('btn-abrir-atelie')) setTimeout(tentar, 500);
      };
      setTimeout(tentar, 0);
    }
    const observar = new MutationObserver(() => {
      const pet = document.querySelector('.cat-wrapper');
      if (pet && !pet.querySelector('.rp-pet-cosmetic-layer')) renderizarVisuais();
    });
    const palco = document.querySelector('.pet-stage');
    if (palco) observar.observe(palco, {childList:true,subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, {once:true});
  else iniciar();
})();