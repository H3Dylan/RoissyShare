const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const transactions = await prisma.transaction.findMany();
        console.log("Total Transactions:", transactions.length);
        
        transactions.forEach(t => {
            const d = new Date(t.completedAt);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            console.log(`Transaction ID: ${t.id}, Donor: ${t.donorId}, Date: ${t.completedAt}, Key: ${key}, CO2: ${t.co2SavedKg}`);
        });

        // Current structure info (if I knew the ID, but let's just see all)
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
