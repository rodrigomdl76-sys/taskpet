const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizarAviso, tokensDosPais, tokensDaCrianca, dividirEmLotes, familiaValida } = require('../push-logic');
const { createPushHandler } = require('../push-handler');

test('normaliza avisos para responsáveis e crianças', () => {
  assert.equal(normalizarAviso({ title: 'Tarefa', onlyPerfil: 'crianca' }, 'p1'), null);
  const pais = normalizarAviso({ title: '  Aprovar  ', body: ' Arrumar a cama ', onlyPerfil: 'pais', tag: 'aprovacao', url: '/taskpet/' }, 'p1');
  assert.equal(pais.title, 'Aprovar');
  assert.equal(pais.body, 'Arrumar a cama');
  assert.equal(pais.tag, 'aprovacao-p1');
  assert.equal(pais.url, '/taskpet/');
  assert.equal(pais.onlyPerfil, 'pais');
  const crianca = normalizarAviso({ title: 'Missão', onlyPerfil: 'crianca', targetChildId: 'c_abc123' }, 'p2');
  assert.equal(crianca.onlyPerfil, 'crianca');
  assert.equal(crianca.targetChildId, 'c_abc123');
  assert.equal(normalizarAviso({ onlyPerfil: 'crianca', targetChildId: '../outro' }, 'p3'), null);
});

test('limita texto e descarta URL externa ou malformada', () => {
  const aviso = normalizarAviso({ title: 'x'.repeat(200), body: 'ok', onlyPerfil: 'pais', url: '//example.com' }, 'id');
  assert.equal(aviso.title.length, 80);
  assert.equal(aviso.url, './');
});

test('seleciona só tokens de responsáveis e remove duplicados', () => {
  const result = tokensDosPais({
    pai1: { perfil: 'pais', token: 'token-pai' },
    pai2: { perfil: 'pais', token: 'token-pai' },
    filho: { perfil: 'crianca', token: 'token-filho' },
    vazio: { perfil: 'pais', token: '' }
  });
  assert.deepEqual(result, [{ uid: 'pai1', token: 'token-pai' }]);
});

test('seleciona somente o token da criança destinatária', () => {
  const registros = {
    filhoA: { perfil: 'crianca', criancaId: 'c_a', token: 'token-a' },
    filhoA2: { perfil: 'crianca', criancaId: 'c_a', token: 'token-a2' },
    filhoB: { perfil: 'crianca', criancaId: 'c_b', token: 'token-b' },
    semId: { perfil: 'crianca', token: 'token-antigo' },
    pai: { perfil: 'pais', token: 'token-pai' }
  };
  assert.deepEqual(tokensDaCrianca(registros, 'c_a'), [
    { uid: 'filhoA', token: 'token-a' },
    { uid: 'filhoA2', token: 'token-a2' }
  ]);
  assert.deepEqual(tokensDaCrianca(registros, 'c_nao_encontrado'), []);
});

test('divide envios em lotes respeitando o limite pedido', () => {
  assert.deepEqual(dividirEmLotes([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});

test('aceita IDs de famílias legados, incluindo casa_principal e vitor', () => {
  assert.equal(familiaValida('casa_principal'), true);
  assert.equal(familiaValida('vitor'), true);
  assert.equal(familiaValida('a/b'), false);
});

async function executarHandler(aviso, registros) {
  const mensagens = [];
  const atualizacoes = [];
  const handler = createPushHandler({
    database: { ref: () => ({ once: async () => ({ val: () => registros }) }) },
    messaging: { sendEachForMulticast: async mensagem => {
      mensagens.push(mensagem);
      return { successCount: mensagem.tokens.length, failureCount: 0, responses: mensagem.tokens.map(() => ({ success: true })) };
    } },
    logger: { info() {}, warn() {} }
  });
  const snapshot = {
    val: () => aviso,
    ref: { update: async dados => atualizacoes.push(dados) }
  };
  await handler(snapshot, { params: { familyId: 'casa_principal', pushId: 'p1' }, authType: 'USER' });
  return { mensagens, atualizacoes };
}

test('envia payload urgente somente aos tokens dos pais', async () => {
  const { mensagens, atualizacoes } = await executarHandler(
    { title: 'Tarefa para aprovar', body: 'Arrumar a cama', tag: 'rotinapet-aprovacao', onlyPerfil: 'pais', url: '/taskpet/' },
    { pai: { perfil: 'pais', token: 'token-pai' }, crianca: { perfil: 'crianca', criancaId: 'c1', token: 'token-crianca' } }
  );
  assert.deepEqual(mensagens[0].tokens, ['token-pai']);
  assert.equal(mensagens[0].notification, undefined);
  assert.equal(mensagens[0].data.title, 'Tarefa para aprovar');
  assert.equal(mensagens[0].data.tag, 'rotinapet-aprovacao-p1');
  assert.deepEqual(mensagens[0].webpush, { headers: { Urgency: 'high', TTL: '86400' } });
  assert.equal(atualizacoes[0].pushStatus, 'enviado');
});

test('envia aprovação apenas ao aparelho da criança-alvo', async () => {
  const { mensagens, atualizacoes } = await executarHandler(
    { title: 'Missão aprovada', body: 'Boa!', tag: 'rotinapet-aprovacao', onlyPerfil: 'crianca', targetChildId: 'c_a', url: '/taskpet/' },
    {
      pai: { perfil: 'pais', token: 'token-pai' },
      filhaA: { perfil: 'crianca', criancaId: 'c_a', token: 'token-a' },
      filhoB: { perfil: 'crianca', criancaId: 'c_b', token: 'token-b' }
    }
  );
  assert.deepEqual(mensagens[0].tokens, ['token-a']);
  assert.equal(atualizacoes[0].pushStatus, 'enviado');
});

test('registra quando a criança ainda não tem token ativo', async () => {
  const { mensagens, atualizacoes } = await executarHandler(
    { onlyPerfil: 'crianca', targetChildId: 'c_a' },
    { filhaB: { perfil: 'crianca', criancaId: 'c_b', token: 'token-b' } }
  );
  assert.deepEqual(mensagens, []);
  assert.equal(atualizacoes[0].pushStatus, 'sem_token_da_crianca');
});

test('ignora gravações não autenticadas e não envia push', async () => {
  let chamadas = 0;
  const handler = createPushHandler({
    database: { ref: () => { chamadas++; return { once: async () => ({ val: () => ({}) }) }; } },
    messaging: { sendEachForMulticast: async () => { throw new Error('não deve enviar'); } },
    logger: { info() {}, warn() {} }
  });
  await handler({ val: () => ({ onlyPerfil: 'pais' }), ref: { update: async () => {} } }, {
    params: { familyId: 'vitor', pushId: 'p2' }, authType: 'UNAUTHENTICATED'
  });
  assert.equal(chamadas, 0);
});
