const functions = require('firebase-functions/v1');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getDatabase } = require('firebase-admin/database');
const { getStorage } = require('firebase-admin/storage');
const { getMessaging } = require('firebase-admin/messaging');
const { createPushHandler } = require('./push-handler');
const { createFamilyAccessHandlers } = require('./family-access');
const { createFamilyDeletionHandler } = require('./family-deletion');
const { createFamilyPhotoHandlers } = require('./family-photos');
const HttpsError = functions.https.HttpsError;

const app = initializeApp();
const database = getDatabase(app, 'https://rotinapet-624a9-default-rtdb.firebaseio.com');
const auth = getAuth(app);
const messaging = getMessaging(app);
const bucket = getStorage(app).bucket('rotinapet-624a9.firebasestorage.app');

const familyAccess = createFamilyAccessHandlers({ database, auth, HttpsError });
const excluirFamilia = createFamilyDeletionHandler({ database, auth, bucket, HttpsError });
const fotosFamilia = createFamilyPhotoHandlers({ bucket, HttpsError });
exports.solicitarAcessoFamilia = functions.region('us-central1').https.onCall(familyAccess.solicitarAcesso);
exports.registrarResponsavelFamiliaNova = functions.region('us-central1').https.onCall(familyAccess.registrarResponsavelFamiliaNova);
exports.listarSolicitacoesFamilia = functions.region('us-central1').https.onCall(familyAccess.listarSolicitacoes);
exports.aprovarAcessoFamilia = functions.region('us-central1').https.onCall(familyAccess.aprovarAcesso);
exports.excluirFamilia = functions.region('us-central1').https.onCall(excluirFamilia);
exports.baixarFotoFamilia = functions.region('us-central1').runWith({ memory: '512MB', timeoutSeconds: 30 }).https.onCall(fotosFamilia.baixarFoto);
exports.protegerFotosFamilia = functions.region('us-central1').runWith({ memory: '512MB', timeoutSeconds: 120 }).https.onCall(fotosFamilia.protegerFotos);

const DB_INSTANCE = 'rotinapet-624a9-default-rtdb';
const QUEUE_PATH = '/rotinapet/familias/{familyId}/pushQueue/{pushId}';

exports.enviarPushAosPais = functions
  .region('us-central1')
  .runWith({ memory: '256MB', timeoutSeconds: 30, maxInstances: 3, failurePolicy: true })
  .database
  .instance(DB_INSTANCE)
  .ref(QUEUE_PATH)
  .onCreate(createPushHandler({
    database,
    messaging,
    logger: functions.logger
  }));
