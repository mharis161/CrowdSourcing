import prisma from '../lib/prisma.js';
async function main() {
  const users = await prisma.user.findMany();
  console.log('Registered Users:');
  users.forEach(u => console.log(`Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
