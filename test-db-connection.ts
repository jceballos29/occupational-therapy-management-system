import prisma from "./lib/prisma";

async function testConnection() {
  try {
    console.log("🔍 Probando conexión a Prisma Accelerate...");

    const insurers = await prisma.insurer.findMany({
      take: 1,
    });

    console.log("✅ Conexión exitosa!");
    console.log("📊 Datos obtenidos:", insurers);
  } catch (error) {
    console.error("❌ Error de conexión:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
