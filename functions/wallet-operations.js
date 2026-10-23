'use strict';

const CHILD_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const ITEM_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const GAME_REWARDS = Object.freeze({ matematica: 1, memoria: 2, reacao: 1, estrelas: 3, extras: 2 });
const ACHIEVEMENT_REWARDS = Object.freeze({ primeira: 10, diaCheio: 25, mestreMath: 30, cem: 30, streak7: 50, nivel10: 60, pet5: 80, tarefas10: 45, acessorio: 20, objeto: 35, streak30: 100 });
const SEASONAL_EVENTS = Object.freeze([
  { id: 'carnaval', start: '02-10', end: '03-05', coins: 3, xp: 5 },
  { id: 'pascoa', start: '03-20', end: '04-25', coins: 4, xp: 6 },
  { id: 'ferias_julho', start: '07-01', end: '07-31', coins: 3, xp: 4 },
  { id: 'halloween', start: '10-20', end: '11-02', coins: 5, xp: 8 },
  { id: 'natal', start: '12-01', end: '12-26', coins: 5, xp: 10 },
  { id: 'ano_novo', start: '12-27', end: '01-05', coins: 4, xp: 8 }
]);
function eventoAtivoNaData(day) {
  const monthDay = day.slice(5);
  return SEASONAL_EVENTS.find(event => event.start <= event.end ? monthDay >= event.start && monthDay <= event.end : monthDay >= event.start || monthDay <= event.end) || null;
}
const DAILY_PURCHASES = Object.freeze({
  minipet: Object.freeze({ passarinho: 0, abelha: 25, drone: 45, disco: 60, balao: 20, sapo: 80, pato: 95, tartaruga: 120, vagalumes: 60, coelho: 110, hamster: 0 }),
  gesto: Object.freeze({ pulinho: 45, giro: 75 }),
  axolote: Object.freeze({ giro: 30, carinho: 25, risada: 25, brilho: 30, espiar: 25 }),
  palco: Object.freeze({ cristal: 0, floresta: 20, nuvem: 25, estrelas: 35, doce: 30, ouro: 40 }),
  fundo: Object.freeze({ ceu: 0, chuva: 12, noite: 20, arcoiris: 30, praia: 25, floresta: 22, floresta_luminosa: 0, reino_submarino: 0, arena_galactica: 55, estadio_lunar: 45, reino_dos_doces: 40, festa: 35, halloween: 40, halloween_castelo: 45, estadio: 45, quarto: 35, mario: 50, dino: 45, princesa: 40, astronauta: 50, pirata: 45, fazenda: 35, neve: 40, aniversario: 0, castelo_noturno: 40, deserto_cactos: 30, quarto_gamer: 50, floresta_blocos: 45, floresta_encantada: 40, cachoeira_florida: 35 }),
  atelier: Object.freeze({
    'visual-ovo-gato-oculos':75,'visual-ovo-gato-samurai':120,'visual-ovo-gato-espacial':120,'visual-ovo-gato-armadura':120,'visual-gato-fase2-espacial':120,'visual-gato-fase2-armadura':120,'visual-gato-fase2-bruxinho-halloween':120,'visual-axolote-cachorrinho':120,'visual-axolote-disco-voador':120,
    'oculos-sol':55,'coroa':55,'laco':40,'fala-quadrinhos':25,'fala-nuvem':30,'toque-estrelas':35,'toque-bolhas':35,'tapete-arcoiris':45,'bola-cenario':25,'ursinho-cenario':35,'moldura-dourada':40,'tiara-flores':45,'curativo-estrelas':30,'bochechas-rosadas':35,'fala-neon':40,'fala-pixel':40,'fonte-redonda':30,'fonte-pixel':35,'toque-arcoiris':40,'toque-confetes':45,'clima-manha':45,'clima-entardecer':45,'clima-vagalumes':50,'clima-neve':50,'planta-cenario':30,'almofada-cenario':35,'moldura-prateada':40,'moldura-arcoiris':50
  })
});
const INVENTORY_FIELDS = Object.freeze({ minipet: 'miniPetsComprados', gesto: 'gestosDesbloqueados', axolote: 'axoloteReacoesCompradas', palco: 'palcosComprados', fundo: 'fundosComprados', atelier: 'personalizacao.adquiridos' });

