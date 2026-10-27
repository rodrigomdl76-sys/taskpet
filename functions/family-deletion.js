'use strict';

const FAMILY_ID_PATTERN = /^[a-z0-9_-]{1,64}$/;

function createFamilyDeletionHandler({ database, auth, bucket, HttpsError, now = () => Date.now() }) {
  return async function excluirFamilia(data, context) {
    const sessao = context.auth;
    if (!sessao?.uid) throw new HttpsError('unauthenticated', 'Entre na conta do responsável para excluir a família.');
    const familyId = data?.familyId;
    if (typeof familyId !== 'string' || !FAMILY_ID_PATTERN.test(familyId)) throw new HttpsError('invalid-argument', 'Família inválida.');
    if (sessao.token.familyId !== familyId || sessao.token.familyRole !== 'parent') {
      throw new HttpsError('permission-denied', 'Somente um responsável vinculado pode excluir a família.');
    }
    const authTime = Number(sessao.token.auth_time || 0) * 1000;
    if (!authTime || now() - authTime > 10 * 60 * 1000 || authTime > now() + 60 * 1000) {
      throw new HttpsError('failed-precondition', 'Por segurança, saia e entre novamente na conta do responsável antes de excluir a família.');
    }
    if (data?.confirmacao !== familyId) throw new HttpsError('failed-precondition', 'Digite o código da família para confirmar a exclusão.');

    const familyPath = `rotinapet/familias/${familyId}`;
    const familySnapshot = await database.ref(familyPath).once('value');
    const members = familySnapshot.exists() ? (familySnapshot.child('security/members').val() || {}) : {};
    const accessRequests = familySnapshot.exists() ? (familySnapshot.child('security/accessRequests').val() || {}) : {};
    async function apagarConta(uid) {
      try {
        const user = await auth.getUser(uid);
        if (user.customClaims?.familyId && user.customClaims.familyId !== familyId) return;
        await auth.deleteUser(uid);
      } catch (error) {
        if (error?.code !== 'auth/user-not-found') throw error;
      }
    }
    if (!familySnapshot.exists()) {
      if (bucket) await bucket.deleteFiles({ prefix: `familias/${familyId}/` });
      await apagarConta(sessao.uid);
      return { deleted: true, familyId };
    }
    // Apaga as fotos primeiro. Se isso falhar, mantém os dados da família disponíveis para nova tentativa.
    if (bucket) await bucket.deleteFiles({ prefix: `familias/${familyId}/` });
    // Apaga primeiro as outras contas e deixa a sessão chamadora ativa para permitir nova tentativa
    // caso uma remoção ou a limpeza do banco falhe. Pedidos ainda pendentes também são revogados.
    const outrosUids = new Set([...Object.keys(members), ...Object.keys(accessRequests)]);
    outrosUids.delete(sessao.uid);
    for (const uid of outrosUids) await apagarConta(uid);
    await database.ref(familyPath).remove();
    await apagarConta(sessao.uid);
    return { deleted: true, familyId };
  };
}

module.exports = { createFamilyDeletionHandler, FAMILY_ID_PATTERN };
