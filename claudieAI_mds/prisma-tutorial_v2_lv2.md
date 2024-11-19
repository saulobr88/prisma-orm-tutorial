# Tutorial Avançado Prisma ORM

## Índice
1. [Introdução](#introdução)
2. [Instalação e Configuração](#instalação)
3. [Schema e Modelos](#schema)
4. [Operações Básicas](#operações)
5. [Relacionamentos](#relacionamentos)
6. [Consultas Avançadas](#consultas)
7. [Migrations](#migrations)
8. [Boas Práticas](#práticas)
9. [Segurança e Autenticação](#segurança)
10. [Testes e Debugging](#testes)
11. [Integração com Frameworks](#integração)
12. [Performance e Otimização](#performance)

## Introdução
O Prisma é uma ferramenta poderosa que vai muito além das operações CRUD básicas. Neste tutorial de nível avançado, vamos explorar recursos e técnicas que vão ajudar você a tirar o máximo proveito do Prisma em projetos complexos.

## Instalação e Configuração
Além dos passos iniciais de instalação e inicialização do Prisma, existem algumas configurações importantes a se considerar em um projeto real:

1. **Gerenciamento de Conexões**: Para evitar a criação de novas conexões a cada requisição, é recomendado usar um singleton do PrismaClient.

```typescript
// utils/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
```

2. **Variáveis de Ambiente**: Armazene as informações de conexão com o banco de dados em variáveis de ambiente, usando um arquivo `.env`.

```
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

3. **Configuração do Prisma**: No `schema.prisma`, você pode definir opções globais, como o nível de log.

```prisma
generator client {
  provider = "prisma-client-js"
  log = ["query", "info", "warn", "error"]
}
```

Essas configurações iniciais ajudarão a deixar seu projeto Prisma mais robusto e preparado para ambientes de produção.

## Schema e Modelos
Além da definição básica de modelos, o Prisma oferece recursos avançados para modelagem de dados:

1. **Enums**: Defina tipos enumerados para campos que possuem um conjunto finito de valores possíveis.

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  role  Role   @default(USER)
}
```

2. **Relacionamentos Complexos**: O Prisma suporta relacionamentos 1:1, 1:N e N:M, além de capacidades avançadas como self-referenciamento.

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  comments  Comment[]
}

model Comment {
  id        Int   @id @default(autoincrement())
  text      String
  post      Post  @relation(fields: [postId], references: [id])
  postId    Int
  author    User  @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

Essas capacidades avançadas de modelagem ajudam a representar fielmente a estrutura de dados da sua aplicação.

## Operações Avançadas
Além das operações CRUD básicas, o Prisma oferece muitos outros recursos poderosos:

1. **Transações**: Execute múltiplas operações em um único bloco transacional, garantindo a consistência dos dados.

```typescript
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.post.create({ data: postData }),
])
```

2. **Upsert**: Combine operações de criação e atualização em uma única chamada, evitando a necessidade de verificações prévias.

```typescript
const user = await prisma.user.upsert({
  where: { email: 'user@example.com' },
  update: { name: 'John Doe Updated' },
  create: { email: 'user@example.com', name: 'John Doe' },
})
```

3. **Aggregations**: Realize operações de agregação, como contagem, média, soma, etc.

```typescript
const stats = await prisma.post.aggregate({
  _count: { _all: true },
  _avg: { likes: true },
  _sum: { views: true },
  where: { published: true },
})
```

Essas operações avançadas tornam o Prisma ainda mais poderoso e flexível para atender às necessidades de sua aplicação.

## Segurança e Autenticação
A segurança é um aspecto crucial em qualquer aplicação. O Prisma oferece recursos que podem ajudar a tornar sua API mais segura:

1. **Filtragem de campos**: Você pode especificar quais campos devem ser retornados em uma consulta, evitando o vazamento de dados sensíveis.

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, email: true, name: true },
})
```

2. **Autorização baseada em Roles**: Você pode implementar um sistema de permissões baseado em funções (Roles) usando o Prisma.

```typescript
// Definir Roles no schema.prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  role  Role   @default(USER)
}

enum Role {
  USER
  ADMIN
}

// Verificar permissões nas consultas
const users = await prisma.user.findMany({
  where: { role: Role.ADMIN },
})
```

3. **Proteção contra SQL Injection**: O Prisma sanitiza automaticamente todos os parâmetros de consulta, protegendo sua aplicação contra ataques de SQL Injection.

Essas funcionalidades de segurança são essenciais para garantir a integridade dos seus dados e a proteção da sua aplicação.

## Testes e Debugging
Testar aplicações que utilizam o Prisma é essencial para garantir a integridade do seu código. O Prisma fornece recursos que facilitam a criação de testes:

1. **Testes Unitários**: Você pode criar testes unitários para as operações CRUD usando a API do Prisma Client.

```typescript
// Exemplo de teste usando Jest
test('create user', async () => {
  const user = await prisma.user.create({
    data: { email: 'test@example.com', name: 'Test User' },
  })
  expect(user.email).toBe('test@example.com')
})
```

2. **Testes de Integração**: O Prisma simplifica a criação de testes de integração, pois você pode usar um banco de dados de teste em memória.

```typescript
// Exemplo de teste de integração usando Jest e SQLite
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db',
    },
  },
})

test('create and read user', async () => {
  const user = await prisma.user.create({
    data: { email: 'test@example.com', name: 'Test User' },
  })
  const readUser = await prisma.user.findUnique({
    where: { id: user.id },
  })
  expect(readUser).toEqual(user)
})
```

3. **Debugging**: O Prisma registra todas as consultas executadas, facilitando o debug de problemas relacionados a banco de dados.

```typescript
// Habilitar o logging de consultas
const prisma = new PrismaClient({
  log: ['query'],
})
```

Esses recursos de testes e debugging ajudarão você a garantir a qualidade e a estabilidade do seu código que utiliza o Prisma.

## Integração com Frameworks
O Prisma pode ser facilmente integrado com diversos frameworks e bibliotecas populares do ecossistema Node.js e TypeScript:

1. **Express.js**: Você pode usar o Prisma em conjunto com o Express.js para criar APIs REST.

```typescript
import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
})
```

2. **NestJS**: O Prisma se integra perfeitamente com o framework NestJS, aproveitando os recursos de injeção de dependências.

```typescript
import { Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { UsersService } from './users.service'

@Module({
  providers: [PrismaService, UsersService],
})
export class UsersModule {}
```

3. **NextJS**: Você pode usar o Prisma em aplicações Next.js, tanto no lado do servidor quanto no lado do cliente.

```typescript
// pages/api/users.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const users = await prisma.user.findMany()
  res.status(200).json(users)
}
```

Essas integrações facilitam a incorporação do Prisma em projetos que utilizam esses frameworks populares.

## Performance e Otimização
À medida que sua aplicação cresce, a performance do banco de dados se torna crucial. O Prisma oferece recursos que podem ajudar a melhorar o desempenho:

1. **Eager Loading**: Carregue dados relacionados automaticamente, evitando consultas adicionais.

```typescript
const users = await prisma.user.findMany({
  include: {
    posts: true,
  },
})
```

2. **Paginação**: Implemente paginação eficiente em suas consultas para evitar overload do banco de dados.

```typescript
const { users, count } = await prisma.user.findMany({
  skip: (page - 1) * perPage,
  take: perPage,
  orderBy: { createdAt: 'desc' },
  include: {
    _count: true,
  },
})
```

3. **Caching de Consultas**: Utilize soluções de caching, como o Redis, para melhorar o desempenho de consultas frequentes.

4. **Particionamento de Banco de Dados**: Divida seus dados em múltiplos bancos de dados ou esquemas para melhorar a escalabilidade.

Essas técnicas de otimização de performance são essenciais à medida que sua aplicação cresce e o volume de dados aumenta.

Este tutorial avançado do Prisma ORM cobriu uma ampla gama de tópicos, desde configurações iniciais até recursos de segurança, testes, integração com frameworks e otimização de performance. Espero que este material seja útil para você dominar o uso do Prisma em projetos complexos. Fique à vontade para me perguntar sobre qualquer dúvida ou solicitar mais detalhes.
