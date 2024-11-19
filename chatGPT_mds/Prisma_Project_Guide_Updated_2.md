
# Prisma ORM com Node.js e TypeScript

Este repositório é um tutorial para configurar o Prisma ORM em um projeto Node.js com TypeScript. Ele inclui a instalação, migrações, seed, operações CRUD, e uma estrutura de arquivos sugerida.

## Pré-requisitos

- **Node.js** e **npm** instalados.
- **Banco de Dados** relacional (pode ser PostgreSQL, MySQL ou SQLite).

---

## 1. Configuração do Projeto

1. Crie uma nova pasta para o projeto e inicialize o Node.js:

   ```bash
   mkdir prisma-project
   cd prisma-project
   npm init -y
   ```

2. Instale as dependências necessárias:

   ```bash
   npm install prisma @prisma/client
   ```

3. Instale as dependências de desenvolvimento:

   ```bash
   npm install -D typescript ts-node @types/node
   ```

4. Inicialize o TypeScript:

   ```bash
   npx tsc --init
   ```

   Isso gerará um arquivo `tsconfig.json`.

5. Inicialize o Prisma:

   ```bash
   npx prisma init
   ```

   Isso criará uma pasta **`prisma`** com um arquivo `schema.prisma` e um arquivo `.env` na raiz do projeto.

---

## 2. Configuração do Banco de Dados

No arquivo `.env`, configure a variável `DATABASE_URL`. Para SQLite, use:

```plaintext
DATABASE_URL="file:./dev.db"
```

Para PostgreSQL, ficaria algo como:

```plaintext
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME"
```

---

## 3. Estrutura do Arquivo `schema.prisma`

Defina os modelos conforme o que você deseja. Abra o arquivo `prisma/schema.prisma` e substitua o conteúdo pelo seguinte:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // Altere para "postgresql" se estiver usando PostgreSQL
  url      = env("DATABASE_URL")
}

model User {
  id       Int      @id @default(autoincrement())
  email    String   @unique
  name     String?
  profile  Profile?
  posts    Post[]   @relation(onDelete: CASCADE)
  comments Comment[]
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String
  userId Int    @unique
  user   User   @relation(fields: [userId], references: [id])
}

model Post {
  id         Int         @id @default(autoincrement())
  title      String
  content    String?
  published  Boolean     @default(false)
  authorId   Int
  author     User        @relation(fields: [authorId], references: [id])
  category   Category?   @relation(fields: [categoryId], references: [id])
  categoryId Int?
  tags       Tag[]       @relation("PostTags")
  comments   Comment[]
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[] @relation("PostTags")
}

model Comment {
  id        Int       @id @default(autoincrement())
  content   String
  postId    Int
  post      Post      @relation(fields: [postId], references: [id])
  authorId  Int
  author    User      @relation(fields: [authorId], references: [id])
  parentId  Int?
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
}
```

---

## 4. Rodar Migrações

Para gerar a estrutura do banco de dados, rode a migração:

```bash
npx prisma migrate dev --name init
```

Isso criará o banco de dados e aplicará as tabelas.

---

## 5. Seed de Dados

1. Crie um arquivo para o seed, `prisma/seed.ts`:

   ```typescript
   import { PrismaClient } from '@prisma/client';

   const prisma = new PrismaClient();

   async function main() {
     const user = await prisma.user.create({
       data: {
         email: 'user@example.com',
         name: 'John Doe',
         profile: { create: { bio: 'Software Developer' } },
         posts: {
           create: [
             {
               title: 'My first post',
               content: 'Hello World!',
               published: true,
               category: { create: { name: 'Technology' } },
               tags: { create: [{ name: 'Typescript' }, { name: 'Prisma' }] },
             },
           ],
         },
       },
     });
     console.log({ user });
   }

   main()
     .catch((e) => {
       console.error(e);
       process.exit(1);
     })
     .finally(async () => {
       await prisma.$disconnect();
     });
   ```

2. Configure o script de seed em `package.json`:

   ```json
   "prisma": {
     "seed": "ts-node prisma/seed.ts"
   }
   ```

3. Execute o seed:

   ```bash
   npx prisma db seed
   ```

---

## 6. CRUD no Prisma

Crie um arquivo `src/index.ts` para colocar as operações CRUD. Seguem alguns exemplos básicos:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create User
  const newUser = await prisma.user.create({
    data: {
      email: 'newuser@example.com',
      name: 'Jane Doe',
    },
  });
  console.log('User created:', newUser);

  // Read Users
  const users = await prisma.user.findMany({
    include: { profile: true, posts: true },
  });
  console.log('All users:', users);

  // Update User
  const updatedUser = await prisma.user.update({
    where: { email: 'newuser@example.com' },
    data: { name: 'Jane Doe Updated' },
  });
  console.log('User updated:', updatedUser);

  // Delete User
  await prisma.user.delete({
    where: { email: 'newuser@example.com' },
  });
  console.log('User deleted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Execute o código:

```bash
npx ts-node src/index.ts
```

---

## 7. Estrutura de Arquivos Recomendada

Aqui está uma estrutura básica recomendada para organizar seu projeto:

```
prisma-project/
├── prisma/
│   ├── schema.prisma  // Modelos e configurações do Prisma
│   ├── dev.db         // Banco de dados SQLite (se estiver usando SQLite)
│   └── seed.ts        // Script de seed
├── src/
│   ├── index.ts       // Arquivo principal para operações CRUD
│   ├── controllers/   // Controladores para lógica de CRUD
│   ├── services/      // Lógica de negócios (ex.: serviços de user, post)
│   ├── routes/        // Rotas (caso use um framework como Express)
│   └── middlewares/   // Middlewares para validação, autenticação, etc.
├── .env
├── package.json
└── tsconfig.json
```

Essa organização separa o código em camadas, facilitando a manutenção e escalabilidade do projeto.

---

Esse é o guia para criar uma estrutura com o Prisma ORM em um projeto Node.js com TypeScript. Se tiver alguma dúvida, estou à disposição!
