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
    async function desvincularConta(uid) {
      try {
        const user = await auth.getUser(uid);
        if (user.customClaims?.familyId !== familyId) return;
        const claims = { ...(user.customClaims || {}) };
        delete claims.familyId;
        delete claims.familyRole;
        await auth.setCustomUserClaims(uid, claims);
      } catch (error) {
        if (error?.code !== 'auth/user-not-found') throw error;
      }
    }
    if (!familySnapshot.exists()) {
      if (bucket) await bucket.deleteFiles({ prefix: `familias/${familyId}/` });
      await desvincularConta(sessao.uid);
      return { deleted: true, familyId };
    }
    // Apaga as fotos primeiro. Se isso falhar, mantém os dados da família disponíveis para nova tentativa.
    if (bucket) await bucket.deleteFiles({ prefix: `familias/${familyId}/` });
    // Remove o vínculo de outras contas sem apagar seus logins pessoais.
    // O responsável que chamou a função fica vinculado até os dados da família serem apagados.
    const outrosUids = new Set(Object.keys(members));
    outrosUids.delete(sessao.uid);
    for (const uid of outrosUids) await desvincularConta(uid);
    await database.ref(familyPath).remove();
    await desvincularConta(sessao.uid);
    return { deleted: true, familyId };
  };
}

module.exports = { createFamilyDeletionHandler, FAMILY_ID_PATTERN };
