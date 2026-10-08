'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { migrarSegredos } = require('../scripts/migrate-private-parent-data');

test('move segredos para o nó privado e os remove do estado compartilhado', async () => {
  const values = new Map([
    ['rotinapet/familias/casa_principal/estado', { tarefas: [], pinHash: 'hash', emailsRecuperacao: ['pai@example.com'], pinPersonalizado: true }],
    ['rotinapet/familias/casa_principal/pais/segredos', {}]
  ]);
  const database = {
    ref(path = '') {
      return {
        once: async () => ({ val: () => values.get(path) || null }),
        update: async updates => { for (const [key, value] of Object.entries(updates)) { const cut = key.lastIndexOf('/'); const parent = key.slice(0, cut); const leaf = key.slice(cut + 1); const object = { ...(values.get(parent) || {}) }; if (value === null) delete object[leaf]; else object[leaf] = value; values.set(parent, object); } }
      };
    }
  };
  const result = await migrarSegredos(database, 'casa_principal');
  assert.equal(values.has('rotinapet/familias/casa_principal/estado/pinHash'), false);
  assert.equal(values.get('rotinapet/familias/casa_principal/pais/segredos').pinHash, 'hash');
  assert.deepEqual(values.get('rotinapet/familias/casa_principal/pais/segredos').emailsRecuperacao, ['pai@example.com']);
  assert.equal(result.removed, 3);
});

test('migração preserva segredo que já estava no nó privado', async () => {
  const values = new Map([
    ['rotinapet/familias/vitor/estado', { pinHash: 'antigo' }],
    ['rotinapet/familias/vitor/pais/segredos', { pinHash: 'novo' }]
  ]);
  const database = { ref(path = '') { return { once: async () => ({ val: () => values.get(path) || null }), update: async updates => { for (const [key, value] of Object.entries(updates)) { if (value === null) values.delete(key); else values.set(key, value); } } }; } };
  await migrarSegredos(database, 'vitor');
  assert.equal(values.get('rotinapet/familias/vitor/pais/segredos').pinHash, 'novo');
  assert.equal(values.has('rotinapet/familias/vitor/estado/pinHash'), false);
});
