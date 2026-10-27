'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createFamilyPhotoHandlers } = require('../family-photos');

function harness() {
  const files = new Map([
    ['familias/casa/criancas/c1/tarefas/t1/2026-10-23.jpg', { metadata: { size: '4', contentType: 'image/jpeg', metadata: { firebaseStorageDownloadTokens: 'old-token', keep: 'yes' } }, bytes: Buffer.from('foto') }],
    ['familias/casa/criancas/c1/tarefas/t2/2026-10-23.jpg', { metadata: { size: '4', contentType: 'image/png', metadata: {} }, bytes: Buffer.from('png') }],
    ['familias/outra/criancas/c1/tarefas/t1/2026-10-23.jpg', { metadata: { size: '4', contentType: 'image/jpeg', metadata: { firebaseStorageDownloadTokens: 'other-token' } }, bytes: Buffer.from('outro') }]
  ]);
  const events = [];
  const bucket = {
    file: path => ({
      getMetadata: async () => { const file = files.get(path); if (!file) throw new Error('not found'); return [file.metadata]; },
      setMetadata: async input => { events.push('revoke'); files.get(path).metadata = { ...files.get(path).metadata, ...input, metadata: input.metadata }; },
      download: async () => { events.push('download'); return [files.get(path).bytes]; }
    }),
    getFiles: async ({ prefix }) => [[...files.keys()].filter(path => path.startsWith(prefix)).map(path => ({
      getMetadata: async () => [files.get(path).metadata],
      setMetadata: async input => { files.get(path).metadata = { ...files.get(path).metadata, ...input, metadata: input.metadata }; }
    }))]
  };
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  return { files, events, handlers: createFamilyPhotoHandlers({ bucket, HttpsError }), HttpsError };
}

test('serves a family photo only to a family member and revokes its bearer token', async () => {
  const h = harness();
  const result = await h.handlers.baixarFoto({ path: 'familias/casa/criancas/c1/tarefas/t1/2026-10-23.jpg' }, { auth: { uid: 'p1', token: { familyId: 'casa', familyRole: 'parent' } } });
  assert.equal(Buffer.from(result.base64, 'base64').toString(), 'foto');
  assert.deepEqual(h.events, ['revoke', 'download']);
  assert.equal(h.files.get('familias/casa/criancas/c1/tarefas/t1/2026-10-23.jpg').metadata.metadata.firebaseStorageDownloadTokens, undefined);
  assert.equal(h.files.get('familias/casa/criancas/c1/tarefas/t1/2026-10-23.jpg').metadata.metadata.keep, 'yes');
});

test('rejects unauthenticated users and paths outside the claimed family', async () => {
  const h = harness();
  await assert.rejects(h.handlers.baixarFoto({ path: 'familias/casa/criancas/c1/tarefas/t1/2026-10-23.jpg' }, {}), { code: 'unauthenticated' });
  await assert.rejects(h.handlers.baixarFoto({ path: 'familias/casa/criancas/c1/tarefas/t1/2026-10-23.jpg' }, { auth: { uid: 'c1', token: { familyId: 'casa', familyRole: 'child' } } }), { code: 'permission-denied' });
  await assert.rejects(h.handlers.baixarFoto({ path: 'familias/outra/criancas/c1/tarefas/t1/2026-10-23.jpg' }, { auth: { uid: 'p1', token: { familyId: 'casa', familyRole: 'parent' } } }), { code: 'permission-denied' });
  await assert.rejects(h.handlers.baixarFoto({ path: 'familias/casa/criancas/c1/tarefas/t2/2026-10-23.jpg' }, { auth: { uid: 'p1', token: { familyId: 'casa', familyRole: 'parent' } } }), { code: 'failed-precondition' });
});

test('revokes tokens from existing family photos', async () => {
  const h = harness();
  const result = await h.handlers.protegerFotos({}, { auth: { uid: 'p1', token: { familyId: 'casa', familyRole: 'parent' } } });
  assert.equal(result.files, 2);
  assert.equal(result.revoked, 1);
});
