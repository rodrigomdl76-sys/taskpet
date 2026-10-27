'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createFamilyDeletionHandler } = require('../family-deletion');

function harness() {
  const values = new Map([['rotinapet/familias/casa', { security: { members: { parent1: {}, child1: {}, pending1: {} } }, estado: { moedas: 2 } }]]);
  const deletedPrefixes = [];
  const users = new Map([
    ['parent1', { customClaims: { familyId: 'casa', familyRole: 'parent', keep: true } }],
    ['child1', { customClaims: { familyId: 'casa', familyRole: 'child', keep: true } }],
    ['pending1', { customClaims: { keep: true } }]
  ]);
  const updatedClaims = [];
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const database = { ref(path) { return { once: async () => ({ exists: () => values.has(path), child: key => ({ val: () => path.endsWith('/familias/casa') && key === 'security/members' ? values.get(path).security.members : null }) }), remove: async () => values.delete(path) }; } };
  const auth = {
    getUser: async uid => { if (!users.has(uid)) throw Object.assign(new Error('not found'), { code: 'auth/user-not-found' }); return users.get(uid); },
    setCustomUserClaims: async (uid, claims) => { updatedClaims.push(uid); users.get(uid).customClaims = claims; }
  };
  const bucket = { deleteFiles: async opts => deletedPrefixes.push(opts.prefix) };
  const handler = createFamilyDeletionHandler({ database, auth, bucket, HttpsError, now: () => 1_800_000_000_000 });
  const context = { auth: { uid: 'parent1', token: { familyId: 'casa', familyRole: 'parent', auth_time: 1_800_000_000 } } };
  return { handler, context, values, deletedPrefixes, users, updatedClaims, HttpsError };
}

test('deletes family data and photos, then unlinks family members without deleting their logins', async () => {
  const h = harness();
  assert.deepEqual(await h.handler({ familyId: 'casa', confirmacao: 'casa' }, h.context), { deleted: true, familyId: 'casa' });
  assert.equal(h.values.has('rotinapet/familias/casa'), false);
  assert.deepEqual(h.deletedPrefixes, ['familias/casa/']);
  assert.deepEqual(new Set(h.updatedClaims), new Set(['parent1', 'child1']));
  assert.equal(h.users.get('parent1').customClaims.keep, true);
  assert.equal(h.users.get('parent1').customClaims.familyId, undefined);
  assert.equal(h.users.get('child1').customClaims.familyRole, undefined);
  assert.deepEqual(h.users.get('pending1').customClaims, { keep: true });
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
    auth: { getUser: async () => ({ customClaims: {} }), setCustomUserClaims: async () => {} },
    bucket: { deleteFiles: async () => { throw new Error('storage down'); } }, HttpsError: h.HttpsError, now: () => 1_800_000_000_000
  });
  await assert.rejects(h.handler({ familyId: 'casa', confirmacao: 'casa' }, h.context), /storage down/);
  assert.equal(h.values.has('rotinapet/familias/casa'), true);
});
