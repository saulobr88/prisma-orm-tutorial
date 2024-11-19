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
O Prisma é um ORM (Object-Relational Mapping) moderno para Node.js e TypeScript que simplifica o trabalho com bancos de dados. Ele oferece:
- Type safety
- Auto-completion
- Query building intuitivo
- Migrations automáticas
- Suporte para PostgreSQL, MySQL, SQLite e SQL Server

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

## Schema
O arquivo schema.prisma é onde você define seus modelos de dados:

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

## Operações Básicas

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

## Relacionamentos
O Prisma facilita o trabalho com relacionamentos entre tabelas:

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

## Consultas Avançadas

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

## Migrations

```bash
# Criar uma migration
npx prisma migrate dev --name init

# Aplicar migrations em produção
npx prisma migrate deploy

# Verificar status das migrations
npx prisma migrate status
```

## Boas Práticas

1. **Gerenciamento de Conexões**
```typescript
// Utilize um singleton para o PrismaClient
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
```

2. **Tratamento de Erros**
```typescript
try {
  const user = await prisma.user.create({
    data: userData,
  })
} catch (error) {
  if (error.code === 'P2002') {
    throw new Error('Email já existe')
  }
  throw error
}
```

3. **Transações**
```typescript
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.post.create({ data: postData }),
])
```

4. **Middleware**
```typescript
prisma.$use(async (params, next) => {
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()
  console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
  return result
})
```

Este tutorial cobre os aspectos fundamentais do Prisma ORM. Para casos de uso mais específicos ou recursos avançados, consulte a [documentação oficial do Prisma](https://www.prisma.io/docs/).