function createWalletOperationHandlers({ database, HttpsError, now = () => Date.now(), random = Math.random, today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date()) }) {
  function exigirFamilia(context, childId) {
    const session = context.auth;
    if (!session?.uid) throw new HttpsError('unauthenticated', 'Faça login para usar as PetCoins.');
    const familyId = session.token?.familyId;
    if (typeof familyId !== 'string' || !/^[a-z0-9_-]{1,64}$/.test(familyId)) throw new HttpsError('permission-denied', 'Aparelho sem vínculo familiar.');
    if (session.token?.familyRole !== 'parent' && !(session.token?.familyRole === 'child' && session.token?.childScope?.[childId] === true)) {
      throw new HttpsError('permission-denied', 'Este perfil não está liberado neste aparelho.');
    }
    return { familyId };
  }

  async function operar(data, context) {
    const childId = data?.childId;
    if (typeof childId !== 'string' || !CHILD_ID_PATTERN.test(childId)) throw new HttpsError('invalid-argument', 'Perfil inválido.');
    const { familyId } = exigirFamilia(context, childId);
    const session = context.auth;
    const familyPath = `rotinapet/familias/${familyId}`;
    const childSnapshot = await database.ref(`${familyPath}/estado/criancas/${childId}`).once('value');
    if (!childSnapshot.val()) throw new HttpsError('not-found', 'Este perfil não pertence à família.');
    const stateSnapshot = await database.ref(`${familyPath}/estado`).once('value');
    const stateData = stateSnapshot.val() || {};
    const active = stateData.criancaAtivaId === childId;
    const coinsPath = active ? `${familyPath}/estado/moedas` : `${familyPath}/estado/criancasDados/${childId}/moedas`;
    const [coinsSnapshot, cashSnapshot] = await Promise.all([
      database.ref(coinsPath).once('value'),
      database.ref(`${active ? `${familyPath}/estado` : `${familyPath}/estado/criancasDados/${childId}`}/dinheiroAcumulado`).once('value')
    ]);
    const category = data?.category;
    const itemId = data?.itemId;
    const inventoryField = INVENTORY_FIELDS[category];
    const inventoryPath = inventoryField ? `${familyPath}/estado/criancasDados/${childId}/${inventoryField.replaceAll('.', '/')}` : null;
    const legacyInventorySnapshot = inventoryPath ? await database.ref(inventoryPath).once('value') : null;
    const legacyInventory = Array.isArray(legacyInventorySnapshot?.val()) ? legacyInventorySnapshot.val() : [];
    const walletRef = database.ref(`${familyPath}/security/wallets/${childId}`);
    const seed = { petCoins: Math.max(0, Number(coinsSnapshot.val()) || 0), cashBalance: Math.max(0, Number(cashSnapshot.val()) || 0), payments: {}, purchases: {}, gameRewards: {}, rewardClaims: {}, redemptions: {}, inventory: {} };
    if (inventoryField) { seed.inventory[category] = legacyInventory; for (const ownedId of legacyInventory) seed.purchases[`${category}_${ownedId}`] = true; }
    const action = data?.action;
    let result;
    const walletTransaction = await walletRef.transaction(current => {
      const wallet = current ? { ...current } : { ...seed };
      if (!wallet.walletOperationsVersion) { wallet.petCoins = seed.petCoins; wallet.cashBalance = seed.cashBalance; wallet.walletOperationsVersion = 1; }
      const updated = { ...wallet, payments: { ...(wallet.payments || {}) }, purchases: { ...(wallet.purchases || {}) }, gameRewards: { ...(wallet.gameRewards || {}) }, rewardClaims: { ...(wallet.rewardClaims || {}) }, redemptions: { ...(wallet.redemptions || {}) }, inventory: { ...(wallet.inventory || {}) } };
      const serverDay = today();
      const pendingChestDays = new Set((stateData.avisosRecompensas || []).filter(item => item?.tipo === 'bau' && typeof item.data === 'string').map(item => item.data));
      updated.rewardClaims = Object.fromEntries(Object.entries(updated.rewardClaims).filter(([key]) => { const match = key.match(/^(?:daily-surprise|seasonal|daily-challenge|daily-chest)_(\d{4}-\d{2}-\d{2})/); return !match || match[1] === serverDay || pendingChestDays.has(match[1]); }));
      if (action === 'approve-redemption') {
        if (session.token?.familyRole !== 'parent') { result = { error: 'parent-required' }; return; }
        if (stateData.criancaAtivaId !== childId) { result = { error: 'inactive-profile' }; return; }
        const requestId = data?.requestId;
        if (typeof requestId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(requestId)) { result = { error: 'invalid-redemption' }; return; }
        const key = `redemption_${requestId}`;
        const requests = Array.isArray(stateData.solicitacoesPremios) ? stateData.solicitacoesPremios : [];
        const request = requests.find(item => String(item?.id) === requestId);
        if (!request) { result = { error: 'missing-redemption' }; return; }
        const dream = request.sonhoId ? (stateData.sonhos || []).find(item => String(item?.id) === String(request.sonhoId)) : null;
        const configuredPrize = request.recompensaId ? (stateData.recompensas || []).find(item => String(item?.id) === String(request.recompensaId)) : null;
        const record = updated.redemptions[key];
        if (record) { result = { ok: true, alreadyRedeemed: true, requestId, cost: record.cost, petCoins: Number(wallet.petCoins) || 0, request, dream }; return updated; }
        if (request.status !== 'pendente' || request.sonhoId && (!dream || dream.status !== 'precificado') || !request.sonhoId && (!configuredPrize || configuredPrize.ativo === false)) { result = { error: 'invalid-redemption' }; return; }
        const cost = Number(dream ? dream.custo : configuredPrize.custo);
        if (!Number.isInteger(cost) || cost < 0 || cost > 100000) { result = { error: 'invalid-redemption' }; return; }
        if ((Number(wallet.petCoins) || 0) < cost) { result = { error: 'insufficient-funds' }; return; }
        updated.petCoins = Math.max(0, Number(wallet.petCoins) || 0) - cost;
        updated.redemptions[key] = { cost, requestId, approvedAt: now(), approvedBy: session.uid };
        result = { ok: true, alreadyRedeemed: false, requestId, cost, petCoins: updated.petCoins, request, dream };
      } else if (action === 'purchase') {
        const category = data?.category;
        const itemId = data?.itemId;
        const table = DAILY_PURCHASES[category];
        if (!table || typeof itemId !== 'string' || !ITEM_ID_PATTERN.test(itemId) || !Object.hasOwn(table, itemId)) {
          result = { error: 'invalid-item' }; return;
        }
        const field = INVENTORY_FIELDS[category];
        const purchaseKey = `${category}_${itemId}`;
        const price = table[itemId];
        const owned = Array.isArray(updated.inventory[category]) ? updated.inventory[category] : (category === data.category ? legacyInventory : []);
        updated.inventory[category] = owned;
        const already = updated.purchases[purchaseKey] === true || owned.includes(itemId);
        if (already) { updated.purchases[purchaseKey] = true; result = { ok: true, alreadyOwned: true, category, itemId, field, price, petCoins: Number(wallet.petCoins) || 0 }; return updated; }
        if ((Number(wallet.petCoins) || 0) < price) { result = { error: 'insufficient-funds' }; return; }
        updated.petCoins = Math.max(0, Number(wallet.petCoins) || 0) - price;
        updated.purchases[purchaseKey] = true;
        updated.inventory[category] = [...owned, itemId];
        result = { ok: true, alreadyOwned: false, category, itemId, field, price, petCoins: updated.petCoins };
      } else if (action === 'claim-reward') {
        const rewardId = data?.rewardId;
        const reference = data?.reference;
        const day = today();
        let claimKey = '';
        let reward = 0;
        let xp = 0;
        let outcome = 'coins';
        let extra = {};
        let legacyAlreadyClaimed = false;
        if (rewardId === 'daily-surprise') {
          claimKey = `daily-surprise_${day}`; legacyAlreadyClaimed = stateData.surpresaResgatadaData === day; reward = 1 + Math.floor(random() * 4); xp = random() < 0.4 ? 3 : 0;
        } else if (rewardId === 'seasonal-event') {
          const event = eventoAtivoNaData(day);
          if (!event || event.id !== reference) { result = { error: 'invalid-event' }; return; }
          claimKey = `seasonal_${day}_${event.id}`; legacyAlreadyClaimed = stateData.eventoBonusData === day && stateData.eventoBonusId === event.id; reward = event.coins; xp = event.xp; extra = { eventId: event.id };
        } else if (rewardId === 'daily-challenge') {
          claimKey = `daily-challenge_${day}`; legacyAlreadyClaimed = stateData.desafioDiarioFeitoData === day; reward = 10; xp = 20;
        } else if (rewardId === 'daily-chest') {
          const chestDay = typeof reference === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(reference) ? reference : day;
          const pending = (stateData.avisosRecompensas || []).some(item => item?.tipo === 'bau' && item?.data === chestDay);
          if (chestDay !== day && !pending || chestDay === day && !(Number(stateData.tarefasHojeCount) > 0 || stateData.desafioDiarioFeitoData === day || pending)) { result = { error: 'reward-locked' }; return; }
          claimKey = `daily-chest_${chestDay}`; legacyAlreadyClaimed = stateData.bauDiarioAbertoData === chestDay || (stateData.bauDatasResgatadas || []).includes(chestDay);
          const roll = random();
          if (roll < 0.55) reward = 8 + Math.floor(random() * 8);
          else if (roll < 0.88) { outcome = 'xp'; xp = 20; }
          else { outcome = 'shield'; extra.shields = Math.min(2, (Number(stateData.escudosOfensiva) || 0) + 1); }
        } else if (rewardId === 'weekly-chest') {
          const streak = Number(reference);
          if (!Number.isInteger(streak) || streak < 7 || streak % 7 !== 0 || Number(stateData.streak) < streak) { result = { error: 'reward-locked' }; return; }
          claimKey = `weekly-chest_${streak}`; legacyAlreadyClaimed = (Number(stateData.ultimoStreakPremiado) || 0) >= streak; reward = 15 + Math.floor(random() * 16); xp = 50; extra.streak = streak;
        } else if (rewardId === 'family-chest') {
          const milestone = Number(reference);
          const profileIds = Object.keys(stateData.criancas || {});
          const streaks = profileIds.map(id => id === stateData.criancaAtivaId ? Number(stateData.streak) || 0 : Number(stateData.criancasDados?.[id]?.streak) || 0);
          const progress = streaks.length ? Math.min(...streaks) : Number(stateData.streak) || 0;
          if (!Number.isInteger(milestone) || milestone < 3 || milestone > 30 || progress < milestone) { result = { error: 'reward-locked' }; return; }
          claimKey = `family-chest_${milestone}_${progress}`; legacyAlreadyClaimed = Number(stateData.metaFamiliarResgatadaStreak) === progress && !!stateData.metaFamiliarResgatadaEm; reward = 20 + Math.floor(random() * 15); xp = 40; extra = { milestone, progress };
        } else if (rewardId === 'achievement') {
          const amount = ACHIEVEMENT_REWARDS[reference];
          if (!amount) { result = { error: 'invalid-achievement' }; return; }
          claimKey = `achievement_${reference}`; legacyAlreadyClaimed = stateData.conquistas?.[reference] === true; reward = amount; xp = 30; extra = { achievementId: reference };
        } else { result = { error: 'invalid-reward' }; return; }
        if (updated.rewardClaims[claimKey] || legacyAlreadyClaimed) { updated.rewardClaims[claimKey] = updated.rewardClaims[claimKey] || { legacy: true, createdAt: now() }; result = { ok: true, alreadyClaimed: true, rewardId, reward: 0, petCoins: Number(wallet.petCoins) || 0 }; return updated; }
        updated.rewardClaims[claimKey] = { reward, xp, outcome, createdAt: now() };
        if (reward > 0) updated.petCoins = Math.max(0, Number(wallet.petCoins) || 0) + reward;
        result = { ok: true, alreadyClaimed: false, rewardId, reward, xp, outcome, ...extra, petCoins: updated.petCoins };
      } else if (action === 'game-reward') {
        const gameId = data?.gameId;
        if (typeof gameId !== 'string' || !Object.hasOwn(GAME_REWARDS, gameId)) { result = { error: 'invalid-game' }; return; }
        const day = today();
        updated.gameRewards = Object.fromEntries(Object.entries(updated.gameRewards).filter(([key]) => key.startsWith(`${day}_`)));
        const rewardKey = `${day}_${gameId}`;
        if (updated.gameRewards[rewardKey]) { result = { ok: true, alreadyClaimed: true, reward: 0, petCoins: Number(wallet.petCoins) || 0 }; return; }
        const reward = GAME_REWARDS[gameId];
        updated.petCoins = Math.max(0, Number(wallet.petCoins) || 0) + reward;
        updated.gameRewards[rewardKey] = { reward, createdAt: now() };
        result = { ok: true, alreadyClaimed: false, gameId, reward, petCoins: updated.petCoins };
      } else { result = { error: 'invalid-action' }; return; }
      return updated;
    }, undefined, false);
    if (result?.error === 'invalid-item') throw new HttpsError('invalid-argument', 'Item não disponível para compra.');
    if (result?.error === 'invalid-game') throw new HttpsError('invalid-argument', 'Minijogo inválido.');
    if (result?.error === 'invalid-reward' || result?.error === 'invalid-achievement' || result?.error === 'invalid-event') throw new HttpsError('invalid-argument', 'Recompensa indisponível.');
    if (result?.error === 'reward-locked') throw new HttpsError('failed-precondition', 'Recompensa ainda não liberada.');
    if (result?.error === 'invalid-action') throw new HttpsError('invalid-argument', 'Operação inválida.');
    if (result?.error === 'parent-required') throw new HttpsError('permission-denied', 'Somente um responsável pode aprovar este resgate.');
    if (result?.error === 'inactive-profile') throw new HttpsError('failed-precondition', 'Selecione o perfil que enviou o pedido.');
    if (result?.error === 'invalid-redemption' || result?.error === 'missing-redemption') throw new HttpsError('failed-precondition', 'Este pedido não está mais disponível para aprovação.');
    if (result?.error === 'insufficient-funds') throw new HttpsError('failed-precondition', 'Saldo insuficiente.');
    const wallet = walletTransaction.snapshot.val();
    if (!wallet) throw new HttpsError('internal', 'Não foi possível atualizar a carteira.');
    const mirror = {
      [`${familyPath}/estado/criancasDados/${childId}/moedas`]: wallet.petCoins
    };
    if (active) mirror[`${familyPath}/estado/moedas`] = wallet.petCoins;
    if (result.requestId) {
      const requests = Array.isArray(stateData.solicitacoesPremios) ? stateData.solicitacoesPremios.map(item => String(item?.id) === result.requestId ? { ...item, status: 'aprovado', aprovadoEm: now(), mensagem: 'Pedido aprovado pelos pais.' } : item) : [];
      const dreams = Array.isArray(stateData.sonhos) ? stateData.sonhos.map(item => result.dream && String(item?.id) === String(result.dream.id) ? { ...item, status: 'realizado', realizadoEm: now() } : item) : [];
      mirror[`${familyPath}/estado/solicitacoesPremios`] = requests;
      if (result.dream) mirror[`${familyPath}/estado/sonhos`] = dreams;
    }
    if (result.category) {
      const path = `${familyPath}/estado/criancasDados/${childId}/${result.field.replaceAll('.', '/')}`;
      const ids = Array.isArray(wallet.inventory?.[result.category]) ? wallet.inventory[result.category] : [];
      mirror[path] = ids;
      if (active) mirror[`${familyPath}/estado/${result.field.replaceAll('.', '/')}`] = ids;
    }
    await database.ref().update(mirror);
    return { ...result, petCoins: wallet.petCoins };
  }
  return { operar };
}

module.exports = { createWalletOperationHandlers, GAME_REWARDS, DAILY_PURCHASES, ACHIEVEMENT_REWARDS, SEASONAL_EVENTS };
