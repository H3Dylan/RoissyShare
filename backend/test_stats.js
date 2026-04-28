const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testStats() {
    try {
        const structureId = "b92e961d-82af-4058-b93f-83a0e14fc329"; // A valid ID from the logs

        const stats = await prisma.transaction.aggregate({
            where: { donorId: structureId },
            _sum: {
                weightSavedKg: true,
                co2SavedKg: true
            },
            _count: {
                id: true
            }
        });

        console.log("Stats:", {
            totalWeightSaved: stats._sum.weightSavedKg || 0,
            totalCO2Saved: stats._sum.co2SavedKg || 0,
            donationsCount: stats._count.id || 0
        });
    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testStats();
