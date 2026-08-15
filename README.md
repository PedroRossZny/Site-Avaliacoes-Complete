# Avalia Aqui

Avalia Aqui e uma plataforma web para avaliar estabelecimentos. O projeto combina um frontend em HTML, CSS e JavaScript puro com uma API em Node.js, Express e Sequelize, usando SQLite como banco local.

A aplicacao permite votar por estrelas, consultar um ranking por media de avaliacoes e interagir em comentarios anonimos por estabelecimento.

## Funcionalidades

- Votacao de estabelecimentos com notas de 1 a 5 estrelas.
- Persistencia do voto por usuario anonimo usando `localStorage` e API.
- Ranking de estabelecimentos ordenado pela media das avaliacoes.
- Contagem total de avaliacoes por estabelecimento.
- Area de comentarios por estabelecimento.
- Respostas a comentarios.
- Likes e unlikes em comentarios e respostas.
- Ordenacao de comentarios por mais recentes ou mais curtidos.
- Busca de estabelecimentos nas telas de votacao e ranking.
- Frontend servido pelo proprio backend Express.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- Sequelize
- SQLite
- Nodemon para desenvolvimento

## Estrutura do projeto

```text
.
+-- server/
|   +-- controllers/
|   |   +-- commentController.js
|   |   +-- reviewController.js
|   +-- models/
|   |   +-- Comment.js
|   |   +-- Review.js
|   +-- public/
|   |   +-- assets/
|   |   +-- css/
|   |   +-- js/
|   |   +-- index.html
|   |   +-- vote.html
|   |   +-- rank.html
|   |   +-- carrossel.html
|   |   +-- estabelecimento1.html ... estabelecimento7.html
|   +-- routes/
|   |   +-- commentRoutes.js
|   |   +-- index.js
|   |   +-- reviewRoutes.js
|   +-- utils/
|   |   +-- db.js
|   +-- index.js
+-- .gitignore
+-- package.json
+-- package-lock.json
+-- README.md
```

## Como executar localmente

### Pre-requisitos

- Node.js instalado, preferencialmente uma versao LTS.
- npm instalado junto com o Node.js.

### Passo a passo

Clone o repositorio e acesse a pasta da aplicacao:

```bash
git clone <URL_DO_REPOSITORIO>
cd Site-Avaliacoes-Complete
```

Instale as dependencias:

```bash
npm install
```

Inicie o servidor:

```bash
npm start
```

Ou, durante o desenvolvimento, use:

```bash
npm run dev
```

Acesse no navegador:

```text
http://localhost:3000
```

## Scripts disponiveis

```bash
npm start
```

Executa o servidor com `node server/index.js`.

```bash
npm run dev
```

Executa o servidor com `nodemon server/index.js`, reiniciando automaticamente apos alteracoes.

## Paginas da aplicacao

- `/` ou `/index.html`: tela inicial com acesso a votacao, ranking e comentarios.
- `/vote.html`: lista de estabelecimentos para votacao por estrelas.
- `/rank.html`: ranking dos estabelecimentos por media de avaliacao.
- `/carrossel.html`: carrossel para escolher o estabelecimento na area de comentarios.
- `/estabelecimento1.html` a `/estabelecimento7.html`: paginas de comentarios individuais.

## API

Todas as rotas abaixo usam o prefixo `/api`.

### Status

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/api` | Retorna uma mensagem simples indicando que o servidor esta rodando. |

### Avaliacoes

| Metodo | Rota | Descricao |
| --- | --- | --- |
| POST | `/api/reviews` | Cria uma avaliacao para um estabelecimento. |
| GET | `/api/reviews` | Lista avaliacoes. Aceita `placeId` como filtro opcional. |
| GET | `/api/reviews/average/:placeId` | Retorna a media de notas e a quantidade de avaliacoes de um estabelecimento. |
| PUT | `/api/reviews/:id` | Atualiza a nota e o comentario de uma avaliacao existente. |

Exemplo de corpo para criar avaliacao:

```json
{
  "placeId": "1",
  "rating": 5,
  "comment": "",
  "anonId": "id-anonimo"
}
```

### Comentarios

| Metodo | Rota | Descricao |
| --- | --- | --- |
| POST | `/api/comments` | Cria um comentario ou uma resposta. |
| GET | `/api/comments?placeId=1` | Lista comentarios de um estabelecimento com respostas aninhadas. |
| POST | `/api/comments/:id/like` | Adiciona um like ao comentario. |
| DELETE | `/api/comments/:id/like` | Remove um like do comentario. |
| DELETE | `/api/comments/:id` | Remove um comentario e suas respostas diretas. |

Exemplo de corpo para criar comentario:

```json
{
  "placeId": 1,
  "text": "Otimo atendimento!",
  "anonId": "id-anonimo"
}
```

Exemplo de corpo para criar resposta:

```json
{
  "placeId": 1,
  "text": "Concordo com a avaliacao.",
  "anonId": "id-anonimo",
  "parentCommentId": 3
}
```

## Banco de dados

O projeto usa SQLite com Sequelize. Ao iniciar o servidor, as tabelas sao sincronizadas automaticamente por `sequelize.sync()`.

O arquivo do banco e criado em:

```text
database.sqlite
```

Esse arquivo esta no `.gitignore`, junto com `node_modules/` e `.env`, para evitar versionar dados locais e dependencias instaladas.

## Observacoes importantes

- A porta do servidor esta fixa em `3000` no arquivo `server/index.js`.
- O projeto importa `dotenv`, mas a configuracao atual nao exige variaveis de ambiente para rodar localmente.
- O identificador anonimo do usuario e salvo no navegador em `localStorage`.
- Os likes tambem usam estado local do navegador para controlar a interface do usuario.
- Ainda nao ha uma suite de testes automatizados configurada.

## Melhorias futuras

- Permitir configurar a porta por variavel de ambiente.
- Adicionar validacoes mais rigorosas nos dados enviados para a API.
- Impedir votos duplicados no backend por `anonId` e `placeId`.
- Criar testes automatizados para rotas, modelos e fluxos principais do frontend.
- Adicionar paginacao em comentarios e avaliacoes.
- Melhorar mensagens de erro e estados de carregamento na interface.

## Autor

Projeto desenvolvido por [PedroRossZny](https://github.com/PedroRossZny).
