import prisma from './lib/prisma.js';
async function run() {
  const user = await prisma.user.findFirst({ where: { email: 'haris@gmail.com' }, include: { company: true } });
  console.log("USER DATA:", JSON.stringify(user, null, 2));

  // Also check the typo email
  const userTypo = await prisma.user.findFirst({ where: { email: 'haris@gmail.om' }, include: { company: true } });
  console.log("TYPO USER DATA:", JSON.stringify(userTypo, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
