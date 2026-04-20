import prisma from './lib/prisma.js';
async function run() {
  const tasks = await prisma.task.findMany({ include: { locations: true } });
  console.log(JSON.stringify(tasks.map(t => ({ id: t.id, locations: t.locations })), null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
