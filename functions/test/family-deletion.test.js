'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createFamilyDeletionHandler } = require('../family-deletion');

function harness() {
  const values = new Map([['rotinapet/familias/casa', { security: { members: { parent1: {}, child1: {} } }, estado: { moedas: 2 } }]]);
  const deletedPrefixes = [];
  const deletedUsers = [];
  const errors = [];
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const database = { ref(path) { return { once: async () => ({ exists: () => values.has(path), child: key => ({ val: () => path.endsWith('/familias/casa') && key === 'security/members' ? values.get(path).security.members : null }) }), remove: async () => values.delete(path) }; } };
  const auth = { getUser: async uid => ({ customClaims: { familyId: 'casa', familyRole: uid === 'child1' ? 'child' : 'parent', keep: true } }), deleteUser: async uid => deletedUsers.push(uid) };
  const bucket = { deleteFiles: async opts => deletedPrefixes.push(opts.prefix) };
  const handler = createFamilyDeletionHandler({ database, auth, bucket, HttpsError, now: () => 1_800_000_000_000 });
  const context = { auth: { uid: 'parent1', token: { familyId: 'casa', familyRole: 'parent', auth_time: 1_800_000_000 } } };
  return { handler, context, values, deletedPrefixes, deletedUsers, errors, HttpsError };
}

test('deletes family data, photos, and linked accounts after fresh parent confirmation', async () => {
  const h = harness();
  assert.deepEqual(await h.handler({ familyId: 'casa', confirmacao: 'casa' }, h.context), { deleted: true, familyId: 'casa' });
  assert.equal(h.values.has('rotinapet/familias/casa'), false);
  assert.deepEqual(h.deletedPrefixes, ['familias/casa/']);
  assert.deepEqual(new Set(h.deletedUsers), new Set(['parent1', 'child1']));
});

test('rejects unauthenticated, non-parent, stale login, and mismatched confirmation', async () => {
  const h = harness();
  await assert.rejects(h.handler({ familyId: 'casa', confirmacao: 'casa' }, {}), { code: 'unauthenticated' });
  await assert.rejects(h.handler({ familyId: 'casa', confirmacao: 'casa' }, { auth: { uid: 'child1', token: { familyId: 'casa', familyRole: 'child', auth_time: 1_800_000_000 } } }), { code: 'permission-denied' });
  await assert.rejects(h.handler({ familyId: 'casa', confirmacao: 'casa' }, { auth: { ...h.context.auth, token: { ...h.context.auth.token, auth_time: 1 } } }), { code: 'failed-precondition' });
  await assert.rejects(h.handler({ familyId: 'casa', confirmacao: 'outra' }, h.context), { code: 'failed-precondition' });
  assert.equal(h.deletedPrefixes.length, 0);
});

test('does not remove family records when photo deletion fails', async () => {
  const h = harness();
  h.handler = createFamilyDeletionHandler({
    database: { ...{ ref: path => ({ once: async () => ({ exists: () => h.values.has(path), child: () => ({ val: () => h.values.get(path).security.members }) }), remove: async () => h.values.delete(path) }) } },
    auth: { getUser: async () => ({ customClaims: {} }), deleteUser: async () => {} },
    bucket: { deleteFiles: async () => { throw new Error('storage down'); } }, HttpsError: h.HttpsError, now: () => 1_800_000_000_000
  });
  await assert.rejects(h.handler({ familyId: 'casa', confirmacao: 'casa' }, h.context), /storage down/);
  assert.equal(h.values.has('rotinapet/familias/casa'), true);
});
