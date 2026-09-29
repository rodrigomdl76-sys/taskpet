# RotinaPet — PWA de rotina infantil

O app está publicado no GitHub Pages. Para executar o projeto, mantenha `index.html`, `js/`, `css/`, `animacoes/` e `assets/` juntos.

## Pet principal

O gato tem três fases implementadas em WebP animado:

| Fase | Nome | Nível inicial | Animações |
| --- | --- | ---: | --- |
| 1 | Ovo-gato | 1 | Parado, carinho, dormir e comemorar |
| 2 | Gato Cavalheiro | 21 | Parado, carinho, dormir e comemorar |
| 3 | Gato Real | 41 | Parado, carinho, dormir e comemorar |

O toque no pet dá carinho. A Home também oferece **Dar Carinho**, **Brincar** e **Comemorar**. Brincar usa a lógica própria do app; não há WebP específico de brincar. Não há animação de dança nesta versão. O perfil dos pais permite testar as três fases sem alterar o nível salvo.

Depois de carregar a primeira imagem, o app pré-carrega os quatro WebP da fase atual. Os 12 arquivos continuam grandes (cerca de 14,6 MB no total); ainda falta recomprimir os originais para reduzir o tráfego móvel.

## Dados e segurança

O app usa Firebase Auth, Realtime Database e Storage, além de cópia local para uso offline. O PIN de quatro dígitos protege a interface do painel dos pais no aparelho; **não é uma autorização segura para leitura ou escrita no Firebase**. O app aceita autenticação anônima e identifica famílias por código. As regras publicadas do Realtime Database e do Storage devem ser auditadas para impedir que um usuário autenticado acesse outra família ou suas fotos. Essas regras não estão neste repositório; não presuma que os dados estejam protegidos até verificar as regras ativas no console do Firebase.

## Interface e conteúdo

A loja oferece fundos, palcos, temas, itens de decoração e mini pets. O passarinho é o mini pet inicial. O código ainda concentra grande parte da lógica em `js/02_principal.js` e carrega várias folhas CSS; a divisão em módulos e a compactação de recursos permanecem pendentes.
