# RotinaPet — código organizado

Abra `index.html` por um servidor local ou hospedagem HTTPS. Mantenha as pastas `css/` e `js/` ao lado do HTML. Para teste local, na pasta do projeto execute `python3 -m http.server 8000` e abra `http://localhost:8000`.

## Organização

- `index.html`: estrutura e modais.
- `css/`: estilos separados em ordem de aplicação. O número no nome mantém a cascata original.
- `js/02_principal.js`: estado, família, tarefas, pet, áudio, lojas e painel dos pais.
- `js/`: demais funcionalidades em camadas, com números para manter a ordem de execução.

Esta reorganização preserva os trechos e a ordem do HTML original; ela não modifica as regras do app. O bloco principal ainda concentra lógica demais. A próxima refatoração deve separar estado/sincronização, tarefas/aprovação, pet/áudio e interface, removendo substituições tardias de funções após testes de regressão.

## Arquivos externos já referenciados

O HTML continua referenciando `manifest.json` e `icon-192.png` e usa bibliotecas externas via CDN. Eles não estavam anexados ao HTML recebido. Para instalação PWA, coloque os arquivos reais ao lado de `index.html` e inclua o service worker usado na sua hospedagem.

## Reações Lottie (teste)

Inclui dois arquivos em `animacoes/`: `gato_carinho.json` para toque no gato e `gato_risada.json` após ganhar um minijogo. O segundo arquivo de risada enviado era uma cópia idêntica, por isso foi omitido. A animação aparece no lugar do SVG durante a reação e o pet atual volta em seguida; se o player ou o JSON não carregar, o pet original continua visível. Esta versão ainda usa o SVG para o estado parado, outros pets e outras ações.

O player é carregado por CDN. O PWA existente deve atualizar o cache do service worker para incluir `css/`, `js/` e `animacoes/` quando estes arquivos forem publicados.
