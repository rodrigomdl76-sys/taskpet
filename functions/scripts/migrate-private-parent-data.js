'use strict';

const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

const CAMPOS = ['pinHash', 'pinBloqueadoAte', 'pinTentativasFalhas', 'pinPersonalizado', 'privacidadeAceita', 'onboardingVistoPais', 'emailsRecuperacao', 'emailRecuperacao', 'pinPais'];

function familiaValida(value) { return typeof value === 'string' && /^[a-z0-9_-]{1,64}$/.test(value); }

async function migrarSegredos(database, familyId) {
  if (!familiaValida(familyId)) throw new Error('Código de família inválido.');
  const base = `rotinapet/familias/${familyId}`;
  const snapshot = await database.ref(`${base}/estado`).once('value');
  const state = snapshot.val();
  if (!state || typeof state !== 'object') throw new Error('Não foi encontrado estado para esta família.');
  const privateSnapshot = await database.ref(`${base}/pais/segredos`).once('value');
  const privateData = privateSnapshot.val() || {};
  const updates = {};
  for (const field of CAMPOS) {
    if (Object.prototype.hasOwnProperty.call(state, field)) {
      if (!Object.prototype.hasOwnProperty.call(privateData, field)) updates[`${base}/pais/segredos/${field}`] = state[field];
      updates[`${base}/estado/${field}`] = null;
    }
  }
  if (Object.keys(updates).length) await database.ref().update(updates);
  return { migrated: Object.keys(updates).filter(path => path.includes('/pais/segredos/')).length, removed: Object.keys(updates).filter(path => path.includes('/estado/')).length };
}

async function main() {
  const familyId = process.argv[2];
  if (!process.env.FIREBASE_DATABASE_URL) throw new Error('Defina FIREBASE_DATABASE_URL para apontar explicitamente ao RTDB.');
  if (!familiaValida(familyId)) throw new Error('Uso: node scripts/migrate-private-parent-data.js <familyId>');
  const app = initializeApp({
    credential: applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: 'rotinapet-624a9'
  });
  console.log(JSON.stringify({ familyId, ...(await migrarSegredos(getDatabase(app), familyId)) }));
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { migrarSegredos, CAMPOS };
