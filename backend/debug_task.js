import prisma from './lib/prisma.js';
async function run() {
  const taskId = 'cmmvpy3z30000k4b18xdkdzuf';
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { company: true } });
  console.log("TASK DATA:", JSON.stringify(task, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
