'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createFamilyAccessHandlers } = require('../family-access');

function setup({ role = 'parent', familyId = 'casa_principal', uid = 'parentUid' } = {}) {
  const paths = new Map([['rotinapet/familias/casa_principal/estado', { tarefas: [] }]]);
  const claims = new Map();
  const ref = path => ({
    once: async () => ({ val: () => paths.get(path) || null, exists: () => paths.has(path) }),
    set: async value => paths.set(path, value),
    remove: async () => paths.delete(path),
    transaction: async update => { const next=update(paths.get(path) || null); if(next===undefined)return {committed:false,snapshot:{val:()=>paths.get(path)||null}}; paths.set(path,next); return {committed:true,snapshot:{val:()=>next}} }
  });
  const database = { ref };
  const auth = {
    getUser: async userId => ({ uid: userId, customClaims: claims.get(userId) || {} }),
    setCustomUserClaims: async (userId, value) => claims.set(userId, value)
  };
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const handlers = createFamilyAccessHandlers({ database, auth, HttpsError, now: () => 1234 });
  const context = { auth: { uid, token: { familyId, familyRole: role } } };
  return { handlers, context, paths, claims };
}

test('a solicitação usa o UID autenticado e não aceita papel escolhido pelo cliente', async () => {
  const { handlers, context, paths } = setup({ role: 'child', uid: 'device123' });
  await handlers.solicitarAcesso({ familyId: 'casa_principal', role: 'parent', deviceLabel: 'Celular' }, context);
  assert.deepEqual(paths.get('rotinapet/familias/casa_principal/security/accessRequests/device123'), { status: 'pending', requestedAt: 1234, deviceLabel: 'Celular' });
});

test('aprovação exige responsável, associa claims e remove o pedido', async () => {
  const { handlers, context, paths, claims } = setup();
  paths.set('rotinapet/familias/casa_principal/security/accessRequests/childUid', { status: 'pending' });
  const result = await handlers.aprovarAcesso({ uid: 'childUid', role: 'child' }, context);
  assert.deepEqual(result, { uid: 'childUid', role: 'child' });
  assert.deepEqual(claims.get('childUid'), { familyId: 'casa_principal', familyRole: 'child' });
  assert.equal(paths.get('rotinapet/familias/casa_principal/security/members/childUid').role, 'child');
  assert.equal(paths.has('rotinapet/familias/casa_principal/security/accessRequests/childUid'), false);
});

test('criança não pode aprovar outros aparelhos', async () => {
  const { handlers } = setup({ role: 'child' });
  await assert.rejects(handlers.aprovarAcesso({ uid: 'childUid' }, { auth: { uid: 'kid', token: { familyId: 'casa_principal', familyRole: 'child' } } }), { code: 'permission-denied' });
});

test('recusa família inválida e UID já associado a outra família', async () => {
  const { handlers, context, claims } = setup();
  await assert.rejects(handlers.solicitarAcesso({ familyId: '../unsafe' }, context), { code: 'invalid-argument' });
  claims.set('childUid', { familyId: 'outra_familia', familyRole: 'child' });
  await assert.rejects(handlers.aprovarAcesso({ uid: 'childUid' }, context), { code: 'failed-precondition' });
});

test('cria a primeira família aleatória com claim de responsável', async () => {
  const { handlers, context, paths, claims } = setup({ uid: 'firstParent' });
  context.auth.token = {};
  const result = await handlers.registrarResponsavelFamiliaNova({ familyId: 'fam_0123456789abcdef0123456789abcdef' }, context);
  assert.equal(result.role, 'parent');
  assert.equal(claims.get('firstParent').familyRole, 'parent');
  assert.equal(paths.get('rotinapet/familias/fam_0123456789abcdef0123456789abcdef/security/members/firstParent').role, 'parent');
});
