const FAMILY_ID_PATTERN = /^[a-z0-9_-]{1,64}$/;
const TOKEN_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const MAX_FCM_BATCH = 500;

function textoSeguro(valor, padrao, maximo) {
  if (typeof valor !== 'string') return padrao;
  const texto = valor.trim().replace(/[\u0000-\u001f\u007f]/g, ' ');
  return texto ? texto.slice(0, maximo) : padrao;
}

function caminhoAppSeguro(valor) {
  if (typeof valor !== 'string' || valor.length > 512) return './';
  if (!valor.startsWith('/') || valor.startsWith('//') || /[\r\n]/.test(valor)) return './';
  return valor;
}

function normalizarAviso(valor, pushId) {
  if (!valor || typeof valor !== 'object' || valor.onlyPerfil !== 'pais') return null;
  const id = String(pushId || 'aviso').replace(/[^A-Za-z0-9_-]/g, '').slice(-32) || 'aviso';
  const tagBase = textoSeguro(valor.tag, 'rotinapet', 64).replace(/[^A-Za-z0-9_-]/g, '-');
  return {
    title: textoSeguro(valor.title, '🐾 RotinaPet', 80),
    body: textoSeguro(valor.body, 'Há uma novidade para aprovar.', 220),
    tag: `${tagBase}-${id}`.slice(0, 96),
    url: caminhoAppSeguro(valor.url)
  };
}

function tokensDosPais(registros) {
  const vistos = new Set();
  return Object.entries(registros || {}).flatMap(([uid, registro]) => {
    if (!TOKEN_ID_PATTERN.test(uid) || !registro || registro.perfil !== 'pais') return [];
    const token = typeof registro.token === 'string' ? registro.token.trim() : '';
    if (!token || vistos.has(token)) return [];
    vistos.add(token);
    return [{ uid, token }];
  });
}

function dividirEmLotes(itens, tamanho = MAX_FCM_BATCH) {
  const lotes = [];
  for (let i = 0; i < itens.length; i += tamanho) lotes.push(itens.slice(i, i + tamanho));
  return lotes;
}

function familiaValida(id) {
  return typeof id === 'string' && FAMILY_ID_PATTERN.test(id);
}

module.exports = { normalizarAviso, tokensDosPais, dividirEmLotes, familiaValida };
