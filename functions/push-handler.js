const { normalizarAviso, tokensDosPais, dividirEmLotes, familiaValida } = require('./push-logic');

const INVALID_TOKEN_CODES = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered'
]);

function createPushHandler({ database, messaging, logger }) {
  async function removerTokenInvalido(familyId, uid, token) {
    const ref = database.ref(`rotinapet/familias/${familyId}/fcmTokens/${uid}`);
    await ref.transaction(registro => {
      if (registro && registro.token === token) return null;
      return registro;
    });
  }

  return async function processarAviso(snapshot, context) {
    const { familyId, pushId } = context.params;
    if (!familiaValida(familyId)) {
      logger.warn('Push ignorado: identificador de família inválido.', { pushId });
      return null;
    }
    if (context.authType !== 'USER') {
      logger.warn('Push ignorado: evento não veio de uma sessão autenticada.', {
        familyId,
        pushId,
        authType: context.authType || 'unknown'
      });
      return null;
    }

    const aviso = normalizarAviso(snapshot.val(), pushId);
    if (!aviso) {
      logger.info('Push ignorado: aviso não destinado aos responsáveis.', { familyId, pushId });
      return null;
    }

    const tokenSnapshot = await database
      .ref(`rotinapet/familias/${familyId}/fcmTokens`)
      .once('value');
    const destinatarios = tokensDosPais(tokenSnapshot.val());
    if (!destinatarios.length) {
      logger.warn('Nenhum aparelho de responsável tem push ativo.', { familyId, pushId });
      await snapshot.ref.update({ pushStatus: 'sem_token_de_responsavel', pushProcessadoEm: Date.now() });
      return null;
    }

    let enviados = 0;
    let falhas = 0;
    const tokensRemover = [];
    for (const lote of dividirEmLotes(destinatarios)) {
      const resposta = await messaging.sendEachForMulticast({
        tokens: lote.map(item => item.token),
        data: {
          title: aviso.title,
          body: aviso.body,
          tag: aviso.tag,
          url: aviso.url
        }
      });
      enviados += resposta.successCount;
      falhas += resposta.failureCount;
      resposta.responses.forEach((resultado, indice) => {
        if (!resultado.success && INVALID_TOKEN_CODES.has(resultado.error?.code)) {
          tokensRemover.push(lote[indice]);
        }
      });
    }

    await Promise.allSettled(tokensRemover.map(item => removerTokenInvalido(familyId, item.uid, item.token)));
    await snapshot.ref.update({
      pushStatus: falhas ? 'enviado_com_falhas' : 'enviado',
      pushEnviados: enviados,
      pushFalhas: falhas,
      pushProcessadoEm: Date.now()
    });
    logger.info('Push de família processado.', { familyId, pushId, enviados, falhas });
    return null;
  };
}

module.exports = { createPushHandler };
