'use strict';

const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getDatabase } = require('firebase-admin/database');

async function main() {
  const [familyId, uid] = process.argv.slice(2);
  if (!process.env.FIREBASE_DATABASE_URL) throw new Error('Defina FIREBASE_DATABASE_URL para apontar explicitamente ao RTDB.');
  if (!/^[a-z0-9_-]{1,64}$/.test(familyId || '') || !/^[A-Za-z0-9_-]{1,128}$/.test(uid || '')) throw new Error('Uso: node scripts/grant-family-parent.js <familyId> <uid>');
  const app = initializeApp({
    credential: applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: 'rotinapet-624a9'
  });
  const auth = getAuth(app);
  const database = getDatabase(app);
  const user = await auth.getUser(uid);
  const claims = { ...(user.customClaims || {}) };
  if (claims.familyId && claims.familyId !== familyId) throw new Error('Este UID já pertence a outra família.');
  claims.familyId = familyId; claims.familyRole = 'parent';
  await auth.setCustomUserClaims(uid, claims);
  await database.ref(`rotinapet/familias/${familyId}/security/members/${uid}`).set({ familyId, role: 'parent', approvedBy: 'admin-bootstrap', approvedAt: Date.now() });
  console.log(JSON.stringify({ familyId, uid, role: 'parent', nextStep: 'Saia e entre novamente neste aparelho para atualizar o token.' }));
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
