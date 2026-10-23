'use strict';

const CHILD_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const TASK_ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function createTaskRewardHandlers({ database, HttpsError, now = () => Date.now(), today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date()) }) {
  function exigirResponsavel(context) {
    const session = context.auth;
    if (!session?.uid) throw new HttpsError('unauthenticated', 'Faça login para aprovar uma tarefa.');
    const familyId = session.token?.familyId;
    if (typeof familyId !== 'string' || !/^[a-z0-9_-]{1,64}$/.test(familyId) || session.token?.familyRole !== 'parent') {
      throw new HttpsError('permission-denied', 'Somente um responsável vinculado pode aprovar tarefas.');
    }
    return { uid: session.uid, familyId };
  }

  async function aprovarTarefa(data, context) {
    const { uid, familyId } = exigirResponsavel(context);
    const childId = data?.childId;
    const taskId = data?.taskId;
    const day = data?.day;
    if (typeof childId !== 'string' || !CHILD_ID_PATTERN.test(childId) || typeof taskId !== 'string' || !TASK_ID_PATTERN.test(taskId)) {
      throw new HttpsError('invalid-argument', 'Perfil ou tarefa inválidos.');
    }
    if (typeof day !== 'string' || !DAY_PATTERN.test(day) || day !== today()) {
      throw new HttpsError('failed-precondition', 'Atualize o app e tente aprovar a tarefa do dia atual.');
    }

    const familyPath = `rotinapet/familias/${familyId}`;
    const taskRef = database.ref(`${familyPath}/filhos/${childId}/tarefas/${taskId}`);
    const snapshots = await Promise.all([
      database.ref(`${familyPath}/estado/criancas/${childId}`).once('value'),
      database.ref(`${familyPath}/estado/criancaAtivaId`).once('value'),
      database.ref(`${familyPath}/estado/moedas`).once('value'),
      database.ref(`${familyPath}/estado/dinheiroAcumulado`).once('value'),
      database.ref(`${familyPath}/estado/taxaCambio`).once('value'),
      database.ref(`${familyPath}/estado/mesadaAtiva`).once('value'),
      database.ref(`${familyPath}/estado/criancasDados/${childId}/moedas`).once('value'),
      database.ref(`${familyPath}/estado/criancasDados/${childId}/dinheiroAcumulado`).once('value'),
      database.ref(`${familyPath}/estado/criancasDados/${childId}/mesadaAtiva`).once('value'),
      taskRef.once('value')
    ]);
    const [childSnapshot, activeIdSnapshot, rootCoinsSnapshot, rootCashSnapshot, exchangeSnapshot, rootAllowanceSnapshot, profileCoinsSnapshot, profileCashSnapshot, profileAllowanceSnapshot, beforeTaskSnapshot] = snapshots;
    if (!childSnapshot.val()) {
      throw new HttpsError('not-found', 'Este perfil não pertence à família.');
    }

    const beforeTask = beforeTaskSnapshot.val();
    if (!beforeTask || String(beforeTask.id) !== taskId) throw new HttpsError('not-found', 'A tarefa não foi encontrada na sincronização segura.');
    const recordBefore = beforeTask.registros?.[day] || {};
    const paidBefore = beforeTask.recompensaSettlementVersion === 2 && recordBefore.pagamentoId;
    const alreadyApprovedLegacy = (beforeTask.status === 'aprovada' || recordBefore.status === 'aprovada') && !paidBefore;
    if (alreadyApprovedLegacy) throw new HttpsError('failed-precondition', 'Esta tarefa foi aprovada antes da ativação do pagamento seguro.');

    if (!paidBefore) {
      let rejection = null;
      const approval = await taskRef.transaction(current => {
        if (!current) { rejection = 'not-found'; return; }
        if (current.recompensaSettlementVersion === 2 && current.registros?.[day]?.pagamentoId) return;
        const record = current.registros?.[day] || {};
        if ((record.status || current.status) !== 'aguardando_aprovacao') {
          rejection = 'not-awaiting-approval';
          return;
        }
        const stamp = now();
        const paymentId = `task_${childId}_${taskId}_${day}`;
        const updated = JSON.parse(JSON.stringify(current));
        updated.registros = updated.registros || {};
        updated.registros[day] = {
          ...(updated.registros[day] || {}), status: 'aprovada', aprovadaEm: stamp,
          recompensaPagaEm: stamp, pagamentoId: paymentId,
          historico: [...(updated.registros[day]?.historico || []), { status: 'aprovada', t: stamp, pagamentoId: paymentId }].slice(-20)
        };
        updated.status = 'aprovada';
        updated.recompensaSettlementVersion = 2;
        updated.historicoAprovacoes = [...(updated.historicoAprovacoes || []), { status: 'aprovada', t: stamp, pagamentoId: paymentId }].slice(-20);
        updated.atualizadoEm = stamp;
        return updated;
      }, undefined, false);
      if (!approval.committed && rejection) {
        if (rejection === 'not-found') throw new HttpsError('not-found', 'A tarefa não foi encontrada.');
        throw new HttpsError('failed-precondition', 'A tarefa não está aguardando aprovação. Atualize o painel dos pais.');
      }
    }

    const task = (await taskRef.once('value')).val();
    const record = task?.registros?.[day] || {};
    if (task?.recompensaSettlementVersion !== 2 || !record.pagamentoId) {
      throw new HttpsError('aborted', 'Não foi possível confirmar a aprovação da tarefa.');
    }
    const paymentId = record.pagamentoId;
    const paymentKey = paymentId.replace(/[^A-Za-z0-9_-]/g, '_');
    const isActiveChild = activeIdSnapshot.val() === childId;
    const legacyCoins = Math.max(0, Number(isActiveChild && rootCoinsSnapshot.val() !== null ? rootCoinsSnapshot.val() : profileCoinsSnapshot.val()) || 0);
    const legacyCash = Math.max(0, Number(isActiveChild && rootCashSnapshot.val() !== null ? rootCashSnapshot.val() : profileCashSnapshot.val()) || 0);
    const seed = { petCoins: legacyCoins, cashBalance: legacyCash, payments: {} };
    const rawReward = Number(task.recompensa);
    const reward = Number.isFinite(rawReward) ? Math.max(0, Math.min(10000, Math.floor(rawReward))) : 0;
    const exchangeRate = Math.max(0, Number(exchangeSnapshot.val()) || 0.01);
    const mesadaAtiva = isActiveChild ? (rootAllowanceSnapshot.val() ?? profileAllowanceSnapshot.val()) : profileAllowanceSnapshot.val();
    const cashReward = mesadaAtiva === false ? 0 : Math.round(reward * exchangeRate * 100) / 100;
    const walletRef = database.ref(`${familyPath}/security/wallets/${childId}`);
    const walletTransaction = await walletRef.transaction(current => {
      const wallet = current || seed;
      if (wallet.payments?.[paymentKey]) return;
      const updated = { ...wallet, payments: { ...(wallet.payments || {}) } };
      updated.petCoins = Math.max(0, Number(wallet.petCoins) || 0) + reward;
      updated.cashBalance = Math.max(0, Number(wallet.cashBalance) || 0) + cashReward;
      updated.payments[paymentKey] = { amount: reward, cashAmount: cashReward, childId, taskId, day, approvedBy: uid, createdAt: now() };
      return updated;
    }, undefined, false);
    const wallet = walletTransaction.snapshot.val();
    if (!wallet) throw new HttpsError('internal', 'O saldo não pôde ser atualizado. Tente novamente.');

    const mirror = {
      [`${familyPath}/estado/criancasDados/${childId}/moedas`]: wallet.petCoins,
      [`${familyPath}/estado/criancasDados/${childId}/dinheiroAcumulado`]: wallet.cashBalance
    };
    if (isActiveChild) {
      mirror[`${familyPath}/estado/moedas`] = wallet.petCoins;
      mirror[`${familyPath}/estado/dinheiroAcumulado`] = wallet.cashBalance;
    }
    await database.ref().update(mirror);
    return { childId, taskId, day, paymentId, reward, cashReward, petCoins: wallet.petCoins, cashBalance: wallet.cashBalance };
  }

  return { aprovarTarefa };
}

module.exports = { createTaskRewardHandlers, CHILD_ID_PATTERN, TASK_ID_PATTERN, DAY_PATTERN };
