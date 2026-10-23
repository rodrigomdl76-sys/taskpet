'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createWalletOperationHandlers } = require('../wallet-operations');
const FAMILY = 'familia_1';
const CHILD = 'crianca_1';
const BASE = `rotinapet/familias/${FAMILY}`;

function setup({ coins = 100, inventory = {}, state = {}, random = () => 0.5, wallet = null } = {}) {
  const store = { rotinapet: { familias: { [FAMILY]: {
    estado: { criancaAtivaId: CHILD, moedas: coins, criancas: { [CHILD]: { nome: 'Ana' } }, criancasDados: { [CHILD]: { moedas: coins, ...inventory } }, ...state },
    ...(wallet ? { security: { wallets: { [CHILD]: wallet } } } : {})
  } } } };
  const copy = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const read = path => path.split('/').filter(Boolean).reduce((value, key) => value?.[key], store);
  const write = (path, value) => {
    const keys = path.split('/').filter(Boolean); const leaf = keys.pop();
    const parent = keys.reduce((value, key) => (value[key] ||= {}), store);
    if (value === null) delete parent[leaf]; else parent[leaf] = copy(value);
  };
  const ref = path => ({
    once: async () => ({ val: () => copy(read(path) ?? null) }),
    transaction: async updater => {
      const current = copy(read(path) ?? null); const next = updater(current);
      if (next === undefined) return { committed: false, snapshot: { val: () => copy(current) } };
      write(path, next); return { committed: true, snapshot: { val: () => copy(next) } };
    },
    update: async updates => Object.entries(updates).forEach(([key, value]) => write(path ? `${path}/${key}` : key, value))
  });
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const handlers = createWalletOperationHandlers({ database: { ref }, HttpsError, now: () => 5000, random, today: () => '2026-10-23' });
  const child = { auth: { uid: 'child-device', token: { familyId: FAMILY, familyRole: 'child', childScope: { [CHILD]: true } } } };
  const parent = { auth: { uid: 'parent-device', token: { familyId: FAMILY, familyRole: 'parent' } } };
  return { handlers, read, child, parent };
}

test('compra usa o preço do servidor e é idempotente', async () => {
  const { handlers, child, read } = setup();
  const args = { action: 'purchase', childId: CHILD, category: 'minipet', itemId: 'sapo', price: 0 };
  const first = await handlers.operar(args, child);
  const retry = await handlers.operar(args, child);
  assert.equal(first.price, 80);
  assert.equal(first.petCoins, 20);
  assert.equal(retry.alreadyOwned, true);
  assert.equal(retry.petCoins, 20);
  assert.deepEqual(read(`${BASE}/estado/criancasDados/${CHILD}/miniPetsComprados`), ['sapo']);
  assert.equal(read(`${BASE}/estado/moedas`), 20);
});

test('itens legados não são cobrados novamente', async () => {
  const { handlers, child, read } = setup({ inventory: { gestosDesbloqueados: ['pulinho'] } });
  const result = await handlers.operar({ action: 'purchase', childId: CHILD, category: 'gesto', itemId: 'pulinho' }, child);
  assert.equal(result.alreadyOwned, true);
  assert.equal(read(`${BASE}/estado/moedas`), 100);
});

test('recompensa do minijogo é definida no servidor e só paga uma vez por dia', async () => {
  const { handlers, child, read } = setup({ coins: 5 });
  const args = { action: 'game-reward', childId: CHILD, gameId: 'estrelas', reward: 99999, coins: 99999 };
  const first = await handlers.operar(args, child);
  const retry = await handlers.operar(args, child);
  assert.equal(first.reward, 3);
  assert.equal(first.petCoins, 8);
  assert.equal(retry.alreadyClaimed, true);
  assert.equal(retry.petCoins, 8);
  assert.equal(read(`${BASE}/estado/moedas`), 8);
});

