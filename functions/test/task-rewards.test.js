'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createTaskRewardHandlers } = require('../task-rewards');

const TODAY = '2026-10-23';
const FAMILY = 'casa_principal';
const CHILD = 'c1';
const TASK = 'tarefa-1';
const BASE = `rotinapet/familias/${FAMILY}`;

function copy(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }

function setup({ task, state = {} } = {}) {
  const store = { rotinapet: { familias: { [FAMILY]: {
    estado: { criancaAtivaId: CHILD, taxaCambio: 0.01, criancas: { c1: { nome: 'Ana' } }, criancasDados: { c1: { moedas: 10, dinheiroAcumulado: 0, mesadaAtiva: true } }, ...state },
    filhos: { [CHILD]: { tarefas: { [TASK]: task || { id: TASK, status: 'aguardando_aprovacao', recompensa: 8, xp: 20, registros: { [TODAY]: { status: 'aguardando_aprovacao' } } } } } }
  } } } };
  const read = path => path.split('/').filter(Boolean).reduce((value, key) => value?.[key], store);
  const write = (path, value) => {
    const keys = path.split('/').filter(Boolean);
    const leaf = keys.pop();
    const parent = keys.reduce((value, key) => (value[key] ||= {}), store);
    if (value === null) delete parent[leaf]; else parent[leaf] = copy(value);
  };
  const ref = path => ({
    once: async () => ({ val: () => copy(read(path) ?? null) }),
    transaction: async updater => {
      const current = copy(read(path) ?? null);
      const next = updater(current);
      if (next === undefined) return { committed: false, snapshot: { val: () => copy(current) } };
      write(path, next);
      return { committed: true, snapshot: { val: () => copy(next) } };
    },
    update: async updates => Object.entries(updates).forEach(([key, value]) => write(path ? `${path}/${key}` : key, value))
  });
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const handlers = createTaskRewardHandlers({ database: { ref }, HttpsError, now: () => 5000, today: () => TODAY });
  const parent = { auth: { uid: 'parentUid', token: { familyId: FAMILY, familyRole: 'parent' } } };
  return { handlers, parent, read };
}

test('aprovação credita moedas e mesada uma única vez, mesmo com repetição da chamada', async () => {
  const { handlers, parent, read } = setup();
  const args = { childId: CHILD, taskId: TASK, day: TODAY };
  const first = await handlers.aprovarTarefa(args, parent);
  const retry = await handlers.aprovarTarefa(args, parent);

  assert.equal(first.petCoins, 18);
  assert.equal(first.cashBalance, 0.08);
  assert.equal(retry.petCoins, 18);
  assert.equal(retry.paymentId, first.paymentId);
  assert.equal(read(`${BASE}/security/wallets/${CHILD}`).payments[first.paymentId].amount, 8);
  assert.equal(read(`${BASE}/estado/criancasDados/${CHILD}/moedas`), 18);
  assert.equal(read(`${BASE}/estado/moedas`), 18);
  assert.equal(read(`${BASE}/filhos/${CHILD}/tarefas/${TASK}`).registros[TODAY].status, 'aprovada');
});

test('não aprova quando a sessão não é de responsável', async () => {
  const { handlers } = setup();
  await assert.rejects(
    handlers.aprovarTarefa({ childId: CHILD, taskId: TASK, day: TODAY }, { auth: { uid: 'kid', token: { familyId: FAMILY, familyRole: 'child' } } }),
    { code: 'permission-denied' }
  );
});

test('não paga tarefa fora do dia atual nem tarefa que não está aguardando aprovação', async () => {
  const { handlers, parent } = setup({ task: { id: TASK, status: 'pendente', recompensa: 8, registros: { [TODAY]: { status: 'pendente' } } } });
  await assert.rejects(handlers.aprovarTarefa({ childId: CHILD, taskId: TASK, day: '2026-10-22' }, parent), { code: 'failed-precondition' });
  await assert.rejects(handlers.aprovarTarefa({ childId: CHILD, taskId: TASK, day: TODAY }, parent), { code: 'failed-precondition' });
});

test('não tenta pagar novamente uma tarefa aprovada pelo sistema antigo', async () => {
  const { handlers, parent, read } = setup({ task: { id: TASK, status: 'aprovada', recompensa: 8, registros: { [TODAY]: { status: 'aprovada', recompensaPagaEm: 4000 } } } });
  await assert.rejects(handlers.aprovarTarefa({ childId: CHILD, taskId: TASK, day: TODAY }, parent), { code: 'failed-precondition' });
  assert.equal(read(`${BASE}/security/wallets/${CHILD}`) ?? null, null);
});
