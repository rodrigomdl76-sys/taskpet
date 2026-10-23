# Push de aprovação para os responsáveis

`enviarPushAosPais` observa novos itens em `rotinapet/familias/{familyId}/pushQueue/{pushId}`. Para itens com `onlyPerfil: "pais"`, procura tokens FCM registrados com `perfil: "pais"` e envia uma mensagem de dados. O `sw.js` já mostra esse payload quando o app está em segundo plano; com o app aberto, o listener `onMessage` mostra o aviso.

O código não guarda chave privada nem credenciais. O Admin SDK usa a identidade de serviço gerenciada pelo Firebase.

# Pagamento seguro de tarefas

`aprovarTarefaSegura` exige sessão de responsável e verifica a tarefa V2 do perfil informado. Ela registra a aprovação e um identificador idempotente, credita PetCoins e mesada em `security/wallets/{childId}` por transação, e atualiza os saldos espelhados usados pela interface. Uma repetição da mesma chamada não credita novamente. O primeiro crédito inicializa a carteira com os saldos legados do perfil. A primeira operação da carteira também sincroniza uma única vez o saldo espelhado legado, preservando ganhos feitos antes desta migração.

A aprovação de tarefas exige internet nesta versão. Tarefas antigas já aprovadas sem o marcador da versão segura são recusadas pela função para evitar pagamento em duplicidade. Implante a função antes de publicar o app. As regras em `database.rules.json` também restringem gravações de filhos; antes de implantá-las, migre os aparelhos infantis já aprovados para incluir os perfis autorizados e teste as regras no emulador. Publicar só o app antes da função deixa o botão de aprovação sem o endpoint necessário.

## Carteira, compras e minijogos

`operarCarteiraSegura` executa compras por catálogo no servidor (Ateliê, mini pets, gestos, reações da Axolote, palcos e fundos), debita o preço cadastrado e registra a posse na carteira com idempotência. O cliente não define preço. A operação também reconhece itens já existentes no perfil para evitar cobrar de novo na primeira migração.

Os minijogos, desafios, baús, bônus sazonais e conquistas agora usam valores fixos ou sorteados no servidor e recibos idempotentes. O cliente não envia quantidade de moedas. Os resgates de sonhos/prêmios também debitam a carteira por transação e só podem ser aprovados por um responsável autenticado.

A função limita repetições e valores, mas não comprova que a criança concluiu uma partida ou atividade. Um cliente modificado ainda pode solicitar os prêmios limitados de cada desafio/jogo e declarar IDs de conquistas permitidos, uma vez por chave. As regras locais removem do perfil infantil a gravação direta de PetCoins, mesada e total sacado; implante e teste essas regras no emulador antes de publicar. Até as regras estarem implantadas, a nuvem continua aceitando a política antiga.

## Preparar e testar

```sh
cd functions
npm install
npm test
```

## Implantar

Cloud Functions só pode ser implantado no plano Blaze. Não faça o upgrade do projeto sem entender e autorizar a associação a uma conta de faturamento. Depois que o projeto estiver no Blaze e a Cloud Messaging API estiver habilitada, execute na raiz:

```sh
firebase deploy --only functions:enviarPushAosPais,functions:aprovarTarefaSegura,functions:operarCarteiraSegura
```

Depois de migrar os aparelhos infantis aprovados e testar no emulador, implante as regras da carteira separadamente:

```sh
firebase deploy --only database
```

Cada aparelho dos responsáveis também precisa permitir notificações e ativar push no painel dos pais. O token precisa aparecer em `rotinapet/familias/{familyId}/fcmTokens/{uid}` com `perfil: "pais"`.

## Teste de ponta a ponta

1. Ative push em um aparelho dos responsáveis e confirme o token na família correta.
2. Em outro aparelho, envie uma tarefa para aprovação.
3. Confirme nos logs da função que o aviso foi processado e no aparelho dos pais que chegou.

O modo de emulação pode testar a lógica sem implantar no projeto real. A entrega no aparelho só pode ser confirmada depois da implantação e do teste entre aparelhos.