test('rejeita perfil fora do escopo e produto fora do catálogo', async () => {
  const { handlers, child } = setup();
  await assert.rejects(handlers.operar({ action: 'purchase', childId: 'outro', category: 'minipet', itemId: 'sapo' }, child), { code: 'permission-denied' });
  await assert.rejects(handlers.operar({ action: 'purchase', childId: CHILD, category: 'minipet', itemId: 'item-inventado' }, child), { code: 'invalid-argument' });
});

test('rejeita compra quando a carteira não tem saldo suficiente', async () => {
  const { handlers, child } = setup({ coins: 1 });
  await assert.rejects(handlers.operar({ action: 'purchase', childId: CHILD, category: 'atelier', itemId: 'visual-ovo-gato-samurai' }, child), { code: 'failed-precondition' });
});


test('desafio diário usa valor do servidor e só pode ser resgatado uma vez', async () => {
  const { handlers, child, read } = setup({ coins: 2 });
  const args = { action: 'claim-reward', childId: CHILD, rewardId: 'daily-challenge', coins: 999999, xp: 999999 };
  const first = await handlers.operar(args, child);
  const retry = await handlers.operar(args, child);
  assert.equal(first.reward, 10);
  assert.equal(first.xp, 20);
  assert.equal(first.petCoins, 12);
  assert.equal(retry.alreadyClaimed, true);
  assert.equal(read(`${BASE}/estado/moedas`), 12);
});

test('bônus sazonal valida o evento ativo no servidor', async () => {
  const { handlers, child } = setup({ coins: 0 });
  const reward = await handlers.operar({ action: 'claim-reward', childId: CHILD, rewardId: 'seasonal-event', reference: 'halloween' }, child);
  assert.equal(reward.reward, 5);
  assert.equal(reward.xp, 8);
  await assert.rejects(handlers.operar({ action: 'claim-reward', childId: CHILD, rewardId: 'seasonal-event', reference: 'carnaval' }, child), { code: 'invalid-argument' });
});

test('baú diário verifica elegibilidade e mantém o resultado fixo ao repetir', async () => {
  const { handlers, child, read } = setup({ coins: 0, random: () => 0.5, state: { tarefasHojeCount: 1 } });
  const args = { action: 'claim-reward', childId: CHILD, rewardId: 'daily-chest' };
  const first = await handlers.operar(args, child);
  const retry = await handlers.operar(args, child);
  assert.equal(first.outcome, 'coins');
  assert.equal(first.reward, 12);
  assert.equal(retry.alreadyClaimed, true);
  assert.equal(read(`${BASE}/estado/moedas`), 12);
});

test('baú semanal exige marco de ofensiva atual e paga uma vez por marco', async () => {
  const { handlers, child, read } = setup({ coins: 0, state: { streak: 14 } });
  const args = { action: 'claim-reward', childId: CHILD, rewardId: 'weekly-chest', reference: 14 };
  const first = await handlers.operar(args, child);
  const retry = await handlers.operar(args, child);
  assert.equal(first.reward, 23);
  assert.equal(first.xp, 50);
  assert.equal(retry.alreadyClaimed, true);
  await assert.rejects(handlers.operar({ ...args, reference: 15 }, child), { code: 'failed-precondition' });
  assert.equal(read(`${BASE}/estado/moedas`), 23);
});

test('prêmio de conquista usa o catálogo fixo e não aceita valor do cliente', async () => {
  const { handlers, child, read } = setup({ coins: 0 });
  const args = { action: 'claim-reward', childId: CHILD, rewardId: 'achievement', reference: 'primeira', reward: 999999 };
  const first = await handlers.operar(args, child);
  const retry = await handlers.operar(args, child);
  assert.equal(first.reward, 10);
  assert.equal(first.xp, 30);
  assert.equal(retry.alreadyClaimed, true);
  assert.equal(read(`${BASE}/estado/moedas`), 10);
});

test('baú da família não libera antes do marco', async () => {
  const { handlers, child } = setup({ state: { streak: 4 } });
  await assert.rejects(handlers.operar({ action: 'claim-reward', childId: CHILD, rewardId: 'family-chest', reference: 5 }, child), { code: 'failed-precondition' });
});


