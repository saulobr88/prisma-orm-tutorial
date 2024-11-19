# Tutorial Completo Prisma ORM

## Índice
1. [Introdução ao Prisma](#introdução)
2. [Instalação e Configuração](#instalação)
3. [Schema e Modelos](#schema)
4. [Operações Básicas](#operações)
5. [Relacionamentos](#relacionamentos)
6. [Consultas Avançadas](#consultas)
7. [Migrations](#migrations)
8. [Boas Práticas](#práticas)

## Introdução
O Prisma é um ORM (Object-Relational Mapping) moderno para Node.js e TypeScript que simplifica o trabalho com bancos de dados. Algumas das principais funcionalidades do Prisma são:

- **Type Safety**: O Prisma gera tipos TypeScript automaticamente a partir do seu schema de banco de dados, garantindo type safety em todo o seu código.
- **Auto-completion**: O Prisma fornece auto-complete inteligente nas suas consultas, economizando tempo e evitando erros.
- **Query Building Intuitivo**: O Prisma oferece uma API fluente e intuitiva para construir consultas complexas de forma simples.
- **Migrations Automáticas**: O Prisma cuida das migrações do seu banco de dados, tornando o processo mais fácil e menos propenso a erros.
- **Suporte a Múltiplos Bancos de Dados**: O Prisma suporta PostgreSQL, MySQL, SQLite e SQL Server, permitindo que você troque de banco de dados com facilidade.

## Instalação

```bash
# Iniciar um projeto Node.js
npm init -y

# Instalar dependências do Prisma
npm install @prisma/client
npm install prisma --save-dev

# Inicializar o Prisma
npx prisma init
```

Durante a inicialização, o Prisma irá criar um diretório `.prisma` com alguns arquivos importantes:

- `schema.prisma`: Onde você define os seus modelos de dados.
- `.env`: Arquivo para armazenar as suas variáveis de ambiente, como a URL de conexão com o banco de dados.

## Schema e Modelos
O arquivo `schema.prisma` é o coração do Prisma. Nele, você define os seus modelos de dados e seus relacionamentos. Veja um exemplo:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

Neste exemplo, temos dois modelos: `User` e `Post`. O modelo `User` possui campos como `email`, `name` e também uma relação `1:N` com o modelo `Post`. Já o modelo `Post` possui campos como `title`, `content` e `published`, além de uma relação `N:1` com o modelo `User`.

O Prisma gera automaticamente os tipos TypeScript correspondentes a esses modelos, permitindo que você os use em todo o seu código de forma segura e produtiva.

## Operações Básicas
Agora que temos os nossos modelos definidos, podemos começar a realizar operações básicas de CRUD (Create, Read, Update, Delete) usando a API do Prisma Client.

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Criar um usuário
async function createUser() {
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'John Doe',
    },
  })
  return user
}

// Buscar todos os usuários
async function getUsers() {
  const users = await prisma.user.findMany()
  return users
}

// Atualizar um usuário
async function updateUser(id: number, data: any) {
  const user = await prisma.user.update({
    where: { id },
    data,
  })
  return user
}

// Deletar um usuário
async function deleteUser(id: number) {
  await prisma.user.delete({
    where: { id },
  })
}
```

Essas são apenas algumas das operações básicas que você pode realizar com o Prisma. Veremos mais exemplos e abordagens avançadas nas próximas seções.

## Relacionamentos
Uma das principais vantagens do Prisma é a facilidade de trabalhar com relacionamentos entre tabelas. Veja um exemplo de como criar um post relacionado a um usuário:

```typescript
// Criar um post para um usuário
async function createPost(authorId: number) {
  const post = await prisma.post.create({
    data: {
      title: 'Meu primeiro post',
      content: 'Conteúdo do post',
      author: {
        connect: { id: authorId }
      }
    },
  })
  return post
}

// Buscar usuário com seus posts
async function getUserWithPosts(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: true,
    },
  })
  return user
}
```

No primeiro exemplo, criamos um novo post e o conectamos a um usuário existente. No segundo exemplo, buscamos um usuário e incluímos seus posts associados.

O Prisma cuida de toda a complexidade envolvida em trabalhar com relacionamentos, simplificando muito o seu código.

## Consultas Avançadas
Além das operações básicas, o Prisma também oferece recursos avançados de consulta, como filtros complexos e agregações.

```typescript
// Filtros complexos
const users = await prisma.user.findMany({
  where: {
    OR: [
      { email: { contains: '@gmail.com' } },
      { email: { contains: '@hotmail.com' } },
    ],
    AND: {
      posts: {
        some: {
          published: true,
        },
      },
    },
  },
})

// Agregações
const stats = await prisma.post.aggregate({
  _count: {
    _all: true,
  },
  _avg: {
    likes: true,
  },
  where: {
    published: true,
  },
})
```

No primeiro exemplo, buscamos usuários que tenham email com '@gmail.com' ou '@hotmail.com', e que também tenham pelo menos um post publicado. No segundo exemplo, agregamos algumas estatísticas sobre os posts publicados, como o número total e a média de likes.

O Prisma fornece uma API fluente e intuitiva para construir consultas complexas, tornando o seu código mais legível e fácil de manter.

[... conteúdo do tutorial anterior continua ...]
