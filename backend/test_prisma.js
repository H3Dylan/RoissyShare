const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log("Testing POST equivalent...");
        // just see if we can query a listing
        const listing = await prisma.listing.findFirst();
        console.log("Listing found:", listing ? listing.id : "None");

        if (listing) {
            console.log("Testing donor access...");
            const donorUser = await prisma.user.findFirst({
                where: { structureId: listing.structureId }
            });
            console.log("Donor User:", donorUser ? donorUser.id : "None");
        }

        console.log("Testing GET conversation equivalent...");
        const conversation = await prisma.conversation.findFirst({
            include: {
                listing: {
                    include: { structure: true }
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: { select: { id: true, firstname: true, lastname: true, structure: { select: { name: true, logoUrl: true } } } },
                        receiver: { select: { id: true, firstname: true, lastname: true } }
                    }
                }
            }
        });
        console.log("Conversation query successful:", conversation ? conversation.id : "None");

    } catch (e) {
        console.error("Prisma error:", e);
    }
}

test().finally(() => process.exit(0));