test('aprovação de resgate debita no servidor uma única vez e marca o pedido', async () => {
  const request = { id: 77, texto: 'Passeio', custo: 30, status: 'pendente', tipo: 'sonho', sonhoId: 9 };
  const dream = { id: 9, texto: 'Passeio', custo: 30, status: 'precificado' };
  const { handlers, parent, read } = setup({ coins: 50, state: { solicitacoesPremios: [request], sonhos: [dream] } });
  const args = { action: 'approve-redemption', childId: CHILD, requestId: '77', cost: 0 };
  const first = await handlers.operar(args, parent);
  const retry = await handlers.operar(args, parent);
  assert.equal(first.cost, 30);
  assert.equal(first.petCoins, 20);
  assert.equal(retry.alreadyRedeemed, true);
  assert.equal(retry.petCoins, 20);
  assert.equal(read(`${BASE}/estado/moedas`), 20);
  assert.equal(read(`${BASE}/estado/solicitacoesPremios/0/status`), 'aprovado');
  assert.equal(read(`${BASE}/estado/sonhos/0/status`), 'realizado');
});

test('criança não pode aprovar resgates e pedido recusado não debita', async () => {
  const request = { id: 77, texto: 'Passeio', custo: 30, status: 'recusado' };
  const { handlers, child, parent, read } = setup({ coins: 50, state: { solicitacoesPremios: [request] } });
  await assert.rejects(handlers.operar({ action: 'approve-redemption', childId: CHILD, requestId: '77' }, child), { code: 'permission-denied' });
  await assert.rejects(handlers.operar({ action: 'approve-redemption', childId: CHILD, requestId: '77' }, parent), { code: 'failed-precondition' });
  assert.equal(read(`${BASE}/estado/moedas`), 50);
});


test('primeira operação migra saldo legado para carteira já criada pela aprovação de tarefa', async () => {
  const { handlers, child, read } = setup({ coins: 73, wallet: { petCoins: 40, cashBalance: 0.4, payments: { task_1: { amount: 40 } } } });
  const result = await handlers.operar({ action: 'game-reward', childId: CHILD, gameId: 'matematica' }, child);
  assert.equal(result.petCoins, 74);
  assert.equal(read(`${BASE}/security/wallets/${CHILD}`).walletOperationsVersion, 1);
  assert.equal(read(`${BASE}/estado/moedas`), 74);
});

test('conquista já marcada no perfil legado não recebe prêmio duplicado', async () => {
  const { handlers, child, read } = setup({ coins: 25, state: { conquistas: { primeira: true } } });
  const result = await handlers.operar({ action: 'claim-reward', childId: CHILD, rewardId: 'achievement', reference: 'primeira' }, child);
  assert.equal(result.alreadyClaimed, true);
  assert.equal(result.petCoins, 25);
  assert.equal(read(`${BASE}/estado/moedas`), 25);
});


test('baú pendente de outro dia pode ser resgatado e prêmio antigo não duplica', async () => {
  const { handlers, child, read } = setup({ coins: 0, random: () => 0.5, state: { avisosRecompensas: [{ tipo: 'bau', data: '2026-10-22' }] } });
  const args = { action: 'claim-reward', childId: CHILD, rewardId: 'daily-chest', reference: '2026-10-22' };
  const result = await handlers.operar(args, child);
  assert.equal(result.reward, 12);
  await assert.rejects(handlers.operar({ ...args, reference: '2026-10-21' }, child), { code: 'failed-precondition' });
  assert.equal(read(`${BASE}/estado/moedas`), 12);
});

test('baú diário já marcado no perfil antigo não paga novamente', async () => {
  const { handlers, child, read } = setup({ coins: 9, state: { tarefasHojeCount: 1, bauDiarioAbertoData: '2026-10-23' } });
  const result = await handlers.operar({ action: 'claim-reward', childId: CHILD, rewardId: 'daily-chest', reference: '2026-10-23' }, child);
  assert.equal(result.alreadyClaimed, true);
  assert.equal(result.petCoins, 9);
  assert.equal(read(`${BASE}/estado/moedas`), 9);
});
