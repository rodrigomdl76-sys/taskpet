'use strict';

const FAMILY_ID_PATTERN = /^[a-z0-9_-]{1,64}$/;
const UID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const VALID_ROLES = new Set(['parent', 'child']);

function createFamilyAccessHandlers({ database, auth, HttpsError, now = () => Date.now() }) {
  function exigirUsuario(context) {
    if (!context.auth?.uid) throw new HttpsError('unauthenticated', 'Faça login antes de continuar.');
    return context.auth;
  }
  function exigirResponsavel(context, familyId) {
    const sessao = exigirUsuario(context);
    if (sessao.token.familyId !== familyId || sessao.token.familyRole !== 'parent') {
      throw new HttpsError('permission-denied', 'Somente um responsável vinculado pode aprovar aparelhos.');
    }
    return sessao;
  }
  async function solicitarAcesso(data, context) {
    const sessao = exigirUsuario(context);
    const familyId = data?.familyId;
    if (typeof familyId !== 'string' || !FAMILY_ID_PATTERN.test(familyId)) throw new HttpsError('invalid-argument', 'Família inválida.');
    if (sessao.token.familyId && sessao.token.familyId !== familyId) throw new HttpsError('failed-precondition', 'Esta conta já está vinculada a outra família.');
    const base = `rotinapet/familias/${familyId}`;
    const state = await database.ref(`${base}/estado`).once('value');
    if (!state.exists()) throw new HttpsError('not-found', 'Família não encontrada. Confira o convite.');
    const ref = database.ref(`${base}/security/accessRequests/${sessao.uid}`);
    const atual = (await ref.once('value')).val();
    if (atual?.status === 'approved') throw new HttpsError('already-exists', 'Este aparelho já foi aprovado. Atualize a sessão e tente novamente.');
    if (atual?.status !== 'pending') await ref.set({ status: 'pending', requestedAt: now(), deviceLabel: typeof data?.deviceLabel === 'string' ? data.deviceLabel.slice(0, 60) : 'Aparelho' });
    return { status: 'pending' };
  }
  async function registrarResponsavelFamiliaNova(data, context) {
    const sessao = exigirUsuario(context);
    const familyId = data?.familyId;
    if (typeof familyId !== 'string' || !/^fam_[a-f0-9]{32}$/.test(familyId)) throw new HttpsError('invalid-argument', 'Identificador de nova família inválido.');
    if (sessao.token.familyId) throw new HttpsError('failed-precondition', 'Esta conta já está vinculada a uma família.');
    const base = `rotinapet/familias/${familyId}`;
    const existente = await database.ref(`${base}/estado`).once('value');
    if (existente.exists()) throw new HttpsError('already-exists', 'Esta família já contém dados; peça aprovação ao responsável.');
    const lock = await database.ref(`${base}/security/bootstrap`).transaction(valor => valor ? undefined : { uid: sessao.uid, criadoEm: now() });
    if (!lock.committed || lock.snapshot.val()?.uid !== sessao.uid) throw new HttpsError('already-exists', 'Esta família já foi inicializada.');
    const user = await auth.getUser(sessao.uid);
    const claims = { ...(user.customClaims || {}), familyId, familyRole: 'parent' };
    await auth.setCustomUserClaims(sessao.uid, claims);
    await database.ref(`${base}/security/members/${sessao.uid}`).set({ familyId, role: 'parent', approvedBy: 'self-bootstrap', approvedAt: now() });
    return { familyId, role: 'parent' };
  }
  async function listarSolicitacoes(_data, context) {
    const sessao = exigirUsuario(context);
    const familyId = sessao.token.familyId;
    if (typeof familyId !== 'string' || !FAMILY_ID_PATTERN.test(familyId)) throw new HttpsError('permission-denied', 'Sessão sem família válida.');
    exigirResponsavel(context, familyId);
    const snapshot = await database.ref(`rotinapet/familias/${familyId}/security/accessRequests`).once('value');
    return { requests: snapshot.val() || {} };
  }
  async function aprovarAcesso(data, context) {
    const sessao = exigirUsuario(context);
    const familyId = sessao.token.familyId;
    if (typeof familyId !== 'string' || !FAMILY_ID_PATTERN.test(familyId)) throw new HttpsError('permission-denied', 'Sessão sem família válida.');
    exigirResponsavel(context, familyId);
    const uid = data?.uid;
    if (data?.role && data.role !== 'child') throw new HttpsError('invalid-argument', 'Aprovação de aparelhos só pode conceder acesso infantil.');
    const role = 'child';
    if (typeof uid !== 'string' || !UID_PATTERN.test(uid) || uid === sessao.uid) throw new HttpsError('invalid-argument', 'Aparelho inválido.');
    const base = `rotinapet/familias/${familyId}`;
    const memberRef = database.ref(`${base}/security/members/${uid}`);
    const existing = (await memberRef.once('value')).val();
    if (existing?.familyId && existing.familyId !== familyId) throw new HttpsError('failed-precondition', 'A conta já pertence a outra família.');
    const requestRef = database.ref(`${base}/security/accessRequests/${uid}`);
    const request = (await requestRef.once('value')).val();
    if (request?.status !== 'pending' && !(existing?.familyId === familyId && existing?.role === 'child' && !existing?.childId)) {
      throw new HttpsError('failed-precondition', 'Não existe solicitação pendente para este aparelho.');
    }
    if (existing?.childId && existing.childId !== data?.childId) {
      throw new HttpsError('failed-precondition', 'Este aparelho já está vinculado a outro perfil. Faça a troca pelo procedimento de desvinculação.');
    }
    const user = await auth.getUser(uid);
    const claims = { ...(user.customClaims || {}) };
    if (claims.familyId && claims.familyId !== familyId) throw new HttpsError('failed-precondition', 'A conta já pertence a outra família.');

    let childId = null;
    if (role === 'child') {
      childId = data?.childId;
      if (typeof childId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(childId)) {
        throw new HttpsError('invalid-argument', 'Selecione o perfil da criança para este aparelho.');
      }
      const childSnapshot = await database.ref(`${base}/estado/criancas/${childId}`).once('value');
      if (!childSnapshot.exists()) throw new HttpsError('not-found', 'O perfil selecionado não existe nesta família.');
      const assignmentRef = database.ref(`${base}/security/childAssignments/${childId}`);
      const assignment = await assignmentRef.transaction(current => {
        if (current && current.uid !== uid) return;
        return { uid, assignedBy: sessao.uid, assignedAt: now() };
      });
      if (!assignment.committed || assignment.snapshot.val()?.uid !== uid) {
        throw new HttpsError('already-exists', 'Este perfil já está vinculado a outro aparelho. Desvincule-o antes de continuar.');
      }
      claims.childId = childId;
    } else {
      delete claims.childId;
    }

    claims.familyId = familyId;
    claims.familyRole = role;
    await auth.setCustomUserClaims(uid, claims);
    await memberRef.set({ familyId, role, ...(childId ? { childId } : {}), approvedBy: sessao.uid, approvedAt: now() });
    await requestRef.remove();
    return { uid, role, ...(childId ? { childId } : {}) };
  }
  return { solicitarAcesso, registrarResponsavelFamiliaNova, listarSolicitacoes, aprovarAcesso };
}

module.exports = { createFamilyAccessHandlers, FAMILY_ID_PATTERN, UID_PATTERN };
