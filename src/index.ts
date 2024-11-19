import { PrismaClient } from "@prisma/client";
import { fakerPT_BR as faker } from '@faker-js/faker';
import { inspect } from "util";
import { create } from "domain";

const prisma = new PrismaClient();

interface createUserData {
    email: string,
    name: string,
    profile?: { create: { bio: string } },
    posts?: {
        create: any[],
    }
}

async function main() {
    // Controls
    let newUser = null;
    const createUser = true;
    const createBio = true;
    const createPosts = true;
    const howManyPosts = 3;
    const localPosts = [];

    const readAllUsers = true;
    const updateNewUser = false;
    const deleteNewUser = false;

    // Create User
    if (createUser) {
        let dataLocal:createUserData = {
            email: faker.internet.email(),
            name: faker.person.fullName(),
        }

        if (createBio) {
            dataLocal = {...dataLocal, profile: { create: { bio: faker.lorem.sentence() } }}
        }

        if (createPosts) {
            for(let i=0; i<howManyPosts; i++) {
                localPosts.push({
                    title: faker.lorem.sentence(),
                    content: faker.lorem.paragraphs(),
                    published: true,
                    category: {
                        connectOrCreate: {
                            where: { name: 'Technology' },
                            create: { name: 'Technology' },
                        },
                    },
                    tags: {
                        connectOrCreate: [
                          { where: { name: 'Typescript' }, create: { name: 'Typescript' } },
                          { where: { name: 'Prisma' }, create: { name: 'Prisma' } },
                        ],
                    },
                });
            }
            dataLocal = {...dataLocal, posts: { create: localPosts }}
        }

        newUser = await prisma.user.create({
            data: {
                email: dataLocal.email,
                name: dataLocal.name,
                profile: dataLocal.profile,
                posts: dataLocal.posts
            },
        });
        console.log('New User:', newUser);
    } // if createUser

    // Read Users
    if (readAllUsers) {
        const users = await prisma.user.findMany({
            include: { profile: true, posts: {include: { tags: true }} },
        });
        console.log('All users: ');
        console.log(inspect(users, {showHidden: false, depth: null, colors: true}));
    }

    // Update User
    if (updateNewUser && newUser) {
        const newName = faker.person.fullName();
        const updateUser = await prisma.user.update({
            where: { id: newUser.id },
            data: { name: `${newName} Updated` },
        });
        console.log('Updated User:', updateUser);
    }

    // Delete User
    if (deleteNewUser && newUser) {
        const deletedUser = await prisma.user.delete({
            where: { id: newUser.id },
        });
        console.log('Deleted User:', deletedUser);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
