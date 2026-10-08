# Acesso familiar por UID

## O que muda

- Cada aparelho autenticado recebe os claims `familyId` e `familyRole` (`parent` ou `child`). O código de convite passa a abrir uma solicitação; ele sozinho não dá acesso à nuvem.
- Uma família nova usa um ID aleatório `fam_<32 hex>`. O primeiro aparelho pode reivindicá-la uma vez como responsável. Famílias legadas precisam ter o UID do responsável inicializado pelo Admin SDK.
- O responsável aprova aparelhos pendentes no painel dos pais. O aparelho aprovado deve recarregar para buscar o token novo.
- PIN, tentativas/bloqueio do PIN e e-mails de recuperação passam para `pais/segredos`. Os campos de progresso da criança são os únicos que o papel `child` pode atualizar diretamente no nó `estado`.
- Tokens FCM ficam legíveis só pelo próprio UID. `pushQueue` só aceita novos avisos pequenos para os responsáveis. O Storage limita uploads a JPEG de até 2 MiB no caminho da família do claim.

## Migração de uma família legada

Faça e guarde um backup do app antes de começar. As regras atuais ainda aceitam qualquer usuário autenticado; não publique as novas regras antes de identificar o UID do responsável inicial e migrar os segredos.

1. Instale as dependências de `functions` e publique primeiro as Cloud Functions:

   `cd functions && npm ci`

   `firebase deploy --only functions`

2. Configure credenciais Admin SDK e `FIREBASE_DATABASE_URL` para o RTDB `rotinapet-624a9-default-rtdb`. Use o UID real da conta do responsável, consultado em Authentication no Firebase Console. Não escolha um UID só pelo nome do aparelho.

3. Mova os campos confidenciais para o nó privado:

   `node scripts/migrate-private-parent-data.js <codigoDaFamilia>`

4. Associe o primeiro responsável:

   `node scripts/grant-family-parent.js <codigoDaFamilia> <uidDoResponsavel>`

5. Publique a versão web deste branch. Nos outros aparelhos, abra o convite; no painel do responsável, aprove cada aparelho que deve entrar como criança.

6. Depois de conferir os membros e testar um aparelho de cada papel, revise e publique as regras:

   `firebase deploy --only database,storage`

Antes do passo 6, confira no RTDB que `pinHash`, `emailsRecuperacao` e os campos do PIN não aparecem mais dentro de `estado`, e que o responsável lê `pais/segredos`.

## Escopo e pontos a validar

- As regras protegem os nós de dados por família e claim; o PIN deixa de estar no estado compartilhado. A lista de campos que crianças podem atualizar mantém o fluxo atual de tarefas e progresso. O app ainda grava tarefas completas nos nós individuais para preservar o merge offline; validação de cada operação de tarefa e proteção contra alteração manual de moedas/recompensas exigem uma etapa separada no backend.
- O app atualmente grava URLs de download do Firebase Storage nos dados da tarefa. Essas URLs incluem um token de download que funciona como link portador; quem obtiver o link pode acessá-lo enquanto o token continuar válido. As regras limitam a emissão/leitura inicial e os novos uploads, mas não tornam privados links já emitidos. Não trate o Storage como proteção completa de fotos até o app trocar esses links por leitura autenticada ou URLs temporárias.
- A inicialização de responsável em família nova é atômica e aceita apenas o formato aleatório gerado pelo app. Famílias existentes usam o script Admin, que precisa ser executado com o UID correto.

Os scripts e as regras aqui são arquivos de preparação. As regras ativas do Firebase não são alteradas por este commit.

