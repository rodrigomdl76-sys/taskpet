const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const appSource = fs.readFileSync(path.join(__dirname, '../../js/02_principal.js'), 'utf8');
const start = appSource.indexOf('function preferirStatusTarefa(');
const end = appSource.indexOf('function prepararTarefaParaHoje(', start);
assert(start >= 0 && end > start, 'funções de mesclagem de tarefas encontradas');

const hoje = '2026-10-14';
const mergeTarefas = new Function(
  'hojeLocal',
  'idsTarefasExcluidas',
  'prepararTarefaParaHoje',
  `${appSource.slice(start, end)}\nreturn mergeTarefasPorVersao;`
)(
  () => hoje,
  () => new Set(),
  tarefa => tarefa
);

test('preserva pedido de aprovação mesmo quando o relógio local está adiantado', () => {
  const local = {
    id: 'tarefa-1',
    status: 'pendente',
    atualizadoEm: 9999999999999,
    registros: { [hoje]: { status: 'pendente' } }
  };
  const remoto = {
    id: 'tarefa-1',
    status: 'aguardando_aprovacao',
    atualizadoEm: 1000,
    registros: { [hoje]: { status: 'aguardando_aprovacao', enviadaEm: 2000 } }
  };

  assert.equal(mergeTarefas([local], [remoto])[0].status, 'aguardando_aprovacao');
});

test('preserva uma recusa mais recente do que o pedido remoto antigo', () => {
  const local = {
    id: 'tarefa-1',
    status: 'pendente',
    registros: { [hoje]: { status: 'pendente', recusadaEm: 3000 } }
  };
  const remoto = {
    id: 'tarefa-1',
    status: 'aguardando_aprovacao',
    registros: { [hoje]: { status: 'aguardando_aprovacao', enviadaEm: 2000 } }
  };

  assert.equal(mergeTarefas([local], [remoto])[0].status, 'pendente');
});

test('aceita novo envio feito depois de uma recusa', () => {
  const local = {
    id: 'tarefa-1',
    status: 'pendente',
    registros: { [hoje]: { status: 'pendente', recusadaEm: 3000 } }
  };
  const remoto = {
    id: 'tarefa-1',
    status: 'aguardando_aprovacao',
    registros: { [hoje]: { status: 'aguardando_aprovacao', enviadaEm: 4000 } }
  };

  assert.equal(mergeTarefas([local], [remoto])[0].status, 'aguardando_aprovacao');
});

test('aprovação paga prevalece sobre cópia pendente antiga', () => {
  const aprovado = {
    id: 'tarefa-1',
    status: 'aprovada',
    atualizadoEm: 2000,
    registros: { [hoje]: { status: 'aprovada', recompensaPagaEm: 2000 } }
  };
  const pendenteAntiga = {
    id: 'tarefa-1',
    status: 'pendente',
    atualizadoEm: 3000,
    registros: { [hoje]: { status: 'pendente' } }
  };

  assert.equal(mergeTarefas([aprovado], [pendenteAntiga])[0].status, 'aprovada');
});

test('aprovação paga remota prevalece sobre cópia local pendente', () => {
  const pendenteLocal = {
    id: 'tarefa-1',
    status: 'pendente',
    atualizadoEm: 3000,
    registros: { [hoje]: { status: 'pendente' } }
  };
  const aprovadoRemoto = {
    id: 'tarefa-1',
    status: 'aprovada',
    atualizadoEm: 2000,
    registros: { [hoje]: { status: 'aprovada', recompensaPagaEm: 2000 } }
  };

  assert.equal(mergeTarefas([pendenteLocal], [aprovadoRemoto])[0].status, 'aprovada');
});

const perfilMergeStart = appSource.indexOf('function mesclarDadosPerfilCriancaAtivo(');
const perfilMergeEnd = appSource.indexOf('function aplicarEstadoRemotoComMerge(', perfilMergeStart);
assert(perfilMergeStart >= 0 && perfilMergeEnd > perfilMergeStart, 'função de mesclagem do perfil ativo encontrada');
const mergePerfilAtivo = new Function(
  `${appSource.slice(perfilMergeStart, perfilMergeEnd)}\nreturn mesclarDadosPerfilCriancaAtivo;`
)();

test('perfil ativo usa o saldo atualizado do estado principal', () => {
  const perfilSalvoAntigo = { moedas: 12, pets: { gato: { nivel: 3, xp: 10 } } };
  const estadoPrincipalAtualizado = { moedas: 27, pets: { gato: { nivel: 4, xp: 5 } } };

  const mesclado = mergePerfilAtivo(perfilSalvoAntigo, estadoPrincipalAtualizado);

  assert.equal(mesclado.moedas, 27);
  assert.deepEqual(mesclado.pets, { gato: { nivel: 4, xp: 5 } });
});
