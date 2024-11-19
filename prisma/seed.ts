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
