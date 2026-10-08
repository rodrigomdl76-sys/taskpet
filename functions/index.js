const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { createPushHandler } = require('./push-handler');
const { createFamilyAccessHandlers } = require('./family-access');
const HttpsError = functions.https.HttpsError;

admin.initializeApp();

const familyAccess = createFamilyAccessHandlers({ database: admin.database(), auth: admin.auth(), HttpsError });
exports.solicitarAcessoFamilia = functions.region('us-central1').https.onCall(familyAccess.solicitarAcesso);
exports.registrarResponsavelFamiliaNova = functions.region('us-central1').https.onCall(familyAccess.registrarResponsavelFamiliaNova);
exports.listarSolicitacoesFamilia = functions.region('us-central1').https.onCall(familyAccess.listarSolicitacoes);
exports.aprovarAcessoFamilia = functions.region('us-central1').https.onCall(familyAccess.aprovarAcesso);

const DB_INSTANCE = 'rotinapet-624a9-default-rtdb';
const QUEUE_PATH = '/rotinapet/familias/{familyId}/pushQueue/{pushId}';

exports.enviarPushAosPais = functions
  .region('us-central1')
  .runWith({ memory: '256MB', timeoutSeconds: 30, maxInstances: 3, failurePolicy: true })
  .database
  .instance(DB_INSTANCE)
  .ref(QUEUE_PATH)
  .onCreate(createPushHandler({
    database: admin.database(),
    messaging: admin.messaging(),
    logger: functions.logger
  }));
