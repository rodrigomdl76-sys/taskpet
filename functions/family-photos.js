'use strict';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const FAMILY_ID_PATTERN = /^[a-z0-9_-]{1,64}$/;

function createFamilyPhotoHandlers({ bucket, HttpsError }) {
  function exigirFamilia(context) {
    const auth = context.auth;
    if (!auth?.uid) throw new HttpsError('unauthenticated', 'Entre na família para acessar as fotos.');
    const familyId = auth.token.familyId;
    if (typeof familyId !== 'string' || !FAMILY_ID_PATTERN.test(familyId) || !['parent', 'child'].includes(auth.token.familyRole)) {
      throw new HttpsError('permission-denied', 'Aparelho sem acesso à família.');
    }
    return { familyId, role: auth.token.familyRole };
  }
  function caminhoFotoValido(path, familyId) {
    if (typeof path !== 'string' || path.length > 512 || !path.startsWith(`familias/${familyId}/`)) return false;
    return /^familias\/[a-z0-9_-]{1,64}\/criancas\/[A-Za-z0-9_-]{1,64}\/tarefas\/[A-Za-z0-9_-]{1,64}\/[A-Za-z0-9_.-]{1,120}\.(jpg|jpeg|webp)$/i.test(path);
  }
  async function revogarToken(file) {
    const [metadata] = await file.getMetadata();
    const custom = { ...(metadata.metadata || {}) };
    if (!custom.firebaseStorageDownloadTokens) return false;
    delete custom.firebaseStorageDownloadTokens;
    await file.setMetadata({ metadata: custom });
    return true;
  }
  async function baixarFoto(data, context) {
    const { familyId, role } = exigirFamilia(context);
    if (role !== 'parent') throw new HttpsError('permission-denied', 'Somente o responsável pode visualizar fotos de tarefas.');
    const path = data?.path;
    if (!caminhoFotoValido(path, familyId)) throw new HttpsError('permission-denied', 'Foto fora desta família.');
    const file = bucket.file(path);
    const [metadata] = await file.getMetadata().catch(() => { throw new HttpsError('not-found', 'Foto não encontrada.'); });
    const size = Number(metadata.size || 0);
    if (size > MAX_PHOTO_BYTES) throw new HttpsError('resource-exhausted', 'A foto ultrapassa o limite permitido.');
    const contentType = String(metadata.contentType || 'image/jpeg').toLowerCase();
    if (!['image/jpeg', 'image/webp'].includes(contentType)) throw new HttpsError('failed-precondition', 'Formato de foto não permitido.');
    await revogarToken(file);
    const [bytes] = await file.download();
    return { base64: bytes.toString('base64'), contentType };
  }
  async function protegerFotos(_data, context) {
    const { familyId, role } = exigirFamilia(context);
    if (role !== 'parent') throw new HttpsError('permission-denied', 'Somente o responsável pode proteger os links antigos.');
    const [files] = await bucket.getFiles({ prefix: `familias/${familyId}/` });
    let revoked = 0;
    for (const file of files) if (await revogarToken(file)) revoked += 1;
    return { protected: true, files: files.length, revoked };
  }
  return { baixarFoto, protegerFotos };
}

module.exports = { createFamilyPhotoHandlers, MAX_PHOTO_BYTES };
