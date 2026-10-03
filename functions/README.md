# Push de aprovação para os responsáveis

`enviarPushAosPais` observa novos itens em `rotinapet/familias/{familyId}/pushQueue/{pushId}`. Para itens com `onlyPerfil: "pais"`, procura tokens FCM registrados com `perfil: "pais"` e envia uma mensagem de dados. O `sw.js` já mostra esse payload quando o app está em segundo plano; com o app aberto, o listener `onMessage` mostra o aviso.

O código não guarda chave privada nem credenciais. O Admin SDK usa a identidade de serviço gerenciada pelo Firebase.

## Preparar e testar

```sh
cd functions
npm install
npm test
```

## Implantar

Cloud Functions só pode ser implantado no plano Blaze. Não faça o upgrade do projeto sem entender e autorizar a associação a uma conta de faturamento. Depois que o projeto estiver no Blaze e a Cloud Messaging API estiver habilitada, execute na raiz:

```sh
firebase deploy --only functions:enviarPushAosPais
```

Cada aparelho dos responsáveis também precisa permitir notificações e ativar push no painel dos pais. O token precisa aparecer em `rotinapet/familias/{familyId}/fcmTokens/{uid}` com `perfil: "pais"`.

## Teste de ponta a ponta

1. Ative push em um aparelho dos responsáveis e confirme o token na família correta.
2. Em outro aparelho, envie uma tarefa para aprovação.
3. Confirme nos logs da função que o aviso foi processado e no aparelho dos pais que chegou.

O modo de emulação pode testar a lógica sem implantar no projeto real. A entrega no aparelho só pode ser confirmada depois da implantação e do teste entre aparelhos.
