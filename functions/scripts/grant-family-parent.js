'use strict';


async function main() {
  const [familyId, uid] = process.argv.slice(2);
  if (!process.env.FIREBASE_DATABASE_URL) throw new Error('Defina FIREBASE_DATABASE_URL para apontar explicitamente ao RTDB.');
  if (!/^[a-z0-9_-]{1,64}$/.test(familyId || '') || !/^[A-Za-z0-9_-]{1,128}$/.test(uid || '')) throw new Error('Uso: node scripts/grant-family-parent.js <familyId> <uid>');
  const admin = require('firebase-admin');
  admin.initializeApp({ credential: admin.credential.applicationDefault(), databaseURL: process.env.FIREBASE_DATABASE_URL });
  const auth = admin.auth();
  const user = await auth.getUser(uid);
  const claims = { ...(user.customClaims || {}) };
  if (claims.familyId && claims.familyId !== familyId) throw new Error('Este UID já pertence a outra família.');
  claims.familyId = familyId; claims.familyRole = 'parent';
  await auth.setCustomUserClaims(uid, claims);
  await admin.database().ref(`rotinapet/familias/${familyId}/security/members/${uid}`).set({ familyId, role: 'parent', approvedBy: 'admin-bootstrap', approvedAt: Date.now() });
  console.log(JSON.stringify({ familyId, uid, role: 'parent', nextStep: 'Saia e entre novamente neste aparelho para atualizar o token.' }));
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
