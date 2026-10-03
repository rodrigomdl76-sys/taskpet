const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizarAviso, tokensDosPais, dividirEmLotes, familiaValida } = require('../push-logic');
const { createPushHandler } = require('../push-handler');

test('só prepara avisos destinados aos responsáveis', () => {
  assert.equal(normalizarAviso({ title: 'Tarefa', onlyPerfil: 'crianca' }, 'p1'), null);
  const aviso = normalizarAviso({ title: '  Aprovar  ', body: ' Arrumar a cama ', onlyPerfil: 'pais', tag: 'aprovacao', url: '/taskpet/' }, 'p1');
  assert.deepEqual(aviso, {
    title: 'Aprovar',
    body: 'Arrumar a cama',
    tag: 'aprovacao-p1',
    url: '/taskpet/'
  });
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

test('divide envios em lotes respeitando o limite pedido', () => {
  assert.deepEqual(dividirEmLotes([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});

test('aceita IDs de famílias legados, incluindo casa_principal e vitor', () => {
  assert.equal(familiaValida('casa_principal'), true);
  assert.equal(familiaValida('vitor'), true);
  assert.equal(familiaValida('a/b'), false);
});

test('envia payload de dados somente aos tokens dos pais e grava o resultado', async () => {
  const enviados = [];
  const atualizacoes = [];
  const mensagens = [];
  const logs = [];
  const registros = {
    pai: { perfil: 'pais', token: 'token-pai' },
    crianca: { perfil: 'crianca', token: 'token-crianca' }
  };
  const handler = createPushHandler({
    database: { ref: path => ({ once: async () => ({ val: () => { enviados.push(path); return registros; } }) }) },
    messaging: { sendEachForMulticast: async mensagem => {
      mensagens.push(mensagem);
      return { successCount: 1, failureCount: 0, responses: [{ success: true }] };
    } },
    logger: { info: (...args) => logs.push(args), warn: (...args) => logs.push(args) }
  });
  const snapshot = {
    val: () => ({ title: 'Tarefa para aprovar', body: 'Arrumar a cama', tag: 'rotinapet-aprovacao', onlyPerfil: 'pais', url: '/taskpet/' }),
    ref: { update: async dados => atualizacoes.push(dados) }
  };
  await handler(snapshot, { params: { familyId: 'casa_principal', pushId: 'p1' }, authType: 'USER' });
  assert.deepEqual(enviados, ['rotinapet/familias/casa_principal/fcmTokens']);
  assert.deepEqual(mensagens[0].tokens, ['token-pai']);
  assert.equal(mensagens[0].notification, undefined);
  assert.deepEqual(mensagens[0].data, {
    title: 'Tarefa para aprovar', body: 'Arrumar a cama', tag: 'rotinapet-aprovacao-p1', url: '/taskpet/'
  });
  assert.equal(atualizacoes[0].pushStatus, 'enviado');
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
